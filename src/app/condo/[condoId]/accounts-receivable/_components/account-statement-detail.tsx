
"use client";

import { useMemo, useState } from "react";
import { useCondo } from "@/contexts/condo-context";
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


interface AccountStatementDetailProps {
    unit: Unit;
}

export function AccountStatementDetail({ unit }: AccountStatementDetailProps) {
    const { condo, saveAccountMovement, addMonthlyFee, saveManagementComment } = useCondo();
    const [comment, setComment] = useState("");
    const [isMovementFormOpen, setMovementFormOpen] = useState(false);
    const [movementType, setMovementType] = useState<'cargo' | 'abono' | undefined>(undefined);

    const balance = useMemo(() => {
        return (unit.accountHistory || []).reduce((acc, item) => acc + item.amount, 0);
    }, [unit.accountHistory]);
    
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

    const handleSaveMovement = (values: any) => {
        const movementData = {
            ...values,
            amount: values.type === 'abono' ? -Math.abs(values.amount) : Math.abs(values.amount)
        };
        saveAccountMovement(movementData);
        setMovementFormOpen(false);
    }
    
    if (!condo || !unit) return null;

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
                        <CardTitle className={`text-lg ${balance > 0 ? 'text-destructive' : 'text-green-600'}`}>
                            {formatCurrency(balance, condo.currency)}
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
                                    {(unit.accountHistory || []).map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell className="text-xs">{formatDate(item.date, {day: '2-digit', month: 'short', year: 'numeric'})}</TableCell>
                                            <TableCell>{item.description}</TableCell>
                                            <TableCell className={cn("text-right font-mono", item.amount > 0 ? 'text-red-600' : 'text-green-600')}>
                                                {formatCurrency(item.amount, condo.currency)}
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
                            {(unit.adminData?.notes ? [{id: 'initial-note', date: '', comment: unit.adminData.notes, user: 'Nota inicial'}] : []).concat(unit.managementHistory || []).map(item => (
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
                        units={condo.units}
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
