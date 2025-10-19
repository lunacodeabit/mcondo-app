
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

export default function FinancesPage() {
  const { condo, addTransaction } = useCondo();
  const [isModalOpen, setModalOpen] = useState(false);

  const financialSummary = useMemo(() => {
    if (!condo) return { income: 0, expenses: 0, reconciledBalance: 0, toCollect: 0, toPay: 0 };

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const income = condo.finances.transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'ingreso' && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = condo.finances.transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'egreso' && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = condo.finances.transactions.filter(t => t.type === 'ingreso').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = condo.finances.transactions.filter(t => t.type === 'egreso').reduce((sum, t) => sum + t.amount, 0);
    const reconciledBalance = condo.finances.manualBalance + totalIncome - totalExpenses;
    
    const toPay = condo.accountsPayable
        .filter(inv => inv.status === 'Pendiente' || inv.status === 'Vencida')
        .reduce((sum, inv) => sum + inv.amount, 0);

    const toCollect = condo.units.reduce((total, unit) => {
        const balance = (unit.accountHistory || []).reduce((acc, mov) => acc + mov.amount, 0);
        return total + (balance > 0 ? balance : 0);
    }, 0);

    return { income, expenses, reconciledBalance, toCollect, toPay };
  }, [condo]);

  if (!condo) return <div>Cargando...</div>;

  return (
    <div className="flex flex-col h-full bg-background">
      <PageHeader title="Finanzas" description="Un resumen de la salud financiera del condominio.">
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
          />
          <KpiCard
            title="Ingresos del Mes"
            value={formatCurrency(financialSummary.income, condo.currency)}
            icon={TrendingUp}
            color="text-green-500"
          />
          <KpiCard
            title="Egresos del Mes"
            value={formatCurrency(financialSummary.expenses, condo.currency)}
            icon={TrendingDown}
            color="text-red-500"
          />
          <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground" />Resumen de Deudas</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Total por Cobrar:</span>
                        <span className="font-bold text-green-600">{formatCurrency(financialSummary.toCollect, condo.currency)}</span>
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
                    <FinancialChart transactions={condo.finances.transactions} />
                </CardContent>
            </Card>
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Historial de Movimientos</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <TransactionsTable 
                        transactions={condo.finances.transactions} 
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
