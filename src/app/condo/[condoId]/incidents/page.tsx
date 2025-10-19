
"use client";

import { useState } from "react";
import { useCondo } from "@/contexts/condo-context";
import { formatDate } from "@/lib/utils";
import type { Incident } from "@/lib/definitions";

import { PageHeader } from "../_components/page-header";
import { StatusBadge } from "../_components/status-badge";
import { PriorityBadge } from "./_components/priority-badge";
import { IncidentForm } from "./_components/incident-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";


export default function IncidentsPage() {
  const { condoId } = useCondo();
  const firestore = useFirestore();

  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [incidentToEdit, setIncidentToEdit] = useState<Incident | undefined>(undefined);
  const [incidentToDelete, setIncidentToDelete] = useState<string | undefined>(undefined);

  const incidentsCollection = useMemoFirebase(() => collection(firestore, 'condominiums', condoId, 'incidents'), [firestore, condoId]);
  const { data: incidents, isLoading } = useCollection<Incident>(incidentsCollection);

  const saveIncident = (incident: Omit<Incident, 'id'> | Incident) => {
    const colRef = collection(firestore, 'condominiums', condoId, 'incidents');
     if ('id' in incident) {
        const incidentRef = doc(colRef, incident.id);
        updateDocumentNonBlocking(incidentRef, incident);
    } else {
        addDocumentNonBlocking(colRef, incident);
    }
    handleCloseForm();
  };

  const deleteIncident = (incidentId: string) => {
    const incidentRef = doc(firestore, 'condominiums', condoId, 'incidents', incidentId);
    deleteDocumentNonBlocking(incidentRef);
  };
  
  const handleOpenForm = (incident?: Incident) => {
    setIncidentToEdit(incident);
    setFormModalOpen(true);
  };

  const handleCloseForm = () => {
    setIncidentToEdit(undefined);
    setFormModalOpen(false);
  }

  const handleOpenDeleteAlert = (incidentId: string) => {
    setIncidentToDelete(incidentId);
    setDeleteAlertOpen(true);
  }

  const handleConfirmDelete = () => {
    if (incidentToDelete) {
      deleteIncident(incidentToDelete);
    }
    setDeleteAlertOpen(false);
    setIncidentToDelete(undefined);
  }

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Incidentes" description="Registre y de seguimiento a los incidentes reportados.">
        <Button onClick={() => handleOpenForm()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Reportar Incidente
        </Button>
      </PageHeader>
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Incidente</TableHead>
                  <TableHead>Reportado por</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(incidents || []).map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell className="font-medium">{incident.title}</TableCell>
                    <TableCell>{incident.reportedBy}</TableCell>
                    <TableCell>{formatDate(incident.date, { day: 'numeric', month: 'short', year: 'numeric' })}</TableCell>
                    <TableCell>
                      <PriorityBadge priority={incident.priority} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={incident.status} />
                    </TableCell>
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
                          <DropdownMenuItem onClick={() => handleOpenForm(incident)}>
                            Ver / Editar Incidente
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-500 focus:text-red-500 focus:bg-red-50"
                            onClick={() => handleOpenDeleteAlert(incident.id)}
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
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{incidentToEdit ? 'Editar' : 'Reportar'} Incidente</DialogTitle>
            <DialogDescription>
              Complete los detalles del incidente para su seguimiento.
            </DialogDescription>
          </DialogHeader>
          <IncidentForm 
            onSubmit={saveIncident} 
            onCancel={handleCloseForm}
            incident={incidentToEdit}
          />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro que desea eliminar este incidente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el registro del incidente.
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
