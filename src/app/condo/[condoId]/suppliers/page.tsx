
"use client";

import { useState } from "react";
import { useCondo } from "@/contexts/condo-context";
import { PageHeader } from "../_components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Upload, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { Supplier } from "@/lib/definitions";
import { SupplierForm } from "./_components/supplier-form";


export default function SuppliersPage() {
  const { condo, saveSupplier, deleteSupplier } = useCondo();
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | undefined>(undefined);
  const [supplierToDelete, setSupplierToDelete] = useState<string | undefined>(undefined);

  const handleOpenForm = (supplier?: Supplier) => {
    setSupplierToEdit(supplier);
    setFormModalOpen(true);
  };

  const handleCloseForm = () => {
    setSupplierToEdit(undefined);
    setFormModalOpen(false);
  }

  const handleSave = (supplier: Omit<Supplier, 'id'> | Supplier) => {
    saveSupplier(supplier);
    handleCloseForm();
  };

  const handleOpenDeleteAlert = (supplierId: string) => {
    setSupplierToDelete(supplierId);
    setDeleteAlertOpen(true);
  }

  const handleConfirmDelete = () => {
    if (supplierToDelete) {
      deleteSupplier(supplierToDelete);
    }
    setDeleteAlertOpen(false);
    setSupplierToDelete(undefined);
  }


  if (!condo) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Suplidores" description="Administre su lista de suplidores y sus facturas.">
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Importar CSV
        </Button>
        <Button onClick={() => handleOpenForm()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Agregar Suplidor
        </Button>
      </PageHeader>
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>RNC</TableHead>
                            <TableHead>Contacto</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {condo.suppliers.map((supplier) => (
                            <TableRow key={supplier.id}>
                                <TableCell className="font-medium">{supplier.name}</TableCell>
                                <TableCell>{supplier.rnc || 'N/A'}</TableCell>
                                <TableCell>
                                    <div>{supplier.contact.name}</div>
                                    <div className="text-xs text-muted-foreground">{supplier.contact.email}</div>
                                </TableCell>
                                <TableCell>{supplier.category}</TableCell>
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
                                        <DropdownMenuItem onClick={() => handleOpenForm(supplier)}>
                                            Editar Suplidor
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            Ver Historial
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                            className="text-red-500 focus:text-red-500 focus:bg-red-50"
                                            onClick={() => handleOpenDeleteAlert(supplier.id)}
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
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{supplierToEdit ? 'Editar' : 'Agregar'} Suplidor</DialogTitle>
            <DialogDescription>
              Complete los detalles del suplidor.
            </DialogDescription>
          </DialogHeader>
          <SupplierForm 
            onSubmit={handleSave} 
            onCancel={handleCloseForm}
            supplier={supplierToEdit}
          />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro que desea eliminar este suplidor?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente al suplidor.
              No se eliminarán las facturas asociadas.
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
