import { initialCondos } from "@/lib/data";
import { CondoProvider } from "@/contexts/condo-context";
import { AdminSidebar } from "./_components/admin-sidebar";
import { notFound } from "next/navigation";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";

export default function CondoAdminLayout({
  params,
  children,
}: {
  params: { condoId: string };
  children: React.ReactNode;
}) {
  const condo = initialCondos.find((c) => c.id === params.condoId);

  if (!condo) {
    notFound();
  }

  return (
    <CondoProvider initialCondo={condo}>
      <SidebarProvider>
        <div className="flex min-h-screen">
          <Sidebar collapsible="icon">
            <AdminSidebar />
          </Sidebar>
          <SidebarInset className="p-0">
            <div className="flex flex-col h-full">
                {children}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </CondoProvider>
  );
}
