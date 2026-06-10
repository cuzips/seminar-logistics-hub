import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser, useUserRoles } from "@/hooks/useCurrentUser";
import { pickPrimaryRole } from "@/lib/rbac";


export const Route = createFileRoute("/_authenticated/consultants")({
  component: ConsultantsPage,
});

function ConsultantsPage() {
  const qc = useQueryClient();
  const { user } = useCurrentUser();
  const { data: roles } = useUserRoles(user?.id);
  const role = pickPrimaryRole(roles);
  const readOnly = role === "consultant";
  const { data: consultants = [] } = useQuery({
    queryKey: ["all-consultants"],
    queryFn: async () => (await supabase.from("consultants").select("*").order("name")).data ?? [],
  });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", home_airport: "", airline_pref: "Delta", seat: "Aisle" });

  const add = async () => {

    const { error } = await supabase.from("consultants").insert({
      name: form.name, email: form.email, phone: form.phone, home_airport: form.home_airport,
      travel_prefs: { airline_pref: form.airline_pref, seat: form.seat, meal: "Standard" },
    });
    if (error) return toast.error(error.message);
    toast.success("Đã thêm giảng viên");
    setOpen(false); qc.invalidateQueries({ queryKey: ["all-consultants"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Giảng viên</h1>
          <p className="text-muted-foreground">Hồ sơ và preferences travel.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Thêm</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Thêm giảng viên</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Họ tên</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>SĐT</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="grid grid-cols-3 gap-2">
                <div><Label>Sân bay</Label><Input value={form.home_airport} onChange={(e) => setForm({ ...form, home_airport: e.target.value })} /></div>
                <div><Label>Hãng</Label><Input value={form.airline_pref} onChange={(e) => setForm({ ...form, airline_pref: e.target.value })} /></div>
                <div><Label>Ghế</Label><Input value={form.seat} onChange={(e) => setForm({ ...form, seat: e.target.value })} /></div>
              </div>
              <Button onClick={add} className="w-full">Lưu</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {consultants.map((c: any) => (
          <Card key={c.id}>
            <CardHeader>
              <CardTitle>{c.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{c.email}</p>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div>SĐT: {c.phone}</div>
              <div>Sân bay: <b>{c.home_airport}</b></div>
              <div>Hãng: {c.travel_prefs?.airline_pref}</div>
              <div>Ghế: {c.travel_prefs?.seat}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
