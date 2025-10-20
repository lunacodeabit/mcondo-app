
"use client";

import { useMemo, useState } from "react";
import { useCondo } from "@/contexts/condo-context";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Invoice, Supplier, Transaction } from "@/lib/definitions";

import { PageHeader } from "../_components/page-header";
import { StatusBadge } from "../_components/status-badge";
import { BillForm } from "./_components/bill-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection, doc } from "firebase/firestore";


export default function AccountsPayablePage() {
  const { condo, condoId } = useCondo();
  const firestore = useFirestore();

  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [invoiceToEdit, setInvoiceToEdit] = useState<Invoice | undefined>(undefined);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | undefined>(undefined);

  const invoicesCollection = useMemoFirebase(() => collection(firestore, 'condominiums', condoId, 'accounts_payable'), [firestore, condoId]);
  const { data: invoices, isLoading: areInvoicesLoading } = useCollection<Invoice>(invoicesCollection);

  const suppliersCollection = useMemoFirebase(() => collection(firestore, 'condominiums', condoId, 'suppliers'), [firestore, condoId]);
  const { data: suppliers, isLoading: areSuppliersLoading } = useCollection<Supplier>(suppliersCollection);

  const sortedInvoices = useMemo(() => {
    if (!invoices) return [];
    return [...invoices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [invoices]);

  const payInvoice = (invoiceId: string) => {
      if (!invoices || !suppliers) return;
      const invoiceToPay = invoices.find(inv => inv.id === invoiceId);
      if (!invoiceToPay) return;

      const newTransaction: Omit<Transaction, 'id'> = {
        date: new Date().toISOString(),
        description: `Pago factura #${invoiceToPay.invoiceNumber} a ${suppliers.find(s => s.id === invoiceToPay.supplierId)?.name || 'N/A'}`,
        type: 'egreso',
        category: 'Cuentas por Pagar',
        amount: invoiceToPay.amount,
        reference: invoiceId,
      };

      const transColRef = collection(firestore, 'condominiums', condoId, 'financial_transactions');
      addDocumentNonBlocking(transColRef, newTransaction).then(docRef => {
        const invoiceRef = doc(firestore, 'condominiums', condoId, 'accounts_payable', invoiceId);
        updateDocumentNonBlocking(invoiceRef, { status: 'Pagada', relatedTransactionId: docRef?.id });
      });
  };

  const saveInvoice = (invoice: Omit<Invoice, 'id' | 'status'> | Invoice) => {
    const colRef = collection(firestore, 'condominiums', condoId, 'accounts_payable');
    const dataToSave = {
      ...invoice,
      date: typeof invoice.date === 'string' ? invoice.date : (invoice.date as Date).toISOString(),
      dueDate: typeof invoice.dueDate === 'string' ? invoice.dueDate : (invoice.dueDate as Date).toISOString(),
    };

    if ('id' in dataToSave) {
        const docRef = doc(colRef, dataToSave.id);
        updateDocumentNonBlocking(docRef, dataToSave);
    } else {
        const newId = `inv-${new Date().getTime()}`;
        const docRef = doc(colRef, newId);
        setDocumentNonBlocking(docRef, { ...dataToSave, id: newId, status: 'Pendiente' }, { merge: true });
    }
    handleCloseForm();
  };

  const deleteInvoice = (invoiceId: string) => {
    const docRef = doc(firestore, 'condominiums', condoId, 'accounts_payable', invoiceId);
    deleteDocumentNonBlocking(docRef);
  };
  
  const handleOpenForm = (invoice?: Invoice) => {
    setInvoiceToEdit(invoice);
    setFormModalOpen(true);
  };

  const handleCloseForm = () => {
    setInvoiceToEdit(undefined);
    setFormModalOpen(false);
  }

  const handleOpenDeleteAlert = (invoiceId: string) => {
    setInvoiceToDelete(invoiceId);
    setDeleteAlertOpen(true);
  }

  const handleConfirmDelete = () => {
    if (invoiceToDelete) {
      deleteInvoice(invoiceToDelete);
    }
    setDeleteAlertOpen(false);
    setInvoiceToDelete(undefined);
  }

  if (areInvoicesLoading || areSuppliersLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Cuentas por Pagar" description="Gestione las facturas de suplidores y servicios.">
        <Button onClick={() => handleOpenForm()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Registrar Factura
        </Button>
      </PageHeader>
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Suplidor</TableHead>
                  <TableHead>No. Factura</TableHead>
                  <TableHead>Fecha Emisión</TableHead>
                  <TableHead>Fecha Vencimiento</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{(suppliers || []).find(s => s.id === invoice.supplierId)?.name || 'N/A'}</TableCell>
                    <TableCell>{invoice.invoiceNumber}</TableCell>
                    <TableCell>{formatDate(invoice.date, { month: 'short', day: 'numeric', year: 'numeric' })}</TableCell>
                    <TableCell>{formatDate(invoice.dueDate, { month: 'short', day: 'numeric', year: 'numeric' })}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(invoice.amount, condo?.currency || 'USD')}</TableCell>
                    <TableCell>
                      <StatusBadge status={invoice.status} />
                    </TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          {invoice.status !== 'Pagada' && (
                            <DropdownMenuItem onClick={() => payInvoice(invoice.id)}>
                              Marcar como Pagada
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleOpenForm(invoice)}>
                            Editar Factura
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-500 focus:text-red-500 focus:bg-red-50"
                            onClick={() => handleOpenDeleteAlert(invoice.id)}
                            >
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      <Dialog open={isFormModalOpen} onOpenChange={setFormModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{invoiceToEdit ? 'Editar' : 'Registrar'} Factura</DialogTitle>
            <DialogDescription>
              Complete los detalles de la factura por pagar.
            </DialogDescription>
          </DialogHeader>
          <BillForm 
            suppliers={suppliers || []}
            onSubmit={saveInvoice as any} 
            onCancel={handleCloseForm}
            invoice={invoiceToEdit}
          />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro que desea eliminar esta factura?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la factura.
              No se eliminará ninguna transacción de egreso asociada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
