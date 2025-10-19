"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";
import {
  LayoutDashboard,
  Building2,
  Users,
  Receipt,
  Truck,
  Briefcase,
  Megaphone,
  ShieldAlert,
  BarChart3,
  ChevronLeft,
} from "lucide-react";
import { useCondo } from "@/contexts/condo-context";
import { Button } from "@/components/ui/button";

export function AdminSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const { condo } = useCondo();
  const condoId = params.condoId as string;

  const navItems = [
    { href: `/condo/${condoId}`, icon: LayoutDashboard, label: "Finanzas" },
    { href: `/condo/${condoId}/units`, icon: Building2, label: "Unidades" },
    { href: `/condo/${condoId}/accounts-receivable`, icon: Users, label: "Cuentas por Cobrar" },
    { href: `/condo/${condoId}/accounts-payable`, icon: Receipt, label: "Cuentas por Pagar" },
    { href: `/condo/${condoId}/suppliers`, icon: Truck, label: "Suplidores" },
    { href: `/condo/${condoId}/employees`, icon: Briefcase, label: "Empleados" },
    { href: `/condo/${condoId}/communications`, icon: Megaphone, label: "Comunicados" },
    { href: `/condo/${condoId}/incidents`, icon: ShieldAlert, label: "Incidentes" },
    { href: `/condo/${condoId}/reports`, icon: BarChart3, label: "Reportes" },
  ];

  return (
    <>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center justify-between p-2">
            <Logo textColor="text-primary-foreground" />
            <div className="group-data-[state=collapsed]:hidden">
                <SidebarTrigger />
            </div>
            <div className="group-data-[collapsible=icon]:block hidden">
                <SidebarTrigger />
            </div>
        </div>
        <div className="p-2 group-data-[state=expanded]:block hidden">
            <h3 className="font-headline text-lg text-primary-foreground">{condo?.name}</h3>
            <p className="text-xs text-sidebar-foreground">{condo?.address}</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href} passHref>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label, side: "right" }}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border mt-auto">
         <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/" passHref>
                <SidebarMenuButton tooltip={{ children: 'Volver', side: "right" }}>
                  <ChevronLeft />
                  <span>Volver a Condominios</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
