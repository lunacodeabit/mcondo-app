import { PageHeader } from "../_components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function IncidentsPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Incidentes" description="Registre y de seguimiento a los incidentes reportados.">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Reportar Incidente
        </Button>
      </PageHeader>
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
            <CardContent className="p-6">
                <p>La tabla de incidentes y su gestión de estado aparecerá aquí.</p>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
