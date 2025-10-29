"use client";

import { useState } from 'react';
// Correcting the import from FirebaseClientProvider to FirebaseProvider and useFirestore to useFirebase
import { FirebaseProvider, useFirebase } from '@/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { initialCondos } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/app/condo/[condoId]/_components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

function SeedComponent() {
  const { firestore, isFirebaseLoading } = useFirebase();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSeedDatabase = async () => {
    setIsLoading(true);
    setIsSuccess(false);
    setError(null);

    if (!firestore) {
      setError("Firestore is not available. Please try again later.");
      setIsLoading(false);
      return;
    }

    try {
      const batch = writeBatch(firestore);

      for (const condo of initialCondos) {
        const condoRef = doc(firestore, 'condominiums', condo.id);
        const { units, finances, accountsPayable, suppliers, employees, communications, incidents, ...condoData } = condo;
        batch.set(condoRef, { ...condoData, finances: { manualBalance: finances.manualBalance } });

        finances.transactions.forEach(t => {
          const transRef = doc(collection(condoRef, 'financial_transactions'), t.id);
          batch.set(transRef, t);
        });
        
        units.forEach(u => {
          const unitRef = doc(collection(condoRef, 'units'), u.id);
          batch.set(unitRef, u);
        });

        accountsPayable.forEach(ap => {
          const apRef = doc(collection(condoRef, 'accounts_payable'), ap.id);
          batch.set(apRef, ap);
        });

        suppliers.forEach(s => {
          const supRef = doc(collection(condoRef, 'suppliers'), s.id);
          batch.set(supRef, s);
        });

        communications.forEach(c => {
          const commRef = doc(collection(condoRef, 'communications'), c.id);
          batch.set(commRef, c);
        });

        incidents.forEach(i => {
          const incRef = doc(collection(condoRef, 'incidents'), i.id);
          batch.set(incRef, i);
        });
      }

      await batch.commit();
      setIsSuccess(true);
    } catch (e: any) {
      console.error(e);
      setError(`Hubo un error: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFirebaseLoading) {
    return (
        <div className="flex h-full items-center justify-center">
            <p>Loading Firebase...</p>
        </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Herramienta de Siembra de Datos" description="Usa este botón para poblar la base de datos con datos de prueba." />
      <main className="flex-1 overflow-y-auto p-6">
        <Card className="max-w-xl mx-auto">
            <CardContent className="p-6 text-center">
                <p className="mb-4">
                    Haz clic en el botón de abajo para crear los condominios "Residencial Armonía" y "Torre del Sol" en tu base de datos de Firestore. Esto te permitirá navegar y probar la aplicación.
                </p>
                <Button onClick={handleSeedDatabase} disabled={isLoading || isFirebaseLoading}>
                    {isLoading ? 'Creando datos...' : 'Crear Condominios de Prueba'}
                </Button>

                {isSuccess && (
                    <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-md">
                        <p className="font-bold">¡Éxito!</p>
                        <p>La base de datos ha sido poblada. Ahora puedes ir a la página principal y ver los condominios.</p>
                        <Link href="/condo" passHref>
                            <Button className="mt-2">Ir a la Aplicación</Button>
                        </Link>
                    </div>
                )}
                {error && (
                     <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-md">
                        <p className="font-bold">Error</p>
                        <p>{error}</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </main>
    </div>
  )
}


export default function SeedPage() {
    return (
        // Correcting the component name here as well
        <FirebaseProvider>
            <SeedComponent />
        </FirebaseProvider>
    )
}