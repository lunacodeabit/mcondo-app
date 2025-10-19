
"use client";

import React, { createContext, useContext, useMemo, useEffect } from 'react';
import { doc, collection, setDoc, deleteDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import type { Condo, Transaction, Invoice, Supplier, AccountMovement, ManagementComment, Unit, Incident } from '@/lib/definitions';
import { setDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { initialCondos } from '@/lib/data'; // for seeding

interface CondoContextType {
  condo: Condo | null;
  isLoading: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  payInvoice: (invoiceId: string, paymentDate: string) => void;
  saveInvoice: (invoice: Omit<Invoice, 'id' | 'status'> | Invoice) => void;
  deleteInvoice: (invoiceId: string) => void;
  saveSupplier: (supplier: Omit<Supplier, 'id'> | Supplier) => void;
  deleteSupplier: (supplierId: string) => void;
  saveUnit: (unit: Omit<Unit, 'id' | 'accountHistory' | 'managementHistory'> | Unit) => void;
  deleteUnit: (unitId: string) => void;
  saveAccountMovement: (movement: Omit<AccountMovement, 'id'> & { unitId: string }) => void;
  addMonthlyFee: (unitId: string) => void;
  saveManagementComment: (unitId: string, comment: Omit<ManagementComment, 'id'>) => void;
  saveIncident: (incident: Omit<Incident, 'id'> | Incident) => void;
  deleteIncident: (incidentId: string) => void;
}

const CondoContext = createContext<CondoContextType | undefined>(undefined);

// Helper function to seed the database once
async function seedDatabase(firestore: any) {
    console.log("Checking if seeding is needed...");
    const condoRef = doc(firestore, 'condominiums', 'condo-1');
    
    // This is a simplified check. In a real app, you might have a 'version' or 'seeded' flag.
    // For now, we just write the data. In a real app, you would be more careful.
    const batch = writeBatch(firestore);

    initialCondos.forEach(condoData => {
        const mainCondoRef = doc(firestore, 'condominiums', condoData.id);
        batch.set(mainCondoRef, {
            id: condoData.id,
            name: condoData.name,
            address: condoData.address,
            currency: condoData.currency,
            finances: {
              manualBalance: condoData.finances.manualBalance
            }
        });

        condoData.finances.transactions.forEach(transaction => {
            const transRef = doc(collection(mainCondoRef, 'financial_transactions'), transaction.id);
            batch.set(transRef, transaction);
        });

        condoData.units.forEach(unit => {
            const unitRef = doc(collection(mainCondoRef, 'units'), unit.id);
            // Separate subcollections from the main unit doc
            const { accountHistory, managementHistory, ...unitData } = unit;
            batch.set(unitRef, unitData);

            accountHistory.forEach(ah => {
                const ahRef = doc(collection(unitRef, 'account_history'), ah.id);
                batch.set(ahRef, ah);
            });

            managementHistory.forEach(mh => {
                const mhRef = doc(collection(unitRef, 'management_history'), mh.id);
                batch.set(mhRef, mh);
            });
        });
        
        condoData.accountsPayable.forEach(invoice => {
            const invoiceRef = doc(collection(mainCondoRef, 'accounts_payable'), invoice.id);
            batch.set(invoiceRef, invoice);
        });

        condoData.suppliers.forEach(supplier => {
            const supplierRef = doc(collection(mainCondoRef, 'suppliers'), supplier.id);
            batch.set(supplierRef, supplier);
        });

        condoData.incidents.forEach(incident => {
            const incidentRef = doc(collection(mainCondoRef, 'incidents'), incident.id);
            batch.set(incidentRef, incident);
        });
         condoData.communications.forEach(comm => {
            const commRef = doc(collection(mainCondoRef, 'communications'), comm.id);
            batch.set(commRef, comm);
        });
    });

    try {
        await batch.commit();
        console.log("Database seeded successfully.");
    } catch (error) {
        console.error("Error seeding database: ", error);
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
    // This is a temporary solution for seeding data for development.
    // In a production app, this would be handled by a backend script or a more robust mechanism.
    seedDatabase(firestore);
  }, [firestore]);


  const condoRef = useMemoFirebase(() => doc(firestore, 'condominiums', condoId), [firestore, condoId]);
  
  // Fetch main condo data
  const { data: condoData, isLoading: isCondoLoading } = useDoc<Condo>(condoRef);
  
  // Fetch subcollections
  const unitsCollection = useMemoFirebase(() => collection(firestore, 'condominiums', condoId, 'units'), [firestore, condoId]);
  const { data: units, isLoading: areUnitsLoading } = useCollection<Unit>(unitsCollection);

  const transactionsCollection = useMemoFirebase(() => collection(firestore, 'condominiums', condoId, 'financial_transactions'), [firestore, condoId]);
  const { data: transactions, isLoading: areTransactionsLoading } = useCollection<Transaction>(transactionsCollection);
  
  const invoicesCollection = useMemoFirebase(() => collection(firestore, 'condominiums', condoId, 'accounts_payable'), [firestore, condoId]);
  const { data: invoices, isLoading: areInvoicesLoading } = useCollection<Invoice>(invoicesCollection);
  
  const suppliersCollection = useMemoFirebase(() => collection(firestore, 'condominiums', condoId, 'suppliers'), [firestore, condoId]);
  const { data: suppliers, isLoading: areSuppliersLoading } = useCollection<Supplier>(suppliersCollection);

  const incidentsCollection = useMemoFirebase(() => collection(firestore, 'condominiums', condoId, 'incidents'), [firestore, condoId]);
  const { data: incidents, isLoading: areIncidentsLoading } = useCollection<Incident>(incidentsCollection);
  
  // This structure is more complex because units have subcollections themselves.
  // For now, we will fetch them on demand inside the components, or adjust this later.
  const unitsWithHistory = useMemo(() => {
      // This is a simplified version. A real app might fetch subcollections here
      // or within the component that needs them (`AccountStatementDetail`).
      // For now, let's assume `useCollection` gives us what we need for the main lists.
      return units || [];
  }, [units]);


  const condo = useMemo((): Condo | null => {
    if (!condoData) return null;
    return {
      ...condoData,
      finances: {
          manualBalance: condoData.finances?.manualBalance || 0,
          transactions: transactions || [],
      },
      units: unitsWithHistory || [],
      accountsPayable: invoices || [],
      suppliers: suppliers || [],
      incidents: incidents || [],
      // These are not loaded here for performance, they can be loaded on their respective pages.
      employees: [], 
      communications: [],
    };
  }, [condoData, transactions, unitsWithHistory, invoices, suppliers, incidents]);

  const isLoading = isCondoLoading || areUnitsLoading || areTransactionsLoading || areInvoicesLoading || areSuppliersLoading || areIncidentsLoading;

  const getCollectionRef = (name: string) => collection(firestore, 'condominiums', condoId, name);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newId = `t-${new Date().getTime()}`;
    const transRef = doc(getCollectionRef('financial_transactions'), newId);
    setDocumentNonBlocking(transRef, { ...transaction, id: newId }, { merge: true });
  };
  
  const payInvoice = (invoiceId: string, paymentDate: string) => {
      if (!condo) return;
      const invoiceToPay = condo.accountsPayable.find(inv => inv.id === invoiceId);
      if (!invoiceToPay) return;

      const newTransaction: Omit<Transaction, 'id'> = {
        date: paymentDate,
        description: `Pago factura #${invoiceToPay.invoiceNumber} a ${condo.suppliers.find(s => s.id === invoiceToPay.supplierId)?.name || 'N/A'}`,
        type: 'egreso',
        category: 'Cuentas por Pagar',
        amount: invoiceToPay.amount,
        reference: invoiceId,
      };

      const transactionId = `t-${new Date().getTime()}`;
      const transRef = doc(getCollectionRef('financial_transactions'), transactionId);
      const invoiceRef = doc(getCollectionRef('accounts_payable'), invoiceId);

      setDocumentNonBlocking(transRef, { ...newTransaction, id: transactionId }, { merge: true });
      updateDocumentNonBlocking(invoiceRef, { status: 'Pagada', relatedTransactionId: transactionId });
  };

  const saveInvoice = (invoice: Omit<Invoice, 'id' | 'status'> | Invoice) => {
    if ('id' in invoice) {
        const invoiceRef = doc(getCollectionRef('accounts_payable'), invoice.id);
        updateDocumentNonBlocking(invoiceRef, invoice);
    } else {
        const newId = `inv-${new Date().getTime()}`;
        const invoiceRef = doc(getCollectionRef('accounts_payable'), newId);
        setDocumentNonBlocking(invoiceRef, { ...invoice, id: newId, status: 'Pendiente' }, { merge: true });
    }
  };

  const deleteInvoice = (invoiceId: string) => {
    deleteDocumentNonBlocking(doc(getCollectionRef('accounts_payable'), invoiceId));
  };

  const saveSupplier = (supplier: Omit<Supplier, 'id'> | Supplier) => {
    if ('id' in supplier) {
        const supRef = doc(getCollectionRef('suppliers'), supplier.id);
        updateDocumentNonBlocking(supRef, supplier);
    } else {
        const newId = `sup-${new Date().getTime()}`;
        const supRef = doc(getCollectionRef('suppliers'), newId);
        setDocumentNonBlocking(supRef, { ...supplier, id: newId }, { merge: true });
    }
  };

  const deleteSupplier = (supplierId: string) => {
    deleteDocumentNonBlocking(doc(getCollectionRef('suppliers'), supplierId));
  };
  
  const saveUnit = (unit: Omit<Unit, 'id' | 'accountHistory' | 'managementHistory'> | Unit) => {
    const { accountHistory, managementHistory, ...unitData } = unit as Unit;
    
    if ('id' in unitData) {
        const unitRef = doc(getCollectionRef('units'), unitData.id);
        updateDocumentNonBlocking(unitRef, unitData);
    } else {
        const newId = `u-${new Date().getTime()}`;
        const unitRef = doc(getCollectionRef('units'), newId);
        setDocumentNonBlocking(unitRef, { ...unitData, id: newId }, { merge: true });
    }
  };

  const deleteUnit = (unitId: string) => {
    deleteDocumentNonBlocking(doc(getCollectionRef('units'), unitId));
  };
  
  const saveAccountMovement = (movement: Omit<AccountMovement, 'id'> & { unitId: string }) => {
    const { unitId, ...movementData } = movement;
    const newId = `ah-${new Date().getTime()}`;
    const movementRef = doc(collection(firestore, 'condominiums', condoId, 'units', unitId, 'account_history'), newId);
    
    const dataToSave = {
        ...movementData,
        id: newId,
        date: movementData.date instanceof Date ? movementData.date.toISOString() : movementData.date,
    };
    setDocumentNonBlocking(movementRef, dataToSave, { merge: true });
  };
  
  const addMonthlyFee = (unitId: string) => {
    if (!condo) return;
    const unit = condo.units.find(u => u.id === unitId);
    if (!unit) return;

    const now = new Date();
    const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const monthName = nextMonthDate.toLocaleString('es-ES', { month: 'long' });
    const year = nextMonthDate.getFullYear();

    const description = `Cuota de Mantenimiento ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
    const date = nextMonthDate.toISOString();
    
    // Note: This check is now against the local state, which is near real-time.
    // A more robust solution might use a Firebase Function or transaction to ensure atomicity.
    const feeExists = (unit.accountHistory || []).some(item => item.description === description);

    if (feeExists) {
        alert(`La cuota para ${description} ya ha sido registrada.`);
        return;
    }
    
    if (unit.fees.monthlyFee <= 0) {
        alert('La cuota mensual para esta unidad no está configurada.');
        return;
    }

    const movement: Omit<AccountMovement, 'id'> = {
        date: date,
        type: 'cuota_mensual',
        description: description,
        amount: unit.fees.monthlyFee,
    };
    
    saveAccountMovement({ ...movement, unitId });
  };

  const saveManagementComment = (unitId: string, comment: Omit<ManagementComment, 'id'>) => {
      const newId = `mc-${new Date().getTime()}`;
      const commentRef = doc(collection(firestore, 'condominiums', condoId, 'units', unitId, 'management_history'), newId);
      setDocumentNonBlocking(commentRef, { ...comment, id: newId }, { merge: true });
  };

  const saveIncident = (incident: Omit<Incident, 'id'> | Incident) => {
     if ('id' in incident) {
        const incidentRef = doc(getCollectionRef('incidents'), incident.id);
        updateDocumentNonBlocking(incidentRef, incident);
    } else {
        const newId = `inc-${new Date().getTime()}`;
        const incidentRef = doc(getCollectionRef('incidents'), newId);
        setDocumentNonBlocking(incidentRef, { ...incident, id: newId }, { merge: true });
    }
  };

  const deleteIncident = (incidentId: string) => {
    deleteDocumentNonBlocking(doc(getCollectionRef('incidents'), incidentId));
  };

  const contextValue = useMemo(() => ({
    condo,
    isLoading,
    addTransaction,
    payInvoice,
    saveInvoice,
    deleteInvoice,
    saveSupplier,
    deleteSupplier,
    saveUnit,
    deleteUnit,
    saveAccountMovement,
    addMonthlyFee,
    saveManagementComment,
    saveIncident,
    deleteIncident,
  }), [condo, isLoading]);

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
