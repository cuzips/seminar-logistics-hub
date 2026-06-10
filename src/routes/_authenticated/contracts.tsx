import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CONTRACT_STATUS_LABEL, formatCurrency } from "@/lib/seminar-utils";

export const Route = createFileRoute("/_authenticated/contracts")({
  component: ContractsPage,
});

function ContractsPage() {
  const { data: contracts = [] } = useQuery({
    queryKey: ["all-contracts"],
    queryFn: async () => (await supabase.from("contracts").select("*, seminars(*, seminar_types(name)), meeting_sites(name,city)").order("updated_at", { ascending: false })).data ?? [],
  });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Hợp đồng</h1>
        <p className="text-muted-foreground">Hàng đợi đàm phán giữa Coordinator và Sales Manager.</p>
      </div>
      <div className="grid gap-3">
        {contracts.length === 0 && <Card><CardContent className="p-6 text-muted-foreground">Chưa có hợp đồng nào.</CardContent></Card>}
        {contracts.map((c: any) => (
          <Card key={c.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>
                    <Link to="/seminars/$id" params={{ id: c.seminar_id }} className="hover:underline">
                      {c.seminars?.seminar_types?.name} — {c.meeting_sites?.name}
                    </Link>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{c.meeting_sites?.city}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  v{c.current_version} · {CONTRACT_STATUS_LABEL[c.status]}
                </span>
              </div>
            </CardHeader>
            <CardContent className="text-sm">Tổng chi phí: <b>{formatCurrency(c.total_cost)}</b></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
