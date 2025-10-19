
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
import type { Unit, AccountMovement } from "@/lib/definitions";
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";


function AccountsReceivableContent() {
  const { condo, isLoading: isCondoLoading, condoId } = useCondo();
  const firestore = useFirestore();
  const router = useRouter();

  const [isDetailOpen, setDetailOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | undefined>(undefined);
  const searchParams = useSearchParams();
  
  const unitsCollection = useMemoFirebase(() => collection(firestore, 'condominiums', condoId, 'units'), [firestore, condoId]);
  const { data: units, isLoading: areUnitsLoading } = useCollection<Unit>(unitsCollection);
  
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [areBalancesLoading, setAreBalancesLoading] = useState(true);

  useEffect(() => {
    if (!units) return;

    const fetchBalances = async () => {
        setAreBalancesLoading(true);
        const newBalances: Record<string, number> = {};
        for (const unit of units) {
            const historyCollection = collection(firestore, 'condominiums', condoId, 'units', unit.id, 'account_history');
            const historySnapshot = await getDocs(historyCollection);
            const balance = historySnapshot.docs.reduce((acc, doc) => acc + doc.data().amount, 0);
            newBalances[unit.id] = balance;
        }
        setBalances(newBalances);
        setAreBalancesLoading(false);
    };

    fetchBalances();
  }, [units, firestore, condoId]);


  const unitsWithBalance = useMemo(() => {
    if (!units) return [];
    return units.map(unit => ({ 
        ...unit, 
        balance: balances[unit.id] || 0 
    })).sort((a, b) => b.balance - a.balance);
  }, [units, balances]);

  useEffect(() => {
    const unitIdToView = searchParams.get('viewUnit');
    if (unitIdToView && units) {
      const unit = units.find(u => u.id === unitIdToView);
      if (unit) {
        handleViewDetail(unit);
      }
    }
  }, [searchParams, units]);


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
    // Update URL without reloading
    router.replace(`/condo/${condoId}/accounts-receivable?viewUnit=${unit.id}`, undefined);
  }

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedUnit(undefined);
    router.replace(`/condo/${condoId}/accounts-receivable`, undefined);
  }
  
  if (isCondoLoading || areUnitsLoading || areBalancesLoading) {
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
                            {Array.from({length: 5}).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-4 w-24 float-right" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-24 float-right" /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                       </Table>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
  }
  if (!condo) return null;

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
                                {formatCurrency(unit.balance, condo?.currency || 'USD')}
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
                <DialogTitle>Estado de Cuenta - Apto. {selectedUnit?.unitNumber}</DialogTitle>
                <DialogDescription>
                    Historial completo de transacciones y gestiones para esta unidad.
                </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto -mx-6 px-6">
              {selectedUnit && <AccountStatementDetail unit={selectedUnit} condoId={condoId} />}
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
