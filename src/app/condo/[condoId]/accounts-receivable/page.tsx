
"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useCondo } from "@/contexts/condo-context";
import { PageHeader } from "../_components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AccountStatementDetail } from "./_components/account-statement-detail";
import type { Unit } from "@/lib/definitions";
import { useSearchParams } from 'next/navigation';

function AccountsReceivableContent() {
  const { condo } = useCondo();
  const [isDetailOpen, setDetailOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | undefined>(undefined);
  const searchParams = useSearchParams();

  useEffect(() => {
    const unitIdToView = searchParams.get('viewUnit');
    if (unitIdToView && condo) {
      const unit = condo.units.find(u => u.id === unitIdToView);
      if (unit) {
        handleViewDetail(unit);
      }
    }
  }, [searchParams, condo]);


  const unitsWithBalance = useMemo(() => {
    if (!condo) return [];
    const currentUnits = condo.units;
    return currentUnits.map(unit => {
      const balance = (unit.accountHistory || []).reduce((acc, mov) => acc + mov.amount, 0);
      return { ...unit, balance };
    }).sort((a, b) => b.balance - a.balance);
  }, [condo, isDetailOpen]);

  const getBalanceBadge = (balance: number) => {
    if (balance > 0) {
      return <Badge variant="destructive">Debe</Badge>;
    }
    if (balance < 0) {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800">A favor</Badge>;
    }
    return <Badge variant="secondary">Al día</Badge>;
  }
  
  const handleViewDetail = (unit: Unit) => {
    setSelectedUnit(unit);
    setDetailOpen(true);
  }

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedUnit(undefined);
  }
  
  const latestSelectedUnit = useMemo(() => {
    if (!selectedUnit || !condo) return undefined;
    return condo.units.find(u => u.id === selectedUnit.id);
  }, [condo, selectedUnit]);


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
                        <TableRow key={unit.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewDetail(unit)}>
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
                                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleViewDetail(unit); }}>Ver Detalle</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
               </Table>
            </CardContent>
        </Card>
      </main>

      <Dialog open={isDetailOpen} onOpenChange={handleCloseDetail}>
        <DialogContent className="max-w-4xl h-[90vh]">
            <DialogHeader>
                <DialogTitle>Estado de Cuenta - Apto. {latestSelectedUnit?.unitNumber}</DialogTitle>
                <DialogDescription>
                    Historial completo de transacciones y gestiones para esta unidad.
                </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto -mx-6 px-6">
              {latestSelectedUnit && <AccountStatementDetail unit={latestSelectedUnit} />}
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AccountsReceivablePage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <AccountsReceivableContent />
        </Suspense>
    )
}
