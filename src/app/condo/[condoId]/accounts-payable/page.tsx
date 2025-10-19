
"use client";

import { useMemo, useState } from "react";
import { useCondo } from "@/contexts/condo-context";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Invoice } from "@/lib/definitions";

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

export default function AccountsPayablePage() {
  const { condo, payInvoice, saveInvoice, deleteInvoice } = useCondo();
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [invoiceToEdit, setInvoiceToEdit] = useState<Invoice | undefined>(undefined);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | undefined>(undefined);


  const invoices = useMemo(() => {
    if (!condo) return [];
    return condo.accountsPayable.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [condo]);

  const handlePayInvoice = (invoiceId: string) => {
    const paymentDate = new Date().toISOString();
    payInvoice(invoiceId, paymentDate);
  };
  
  const handleOpenForm = (invoice?: Invoice) => {
    setInvoiceToEdit(invoice);
    setFormModalOpen(true);
  };

  const handleCloseForm = () => {
    setInvoiceToEdit(undefined);
    setFormModalOpen(false);
  }

  const handleSave = (invoice: Omit<Invoice, 'id' | 'status'> | Invoice) => {
    saveInvoice(invoice);
    handleCloseForm();
  };

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

  if (!condo) {
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
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{condo.suppliers.find(s => s.id === invoice.supplierId)?.name || 'N/A'}</TableCell>
                    <TableCell>{invoice.invoiceNumber}</TableCell>
                    <TableCell>{formatDate(invoice.date, { month: 'short', day: 'numeric', year: 'numeric' })}</TableCell>
                    <TableCell>{formatDate(invoice.dueDate, { month: 'short', day: 'numeric', year: 'numeric' })}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(invoice.amount, condo.currency)}</TableCell>
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
                            <DropdownMenuItem onClick={() => handlePayInvoice(invoice.id)}>
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
            suppliers={condo.suppliers}
            onSubmit={handleSave} 
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
