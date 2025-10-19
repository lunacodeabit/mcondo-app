"use client";

import { useMemo } from 'react';
import type { Transaction } from '@/lib/definitions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionsTableProps {
  transactions: Transaction[];
  initialBalance: number;
  currency: string;
}

export function TransactionsTable({ transactions, initialBalance, currency }: TransactionsTableProps) {
  const transactionsWithBalance = useMemo(() => {
    let currentBalance = initialBalance;
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // We need to calculate balances from oldest to newest first
    const balanceCalculationMap = new Map<string, number>();
    let runningBalance = initialBalance;
    [...transactions]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach(t => {
        runningBalance += t.type === 'ingreso' ? t.amount : -t.amount;
        balanceCalculationMap.set(t.id, runningBalance);
      });

    return sortedTransactions.map(t => ({
      ...t,
      balance: balanceCalculationMap.get(t.id) || 0,
    }));
  }, [transactions, initialBalance]);

  return (
    <ScrollArea className="h-[430px]">
      <Table>
        <TableHeader className="sticky top-0 bg-card z-10">
          <TableRow>
            <TableHead>Descripción</TableHead>
            <TableHead className="text-right">Monto</TableHead>
            <TableHead className="text-right">Balance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactionsWithBalance.map(t => (
            <TableRow key={t.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                   {t.type === 'ingreso' ? 
                    <ArrowUpCircle className="h-4 w-4 text-green-500" /> : 
                    <ArrowDownCircle className="h-4 w-4 text-red-500" />}
                  <div>
                    <div className="font-medium">{t.description}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(t.date)}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className={cn(
                  "text-right font-mono",
                  t.type === 'ingreso' ? 'text-green-600' : 'text-red-600'
                )}>
                {t.type === 'ingreso' ? '+' : '-'}{formatCurrency(t.amount, currency)}
              </TableCell>
              <TableCell className="text-right font-mono">{formatCurrency(t.balance, currency)}</TableCell>
            </TableRow>
          ))}
           <TableRow className='bg-muted/50'>
              <TableCell colSpan={2} className="font-bold">Balance Inicial</TableCell>
              <TableCell className="text-right font-bold font-mono">{formatCurrency(initialBalance, currency)}</TableCell>
            </TableRow>
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
