import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { STATUS_LABEL, STATUS_COLOR, formatDate, daysUntil } from "@/lib/seminar-utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { data: seminars = [] } = useQuery({
    queryKey: ["seminars-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seminars")
        .select("*, seminar_types(name), consultants(name), meeting_sites:selected_site_id(name,city)")
        .order("start_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const upcoming = seminars.filter((s) => new Date(s.start_date) >= new Date());
  const inProgress = seminars.filter((s) => !["completed", "ready"].includes(s.status));
  const completed = seminars.filter((s) => s.status === "completed");
  const alerts = upcoming.filter((s) => {
    const d = daysUntil(s.start_date);
    return d <= 14 && d >= 0 && s.status !== "materials_shipped" && s.status !== "ready" && s.status !== "completed";
  });

  const kpis = [
    { label: "Sắp diễn ra", value: upcoming.length, icon: Calendar, color: "text-blue-600 bg-blue-50" },
    { label: "Đang xử lý", value: inProgress.length, icon: Clock, color: "text-amber-600 bg-amber-50" },
    { label: "Cần chú ý (≤14 ngày)", value: alerts.length, icon: AlertTriangle, color: "text-red-600 bg-red-50" },
    { label: "Đã hoàn tất", value: completed.length, icon: CheckCircle2, color: "text-green-600 bg-green-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Tổng quan</h1>
        <p className="text-muted-foreground">Trung tâm điều phối hậu cần toàn bộ seminar.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <div className="text-sm text-muted-foreground">{k.label}</div>
                <div className="mt-1 text-3xl font-bold">{k.value}</div>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${k.color}`}>
                <k.icon className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {alerts.length > 0 && (
        <Card className="border-amber-300 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <AlertTriangle className="h-5 w-5" /> Cảnh báo: Seminar trong 14 ngày tới chưa hoàn tất chuẩn bị
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {alerts.map((s: any) => (
                <li key={s.id} className="flex items-center justify-between rounded-md bg-white p-3">
                  <div>
                    <Link to="/seminars/$id" params={{ id: s.id }} className="font-medium hover:underline">
                      {s.seminar_types?.name} — {s.city}
                    </Link>
                    <div className="text-sm text-muted-foreground">
                      Bắt đầu {formatDate(s.start_date)} ({daysUntil(s.start_date)} ngày nữa) — Trạng thái: {STATUS_LABEL[s.status]}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Seminar sắp diễn ra</CardTitle>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có seminar nào sắp tới.</p>
          ) : (
            <div className="space-y-2">
              {upcoming.slice(0, 8).map((s: any) => (
                <Link
                  key={s.id}
                  to="/seminars/$id"
                  params={{ id: s.id }}
                  className="flex items-center justify-between rounded-md border p-3 hover:bg-accent/30"
                >
                  <div>
                    <div className="font-medium">{s.seminar_types?.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {s.city} · {formatDate(s.start_date)} → {formatDate(s.end_date)} · {s.consultants?.name ?? "Chưa gán"}
                    </div>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_COLOR[s.status]}`}>
                    {STATUS_LABEL[s.status]}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
