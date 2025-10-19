
"use client";

import React, { createContext, useContext, useState, useMemo } from 'react';
import type { Condo, Transaction, Invoice, Supplier } from '@/lib/definitions';

interface CondoContextType {
  condo: Condo | null;
  setCondo: React.Dispatch<React.SetStateAction<Condo | null>>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  payInvoice: (invoiceId: string, paymentDate: string) => void;
  saveInvoice: (invoice: Omit<Invoice, 'id' | 'status'> | Invoice) => void;
  deleteInvoice: (invoiceId: string) => void;
  saveSupplier: (supplier: Omit<Supplier, 'id'> | Supplier) => void;
  deleteSupplier: (supplierId: string) => void;
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

  const contextValue = useMemo(() => ({
    condo,
    setCondo,
    addTransaction,
    payInvoice,
    saveInvoice,
    deleteInvoice,
    saveSupplier,
    deleteSupplier,
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
