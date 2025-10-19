
"use client";

import { useState } from "react";
import { useCondo } from "@/contexts/condo-context";
import { PageHeader } from "../_components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { Unit } from "@/lib/definitions";
import { UnitForm } from "./_components/unit-form";
import { useRouter } from 'next/navigation';
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection, doc } from "firebase/firestore";

export default function UnitsPage() {
  const { condoId } = useCondo();
  const firestore = useFirestore();
  const router = useRouter();

  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [unitToEdit, setUnitToEdit] = useState<Unit | undefined>(undefined);
  const [unitToDelete, setUnitToDelete] = useState<string | undefined>(undefined);
  
  const unitsCollection = useMemoFirebase(() => collection(firestore, 'condominiums', condoId, 'units'), [firestore, condoId]);
  const { data: units, isLoading } = useCollection<Unit>(unitsCollection);

  const saveUnit = (unit: Omit<Unit, 'id' | 'accountHistory' | 'managementHistory'> | Unit) => {
    const colRef = collection(firestore, 'condominiums', condoId, 'units');
    const { accountHistory, managementHistory, ...unitData } = unit as Unit;
    
    if ('id' in unitData) {
        const unitRef = doc(colRef, unitData.id);
        updateDocumentNonBlocking(unitRef, unitData);
    } else {
        addDocumentNonBlocking(colRef, unitData);
    }
    handleCloseForm();
  };

  const deleteUnit = (unitId: string) => {
    const unitRef = doc(firestore, 'condominiums', condoId, 'units', unitId);
    deleteDocumentNonBlocking(unitRef);
  };

  const handleOpenForm = (unit?: Unit) => {
    setUnitToEdit(unit);
    setFormModalOpen(true);
  };

  const handleCloseForm = () => {
    setUnitToEdit(undefined);
    setFormModalOpen(false);
  }

  const handleOpenDeleteAlert = (unitId: string) => {
    setUnitToDelete(unitId);
    setDeleteAlertOpen(true);
  }

  const handleConfirmDelete = () => {
    if (unitToDelete) {
      deleteUnit(unitToDelete);
    }
    setDeleteAlertOpen(false);
    setUnitToDelete(undefined);
  }

  const handleViewStatement = (unitId: string) => {
     const accountsReceivableUrl = `/condo/${condoId}/accounts-receivable?viewUnit=${unitId}`;
     router.push(accountsReceivableUrl);
  }

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Unidades" description="Gestione las propiedades y sus residentes.">
        <Button onClick={() => handleOpenForm()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Agregar Unidad
        </Button>
      </PageHeader>
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>No. Unidad</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Propietario</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead>Ocupación</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(units || []).map((unit) => (
                            <TableRow key={unit.id}>
                                <TableCell className="font-medium">{unit.unitNumber}</TableCell>
                                <TableCell>{unit.type}</TableCell>
                                <TableCell>
                                    <div>{unit.owner.name}</div>
                                    <div className="text-xs text-muted-foreground">{unit.owner.email}</div>
                                </TableCell>
                                <TableCell>{unit.owner.phone}</TableCell>
                                <TableCell>{unit.occupation.status === 'ocupado_inquilino' ? `Inquilino: ${unit.occupation.tenant?.name}` : 'Propietario'}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Abrir menú</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => handleOpenForm(unit)}>
                                            Editar Unidad
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleViewStatement(unit.id)}>
                                            Ver Estado de Cuenta
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                            className="text-red-500 focus:text-red-500 focus:bg-red-50"
                                            onClick={() => handleOpenDeleteAlert(unit.id)}
                                            >
                                            Eliminar
                                        </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </main>
      
      <Dialog open={isFormModalOpen} onOpenChange={setFormModalOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{unitToEdit ? 'Editar' : 'Agregar'} Unidad</DialogTitle>
            <DialogDescription>
              Complete los detalles de la propiedad y su residente.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[80vh] overflow-y-auto -mx-6 px-6">
            <UnitForm 
                onSubmit={saveUnit} 
                onCancel={handleCloseForm}
                unit={unitToEdit}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro que desea eliminar esta unidad?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la unidad y todo su historial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
    </div>
  );
}
