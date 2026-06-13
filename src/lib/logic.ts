import { supabase } from './supabase';
import type { Pot, PotMember, SpendCategory, EventKind } from './types';

// ── reads ─────────────────────────────────────────────────────────────────
async function getPot(potId: string): Promise<Pot> {
  const { data, error } = await supabase.from('pots').select('*').eq('id', potId).single();
  if (error) throw error;
  return data as Pot;
}

async function getMember(potId: string, userId: string): Promise<PotMember> {
  const { data, error } = await supabase
    .from('pot_members')
    .select('*')
    .eq('pot_id', potId)
    .eq('user_id', userId)
    .single();
  if (error) throw error;
  return data as PotMember;
}

async function getMembers(potId: string): Promise<PotMember[]> {
  const { data, error } = await supabase.from('pot_members').select('*').eq('pot_id', potId);
  if (error) throw error;
  return (data ?? []) as PotMember[];
}

// ── writes ──────────────────────────────────────────────────────────────────
async function saveMember(m: PotMember): Promise<void> {
  const { error } = await supabase
    .from('pot_members')
    .update({
      stake_pence: m.stake_pence,
      spent_pence: m.spent_pence,
      current_streak: m.current_streak,
      status: m.status,
    })
    .eq('id', m.id);
  if (error) throw error;
}

export async function insertEvent(
  potId: string,
  kind: EventKind,
  actorName: string | null,
  payload: Record<string, any> = {},
): Promise<void> {
  const { error } = await supabase
    .from('events')
    .insert({ pot_id: potId, kind, actor_name: actorName, payload });
  if (error) throw error;
}

// ── the referee ───────────────────────────────────────────────────────────
// A new transaction in the bet category is the ONLY thing that can break an
// "under"/"nospend" bet. No human ever marks a bet won or lost.
export async function recordTransaction(
  potId: string,
  userId: string,
  actorName: string,
  merchant: string,
  category: SpendCategory,
  amountPence: number,
): Promise<void> {
  await supabase.from('transactions').insert({
    pot_id: potId,
    user_id: userId,
    merchant,
    category,
    amount_pence: amountPence,
  });
  await insertEvent(potId, 'spend', actorName, { merchant, category, amount: amountPence });

  const pot = await getPot(potId);
  if (category !== pot.category) return;

  const m = await getMember(potId, userId);
  if (m.status !== 'active') return;
  m.spent_pence += amountPence;
  await saveMember(m); // fires realtime → live bet-health bar moves

  if (pot.comparator === 'under' && m.spent_pence > pot.threshold_pence) {
    await breakBet(potId, userId);
  }
  if (pot.comparator === 'nospend' && amountPence > 0) {
    await breakBet(potId, userId);
  }
}

// Idempotent: never double-breaks. Redistributes the broken stake to holders.
export async function breakBet(potId: string, brokenId: string): Promise<void> {
  const broken = await getMember(potId, brokenId);
  if (broken.status !== 'active') return; // already resolved — no-op

  const amount = broken.stake_pence;
  broken.status = 'broken';
  broken.stake_pence = 0;
  broken.current_streak = 0;
  await saveMember(broken);

  const all = await getMembers(potId);
  const holders = all.filter((h) => h.status === 'active' && h.id !== broken.id);

  if (holders.length > 0 && amount > 0) {
    const share = Math.floor(amount / holders.length);
    const remainder = amount - share * holders.length;
    for (let i = 0; i < holders.length; i++) {
      const h = holders[i];
      h.stake_pence += share + (i === 0 ? remainder : 0);
      await saveMember(h); // each save fires the payout-slide animation
      const name = await displayName(h.user_id);
      await insertEvent(potId, 'redistribute', name, {
        from_user: broken.user_id,
        to_user: h.user_id,
        amount: share + (i === 0 ? remainder : 0),
      });
    }
  }

  const brokenName = await displayName(broken.user_id);
  const pot = await getPot(potId);
  await insertEvent(potId, 'broke', brokenName, { category: pot.category });
}

// Scheduled settlement: survivors of an under/nospend window win; atleast
// members who fell short break.
export async function resolveWindowEnd(potId: string): Promise<void> {
  const pot = await getPot(potId);
  const members = await getMembers(potId);
  for (const m of members) {
    if (m.status !== 'active') continue;
    if (pot.comparator === 'atleast' && m.spent_pence < pot.threshold_pence) {
      await breakBet(potId, m.user_id);
      continue;
    }
    m.status = 'won';
    await saveMember(m);
    await insertEvent(potId, 'won', await displayName(m.user_id), {});
  }
}

export async function checkIn(potId: string, userId: string, actorName: string): Promise<void> {
  const m = await getMember(potId, userId);
  if (m.status !== 'active') return;
  m.current_streak += 1;
  await saveMember(m);
  await insertEvent(potId, 'check_in', actorName, { streak: m.current_streak });
}

async function displayName(userId: string): Promise<string> {
  const { data } = await supabase.from('users').select('display_name').eq('id', userId).single();
  return data?.display_name ?? 'Someone';
}
