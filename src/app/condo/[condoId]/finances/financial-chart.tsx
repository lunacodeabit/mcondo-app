"use client";

import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { subMonths, format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Transaction } from '@/lib/definitions';
import { ChartTooltipContent } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FinancialChartProps {
  transactions: Transaction[];
}

export function FinancialChart({ transactions }: FinancialChartProps) {
  const [months, setMonths] = useState(6);

  const chartData = useMemo(() => {
    const data: { [key: string]: { month: string; ingresos: number; egresos: number } } = {};
    const endDate = new Date();
    const startDate = subMonths(endDate, months - 1);

    for (let i = 0; i < months; i++) {
      const date = subMonths(endDate, i);
      const monthKey = format(date, 'yyyy-MM');
      const monthLabel = format(date, 'MMM', { locale: es });
      data[monthKey] = { month: monthLabel, ingresos: 0, egresos: 0 };
    }

    transactions.forEach(t => {
      const tDate = new Date(t.date);
      if (tDate >= startDate && tDate <= endDate) {
        const monthKey = format(tDate, 'yyyy-MM');
        if (data[monthKey]) {
          if (t.type === 'ingreso') {
            data[monthKey].ingresos += t.amount;
          } else {
            data[monthKey].egresos += t.amount;
          }
        }
      }
    });

    return Object.values(data).reverse();
  }, [transactions, months]);

  return (
    <div className="h-[350px] relative">
      <div className="absolute top-[-3rem] right-0">
        <Select value={String(months)} onValueChange={(val) => setMonths(Number(val))}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Rango de tiempo" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="1">Último mes</SelectItem>
                <SelectItem value="3">Últimos 3 meses</SelectItem>
                <SelectItem value="6">Últimos 6 meses</SelectItem>
                <SelectItem value="9">Últimos 9 meses</SelectItem>
                <SelectItem value="12">Últimos 12 meses</SelectItem>
            </SelectContent>
        </Select>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${Number(value) / 1000}k`}
          />
          <Tooltip
            cursor={{ fill: 'hsl(var(--muted))' }}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Bar dataKey="ingresos" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Ingresos"/>
          <Bar dataKey="egresos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Egresos" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
