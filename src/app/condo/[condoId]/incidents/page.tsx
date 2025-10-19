"use client";

import { useState } from "react";
import { useCondo } from "@/contexts/condo-context";
import { formatDate } from "@/lib/utils";
import type { Incident } from "@/lib/definitions";

import { PageHeader } from "../_components/page-header";
import { StatusBadge } from "../_components/status-badge";
import { PriorityBadge } from "./_components/priority-badge";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PlusCircle, MoreHorizontal } from "lucide-react";


export default function IncidentsPage() {
  const { condo } = useCondo();
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [incidentToEdit, setIncidentToEdit] = useState<Incident | undefined>(undefined);
  const [incidentToDelete, setIncidentToDelete] = useState<string | undefined>(undefined);
  
  const handleOpenForm = (incident?: Incident) => {
    // setIncidentToEdit(incident);
    // setFormModalOpen(true);
    alert('Funcionalidad de formulario en desarrollo');
  };

  if (!condo) {
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
                {condo.incidents.map((incident) => (
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
                          <DropdownMenuItem>
                            Cambiar Estado
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-500 focus:text-red-500 focus:bg-red-50"
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
    </div>
  );
}
