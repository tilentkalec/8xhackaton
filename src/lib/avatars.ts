// Avatar emoji + archetype display data. avatar_emoji stores a name key.
export const EMOJI: Record<string, string> = {
  fox: '🦊',
  turtle: '🐢',
  owl: '🦉',
  bear: '🐻',
  rabbit: '🐰',
  panda: '🐼',
  cat: '🐱',
  frog: '🐸',
};

export function emojiFor(key: string | null | undefined): string {
  if (!key) return '🐱';
  return EMOJI[key] ?? '🐱';
}

export interface Archetype {
  key: string;
  label: string;
  emoji: string;
  blurb: string;
  // default bet category this archetype rides on
  category: string;
}

export const ARCHETYPES: Record<string, Archetype> = {
  traveller: {
    key: 'traveller',
    label: 'The Traveller',
    emoji: '🦊',
    blurb: 'Spends on experiences, saves for the next trip.',
    category: 'cafe',
  },
  socialiser: {
    key: 'socialiser',
    label: 'The Socialiser',
    emoji: '🐢',
    blurb: 'Lives for the going-out budget. Holds the line on rounds.',
    category: 'going_out',
  },
  saver: {
    key: 'saver',
    label: 'The Saver',
    emoji: '🦉',
    blurb: 'Quietly stacking. The one everyone bets against losing.',
    category: 'savings',
  },
  planner: {
    key: 'planner',
    label: 'The Planner',
    emoji: '🐰',
    blurb: 'Every pound has a job. Loves a sinking fund.',
    category: 'grocery',
  },
};

export function archetypeFor(key: string | null | undefined): Archetype {
  return ARCHETYPES[key ?? 'traveller'] ?? ARCHETYPES.traveller;
}

export const CATEGORY_LABEL: Record<string, string> = {
  cafe: 'cafés',
  grocery: 'groceries',
  going_out: 'going out',
  transport: 'transport',
  savings: 'savings',
};
