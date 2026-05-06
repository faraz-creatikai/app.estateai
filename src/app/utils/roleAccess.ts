// accessControl.ts
import { useAuth } from "@/context/AuthContext";

export const useAccessControl = () => {
  const { admin } = useAuth();

  const canAccess = (roles: string[]) => {
    return roles.includes(admin?.role || "");
  };

  const showToAdmins = () =>
    canAccess(["administrator", "city_admin", "client_admin"]);

  const showToSuperAdmin = () =>
    canAccess(["administrator"]);

  return { canAccess, showToAdmins, showToSuperAdmin };
};