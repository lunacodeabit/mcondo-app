"use client";

import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import { subMonths, format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Transaction } from '@/lib/definitions';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FinancialChartProps {
  transactions: Transaction[];
}

const timeRanges = [
  { label: '1M', months: 1 },
  { label: '3M', months: 3 },
  { label: '6M', months: 6 },
  { label: '12M', months: 12 },
];

export function FinancialChart({ transactions }: FinancialChartProps) {
  const [months, setMonths] = useState(6);

  const chartConfig = {
    ingresos: {
      label: "Ingresos",
      color: "hsl(var(--accent))",
    },
    egresos: {
      label: "Egresos",
      color: "hsl(var(--primary) / 0.7)", // Softer blue
    },
  } satisfies ChartConfig;

  const chartData = useMemo(() => {
    const data: { [key: string]: { month: string; ingresos: number; egresos: number } } = {};
    const endDate = new Date();
    const startDate = subMonths(endDate, months - 1);

    for (let i = 0; i < months; i++) {
      const date = subMonths(endDate, i);
      const monthKey = format(date, 'yyyy-MM');
      const monthLabel = format(date, 'MMM yyyy', { locale: es });
      data[monthKey] = { month: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1), ingresos: 0, egresos: 0 };
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
      <div className="absolute top-[-3.5rem] right-0 flex gap-1">
        {timeRanges.map(range => (
            <Button 
                key={range.label}
                variant="ghost"
                size="sm"
                onClick={() => setMonths(range.months)}
                className={cn('text-xs', months === range.months && 'bg-muted font-bold')}
            >
                {range.label}
            </Button>
        ))}
      </div>
      <ChartContainer config={chartConfig} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
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
            <Legend content={<CustomLegend payload={undefined} chartConfig={chartConfig} />} />
            <Bar dataKey="ingresos" fill="var(--color-ingresos)" radius={[4, 4, 0, 0]} name="Ingresos"/>
            <Bar dataKey="egresos" fill="var(--color-egresos)" radius={[4, 4, 0, 0]} name="Egresos" />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}

const CustomLegend = ({ chartConfig }: { payload: any, chartConfig: ChartConfig }) => (
    <div className="flex justify-center gap-4 text-sm mt-4">
      {Object.entries(chartConfig).map(([key, config]) => (
        <div key={key} className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: config.color }}></span>
          <span>{config.label}</span>
        </div>
      ))}
    </div>
);
