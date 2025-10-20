"use client";

import { useMemo } from 'react';
import type { Transaction } from '@/lib/definitions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionsTableProps {
  transactions: Transaction[];
  initialBalance: number;
  currency: string;
}

export function TransactionsTable({ transactions, initialBalance, currency }: TransactionsTableProps) {
  const transactionsWithBalance = useMemo(() => {
    // We need to calculate balances from oldest to newest first
    const balanceCalculationMap = new Map<string, number>();
    let runningBalance = initialBalance;
    [...transactions]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach(t => {
        runningBalance += t.type === 'ingreso' ? t.amount : -t.amount;
        balanceCalculationMap.set(t.id, runningBalance);
      });

    // Then, sort for display (newest first)
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(t => ({
        ...t,
        balance: balanceCalculationMap.get(t.id) || 0,
    }));
  }, [transactions, initialBalance]);

  return (
    <ScrollArea className="h-[430px]">
      <Table>
        <TableHeader className="sticky top-0 bg-card z-10">
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead className="text-right">Monto</TableHead>
            <TableHead className="text-right">Saldo</TableHead>
            <TableHead className="text-center">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactionsWithBalance.map(t => (
            <TableRow key={t.id}>
              <TableCell className="text-xs">{formatDate(t.date, { day: '2-digit', month: '2-digit', year: 'numeric' })}</TableCell>
              <TableCell>
                <span className={cn('text-xs font-semibold px-2 py-1 rounded-full',
                    t.type === 'ingreso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                )}>
                    {t.type}
                </span>
              </TableCell>
              <TableCell className="font-medium">{t.description}</TableCell>
              <TableCell className="text-muted-foreground">{t.category}</TableCell>
              <TableCell className={cn(
                  "text-right font-mono",
                  t.type === 'ingreso' ? 'text-green-600' : 'text-red-600'
                )}>
                {t.type === 'ingreso' ? '+' : '-'}{formatCurrency(t.amount, currency)}
              </TableCell>
              <TableCell className="text-right font-mono">{formatCurrency(t.balance, currency)}</TableCell>
              <TableCell className="text-center">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
