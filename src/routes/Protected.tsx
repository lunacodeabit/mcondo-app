import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types/auth";

export default function Protected({
  children,
  allowRoles
}: {
  children: JSX.Element;
  allowRoles?: Role[];
}) {
  const { user, profile, loading } = useAuth();
  if (loading) return <div className="p-8">Cargando…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowRoles && profile && !allowRoles.includes(profile.role)) {
    return <div className="p-8 text-red-600">No tienes permisos para esta sección.</div>;
  }
  return children;
}
