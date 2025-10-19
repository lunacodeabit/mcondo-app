import { PageHeader } from "../_components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function EmployeesPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Empleados" description="Gestione el personal del condominio y su nómina.">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Agregar Empleado
        </Button>
      </PageHeader>
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
            <CardContent className="p-6">
                <p>La lista de empleados, sus detalles y configuración de nómina aparecerán aquí.</p>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
