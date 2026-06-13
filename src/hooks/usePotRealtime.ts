import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { MemberWithUser, Pot, PotEvent, PotMember, User } from '@/lib/types';

interface PotState {
  pot: Pot | null;
  members: MemberWithUser[];
  events: PotEvent[];
  loading: boolean;
  refetch: () => Promise<void>;
}

// One realtime channel per pot. Drives the bet-health bars (pot_members),
// the live feed (events). Applies optimistic patches in place so animations
// never wait on the network round-trip.
export function usePotRealtime(potId: string): PotState {
  const [pot, setPot] = useState<Pot | null>(null);
  const [members, setMembers] = useState<MemberWithUser[]>([]);
  const [events, setEvents] = useState<PotEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const usersRef = useRef<Record<string, User>>({});

  const hydrateMembers = useCallback(async (): Promise<MemberWithUser[]> => {
    const { data: rows } = await supabase.from('pot_members').select('*').eq('pot_id', potId);
    const memberRows = (rows ?? []) as PotMember[];
    const missing = memberRows.map((m) => m.user_id).filter((id) => !usersRef.current[id]);
    if (missing.length) {
      const { data: users } = await supabase.from('users').select('*').in('id', missing);
      for (const u of (users ?? []) as User[]) usersRef.current[u.id] = u;
    }
    return memberRows
      .map((m) => ({ ...m, user: usersRef.current[m.user_id] }))
      .filter((m) => m.user) as MemberWithUser[];
  }, [potId]);

  const refetch = useCallback(async () => {
    const [{ data: potRow }, hydrated, { data: ev }] = await Promise.all([
      supabase.from('pots').select('*').eq('id', potId).single(),
      hydrateMembers(),
      supabase.from('events').select('*').eq('pot_id', potId).order('created_at', { ascending: false }).limit(40),
    ]);
    setPot((potRow as Pot) ?? null);
    setMembers(hydrated);
    setEvents(((ev ?? []) as PotEvent[]));
    setLoading(false);
  }, [potId, hydrateMembers]);

  useEffect(() => {
    refetch();
    const channel = supabase
      .channel(`pot-${potId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pot_members', filter: `pot_id=eq.${potId}` },
        (payload) => {
          const row = payload.new as PotMember;
          if (!row?.id) return;
          setMembers((prev) => {
            const existing = prev.find((m) => m.id === row.id);
            if (!existing) {
              // new member joined — refetch to pull the user record
              refetch();
              return prev;
            }
            return prev.map((m) => (m.id === row.id ? { ...m, ...row, user: m.user } : m));
          });
        },
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'events', filter: `pot_id=eq.${potId}` },
        (payload) => {
          const ev = payload.new as PotEvent;
          setEvents((prev) => [ev, ...prev].slice(0, 40));
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pots', filter: `id=eq.${potId}` },
        (payload) => setPot(payload.new as Pot),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [potId, refetch]);

  return { pot, members, events, loading, refetch };
}
