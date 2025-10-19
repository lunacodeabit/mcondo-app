"use client";

import { useState } from 'react';
import Link from 'next/link';
import { initialCondos } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';

export default function CondoSelectionPage() {
  const [condos] = useState(initialCondos);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="p-4 border-b">
        <Logo />
      </header>
      <main className="p-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Seleccione un Condominio</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {condos.map((condo) => (
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
