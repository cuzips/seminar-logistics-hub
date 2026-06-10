import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/seminars/new")({
  component: NewSeminar,
});

function NewSeminar() {
  const navigate = useNavigate();
  const [typeId, setTypeId] = useState("");
  const [city, setCity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [consultantId, setConsultantId] = useState("");
  const [registrants, setRegistrants] = useState(20);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: types = [] } = useQuery({
    queryKey: ["types"],
    queryFn: async () => (await supabase.from("seminar_types").select("id,name")).data ?? [],
  });
  const { data: consultants = [] } = useQuery({
    queryKey: ["consultants"],
    queryFn: async () => (await supabase.from("consultants").select("id,name")).data ?? [],
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeId || !consultantId) {
      return toast.error("Vui lòng chọn loại seminar và giảng viên");
    }
    setLoading(true);
    const { data: u } = await supabase.auth.getUser();
    const { data, error } = await supabase.from("seminars").insert({
      type_id: typeId, city, start_date: startDate, end_date: endDate,
      consultant_id: consultantId, registrant_count: registrants,
      notes: notes || null, status: "booked", created_by: u.user?.id ?? null,
    }).select().single();
    setLoading(false);
    if (error) return toast.error(error.message);
    if (data && u.user) {
      await supabase.from("activity_log").insert({ seminar_id: data.id, actor_id: u.user.id, action: "Tạo booking", payload: { city, start_date: startDate } });
    }
    toast.success("Đã tạo booking");
    navigate({ to: "/seminars/$id", params: { id: data!.id } });
  };


  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Booking mới</h1>
        <p className="text-muted-foreground">Tạo seminar từ thông tin của phòng Bookings.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Thông tin seminar</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>Loại seminar</Label>
              <Select value={typeId} onValueChange={setTypeId} required>
                <SelectTrigger><SelectValue placeholder="Chọn loại" /></SelectTrigger>
                <SelectContent>
                  {types.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Thành phố</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ngày bắt đầu</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </div>
              <div>
                <Label>Ngày kết thúc</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
              </div>
            </div>
            <div>
              <Label>Giảng viên</Label>
              <Select value={consultantId} onValueChange={setConsultantId} required>
                <SelectTrigger><SelectValue placeholder="Chọn giảng viên" /></SelectTrigger>
                <SelectContent>
                  {consultants.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Số đăng ký dự kiến</Label>
              <Input type="number" min={1} value={registrants} onChange={(e) => setRegistrants(+e.target.value)} required />
            </div>
            <div>
              <Label>Ghi chú</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading}>{loading ? "Đang lưu..." : "Tạo booking"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
