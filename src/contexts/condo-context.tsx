
"use client";

import React, { createContext, useContext, useState, useMemo } from 'react';
import type { Condo, Transaction, Invoice, Supplier, AccountMovement, ManagementComment } from '@/lib/definitions';

interface CondoContextType {
  condo: Condo | null;
  setCondo: React.Dispatch<React.SetStateAction<Condo | null>>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  payInvoice: (invoiceId: string, paymentDate: string) => void;
  saveInvoice: (invoice: Omit<Invoice, 'id' | 'status'> | Invoice) => void;
  deleteInvoice: (invoiceId: string) => void;
  saveSupplier: (supplier: Omit<Supplier, 'id'> | Supplier) => void;
  deleteSupplier: (supplierId: string) => void;
  saveAccountMovement: (movement: Omit<AccountMovement, 'id'> & { unitId: string }) => void;
  addMonthlyFee: (unitId: string) => void;
  saveManagementComment: (unitId: string, comment: Omit<ManagementComment, 'id'>) => void;
}

const CondoContext = createContext<CondoContextType | undefined>(undefined);

export function CondoProvider({
  initialCondo,
  children,
}: {
  initialCondo: Condo;
  children: React.ReactNode;
}) {
  const [condo, setCondo] = useState<Condo | null>(initialCondo);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    setCondo(prevCondo => {
      if (!prevCondo) return null;
      const newTransaction: Transaction = {
        ...transaction,
        id: `t-${new Date().getTime()}`,
      };
      return {
        ...prevCondo,
        finances: {
          ...prevCondo.finances,
          transactions: [newTransaction, ...prevCondo.finances.transactions],
        },
      };
    });
  };
  
  const payInvoice = (invoiceId: string, paymentDate: string) => {
    setCondo(prevCondo => {
      if (!prevCondo) return null;
      
      const invoiceToPay = prevCondo.accountsPayable.find(inv => inv.id === invoiceId);
      if (!invoiceToPay) return prevCondo;

      const newTransaction: Omit<Transaction, 'id'> = {
        date: paymentDate,
        description: `Pago factura #${invoiceToPay.invoiceNumber} a ${prevCondo.suppliers.find(s => s.id === invoiceToPay.supplierId)?.name || 'N/A'}`,
        type: 'egreso',
        category: 'Cuentas por Pagar',
        amount: invoiceToPay.amount,
        reference: invoiceId,
      };
      const transactionId = `t-${new Date().getTime()}`;

      return {
        ...prevCondo,
        finances: {
          ...prevCondo.finances,
          transactions: [{...newTransaction, id: transactionId}, ...prevCondo.finances.transactions],
        },
        accountsPayable: prevCondo.accountsPayable.map(inv => 
          inv.id === invoiceId 
          ? { ...inv, status: 'Pagada', relatedTransactionId: transactionId } 
          : inv
        ),
      };
    });
  };

  const saveInvoice = (invoice: Omit<Invoice, 'id' | 'status'> | Invoice) => {
    setCondo(prevCondo => {
      if (!prevCondo) return null;
      
      let updatedInvoices: Invoice[];

      if ('id' in invoice) {
        // Editing existing invoice
        updatedInvoices = prevCondo.accountsPayable.map(i => i.id === invoice.id ? { ...i, ...invoice } : i);
      } else {
        // Adding new invoice
        const newInvoice: Invoice = {
          ...invoice,
          id: `inv-${new Date().getTime()}`,
          status: 'Pendiente',
        };
        updatedInvoices = [newInvoice, ...prevCondo.accountsPayable];
      }
      
      return {
        ...prevCondo,
        accountsPayable: updatedInvoices,
      };
    });
  };

  const deleteInvoice = (invoiceId: string) => {
    setCondo(prevCondo => {
      if (!prevCondo) return null;

      // Note: This does not delete any associated financial transaction.
      // That would require more complex logic, which can be added later.
      return {
        ...prevCondo,
        accountsPayable: prevCondo.accountsPayable.filter(inv => inv.id !== invoiceId),
      };
    });
  };

  const saveSupplier = (supplier: Omit<Supplier, 'id'> | Supplier) => {
    setCondo(prevCondo => {
      if (!prevCondo) return null;
      
      let updatedSuppliers: Supplier[];

      if ('id' in supplier) {
        // Editing existing supplier
        updatedSuppliers = prevCondo.suppliers.map(s => s.id === supplier.id ? { ...s, ...supplier } : s);
      } else {
        // Adding new supplier
        const newSupplier: Supplier = {
          ...supplier,
          id: `sup-${new Date().getTime()}`,
        };
        updatedSuppliers = [newSupplier, ...prevCondo.suppliers];
      }
      
      return {
        ...prevCondo,
        suppliers: updatedSuppliers,
      };
    });
  };

  const deleteSupplier = (supplierId: string) => {
    setCondo(prevCondo => {
      if (!prevCondo) return null;

      // Note: This does not delete related invoices. 
      // You might want to add a check or cascade deletion logic later.
      return {
        ...prevCondo,
        suppliers: prevCondo.suppliers.filter(s => s.id !== supplierId),
      };
    });
  };
  
  const saveAccountMovement = (movement: Omit<AccountMovement, 'id'> & { unitId: string }) => {
    setCondo(prevCondo => {
        if (!prevCondo) return null;

        const { unitId, ...newMovementData } = movement;

        const updatedUnits = prevCondo.units.map(unit => {
            if (unit.id === unitId) {
                const maxId = (unit.accountHistory || []).reduce((max, item) => Math.max(Number(item.id.replace('ah','')), max), 0);
                const newMovement: AccountMovement = {
                    ...newMovementData,
                    id: `ah-${maxId + 1}`,
                    date: newMovementData.date instanceof Date ? newMovementData.date.toISOString() : newMovementData.date,
                };
                const updatedHistory = [newMovement, ...(unit.accountHistory || [])]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                return { ...unit, accountHistory: updatedHistory };
            }
            return unit;
        });

        return { ...prevCondo, units: updatedUnits };
    });
  };
  
  const addMonthlyFee = (unitId: string) => {
    setCondo(prevCondo => {
      if (!prevCondo) return null;
      const unit = prevCondo.units.find(u => u.id === unitId);
      if (!unit) return prevCondo;

      const now = new Date();
      // Logic to get the first day of the *next* month
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const monthName = nextMonthDate.toLocaleString('es-ES', { month: 'long' });
      const year = nextMonthDate.getFullYear();

      const description = `Cuota de Mantenimiento ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
      const date = nextMonthDate.toISOString();
      
      const feeExists = (unit.accountHistory || []).some(item => item.description === description);

      if (feeExists) {
        alert(`La cuota para ${description} ya ha sido registrada.`);
        return prevCondo;
      }

      if (unit.fees.monthlyFee <= 0) {
        alert('La cuota mensual para esta unidad no está configurada.');
        return prevCondo;
      }
      
      const newMovement: Omit<AccountMovement, 'id'> = {
          date: date,
          type: 'cuota_mensual',
          description: description,
          amount: unit.fees.monthlyFee,
      };

      saveAccountMovement({ ...newMovement, unitId });
      // The state will be updated inside saveAccountMovement, so we just return the current state here
      // to avoid a double update. The logic inside saveAccountMovement will handle the state change.
      return prevCondo;
    });
  };

  const saveManagementComment = (unitId: string, comment: Omit<ManagementComment, 'id'>) => {
      setCondo(prevCondo => {
          if (!prevCondo) return null;
          const updatedUnits = prevCondo.units.map(unit => {
              if (unit.id === unitId) {
                  const maxId = (unit.managementHistory || []).reduce((max, item) => Math.max(Number(item.id.replace('mc','')), max), 0);
                  const newComment: ManagementComment = {
                      ...comment,
                      id: `mc-${maxId + 1}`,
                  };
                  const updatedHistory = [newComment, ...(unit.managementHistory || [])];
                  return { ...unit, managementHistory: updatedHistory };
              }
              return unit;
          });
          return { ...prevCondo, units: updatedUnits };
      });
  };


  const contextValue = useMemo(() => ({
    condo,
    setCondo,
    addTransaction,
    payInvoice,
    saveInvoice,
    deleteInvoice,
    saveSupplier,
    deleteSupplier,
    saveAccountMovement,
    addMonthlyFee,
    saveManagementComment,
  }), [condo]);

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
