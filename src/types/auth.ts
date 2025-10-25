export type Role = "super_admin" | "admin" | "propietario";

export interface UserProfile {
  role: Role;
  tenants: string[];         // lista de tenant_id (condominios) que puede ver
  displayName?: string;
  email?: string;
  created_at?: any;
}
