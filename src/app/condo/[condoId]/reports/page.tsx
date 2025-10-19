
"use client";

import { PageHeader } from "../_components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { useCondo } from "@/contexts/condo-context";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";
import type { Unit } from "@/lib/definitions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useState, useEffect } from "react";


export default function ReportsPage() {
  const { condo, condoId } = useCondo();
  const firestore = useFirestore();

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


  const generateReceivablesReport = () => {
    if (!condo || !units || areBalancesLoading) {
        alert("Los datos aún no están listos para generar el reporte.");
        return;
    };
    
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(`Reporte de Cuentas por Cobrar - ${condo.name}`, 14, 22);
    doc.setFontSize(11);
    doc.text(`Fecha: ${formatDate(new Date().toISOString())}`, 14, 30);

    const tableColumn = ["Unidad", "Propietario", "Estado", "Saldo"];
    const tableRows: (string | number)[][] = [];

    units.forEach(unit => {
        const balance = balances[unit.id] || 0;
        const status = balance <= 0 ? "Al día" : "Debe";
        const row = [
            unit.unitNumber,
            unit.owner.name,
            status,
            formatCurrency(balance, condo.currency),
        ];
        tableRows.push(row);
    });
    
    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 35,
    });

    const totalDebt = Object.values(balances).reduce((sum, balance) => sum + (balance > 0 ? balance : 0), 0);
    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(12);
    doc.text(`Total por Cobrar: ${formatCurrency(totalDebt, condo.currency)}`, 14, finalY + 10);
    
    doc.save(`Reporte_Cuentas_por_Cobrar_${condo.name}.pdf`);
  };


  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Reportes" description="Genere reportes financieros y administrativos." />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Cuentas por Cobrar</CardTitle>
                    <CardDescription>
                        Genere un resumen de los saldos de todas las unidades,
                        indicando quiénes están al día y quiénes tienen deudas pendientes.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={generateReceivablesReport} disabled={areUnitsLoading || areBalancesLoading}>
                        <FileDown className="mr-2 h-4 w-4" />
                        {areUnitsLoading || areBalancesLoading ? 'Cargando datos...' : 'Generar PDF'}
                    </Button>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
