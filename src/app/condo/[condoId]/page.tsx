
"use client";

import { useCondo } from "@/contexts/condo-context";
import { PageHeader } from "./_components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, TrendingUp, TrendingDown, Scale, DollarSign } from "lucide-react";
import { KpiCard } from "./_components/kpi-card";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialChart } from "./finances/financial-chart";
import { TransactionsTable } from "./finances/transactions-table";
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FinanceForm } from "./finances/finance-form";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import type { Transaction, Invoice, Unit, AccountMovement } from "@/lib/definitions";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function FinancesPage() {
  const { condo, isLoading, condoId } = useCondo();
  const [isModalOpen, setModalOpen] = useState(false);
  const firestore = useFirestore();

  // --- Data Fetching ---
  const transactionsCollection = useMemoFirebase(() => collection(firestore, 'condominiums', condoId, 'financial_transactions'), [firestore, condoId]);
  const { data: transactions, isLoading: isTransactionsLoading } = useCollection<Transaction>(transactionsCollection);

  const invoicesCollection = useMemoFirebase(() => collection(firestore, 'condominiums', condoId, 'accounts_payable'), [firestore, condoId]);
  const { data: invoices, isLoading: isInvoicesLoading } = useCollection<Invoice>(invoicesCollection);
  
  const unitsCollection = useMemoFirebase(() => collection(firestore, 'condominiums', condoId, 'units'), [firestore, condoId]);
  const { data: units, isLoading: areUnitsLoading } = useCollection<Unit>(unitsCollection);
  
  // A simple way to get account history for all units. For larger condos, this could be optimized.
  // This is a placeholder for a more complex aggregation if needed.
  const [allAccountMovements, setAllAccountMovements] = useState<{[unitId: string]: AccountMovement[]}>({});

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const transColRef = collection(firestore, 'condominiums', condoId, 'financial_transactions');
    addDocumentNonBlocking(transColRef, transaction);
  };

  const financialSummary = useMemo(() => {
    if (!condo) return { income: 0, expenses: 0, reconciledBalance: 0, toCollect: 0, toPay: 0 };

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyTransactions = (transactions || []).filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
    });

    const income = monthlyTransactions.filter(t => t.type === 'ingreso').reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthlyTransactions.filter(t => t.type === 'egreso').reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = (transactions || []).filter(t => t.type === 'ingreso').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = (transactions || []).filter(t => t.type === 'egreso').reduce((sum, t) => sum + t.amount, 0);
    const reconciledBalance = condo.finances.manualBalance + totalIncome - totalExpenses;
    
    const toPay = (invoices || []).filter(inv => inv.status === 'Pendiente' || inv.status === 'Vencida').reduce((sum, inv) => sum + inv.amount, 0);

    // This calculation is now less direct. The balance is calculated on the accounts receivable page.
    // For this dashboard, we will show a placeholder or a simplified value.
    // A proper implementation would need a more complex query or cloud function.
    const toCollect = 0; // Simplified for now.

    return { income, expenses, reconciledBalance, toCollect, toPay };
  }, [condo, transactions, invoices, units]);

  if (isLoading) return <div>Cargando...</div>;
  if (!condo) return <div>Condominio no encontrado.</div>;

  return (
    <div className="flex flex-col h-full bg-background">
      <PageHeader title="Gestión Financiera" description={`Un resumen de la salud financiera de ${condo.name}.`}>
        <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Registrar Movimiento
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Registrar Movimiento Financiero</DialogTitle>
                </DialogHeader>
                <FinanceForm addTransaction={addTransaction} closeModal={() => setModalOpen(false)} />
            </DialogContent>
        </Dialog>
      </PageHeader>
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            title="Saldo Reconciliado"
            value={formatCurrency(financialSummary.reconciledBalance, condo.currency)}
            icon={Scale}
            color="text-blue-500"
            isLoading={isTransactionsLoading}
          />
          <KpiCard
            title="Ingresos del Mes"
            value={formatCurrency(financialSummary.income, condo.currency)}
            icon={TrendingUp}
            color="text-green-500"
            isLoading={isTransactionsLoading}
          />
          <KpiCard
            title="Egresos del Mes"
            value={formatCurrency(financialSummary.expenses, condo.currency)}
            icon={TrendingDown}
            color="text-red-500"
            isLoading={isTransactionsLoading}
          />
          <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground" />Resumen de Deudas</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Total por Cobrar:</span>
                        <span className="font-bold text-green-600">N/A</span>
                    </div>
                    <div className="flex justify-between mt-1">
                        <span className="text-muted-foreground">Total por Pagar:</span>
                        <span className="font-bold text-red-600">{formatCurrency(financialSummary.toPay, condo.currency)}</span>
                    </div>
                </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle>Ingresos vs. Egresos</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <FinancialChart transactions={transactions || []} />
                </CardContent>
            </Card>
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Historial de Movimientos</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <TransactionsTable 
                        transactions={transactions || []} 
                        initialBalance={condo.finances.manualBalance}
                        currency={condo.currency}
                    />
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
