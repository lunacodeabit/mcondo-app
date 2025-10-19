import { PageHeader } from "../_components/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function AccountsReceivablePage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Cuentas por Cobrar" description="Administre los estados de cuenta de cada unidad." />
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
            <CardContent className="p-6">
                <p>La tabla de saldos de unidades y detalles de cuentas aparecerán aquí.</p>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
