// Role-based access control for sidebar + routes.
// Coordinator sees everything; others are restricted.

export type Role = "coordinator" | "sales_manager" | "materials" | "consultant";

// Paths a role is allowed to visit. Coordinator omitted = full access.
export const ROLE_ALLOWED_PATHS: Record<Exclude<Role, "coordinator">, string[]> = {
  sales_manager: ["/seminars", "/contracts"],
  materials: ["/materials"],
  consultant: ["/travel", "/consultants"],
};

// Landing route per role after login / when access is denied.
export const ROLE_HOME: Record<Role, string> = {
  coordinator: "/dashboard",
  sales_manager: "/seminars",
  materials: "/materials",
  consultant: "/travel",
};

export function pickPrimaryRole(roles: string[] | undefined): Role {
  if (!roles || roles.length === 0) return "coordinator";
  const order: Role[] = ["coordinator", "sales_manager", "materials", "consultant"];
  for (const r of order) if (roles.includes(r)) return r;
  return (roles[0] as Role) ?? "coordinator";
}

export function canAccessPath(role: Role, pathname: string): boolean {
  if (role === "coordinator") return true;
  const allowed = ROLE_ALLOWED_PATHS[role] ?? [];
  return allowed.some((p) => pathname === p || pathname.startsWith(p + "/"));
}
