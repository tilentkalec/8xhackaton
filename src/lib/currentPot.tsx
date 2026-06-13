import React, { createContext, useContext, useState } from 'react';
import { DEMO } from './constants';

interface CurrentPotValue {
  potId: string;
  setPotId: (id: string) => void;
}

const CurrentPotContext = createContext<CurrentPotValue | null>(null);

// The pot currently shown across the tabs. Defaults to the seeded demo pot
// so launch is always demo-safe; create/join switch it.
export function CurrentPotProvider({ children }: { children: React.ReactNode }) {
  const [potId, setPotId] = useState<string>(DEMO.POT_ID);
  return <CurrentPotContext.Provider value={{ potId, setPotId }}>{children}</CurrentPotContext.Provider>;
}

export function useCurrentPot(): CurrentPotValue {
  const ctx = useContext(CurrentPotContext);
  if (!ctx) throw new Error('useCurrentPot must be used within CurrentPotProvider');
  return ctx;
}
