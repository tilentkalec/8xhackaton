// Seeded fixed UUIDs — referenced by the demo dev-toggle so there's no login on stage.
export const DEMO = {
  POT_ID: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  INVITE_CODE: 'POTS42',
  USERS: {
    MAYA: '11111111-1111-1111-1111-111111111111',
    TOM: '22222222-2222-2222-2222-222222222222',
  },
} as const;

// The two real demo accounts you toggle between on stage.
export const DEMO_ACCOUNTS = [
  { id: DEMO.USERS.MAYA, name: 'Maya', emoji: 'fox' },
  { id: DEMO.USERS.TOM, name: 'Tom', emoji: 'turtle' },
] as const;
