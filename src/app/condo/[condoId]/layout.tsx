
import { CondoProvider } from "@/contexts/condo-context";
import { AdminSidebar } from "./_components/admin-sidebar";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { FirebaseProvider } from "@/firebase/provider";

export default function CondoAdminLayout({
  params,
  children,
}: {
  params: { condoId: string };
  children: React.ReactNode;
}) {

  // The check for condo existence will now happen inside the provider or page
  // as data is fetched asynchronously.

  return (
    <FirebaseProvider>
      <CondoProvider condoId={params.condoId}>
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
    </FirebaseProvider>
  );
}

    