import { PageHeader } from "../_components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function CommunicationsPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Comunicados" description="Envíe notificaciones a los residentes.">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo Comunicado
        </Button>
      </PageHeader>
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
            <CardContent className="p-6">
                <p>La lista de comunicados enviados y la opción para crear nuevos aparecerán aquí.</p>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
