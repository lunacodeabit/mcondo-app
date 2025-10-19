
"use client";

import { PageHeader } from "../_components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useCondo } from "@/contexts/condo-context";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "../_components/status-badge";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useMemo } from "react";

export default function AccountsPayablePage() {
  const { condo, payInvoice } = useCondo();

  const invoices = useMemo(() => {
    if (!condo) return [];
    return condo.accountsPayable.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [condo]);

  const handlePayInvoice = (invoiceId: string) => {
    const paymentDate = new Date().toISOString();
    payInvoice(invoiceId, paymentDate);
  };
  
  if (!condo) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Cuentas por Pagar" description="Gestione las facturas de suplidores y servicios.">
        <Button>
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
                          <DropdownMenuItem>Editar Factura</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-500 focus:text-red-500 focus:bg-red-50">
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
    </div>
  );
}
