import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { STATUS_LABEL, STATUS_COLOR, CONTRACT_STATUS_LABEL, formatDate, formatCurrency, computeMaterials, daysUntil } from "@/lib/seminar-utils";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Send, Package, Plane } from "lucide-react";

export const Route = createFileRoute("/_authenticated/seminars/$id")({
  component: SeminarDetail,
});

function SeminarDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();

  const { data: seminar, isLoading } = useQuery({
    queryKey: ["seminar", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seminars")
        .select("*, seminar_types(*), consultants(*), meeting_sites:selected_site_id(*)")
        .eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["seminar", id] });

  if (isLoading || !seminar) return <div>Đang tải...</div>;

  const days = daysUntil(seminar.start_date);

  return (
    <div className="space-y-6">
      <div>
        <Link to="/seminars" className="text-sm text-muted-foreground hover:underline">
          <ArrowLeft className="mr-1 inline h-3 w-3" /> Về danh sách
        </Link>
        <div className="mt-2 flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">{(seminar as any).seminar_types?.name}</h1>
            <p className="text-muted-foreground">
              {seminar.city} · {formatDate(seminar.start_date)} → {formatDate(seminar.end_date)}
              {" · "}{(seminar as any).consultants?.name}
              {" · "}{seminar.registrant_count} người đăng ký
            </p>
          </div>
          <span className={`rounded-full px-3 py-1.5 text-sm font-medium ${STATUS_COLOR[seminar.status]}`}>
            {STATUS_LABEL[seminar.status]}
          </span>
        </div>
        {days >= 0 && days <= 14 && (
          <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            ⚠️ Còn {days} ngày — cần hoàn tất chuẩn bị materials và travel.
          </div>
        )}
      </div>

      <Tabs defaultValue="site">
        <TabsList>
          <TabsTrigger value="site">Địa điểm</TabsTrigger>
          <TabsTrigger value="contract">Hợp đồng</TabsTrigger>
          <TabsTrigger value="travel">Travel</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="activity">Hoạt động</TabsTrigger>
        </TabsList>
        <TabsContent value="site"><SiteTab seminar={seminar} onChange={refresh} /></TabsContent>
        <TabsContent value="contract"><ContractTab seminar={seminar} onChange={refresh} /></TabsContent>
        <TabsContent value="travel"><TravelTab seminar={seminar} onChange={refresh} /></TabsContent>
        <TabsContent value="materials"><MaterialsTab seminar={seminar} onChange={refresh} /></TabsContent>
        <TabsContent value="activity"><ActivityTab seminarId={id} /></TabsContent>
      </Tabs>
    </div>
  );
}

async function logAction(seminarId: string, action: string, payload: any = {}) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return;
  await supabase.from("activity_log").insert({ seminar_id: seminarId, actor_id: u.user.id, action, payload });
}

type AppRole = "coordinator" | "sales_manager" | "consultant" | "materials";
async function notifyRole(role: AppRole, seminarId: string, type: string, message: string) {
  await supabase.from("notifications").insert({ target_role: role, seminar_id: seminarId, type, message });
}

