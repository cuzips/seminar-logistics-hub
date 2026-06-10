import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/notifications")({
  component: NotifPage,
});

function NotifPage() {
  const qc = useQueryClient();
  const { data: notifs = [] } = useQuery({
    queryKey: ["all-notif"],
    queryFn: async () => (await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(100)).data ?? [],
  });

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["all-notif"] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Thông báo</h1>
        <p className="text-muted-foreground">Cập nhật mới nhất theo vai trò của bạn.</p>
      </div>
      <div className="space-y-2">
        {notifs.length === 0 && <Card><CardContent className="p-6 text-muted-foreground">Không có thông báo.</CardContent></Card>}
        {notifs.map((n: any) => (
          <Card key={n.id} className={n.read ? "opacity-60" : ""}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium">{n.message}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(n.created_at).toLocaleString("vi-VN")} · {n.target_role ?? "—"}
                  {n.seminar_id && <> · <Link to="/seminars/$id" params={{ id: n.seminar_id }} className="text-primary hover:underline">Mở seminar</Link></>}
                </div>
              </div>
              {!n.read && <Button size="sm" variant="outline" onClick={() => markRead(n.id)}>Đánh dấu đã đọc</Button>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
