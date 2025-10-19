
"use client";

import React, { createContext, useContext, useMemo, useEffect } from 'react';
import { doc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import type { Condo } from '@/lib/definitions';
import { initialCondos } from '@/lib/data'; // for seeding

interface CondoContextType {
  condo: Condo | null;
  isLoading: boolean;
  condoId: string;
}

const CondoContext = createContext<CondoContextType | undefined>(undefined);

export function CondoProvider({
  condoId,
  children,
}: {
  condoId: string;
  children: React.ReactNode;
}) {
  const firestore = useFirestore();

  const condoRef = useMemoFirebase(() => doc(firestore, 'condominiums', condoId), [firestore, condoId]);
  
  // Fetch main condo data ONLY. Subcollections will be fetched by their respective pages.
  const { data: condoData, isLoading: isCondoLoading } = useDoc<Omit<Condo, 'units' | 'accountsPayable' | 'suppliers' | 'incidents' | 'finances' | 'employees' | 'communications'>>(condoRef);

  const condo = useMemo((): Condo | null => {
    if (!condoData) return null;
    // Return the basic condo object. Subcollections will be populated by pages.
    return {
      ...condoData,
      finances: { manualBalance: (condoData as any).finances?.manualBalance || 0, transactions: [] },
      units: [],
      accountsPayable: [],
      suppliers: [],
      incidents: [],
      employees: [], 
      communications: [],
    };
  }, [condoData]);

  const contextValue = useMemo(() => ({
    condo,
    isLoading: isCondoLoading,
    condoId,
  }), [condo, isCondoLoading, condoId]);

  return (
    <CondoContext.Provider value={contextValue}>
      {children}
    </CondoContext.Provider>
  );
}

export function useCondo() {
  const context = useContext(CondoContext);
  if (context === undefined) {
    throw new Error('useCondo must be used within a CondoProvider');
  }
  return context;
}
