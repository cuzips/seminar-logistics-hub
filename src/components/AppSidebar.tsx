import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Calendar, MapPin, Users, BookOpen, FileSignature, Plane, Package, Bell, LogOut } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCurrentUser, useUserRoles } from "@/hooks/useCurrentUser";
import { pickPrimaryRole, canAccessPath } from "@/lib/rbac";

const items = [
  { title: "Tổng quan", url: "/dashboard", icon: LayoutDashboard },
  { title: "Seminar", url: "/seminars", icon: Calendar },
  { title: "Địa điểm họp", url: "/sites", icon: MapPin },
  { title: "Giảng viên", url: "/consultants", icon: Users },
  { title: "Loại seminar", url: "/seminar-types", icon: BookOpen },
  { title: "Hợp đồng", url: "/contracts", icon: FileSignature },
  { title: "Travel", url: "/travel", icon: Plane },
  { title: "Materials", url: "/materials", icon: Package },
  { title: "Thông báo", url: "/notifications", icon: Bell },
];


export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const { data: roles } = useUserRoles(user?.id);
  const role = pickPrimaryRole(roles);
  const visibleItems = items.filter((it) => canAccessPath(role, it.url));

  const isActive = (url: string) => pathname === url || pathname.startsWith(url + "/");


  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Đã đăng xuất");
    navigate({ to: "/" });
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 shrink-0 rounded-md bg-sidebar-primary" />
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="font-display text-sm font-bold leading-tight">Training Inc.</div>
              <div className="text-xs text-sidebar-foreground/70">Logistics</div>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Điều hướng</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut}>
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Đăng xuất</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
