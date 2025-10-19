
"use client";

import { useMemo } from "react";
import { useCondo } from "@/contexts/condo-context";
import { PageHeader } from "../_components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AccountsReceivablePage() {
  const { condo } = useCondo();

  const unitsWithBalance = useMemo(() => {
    if (!condo) return [];
    return condo.units.map(unit => {
      const balance = unit.accountHistory.reduce((acc, mov) => acc + mov.amount, 0);
      return { ...unit, balance };
    }).sort((a,b) => b.balance - a.balance);
  }, [condo]);

  const getBalanceBadge = (balance: number) => {
    if (balance > 0) {
      return <Badge variant="destructive">Debe</Badge>;
    }
    if (balance < 0) {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">A favor</Badge>;
    }
    return <Badge variant="secondary">Al día</Badge>;
  }

  if (!condo) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Cuentas por Cobrar" description="Administre los estados de cuenta de cada unidad." />
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
            <CardContent className="p-0">
               <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Unidad</TableHead>
                        <TableHead>Propietario</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Saldo</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {unitsWithBalance.map(unit => (
                        <TableRow key={unit.id}>
                            <TableCell className="font-medium">{unit.unitNumber}</TableCell>
                            <TableCell>{unit.owner.name}</TableCell>
                            <TableCell>{getBalanceBadge(unit.balance)}</TableCell>
                            <TableCell className={cn(
                                "text-right font-mono",
                                unit.balance > 0 && "text-destructive",
                                unit.balance < 0 && "text-blue-600"
                            )}>
                                {formatCurrency(unit.balance, condo.currency)}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="outline" size="sm" disabled>Ver Detalle</Button>
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
