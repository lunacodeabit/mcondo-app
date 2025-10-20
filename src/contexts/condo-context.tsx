
"use client";

import React, { createContext, useContext, useMemo, useEffect } from 'react';
import { doc, collection, writeBatch, getDocs } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import type { Condo } from '@/lib/definitions';
import { initialCondos } from '@/lib/data'; // for seeding

interface CondoContextType {
  condo: Condo | null;
  isLoading: boolean;
  condoId: string;
}

const CondoContext = createContext<CondoContextType | undefined>(undefined);

// Seeding function
async function seedInitialData(firestore: any) {
  const condosRef = collection(firestore, "condominiums");
  const snapshot = await getDocs(condosRef);
  if (snapshot.empty) {
    console.log("No condominiums found. Seeding initial data...");
    const batch = writeBatch(firestore);

    initialCondos.forEach((condo) => {
      const condoDocRef = doc(condosRef, condo.id);
      
      const { units, accountsPayable, suppliers, employees, communications, incidents, finances, ...condoData } = condo;
      const { transactions, ...financeData } = finances;

      // Set main condo document
      batch.set(condoDocRef, { ...condoData, finances: financeData });
      
      // Seed subcollections
      units.forEach(unit => {
        const { accountHistory, managementHistory, ...unitData } = unit;
        const unitDocRef = doc(condosRef, condo.id, 'units', unit.id);
        batch.set(unitDocRef, unitData);
        accountHistory.forEach(ah => batch.set(doc(unitDocRef, 'account_history', ah.id), ah));
        managementHistory.forEach(mh => batch.set(doc(unitDocRef, 'management_history', mh.id), mh));
      });
      accountsPayable.forEach(ap => batch.set(doc(condosRef, condo.id, 'accounts_payable', ap.id), ap));
      suppliers.forEach(s => batch.set(doc(condosRef, condo.id, 'suppliers', s.id), s));
      transactions.forEach(t => batch.set(doc(condosRef, condo.id, 'financial_transactions', t.id), t));
      incidents.forEach(i => batch.set(doc(condosRef, condo.id, 'incidents', i.id), i));
    });

    await batch.commit();
    console.log("Initial data seeded successfully.");
  } else {
    console.log("Condominiums found. Skipping seed.");
  }
}


export function CondoProvider({
  condoId,
  children,
}: {
  condoId: string;
  children: React.ReactNode;
}) {
  const firestore = useFirestore();

  useEffect(() => {
    if (firestore) {
      seedInitialData(firestore);
    }
  }, [firestore]);


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
