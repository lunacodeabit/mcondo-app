
"use client";

import { useMemo, useState } from "react";
import type { Unit, AccountMovement, ManagementComment } from "@/lib/definitions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PlusCircle, MinusCircle, CalendarPlus, MessageSquarePlus } from "lucide-react";
import { AccountMovementForm } from "./account-movement-form";

import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { addDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase/non-blocking-updates";


interface AccountStatementDetailProps {
    unit: Unit;
    condoId: string;
}

export function AccountStatementDetail({ unit, condoId }: AccountStatementDetailProps) {
    const firestore = useFirestore();
    const [comment, setComment] = useState("");
    const [isMovementFormOpen, setMovementFormOpen] = useState(false);
    const [movementType, setMovementType] = useState<'cargo' | 'abono' | undefined>(undefined);

    const accountHistoryQuery = useMemoFirebase(() => collection(firestore, 'condominiums', condoId, 'units', unit.id, 'account_history'), [firestore, condoId, unit.id]);
    const { data: accountHistory, isLoading: isHistoryLoading } = useCollection<AccountMovement>(accountHistoryQuery);

    const managementHistoryQuery = useMemoFirebase(() => collection(firestore, 'condominiums', condoId, 'units', unit.id, 'management_history'), [firestore, condoId, unit.id]);
    const { data: managementHistory, isLoading: isManagementHistoryLoading } = useCollection<ManagementComment>(managementHistoryQuery);

    const saveManagementComment = (unitId: string, comment: Omit<ManagementComment, 'id'>) => {
      const commentColRef = collection(firestore, 'condominiums', condoId, 'units', unitId, 'management_history');
      addDocumentNonBlocking(commentColRef, comment);
    };

    const saveAccountMovement = (movement: Omit<AccountMovement, 'id'> & { unitId: string }) => {
        const { unitId, ...movementData } = movement;
        const colRef = collection(firestore, 'condominiums', condoId, 'units', unitId, 'account_history');
        addDocumentNonBlocking(colRef, movementData);
    };

     const addMonthlyFee = (unitId: string) => {
        if (!unit) return;

        const now = new Date();
        const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const monthName = nextMonthDate.toLocaleString('es-ES', { month: 'long' });
        const year = nextMonthDate.getFullYear();

        const description = `Cuota de Mantenimiento ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
        const date = nextMonthDate.toISOString();
        
        const feeExists = (accountHistory || []).some(item => item.description === description);

        if (feeExists) {
            alert(`La cuota para ${description} ya ha sido registrada.`);
            return;
        }
        
        if (unit.fees.monthlyFee <= 0) {
            alert('La cuota mensual para esta unidad no está configurada.');
            return;
        }

        const movement: Omit<AccountMovement, 'id'> = {
            date: date,
            type: 'cuota_mensual',
            description: description,
            amount: unit.fees.monthlyFee,
        };
        
        saveAccountMovement({ ...movement, unitId });
    };


    const balance = useMemo(() => {
        return (accountHistory || []).reduce((acc, item) => acc + item.amount, 0);
    }, [accountHistory]);
    
    const handleSaveComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim() || !unit) return;
        
        const newComment: Omit<ManagementComment, 'id'> = {
            date: new Date().toISOString(),
            comment: comment,
            user: "Admin" // Placeholder for logged-in user
        };
        saveManagementComment(unit.id, newComment);
        setComment("");
    };

    const handleOpenMovementForm = (type: 'cargo' | 'abono') => {
        setMovementType(type);
        setMovementFormOpen(true);
    };

    const handleSaveMovement = (values: { date: Date | string } & Omit<AccountMovement, 'id' | 'date'> & { unitId: string }) => {
        const movementData = {
            ...values,
            date: values.date instanceof Date ? values.date.toISOString() : values.date,
            amount: values.type === 'abono' ? -Math.abs(values.amount) : Math.abs(values.amount)
        };
        saveAccountMovement(movementData);
        setMovementFormOpen(false);
    }
    
    if (!unit) return null;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Propietario</CardDescription>
                        <CardTitle className="text-lg">{unit.owner.name}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Teléfono</CardDescription>
                        <CardTitle className="text-lg">{unit.owner.phone}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Saldo Actual</CardDescription>
                        <CardTitle className={`text-lg ${balance >= 0 ? 'text-destructive' : 'text-green-600'}`}>
                            {formatCurrency(balance)}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <div className="flex flex-wrap gap-2">
                <Button onClick={() => handleOpenMovementForm('cargo')} size="sm"><PlusCircle className="mr-2"/>Agregar Cargo</Button>
                <Button onClick={() => handleOpenMovementForm('abono')} size="sm" variant="outline"><MinusCircle className="mr-2"/>Agregar Abono</Button>
                <Button onClick={() => addMonthlyFee(unit.id)} size="sm" variant="secondary"><CalendarPlus className="mr-2"/>Agregar Cuota del Mes</Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                    <h4 className="text-lg font-semibold text-foreground mb-2">Historial de Cuenta</h4>
                    <Card>
                      <CardContent className="p-0">
                        <ScrollArea className="h-96">
                            <Table>
                                <TableHeader className="sticky top-0 bg-card">
                                    <TableRow>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Descripción</TableHead>
                                        <TableHead className="text-right">Monto</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(accountHistory || []).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell className="text-xs">{formatDate(item.date, {day: '2-digit', month: 'short', year: 'numeric'})}</TableCell>
                                            <TableCell>{item.description}</TableCell>
                                            <TableCell className={cn("text-right font-mono", item.amount >= 0 ? 'text-red-600' : 'text-green-600')}>
                                                {formatCurrency(item.amount)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                       </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <h4 className="text-lg font-semibold text-foreground mb-2">Historial de Gestión</h4>
                    <form onSubmit={handleSaveComment} className="mb-4">
                        <Textarea 
                            value={comment} 
                            onChange={(e) => setComment(e.target.value)}
                            rows={2}
                            placeholder="Agregar un nuevo comentario..."
                        />
                        <Button type="submit" size="sm" className="mt-2"><MessageSquarePlus className="mr-2" />Guardar Comentario</Button>
                    </form>
                    <ScrollArea className="h-80 pr-4">
                        <div className="space-y-3">
                            {(managementHistory || []).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(item => (
                                <Card key={item.id} className="bg-muted/50">
                                    <CardContent className="p-3 text-sm">
                                        <p className="text-foreground">{item.comment}</p>
                                        <p className="text-xs text-muted-foreground text-right mt-2">
                                            {item.user} - {item.date ? formatDate(item.date) : ''}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            <Dialog open={isMovementFormOpen} onOpenChange={setMovementFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Registrar Movimiento en Cuenta</DialogTitle>
                        <DialogDescription>Apto. {unit.unitNumber} - {unit.owner.name}</DialogDescription>
                    </DialogHeader>
                    <AccountMovementForm 
                        units={[]}
                        onSubmit={handleSaveMovement}
                        onCancel={() => setMovementFormOpen(false)}
                        preselectedUnitId={unit.id}
                        movementType={movementType}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
