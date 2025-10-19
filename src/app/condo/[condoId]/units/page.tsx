import { PageHeader } from "../_components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function UnitsPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Unidades" description="Gestione las propiedades y sus residentes.">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Agregar Unidad
        </Button>
      </PageHeader>
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
            <CardContent className="p-6">
                <p>Tabla de unidades y formularios de gestión aparecerán aquí.</p>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
