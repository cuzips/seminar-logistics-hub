import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/seminar-utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/materials")({
  component: MaterialsPage,
});

function MaterialsPage() {
  const qc = useQueryClient();
  const { data: reqs = [] } = useQuery({
    queryKey: ["all-mr"],
    queryFn: async () => (await supabase.from("materials_requests").select("*, seminars(*, seminar_types(name))").order("created_at", { ascending: false })).data ?? [],
  });

  const ship = async (r: any) => {
    const { data: u } = await supabase.auth.getUser();
    await supabase.from("materials_requests").update({
      status: "shipped", shipped_at: new Date().toISOString(),
      tracking_number: "TRK-" + Math.random().toString(36).slice(2, 9).toUpperCase(),
      handled_by: u.user?.id,
    }).eq("id", r.id);
    await supabase.from("seminars").update({ status: "materials_shipped" }).eq("id", r.seminar_id);
    await supabase.from("activity_log").insert({ seminar_id: r.seminar_id, actor_id: u.user?.id, action: "Materials đã gửi", payload: {} });
    await supabase.from("notifications").insert({ target_role: "coordinator" as const, seminar_id: r.seminar_id, type: "materials_shipped", message: "Materials đã được gửi đi." });
    toast.success("Đã gửi"); qc.invalidateQueries({ queryKey: ["all-mr"] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Materials</h1>
        <p className="text-muted-foreground">Hàng đợi cho Materials-handling department.</p>
      </div>
      {reqs.length === 0 && <Card><CardContent className="p-6 text-muted-foreground">Không có yêu cầu nào.</CardContent></Card>}
      <div className="grid gap-3">
        {reqs.map((r: any) => (
          <Card key={r.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>
                    <Link to="/seminars/$id" params={{ id: r.seminar_id }} className="hover:underline">
                      {r.seminars?.seminar_types?.name} — {r.seminars?.city}
                    </Link>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Seminar: {formatDate(r.seminars?.start_date)}</p>
                </div>
                <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">{r.status}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><b>Gửi đến:</b> {r.ship_to_address}</div>
              <ul className="ml-4 list-disc">
                {(r.items ?? []).map((it: any) => <li key={it.name}>{it.name} × {it.quantity}</li>)}
              </ul>
              {r.status !== "shipped" && <Button onClick={() => ship(r)}>Đóng gói & Gửi</Button>}
              {r.tracking_number && <div className="text-xs text-muted-foreground">Tracking: {r.tracking_number}</div>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
