import { PageHeader } from "../_components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Reportes" description="Genere reportes financieros y administrativos." />
      <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <div className="mx-auto bg-muted rounded-full p-3 w-fit">
                <BarChart3 className="h-10 w-10 text-muted-foreground"/>
            </div>
            <CardTitle className="mt-4">Módulo de Reportes en Desarrollo</CardTitle>
            <CardDescription>
              Próximamente podrá generar reportes detallados sobre las finanzas,
              cobros, pagos y más.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">¡Estamos trabajando para traerle esta funcionalidad!</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
