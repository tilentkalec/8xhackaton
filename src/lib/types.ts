export type Comparator = 'under' | 'nospend' | 'atleast';
export type MemberStatus = 'active' | 'broken' | 'won';
export type EventKind =
  | 'spend'
  | 'check_in'
  | 'broke'
  | 'redistribute'
  | 'won'
  | 'join';
export type SpendCategory =
  | 'cafe'
  | 'grocery'
  | 'going_out'
  | 'transport'
  | 'savings';

export interface User {
  id: string;
  display_name: string;
  archetype: string;
  avatar_emoji: string;
}

export interface Pot {
  id: string;
  name: string;
  goal_label: string;
  category: SpendCategory;
  comparator: Comparator;
  threshold_pence: number;
  window_start: string;
  window_end: string;
  stake_pence: number;
  pot_total_pence: number;
  invite_code: string;
}

export interface PotMember {
  id: string;
  pot_id: string;
  user_id: string;
  stake_pence: number;
  spent_pence: number;
  current_streak: number;
  status: MemberStatus;
}

export interface PotEvent {
  id: string;
  pot_id: string;
  kind: EventKind;
  actor_name: string | null;
  payload: Record<string, any> | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  pot_id: string;
  user_id: string;
  merchant: string;
  category: SpendCategory;
  amount_pence: number;
  created_at: string;
}

// A member joined with its user record, for rendering tiles.
export interface MemberWithUser extends PotMember {
  user: User;
}
