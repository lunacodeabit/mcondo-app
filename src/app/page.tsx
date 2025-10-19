import Link from "next/link";
import { initialCondos } from "@/lib/data";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building, MapPin } from "lucide-react";
import { Logo } from "@/components/logo";

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center p-4 sm:p-8">
      <header className="w-full max-w-5xl mb-8">
        <Logo />
      </header>
      <div className="w-full max-w-5xl">
        <h1 className="text-3xl font-bold font-headline mb-2">Mis Condominios</h1>
        <p className="text-muted-foreground mb-8">Seleccione un condominio para empezar a administrar.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialCondos.map((condo) => (
            <Card key={condo.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="bg-secondary p-3 rounded-lg">
                    <Building className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="font-headline text-xl">{condo.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1.5 pt-1">
                      <MapPin className="h-3 w-3"/>
                      {condo.address}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-sm text-muted-foreground space-y-2">
                    <p><strong>{condo.units.length}</strong> unidades</p>
                    <p><strong>{condo.suppliers.length}</strong> suplidores</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/condo/${condo.id}`}>
                    Administrar <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
