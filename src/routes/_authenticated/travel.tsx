import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/seminar-utils";

export const Route = createFileRoute("/_authenticated/travel")({
  component: TravelPage,
});

function TravelPage() {
  const { data: travels = [] } = useQuery({
    queryKey: ["all-travel"],
    queryFn: async () => (await supabase.from("travel_arrangements").select("*, seminars(*, seminar_types(name)), consultants(name)").order("departure_date", { ascending: true })).data ?? [],
  });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Travel</h1>
        <p className="text-muted-foreground">Lịch trình bay của các giảng viên.</p>
      </div>
      {travels.length === 0 && <Card><CardContent className="p-6 text-muted-foreground">Chưa có sắp xếp travel.</CardContent></Card>}
      <div className="grid gap-3">
        {travels.map((t: any) => (
          <Card key={t.id}>
            <CardHeader>
              <CardTitle>
                <Link to="/seminars/$id" params={{ id: t.seminar_id }} className="hover:underline">
                  {t.consultants?.name} — {t.seminars?.seminar_types?.name}
                </Link>
              </CardTitle>
              <p className="text-sm text-muted-foreground">{t.seminars?.city} · {formatDate(t.departure_date)}</p>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div>Chuyến đi: <b>{t.outbound_flight}</b></div>
              {t.return_flight && <div>Chuyến về: {t.return_flight}</div>}
              {t.hotel && <div>Khách sạn: {t.hotel}</div>}
              <div>Trạng thái: {t.status} {t.itinerary_sent_at && "· Itinerary đã gửi"}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
