"use client";

import React, { createContext, useContext, useState, useMemo } from 'react';
import type { Condo, Transaction, Invoice } from '@/lib/definitions';

interface CondoContextType {
  condo: Condo | null;
  setCondo: React.Dispatch<React.SetStateAction<Condo | null>>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  payInvoice: (invoiceId: string, paymentDate: string) => void;
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

  const contextValue = useMemo(() => ({
    condo,
    setCondo,
    addTransaction,
    payInvoice,
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
