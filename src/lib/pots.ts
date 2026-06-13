import { supabase } from './supabase';
import { insertEvent } from './logic';
import type { Comparator, SpendCategory } from './types';

function inviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export interface CreatePotInput {
  name: string;
  goalLabel: string;
  category: SpendCategory;
  comparator: Comparator;
  thresholdPence: number;
  stakePence: number;
}

export interface CreatedPot {
  potId: string;
  inviteCode: string;
}

// Inserts the pot + the creator as the first member (their stake seeds the pot).
export async function createPot(
  input: CreatePotInput,
  creator: { id: string; name: string },
): Promise<CreatedPot> {
  const code = inviteCode();
  const windowEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: pot, error } = await supabase
    .from('pots')
    .insert({
      name: input.name,
      goal_label: input.goalLabel,
      category: input.category,
      comparator: input.comparator,
      threshold_pence: input.thresholdPence,
      window_end: windowEnd,
      stake_pence: input.stakePence,
      pot_total_pence: input.stakePence,
      invite_code: code,
    })
    .select('id')
    .single();
  if (error || !pot) throw error ?? new Error('create failed');

  await supabase.from('pot_members').insert({
    pot_id: pot.id,
    user_id: creator.id,
    stake_pence: input.stakePence,
    spent_pence: 0,
    current_streak: 0,
    status: 'active',
  });
  await insertEvent(pot.id, 'join', creator.name, {});

  return { potId: pot.id, inviteCode: code };
}

// Joins a pot by invite code. Idempotent on membership. Returns the pot id, or
// null if the code is unknown.
export async function joinByCode(
  code: string,
  user: { id: string; name: string },
): Promise<string | null> {
  const { data: pot } = await supabase
    .from('pots')
    .select('*')
    .eq('invite_code', code.trim().toUpperCase())
    .maybeSingle();
  if (!pot) return null;

  const { data: existing } = await supabase
    .from('pot_members')
    .select('id')
    .eq('pot_id', pot.id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!existing) {
    await supabase.from('pot_members').insert({
      pot_id: pot.id,
      user_id: user.id,
      stake_pence: pot.stake_pence,
      spent_pence: 0,
      current_streak: 0,
      status: 'active',
    });
    await supabase
      .from('pots')
      .update({ pot_total_pence: pot.pot_total_pence + pot.stake_pence })
      .eq('id', pot.id);
    await insertEvent(pot.id, 'join', user.name, {});
  }

  return pot.id as string;
}
