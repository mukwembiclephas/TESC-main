import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

export const PermissionGuard = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const hasNotified = useRef(false);

  const userPermissions = user?.department?.permissions || [];
  const userLevel = user?.level;

  // 1. Level 1 (Super Admin) bypasses all checks
  const isSuperAdmin = userLevel === "1";

  // 2. Public / Semi-Public Routes
  // We include /settings here so non-admins can reach their profile tab
  const isPublicPage = [
    "/dashboard",
    "/help",
    "/settings",
    "/profile",
  ].includes(location.pathname);

  const hasAccess = userPermissions.some((p) => {
    // Exact match: e.g. "/students"
    if (location.pathname === p) return true;

    // Sub-route match: e.g. user has "/admissions" and visits "/admissions/fees"
    if (location.pathname.startsWith(p + "/")) return true;

    // Cross-module Dashboard mapping:
    // If permission array has "/admissions", grant access to "/dashboard/admissions"
    const dashboardPath = `/dashboard${p}`;
    if (location.pathname === dashboardPath) return true;

    return false;
  });

  useEffect(() => {
    // Reset notification ref when location changes to allow errors for different pages
    hasNotified.current = false;
  }, [location.pathname]);

  useEffect(() => {
    if (!isSuperAdmin && !isPublicPage && !hasAccess && !hasNotified.current) {
      toast.error(
        "Access Denied: You do not have permission to view this page."
      );
      hasNotified.current = true;
    }
  }, [isSuperAdmin, isPublicPage, hasAccess]);

  if (isSuperAdmin || isPublicPage || hasAccess) {
    return <>{children}</>;
  }

  // Redirect unauthorized users to Dashboard
  return <Navigate to="/dashboard" replace />;
};
