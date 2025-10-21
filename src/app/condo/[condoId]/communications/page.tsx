"use client";

import { useState } from "react";
import { useCondo } from "@/contexts/condo-context";
import { PageHeader } from "../_components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import type { Communication } from "@/lib/definitions";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { CommunicationForm } from "./_components/communication-form";

export default function CommunicationsPage() {
  const { condoId } = useCondo();
  const firestore = useFirestore();

  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [communicationToDelete, setCommunicationToDelete] = useState<string | undefined>(undefined);
  
  const communicationsCollection = useMemoFirebase(() => collection(firestore, 'condominiums', condoId, 'communications'), [firestore, condoId]);
  const { data: communications, isLoading } = useCollection<Communication>(communicationsCollection);

  const saveCommunication = (data: Omit<Communication, 'id' | 'date'>) => {
    const dataToSave = {
      ...data,
      date: new Date().toISOString(),
    };
    addDocumentNonBlocking(communicationsCollection, dataToSave);
    setFormModalOpen(false);
  };

  const deleteCommunication = (communicationId: string) => {
    const docRef = doc(firestore, 'condominiums', condoId, 'communications', communicationId);
    deleteDocumentNonBlocking(docRef);
  };

  const handleOpenDeleteAlert = (communicationId: string) => {
    setCommunicationToDelete(communicationId);
    setDeleteAlertOpen(true);
  }

  const handleConfirmDelete = () => {
    if (communicationToDelete) {
      deleteCommunication(communicationToDelete);
    }
    setDeleteAlertOpen(false);
    setCommunicationToDelete(undefined);
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Comunicados" description="Envíe notificaciones a los residentes.">
        <Dialog open={isFormModalOpen} onOpenChange={setFormModalOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nuevo Comunicado
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Comunicado</DialogTitle>
                    <DialogDescription>
                        Redacte y envíe un nuevo comunicado a los residentes.
                    </DialogDescription>
                </DialogHeader>
                <CommunicationForm 
                    onSubmit={saveCommunication}
                    onCancel={() => setFormModalOpen(false)}
                />
            </DialogContent>
        </Dialog>
      </PageHeader>
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {isLoading && Array.from({ length: 3 }).map((_, i) => (
             <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/4" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                </CardContent>
              </Card>
          ))}
          {!isLoading && communications?.map((comm) => (
            <Card key={comm.id}>
              <CardHeader className="flex flex-row justify-between items-start">
                <div>
                  <CardTitle>{comm.title}</CardTitle>
                  <CardDescription>{formatDate(comm.date)}</CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleOpenDeleteAlert(comm.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{comm.content}</p>
              </CardContent>
            </Card>
          ))}
           {!isLoading && communications?.length === 0 && (
             <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                    No hay comunicados para mostrar.
                </CardContent>
            </Card>
           )}
        </div>
      </main>
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro que desea eliminar este comunicado?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el comunicado.
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
