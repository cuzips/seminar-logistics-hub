import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { formatCurrency } from "@/lib/seminar-utils";
import { Plus } from "lucide-react";

import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/sites")({
  component: SitesPage,
});

const CITIES = ["Sài Gòn", "Hà Nội", "Đà Nẵng"] as const;


function SitesPage() {
  const qc = useQueryClient();
  const { data: sites = [] } = useQuery({
    queryKey: ["all-sites"],
    queryFn: async () => (await supabase.from("meeting_sites").select("*").order("city")).data ?? [],
  });
  const [open, setOpen] = useState(false);
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [form, setForm] = useState({ name: "", city: "Sài Gòn", address: "", sales_manager_name: "", cost_per_day: 0, max_capacity: 50, space_info: "" });


  const add = async () => {
    const { error } = await supabase.from("meeting_sites").insert(form);
    if (error) return toast.error(error.message);
    toast.success("Đã thêm site");
    setOpen(false); qc.invalidateQueries({ queryKey: ["all-sites"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Địa điểm họp</h1>
          <p className="text-muted-foreground">Danh sách meeting sites tại các thành phố.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Thêm site</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Thêm địa điểm</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Tên</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div>
                <Label>Thành phố</Label>
                <Select value={form.city} onValueChange={(v) => setForm({ ...form, city: v })}>
                  <SelectTrigger><SelectValue placeholder="Chọn thành phố" /></SelectTrigger>
                  <SelectContent>
                    {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div><Label>Địa chỉ</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
              <div><Label>Sales Manager</Label><Input value={form.sales_manager_name} onChange={(e) => setForm({ ...form, sales_manager_name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Chi phí/ngày ($)</Label><Input type="number" value={form.cost_per_day} onChange={(e) => setForm({ ...form, cost_per_day: +e.target.value })} /></div>
                <div><Label>Sức chứa</Label><Input type="number" value={form.max_capacity} onChange={(e) => setForm({ ...form, max_capacity: +e.target.value })} /></div>
              </div>
              <div><Label>Mô tả không gian</Label><Input value={form.space_info} onChange={(e) => setForm({ ...form, space_info: e.target.value })} /></div>
              <Button onClick={add} className="w-full">Lưu</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sites.map((s: any) => (
          <Card key={s.id}>
            <CardHeader>
              <CardTitle>{s.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{s.city} · {s.address}</p>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div>Sales Manager: <b>{s.sales_manager_name}</b></div>
              <div>Sức chứa: {s.max_capacity}</div>
              <div>Giá/ngày: {formatCurrency(s.cost_per_day)}</div>
              <div className="text-xs text-muted-foreground">{s.space_info}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
