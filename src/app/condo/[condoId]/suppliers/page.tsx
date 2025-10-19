import { PageHeader } from "../_components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function SuppliersPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Suplidores" description="Administre su lista de suplidores y sus facturas.">
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Importar CSV
        </Button>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Agregar Suplidor
        </Button>
      </PageHeader>
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
            <CardContent className="p-6">
                <p>La lista de suplidores y su historial de facturas aparecerán aquí.</p>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
