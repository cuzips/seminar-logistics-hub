import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/seminar-types")({
  component: TypesPage,
});

function TypesPage() {
  const { data: types = [] } = useQuery({
    queryKey: ["types-page"],
    queryFn: async () => (await supabase.from("seminar_types").select("*").order("name")).data ?? [],
  });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Loại seminar</h1>
        <p className="text-muted-foreground">Catalog với cấu hình phòng/AV và bộ materials chuẩn.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {types.map((t: any) => (
          <Card key={t.id}>
            <CardHeader>
              <CardTitle>{t.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{t.description}</p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>Phòng mặc định: {t.default_rooms} · Bố trí: <b>{t.default_seating}</b></div>
              <div>AV: {(t.default_av ?? []).join(", ")}</div>
              <div>
                <div className="mt-2 font-medium">Materials chuẩn:</div>
                <ul className="ml-4 list-disc">
                  {(t.materials_template ?? []).map((m: any) => (
                    <li key={m.name}>{m.name} — {m.per_attendee ? `${m.qty_per}/người` : `${m.qty_per} cố định`}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
