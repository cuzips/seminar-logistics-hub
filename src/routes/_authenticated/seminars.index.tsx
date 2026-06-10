import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { STATUS_LABEL, STATUS_COLOR, formatDate } from "@/lib/seminar-utils";
import { Plus } from "lucide-react";
import { useCurrentUser, useUserRoles } from "@/hooks/useCurrentUser";
import { pickPrimaryRole, canAccessPath } from "@/lib/rbac";

export const Route = createFileRoute("/_authenticated/seminars/")({
  component: SeminarsList,
});


function SeminarsList() {
  const { user } = useCurrentUser();
  const { data: userRoles } = useUserRoles(user?.id);
  const role = pickPrimaryRole(userRoles);
  const canCreate = canAccessPath(role, "/seminars/new");

  const { data: seminars = [], isLoading } = useQuery({

    queryKey: ["seminars-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seminars")
        .select("*, seminar_types(name), consultants(name)")
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Seminar</h1>
          <p className="text-muted-foreground">Danh sách booking từ phòng Bookings.</p>
        </div>
        <Button asChild>
          <Link to="/seminars/new"><Plus className="mr-2 h-4 w-4" /> Booking mới</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-center text-muted-foreground">Đang tải...</div>
          ) : seminars.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">Chưa có seminar nào.</div>
          ) : (
            <table className="w-full">
              <thead className="border-b bg-muted/50 text-left text-sm">
                <tr>
                  <th className="p-3">Loại seminar</th>
                  <th className="p-3">Thành phố</th>
                  <th className="p-3">Ngày</th>
                  <th className="p-3">Giảng viên</th>
                  <th className="p-3">Đăng ký</th>
                  <th className="p-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {seminars.map((s: any) => (
                  <tr key={s.id} className="border-b text-sm hover:bg-accent/20">
                    <td className="p-3">
                      <Link to="/seminars/$id" params={{ id: s.id }} className="font-medium text-primary hover:underline">
                        {s.seminar_types?.name ?? "—"}
                      </Link>
                    </td>
                    <td className="p-3">{s.city}</td>
                    <td className="p-3">{formatDate(s.start_date)} → {formatDate(s.end_date)}</td>
                    <td className="p-3">{s.consultants?.name ?? "—"}</td>
                    <td className="p-3">{s.registrant_count}</td>
                    <td className="p-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_COLOR[s.status]}`}>
                        {STATUS_LABEL[s.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
