
"use client";

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { FirebaseClientProvider, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Condo } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';

function CondoSelectionContent() {
  const firestore = useFirestore();
  const condosQuery = useMemoFirebase(() => collection(firestore, 'condominiums'), [firestore]);
  const { data: condos, isLoading } = useCollection<Condo>(condosQuery);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="p-4 border-b">
        <Logo />
      </header>
      <main className="p-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Seleccione un Condominio</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading && Array.from({ length: 2 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[250px]" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
            {!isLoading && condos?.map((condo) => (
              <Card key={condo.id}>
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">{condo.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{condo.address}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <Link href={`/condo/${condo.id}`} passHref>
                    <Button className="w-full">
                      Administrar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}


export default function CondoSelectionPage() {
    return (
        <FirebaseClientProvider>
            <CondoSelectionContent />
        </FirebaseClientProvider>
    )
}

    