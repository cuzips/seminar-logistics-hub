export const ROLE_LABEL: Record<string, string> = {
  coordinator: "Logistics Coordinator",
  sales_manager: "Sales Manager",
  consultant: "Giảng viên (Consultant)",
  materials: "Materials Staff",
};

export const STATUS_LABEL: Record<string, string> = {
  booked: "Đã booking",
  site_selecting: "Đang chọn địa điểm",
  contract_negotiating: "Đang đàm phán hợp đồng",
  contract_approved: "Hợp đồng đã ký",
  travel_booked: "Đã đặt travel",
  materials_requested: "Đã yêu cầu materials",
  materials_shipped: "Materials đã gửi",
  ready: "Sẵn sàng",
  completed: "Hoàn tất",
};

export const STATUS_COLOR: Record<string, string> = {
  booked: "bg-slate-200 text-slate-800",
  site_selecting: "bg-blue-100 text-blue-800",
  contract_negotiating: "bg-amber-100 text-amber-800",
  contract_approved: "bg-indigo-100 text-indigo-800",
  travel_booked: "bg-cyan-100 text-cyan-800",
  materials_requested: "bg-purple-100 text-purple-800",
  materials_shipped: "bg-teal-100 text-teal-800",
  ready: "bg-green-100 text-green-800",
  completed: "bg-emerald-200 text-emerald-900",
};

export const CONTRACT_STATUS_LABEL: Record<string, string> = {
  draft: "Bản nháp",
  pending_coordinator: "Chờ Coordinator duyệt",
  pending_sales: "Chờ Sales Manager duyệt",
  approved: "Đã chấp thuận",
};

export function formatDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("vi-VN");
}

export function formatCurrency(n: number | null | undefined) {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export function daysUntil(date: string) {
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export interface MaterialItem {
  name: string;
  per_attendee: boolean;
  qty_per: number;
}

export function computeMaterials(template: MaterialItem[], attendees: number) {
  return template.map((item) => ({
    name: item.name,
    quantity: item.per_attendee ? attendees * item.qty_per : item.qty_per,
  }));
}
