import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useCurrentUser, useUserRoles } from "@/hooks/useCurrentUser";
import { ROLE_LABEL } from "@/lib/seminar-utils";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  const { user } = useCurrentUser();
  const { data: roles } = useUserRoles(user?.id);
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="flex h-14 items-center justify-between border-b bg-card px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="hidden font-display text-sm font-semibold sm:inline">Logistics Coordinator</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="text-right">
                <div className="font-medium">{user?.email}</div>
                <div className="text-xs text-muted-foreground">
                  {roles?.map((r) => ROLE_LABEL[r]).join(", ") || "—"}
                </div>
              </div>
              <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                {user?.email?.[0]?.toUpperCase()}
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-background p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
