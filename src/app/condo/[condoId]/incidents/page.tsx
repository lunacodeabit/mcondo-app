"use client";

import { useState } from "react";
import { useCondo } from "@/contexts/condo-context";
import { formatDate } from "@/lib/utils";
import type { Incident } from "@/lib/definitions";

import { PageHeader } from "../_components/page-header";
import { StatusBadge } from "../_components/status-badge";
import { IncidentForm } from "./_components/incident-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PlusCircle, Trash2 } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

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
    const dataToSave = {
      ...incident,
      date: typeof incident.date === 'string' ? incident.date : (incident.date as Date).toISOString(),
    };

    if ('id' in dataToSave) {
      const incidentRef = doc(incidentsCollection, dataToSave.id);
      updateDocumentNonBlocking(incidentRef, dataToSave);
    } else {
      addDocumentNonBlocking(incidentsCollection, dataToSave);
    }
    setFormModalOpen(false);
    setIncidentToEdit(undefined);
  };
  
  const updateIncidentStatus = (incidentId: string, status: Incident['status']) => {
    const incidentRef = doc(incidentsCollection, incidentId);
    updateDocumentNonBlocking(incidentRef, { status });
  };

  const deleteIncident = (incidentId: string) => {
    const incidentRef = doc(incidentsCollection, incidentId);
    deleteDocumentNonBlocking(incidentRef);
  };
  
  const handleOpenForm = (incident?: Incident) => {
    setIncidentToEdit(incident);
    setFormModalOpen(true);
  };

  const handleOpenDeleteAlert = (incidentId: string) => {
    setIncidentToDelete(incidentId);
    setDeleteAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    if (incidentToDelete) {
      deleteIncident(incidentToDelete);
    }
    setDeleteAlertOpen(false);
    setIncidentToDelete(undefined);
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Gestión de Incidentes" description="Registre y de seguimiento a los incidentes reportados.">
        <Dialog open={isFormModalOpen} onOpenChange={setFormModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenForm()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Reportar Incidente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{incidentToEdit ? 'Editar' : 'Reportar'} Incidente</DialogTitle>
              <DialogDescription>
                Complete los detalles del incidente para su seguimiento.
              </DialogDescription>
            </DialogHeader>
            <IncidentForm 
              onSubmit={saveIncident} 
              onCancel={() => { setFormModalOpen(false); setIncidentToEdit(undefined); }}
              incident={incidentToEdit}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Reportado por</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[180px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(incidents || []).map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell>{formatDate(incident.date, { day: 'numeric', month: 'short', year: 'numeric' })}</TableCell>
                    <TableCell className="font-medium">{incident.reportedBy}</TableCell>
                    <TableCell>{incident.title}</TableCell>
                    <TableCell>
                      <StatusBadge status={incident.status} />
                    </TableCell>
                    <TableCell className="flex items-center gap-2">
                       <Select value={incident.status} onValueChange={(value) => updateIncidentStatus(incident.id, value as Incident['status'])}>
                          <SelectTrigger>
                            <SelectValue placeholder="Cambiar estado" />
                          </SelectTrigger>
                          <SelectContent>
                             <SelectItem value="abierto">Abierto</SelectItem>
                             <SelectItem value="en_progreso">En Progreso</SelectItem>
                             <SelectItem value="resuelto">Resuelto</SelectItem>
                             <SelectItem value="cerrado">Cerrado</SelectItem>
                          </SelectContent>
                       </Select>
                       <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteAlert(incident.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      
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
