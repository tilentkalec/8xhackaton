import React, { createContext, useContext, useMemo, useState } from 'react';
import { DEMO_ACCOUNTS } from './constants';

interface SessionValue {
  userId: string;
  name: string;
  emoji: string;
  isMaya: boolean;
  toggle: () => void;
}

const SessionContext = createContext<SessionValue | null>(null);

// Dev session: no login on stage. Toggle between Maya and Tom so you can
// demo from either side (or run each on a separate phone).
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [index, setIndex] = useState(0); // 0 = Maya, 1 = Tom

  const value = useMemo<SessionValue>(() => {
    const acc = DEMO_ACCOUNTS[index];
    return {
      userId: acc.id,
      name: acc.name,
      emoji: acc.emoji,
      isMaya: index === 0,
      toggle: () => setIndex((i) => (i === 0 ? 1 : 0)),
    };
  }, [index]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
