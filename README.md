# Pots 🍯

Gen-Z financial-habits betting app, built at the **8x hackathon** ([event](https://luma.com/t4j6h0br)).

Friends put real money (simulated as integer pence) into a shared pot and bet it on sticking to their own budget. Hold your goal — you keep your stake. Break it — your stake redistributes **live** to the friends who held. **The bet is resolved automatically by transaction data, never by a human: the bank is the referee.**

## The demo beat

On two phones, when one person's spending crosses their budget cap, their stake visibly **slides** across to the other person in real time, with a haptic. Drive it from the Pot screen's dev row: **"Add £30 cafe (Tom)"** pushes Tom from £96 → £126, auto-breaks his bet, and pays his stake to Maya.

## Stack

Expo SDK 56 · React Native 0.85 · TypeScript · Expo Router (file-based, `src/app`) · Supabase (Postgres + Realtime) · react-native-reanimated v4 · expo-haptics.

## Run it

```bash
npm install
npx expo start
```

Scan the QR with **Expo Go** on a real phone (iOS/Android). For the cross-device demo, open it on two phones — the realtime payout slide fires on both. Use the **toggle chip** (top-right of the Pot screen) to switch between Maya and Tom, or run each account on a separate phone.

## Screens

- **Pot** (home) — member tiles, live bet-health bars, pot total, live feed, check-in, and the payout slide. Dev row drives the demo.
- **Buckets** — 50/30/20 split tuned by archetype; the staked category shows live bet status.
- **Coach** — rule-based "stake at risk" nudges (fire at 80% of cap) and a projection.
- **Squad** — leaderboard ranked by who's holding and what they stand to win (never by income).

## Architecture

- `src/lib/logic.ts` — the referee. `recordTransaction` (the only thing that can break an under/nospend bet), `breakBet` (idempotent, redistributes the stake), `resolveWindowEnd` (scheduled settlement).
- `src/hooks/usePotRealtime.ts` — one realtime channel per pot; patches `pot_members` (bet-health bars + payout) and `events` (feed) optimistically.
- Money is integer **pence** everywhere — no floats.

## ⚠️ Demo-only notes

- **Open RLS policies** (anon can read/write everything) are for the hackathon demo ONLY. Do not ship.
- No auth, no KYC, no real payments — stakes are simulated pence.
- Supabase anon key is committed for demo convenience; rotate before any real use.
