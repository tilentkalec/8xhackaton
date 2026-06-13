import { supabase } from './supabase';
import { DEMO } from './constants';

// Resets the seeded pot to its pre-break state so the payout demo can be
// re-run on stage. Demo-only.
export async function resetDemo(): Promise<void> {
  await supabase
    .from('pot_members')
    .update({ stake_pence: 500, spent_pence: 6000, current_streak: 5, status: 'active' })
    .eq('user_id', DEMO.USERS.MAYA)
    .eq('pot_id', DEMO.POT_ID);
  await supabase
    .from('pot_members')
    .update({ stake_pence: 500, spent_pence: 9600, current_streak: 3, status: 'active' })
    .eq('user_id', DEMO.USERS.TOM)
    .eq('pot_id', DEMO.POT_ID);

  await supabase.from('transactions').delete().eq('pot_id', DEMO.POT_ID);
  await supabase.from('events').delete().eq('pot_id', DEMO.POT_ID);

  await supabase.from('events').insert([
    { pot_id: DEMO.POT_ID, kind: 'join', actor_name: 'Maya', payload: {} },
    { pot_id: DEMO.POT_ID, kind: 'join', actor_name: 'Tom', payload: {} },
    { pot_id: DEMO.POT_ID, kind: 'check_in', actor_name: 'Maya', payload: { streak: 5 } },
    { pot_id: DEMO.POT_ID, kind: 'check_in', actor_name: 'Tom', payload: { streak: 3 } },
  ]);
}