/* ---------------- SITE TAB ---------------- */
function SiteTab({ seminar, onChange }: { seminar: any; onChange: () => void }) {
  const { data: sitesInCity = [] } = useQuery({
    queryKey: ["sites-city", seminar.city],
    queryFn: async () => (await supabase.from("meeting_sites").select("*").ilike("city", seminar.city)).data ?? [],
  });
  const { data: options = [], refetch } = useQuery({
    queryKey: ["site-options", seminar.id],
    queryFn: async () => (await supabase.from("site_options").select("*, meeting_sites(*)").eq("seminar_id", seminar.id)).data ?? [],
  });

  const addOption = async (siteId: string) => {
    const site: any = sitesInCity.find((s: any) => s.id === siteId);
    if (!site) return;
    const days = (new Date(seminar.end_date).getTime() - new Date(seminar.start_date).getTime()) / 86400000 + 1;
    await supabase.from("site_options").insert({
      seminar_id: seminar.id, site_id: siteId, available: true,
      estimated_cost: site.cost_per_day * days,
    });
    await supabase.from("seminars").update({ status: "site_selecting" }).eq("id", seminar.id);
    await logAction(seminar.id, "Thêm site vào danh sách so sánh", { site: site.name });
    refetch(); onChange();
  };

  const select = async (opt: any) => {
    await supabase.from("site_options").update({ selected: false }).eq("seminar_id", seminar.id);
    await supabase.from("site_options").update({ selected: true }).eq("id", opt.id);
    await supabase.from("seminars").update({ selected_site_id: opt.site_id, status: "contract_negotiating" }).eq("id", seminar.id);
    await logAction(seminar.id, "Chọn địa điểm", { site: opt.meeting_sites.name });
    await notifyRole("sales_manager", seminar.id, "site_selected", `Coordinator đã chọn ${opt.meeting_sites.name} cho seminar tại ${seminar.city}. Vui lòng tạo hợp đồng.`);
    toast.success("Đã chọn địa điểm và chuyển sang đàm phán hợp đồng");
    refetch(); onChange();
  };

  const remove = async (id: string) => {
    await supabase.from("site_options").delete().eq("id", id);
    refetch();
  };

  const type = seminar.seminar_types;
  const recRooms = Math.max(type?.default_rooms ?? 1, Math.ceil(seminar.registrant_count / 60));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Ước lượng nhu cầu</CardTitle>
          <CardDescription>Dựa trên loại seminar và số đăng ký.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3 text-sm">
          <div><div className="text-muted-foreground">Số phòng</div><div className="text-xl font-semibold">{recRooms}</div></div>
          <div><div className="text-muted-foreground">Kiểu bố trí</div><div className="text-xl font-semibold capitalize">{type?.default_seating}</div></div>
          <div><div className="text-muted-foreground">AV cần thiết</div><div className="font-medium">{(type?.default_av ?? []).join(", ")}</div></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Site options tại {seminar.city}</CardTitle>
          <CardDescription>So sánh và chọn địa điểm phù hợp.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Select onValueChange={addOption}>
              <SelectTrigger className="max-w-md"><SelectValue placeholder="Thêm site để so sánh..." /></SelectTrigger>
              <SelectContent>
                {sitesInCity
                  .filter((s: any) => !options.find((o: any) => o.site_id === s.id))
                  .map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name} — {formatCurrency(s.cost_per_day)}/ngày</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {options.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có site nào được thêm.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b text-left">
                <tr><th className="p-2">Site</th><th className="p-2">Sức chứa</th><th className="p-2">Chi phí ước tính</th><th className="p-2">Tiện nghi</th><th className="p-2"></th></tr>
              </thead>
              <tbody>
                {options.map((o: any) => (
                  <tr key={o.id} className={`border-b ${o.selected ? "bg-green-50" : ""}`}>
                    <td className="p-2">
                      <div className="font-medium">{o.meeting_sites.name}</div>
                      <div className="text-xs text-muted-foreground">{o.meeting_sites.address}</div>
                    </td>
                    <td className="p-2">{o.meeting_sites.max_capacity}</td>
                    <td className="p-2">{formatCurrency(o.estimated_cost)}</td>
                    <td className="p-2 text-xs">{(o.meeting_sites.amenities ?? []).join(", ")}</td>
                    <td className="p-2 text-right">
                      {o.selected ? (
                        <span className="text-sm font-medium text-green-700">✓ Đã chọn</span>
                      ) : (
                        <>
                          <Button size="sm" onClick={() => select(o)}>Chọn</Button>
                          <Button size="sm" variant="ghost" onClick={() => remove(o.id)}>Bỏ</Button>
                        </>
                      )}
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

/* ---------------- CONTRACT TAB ---------------- */
function ContractTab({ seminar, onChange }: { seminar: any; onChange: () => void }) {
  const { data: contract, refetch } = useQuery({
    queryKey: ["contract", seminar.id],
    queryFn: async () => (await supabase.from("contracts").select("*, meeting_sites(*)").eq("seminar_id", seminar.id).maybeSingle()).data,
  });
  const { data: versions = [], refetch: refetchV } = useQuery({
    queryKey: ["contract-versions", contract?.id],
    enabled: !!contract?.id,
    queryFn: async () => (await supabase.from("contract_versions").select("*").eq("contract_id", contract!.id).order("version", { ascending: false })).data ?? [],
  });

  const [terms, setTerms] = useState("");
  const [cost, setCost] = useState(0);
  const [note, setNote] = useState("");

  if (!seminar.selected_site_id) {
    return <Card><CardContent className="p-6 text-muted-foreground">Hãy chọn địa điểm họp trước khi tạo hợp đồng.</CardContent></Card>;
  }

  const createDraft = async () => {
    const { data: u } = await supabase.auth.getUser();
    const days = (new Date(seminar.end_date).getTime() - new Date(seminar.start_date).getTime()) / 86400000 + 1;
    const site = (seminar as any).meeting_sites;
    const baseCost = site?.cost_per_day * days;
    const { data: c, error } = await supabase.from("contracts").insert({
      seminar_id: seminar.id, site_id: seminar.selected_site_id,
      status: "pending_coordinator", total_cost: baseCost, current_version: 1,
    }).select().single();
    if (error) return toast.error(error.message);
    await supabase.from("contract_versions").insert({
      contract_id: c!.id, version: 1, action: "created",
      terms: { rooms: 1, seating: site?.seating ?? "theater", av: [], days, daily_rate: site?.cost_per_day, total: baseCost },
      note: null, created_by: u.user!.id,
    });

    await logAction(seminar.id, "Sales Manager tạo bản nháp hợp đồng", {});
    await notifyRole("coordinator", seminar.id, "contract_draft", "Sales Manager đã gửi bản nháp hợp đồng để xem xét.");
    toast.success("Đã tạo bản nháp"); refetch(); refetchV(); onChange();
  };

  const submitVersion = async (action: "edit" | "approve") => {
    if (!contract) return;
    const { data: u } = await supabase.auth.getUser();
    const newVersion = contract.current_version + 1;
    const isApprove = action === "approve";
    const nextStatus: any = isApprove
      ? (contract.status === "pending_coordinator" ? "pending_sales" : "approved")
      : (contract.status === "pending_coordinator" ? "pending_sales" : "pending_coordinator");

    await supabase.from("contract_versions").insert({
      contract_id: contract.id, version: newVersion, action: isApprove ? "approved" : "edited",
      terms: { changes: terms, total: cost || contract.total_cost }, note,
      created_by: u.user!.id,
    });
    await supabase.from("contracts").update({
      current_version: newVersion, status: nextStatus,
      total_cost: cost || contract.total_cost,
    }).eq("id", contract.id);

    if (nextStatus === "approved") {
      await supabase.from("seminars").update({ status: "contract_approved" }).eq("id", seminar.id);
      await logAction(seminar.id, "Hợp đồng đã được cả hai bên chấp thuận", {});
      await notifyRole("coordinator", seminar.id, "contract_approved", "Hợp đồng đã được duyệt — có thể chuyển sang travel.");
    } else {
      await logAction(seminar.id, isApprove ? "Chấp thuận hợp đồng — chờ bên kia" : "Yêu cầu chỉnh sửa hợp đồng", { note });
      const targetRole = nextStatus === "pending_coordinator" ? "coordinator" : "sales_manager";
      await notifyRole(targetRole, seminar.id, "contract_review", "Có phiên bản hợp đồng mới cần xem xét.");
    }
    setTerms(""); setNote(""); setCost(0);
    refetch(); refetchV(); onChange();
    toast.success(isApprove ? "Đã chấp thuận" : "Đã gửi chỉnh sửa");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Hợp đồng với {(contract as any)?.meeting_sites?.name ?? "địa điểm đã chọn"}</CardTitle>
          <CardDescription>
            Vòng lặp đàm phán giữa Coordinator và Sales Manager.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!contract ? (
            <div>
              <p className="mb-3 text-sm text-muted-foreground">Sales Manager cần tạo bản nháp đầu tiên.</p>
              <Button onClick={createDraft}>Tạo bản nháp (Sales Manager)</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  v{contract.current_version} · {CONTRACT_STATUS_LABEL[contract.status]}
                </span>
                <span className="text-sm">Tổng chi phí: {formatCurrency(contract.total_cost)}</span>
              </div>

              {contract.status !== "approved" && (
                <div className="rounded-md border p-4 space-y-3">
                  <h4 className="font-medium">Phản hồi / cập nhật</h4>
                  <div>
                    <Label>Nội dung chỉnh sửa</Label>
                    <Textarea value={terms} onChange={(e) => setTerms(e.target.value)} placeholder="VD: Tăng số phòng từ 1 lên 2, thêm wireless mic..." />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Tổng chi phí mới ($)</Label>
                      <Input type="number" value={cost} onChange={(e) => setCost(+e.target.value)} placeholder={contract.total_cost.toString()} />
                    </div>
                    <div>
                      <Label>Ghi chú</Label>
                      <Input value={note} onChange={(e) => setNote(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => submitVersion("edit")} variant="outline">
                      <Send className="mr-2 h-4 w-4" /> Gửi chỉnh sửa
                    </Button>
                    <Button onClick={() => submitVersion("approve")}>
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Chấp thuận phiên bản hiện tại
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {versions.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Lịch sử phiên bản</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {versions.map((v: any) => (
                <li key={v.id} className="rounded border p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">v{v.version} — {v.action}</span>
                    <span className="text-xs text-muted-foreground">{new Date(v.created_at).toLocaleString("vi-VN")}</span>
                  </div>
                  {v.note && <div className="text-muted-foreground">{v.note}</div>}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ---------------- TRAVEL TAB ---------------- */
function TravelTab({ seminar, onChange }: { seminar: any; onChange: () => void }) {
  const { data: travel, refetch } = useQuery({
    queryKey: ["travel", seminar.id],
    queryFn: async () => (await supabase.from("travel_arrangements").select("*").eq("seminar_id", seminar.id).maybeSingle()).data,
  });

  const c = seminar.consultants;
  const [outbound, setOutbound] = useState("");
  const [ret, setRet] = useState("");
  const [airline, setAirline] = useState(c?.travel_prefs?.airline_pref ?? "Delta");
  const [hotel, setHotel] = useState("");

  const cityCode = seminar.city ? seminar.city.slice(0, 3).toUpperCase() : "DST";
  const home = c?.home_airport ?? "HOME";
  const outboundTimes = ["08:30", "14:15", "19:00"];
  const returnTimes = ["09:45", "16:20", "21:10"];
  const seedNum = (offset: number) => 100 + ((seminar.id?.charCodeAt(0) ?? 0) + offset * 37) % 900;

  const flightSchedules = outboundTimes.map((time, i) => ({
    code: `${airline} ${seedNum(i)} — ${home} → ${cityCode} ${time}`,
    time,
  }));
  const returnSchedules = returnTimes.map((time, i) => ({
    code: `${airline} ${seedNum(i + 10)} — ${cityCode} → ${home} ${time}`,
    time,
  }));

  const pickRoundTrip = (i: number) => {
    setOutbound(flightSchedules[i].code);
    setRet(returnSchedules[i].code);
  };

  const book = async () => {
    const payload = {
      seminar_id: seminar.id, consultant_id: seminar.consultant_id,
      outbound_flight: outbound, return_flight: ret, airline, hotel,
      departure_date: seminar.start_date, return_date: seminar.end_date,
      travel_agency: "Global Travel Co.",
      confirmation_number: "TRV-" + Math.random().toString(36).slice(2, 9).toUpperCase(),
      status: "booked",
    };
    if (travel) await supabase.from("travel_arrangements").update(payload).eq("id", travel.id);
    else await supabase.from("travel_arrangements").insert(payload);
    await supabase.from("seminars").update({ status: "travel_booked" }).eq("id", seminar.id);
    await logAction(seminar.id, "Đặt vé travel cho consultant", { airline, outbound });
    await notifyRole("consultant", seminar.id, "travel_booked", `Travel cho ${c?.name} đã được đặt — kiểm tra itinerary.`);
    toast.success("Đã đặt travel"); refetch(); onChange();
  };

  const sendItinerary = async () => {
    if (!travel) return;
    await supabase.from("travel_arrangements").update({ itinerary_sent_at: new Date().toISOString(), status: "confirmed" }).eq("id", travel.id);
    await logAction(seminar.id, "Gửi itinerary cho consultant", {});
    toast.success("Đã gửi itinerary"); refetch();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Hồ sơ travel của {c?.name}</CardTitle>
          <CardDescription>Thông tin lưu sẵn trong logistics database.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <div><span className="text-muted-foreground">Sân bay nhà:</span> {c?.home_airport}</div>
          <div><span className="text-muted-foreground">Hãng ưa thích:</span> {c?.travel_prefs?.airline_pref}</div>
          <div><span className="text-muted-foreground">Ghế:</span> {c?.travel_prefs?.seat}</div>
          <div><span className="text-muted-foreground">Bữa ăn:</span> {c?.travel_prefs?.meal}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lịch chuyến bay khả dụng</CardTitle>
          <CardDescription>Chọn chuyến đi & chuyến về, hoặc bấm "Chọn khứ hồi" để chọn cả cặp.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="mb-2 text-sm font-semibold">Chuyến đi ({home} → {cityCode})</div>
            <ul className="space-y-1 text-sm">
              {flightSchedules.map((f, i) => (
                <li key={f.code} className="flex items-center gap-2">
                  <button
                    className={`flex-1 rounded border p-2 text-left hover:bg-accent/30 ${outbound === f.code ? "border-primary bg-primary/10" : ""}`}
                    onClick={() => setOutbound(f.code)}
                  >
                    {f.code}
                  </button>
                  <Button variant="outline" size="sm" onClick={() => pickRoundTrip(i)}>Khứ hồi</Button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold">Chuyến về ({cityCode} → {home})</div>
            <ul className="space-y-1 text-sm">
              {returnSchedules.map((f) => (
                <li key={f.code}>
                  <button
                    className={`w-full rounded border p-2 text-left hover:bg-accent/30 ${ret === f.code ? "border-primary bg-primary/10" : ""}`}
                    onClick={() => setRet(f.code)}
                  >
                    {f.code}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle>Đặt vé qua travel agency</CardTitle>
          <CardDescription>Global Travel Co.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Chuyến đi</Label>
            <Input value={outbound} onChange={(e) => setOutbound(e.target.value)} placeholder="Chọn từ danh sách trên" />
          </div>
          <div>
            <Label>Chuyến về</Label>
            <Input value={ret} onChange={(e) => setRet(e.target.value)} placeholder="VD: Delta 412 — JFK ← NYC 18:00" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Hãng</Label><Input value={airline} onChange={(e) => setAirline(e.target.value)} /></div>
            <div><Label>Khách sạn</Label><Input value={hotel} onChange={(e) => setHotel(e.target.value)} /></div>
          </div>
          <div className="flex gap-2">
            <Button onClick={book}><Plane className="mr-2 h-4 w-4" /> {travel ? "Cập nhật" : "Đặt vé"}</Button>
            {travel && <Button variant="outline" onClick={sendItinerary}>Gửi itinerary cho consultant</Button>}
          </div>
          {travel && (
            <div className="mt-2 rounded-md bg-secondary p-3 text-sm">
              <div>Mã xác nhận: <b>{travel.confirmation_number}</b></div>
              <div>Trạng thái: {travel.status}</div>
              {travel.itinerary_sent_at && <div>Itinerary đã gửi: {new Date(travel.itinerary_sent_at).toLocaleString("vi-VN")}</div>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------- MATERIALS TAB ---------------- */
function MaterialsTab({ seminar, onChange }: { seminar: any; onChange: () => void }) {
  const { data: req, refetch } = useQuery({
    queryKey: ["materials", seminar.id],
    queryFn: async () => (await supabase.from("materials_requests").select("*").eq("seminar_id", seminar.id).maybeSingle()).data,
  });

  const template = seminar.seminar_types?.materials_template ?? [];
  const computed = computeMaterials(template, seminar.registrant_count);
  const site = (seminar as any).meeting_sites;
  const shipTo = site ? `${site.name}, ${site.address}, ${site.city}` : `${seminar.city}`;

  const send = async () => {
    const { data: u } = await supabase.auth.getUser();
    const payload = {
      seminar_id: seminar.id, items: computed, ship_to_address: shipTo,
      status: "requested", requested_by: u.user!.id,
    };
    if (req) await supabase.from("materials_requests").update(payload).eq("id", req.id);
    else await supabase.from("materials_requests").insert(payload);
    await supabase.from("seminars").update({ status: "materials_requested" }).eq("id", seminar.id);
    await logAction(seminar.id, "Gửi yêu cầu materials cho Materials-handling", { count: computed.length });
    await notifyRole("materials", seminar.id, "materials_request", `Yêu cầu materials mới cho ${seminar.city} (${formatDate(seminar.start_date)}).`);
    toast.success("Đã gửi yêu cầu materials"); refetch(); onChange();
  };

  const markShipped = async () => {
    const { data: u } = await supabase.auth.getUser();
    await supabase.from("materials_requests").update({
      status: "shipped", shipped_at: new Date().toISOString(),
      tracking_number: "TRK-" + Math.random().toString(36).slice(2, 9).toUpperCase(),
      handled_by: u.user!.id,
    }).eq("id", req!.id);
    await supabase.from("seminars").update({ status: "materials_shipped" }).eq("id", seminar.id);
    await logAction(seminar.id, "Materials đã gửi tới meeting facility", {});
    await notifyRole("coordinator", seminar.id, "materials_shipped", "Materials đã được gửi đi.");
    toast.success("Đã ghi nhận đã gửi"); refetch(); onChange();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Danh sách materials (tự ước lượng)</CardTitle>
          <CardDescription>
            Theo loại seminar "{seminar.seminar_types?.name}" và {seminar.registrant_count} người đăng ký.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead className="border-b text-left">
              <tr><th className="p-2">Vật phẩm</th><th className="p-2">Số lượng</th></tr>
            </thead>
            <tbody>
              {computed.map((it: any) => (
                <tr key={it.name} className="border-b">
                  <td className="p-2">{it.name}</td><td className="p-2">{it.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 text-sm">
            <b>Gửi đến:</b> {shipTo}
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={send}><Package className="mr-2 h-4 w-4" /> {req ? "Gửi lại yêu cầu" : "Gửi yêu cầu"}</Button>
            {req && req.status !== "shipped" && (
              <Button variant="outline" onClick={markShipped}>Đánh dấu đã gửi (Materials staff)</Button>
            )}
          </div>
          {req && (
            <div className="mt-3 rounded-md bg-secondary p-3 text-sm">
              <div>Trạng thái: <b>{req.status}</b></div>
              {req.tracking_number && <div>Tracking: {req.tracking_number}</div>}
              {req.shipped_at && <div>Đã gửi lúc: {new Date(req.shipped_at).toLocaleString("vi-VN")}</div>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------- ACTIVITY TAB ---------------- */
function ActivityTab({ seminarId }: { seminarId: string }) {
  const { data: log = [] } = useQuery({
    queryKey: ["log", seminarId],
    queryFn: async () => (await supabase.from("activity_log").select("*, profiles:actor_id(full_name,email)").eq("seminar_id", seminarId).order("created_at", { ascending: false })).data ?? [],
  });
  return (
    <Card>
      <CardHeader><CardTitle>Nhật ký hoạt động</CardTitle></CardHeader>
      <CardContent>
        {log.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có hoạt động.</p>
        ) : (
          <ol className="space-y-3 border-l-2 border-border pl-4">
            {log.map((entry: any) => (
              <li key={entry.id} className="relative">
                <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-primary" />
                <div className="text-sm font-medium">{entry.action}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(entry.created_at).toLocaleString("vi-VN")}
                  {entry.profiles && ` · ${entry.profiles.full_name || entry.profiles.email}`}
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
