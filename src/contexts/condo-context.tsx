
"use client";

import React, { createContext, useContext, useMemo, useEffect } from 'react';
import { doc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import type { Condo } from '@/lib/definitions';

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

  const condoRef = useMemoFirebase(() => {
      if (!firestore) return null;
      return doc(firestore, 'condominiums', condoId);
  }, [firestore, condoId]);
  
  const { data: condo, isLoading } = useDoc<Condo>(condoRef);
  
  const contextValue = useMemo(() => ({
    condo: condo || null,
    isLoading,
    condoId,
  }), [condo, isLoading, condoId]);

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
