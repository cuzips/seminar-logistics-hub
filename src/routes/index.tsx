import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, MapPin, FileSignature, Plane, Package, Bell } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

const features = [
  { icon: Calendar, title: "Quản lý Booking", desc: "Tiếp nhận thông tin seminar từ phòng Bookings: loại, ngày, thành phố, giảng viên." },
  { icon: MapPin, title: "Chọn địa điểm họp", desc: "So sánh sites theo lịch trống, chi phí, không gian và vị trí." },
  { icon: FileSignature, title: "Đàm phán hợp đồng", desc: "Vòng lặp duyệt hợp đồng giữa Coordinator và Sales Manager với lịch sử phiên bản." },
  { icon: Plane, title: "Sắp xếp Travel", desc: "Tra cứu chuyến bay, đặt vé qua travel agency, gửi itinerary cho consultant." },
  { icon: Package, title: "Yêu cầu Materials", desc: "Tự gợi ý danh sách materials theo loại seminar và số đăng ký, gửi Materials-handling." },
  { icon: Bell, title: "Thông báo & Nhật ký", desc: "Lịch sử mọi thao tác và alert tự động 2 tuần trước seminar." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary" />
            <span className="font-display text-lg font-bold">Training Inc. Logistics</span>
          </div>
          <Link to="/auth" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Đăng nhập
          </Link>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-6 py-20 text-center">
          <h1 className="font-display text-5xl font-bold tracking-tight md:text-6xl">
            Hệ thống quản lý <span className="text-primary">hậu cần seminar</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Trung tâm điều phối toàn bộ tác vụ logistics: từ booking, chọn địa điểm, đàm phán hợp đồng, sắp xếp travel cho giảng viên, đến gửi materials cho từng seminar.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link to="/auth" className="rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90">
              Bắt đầu ngay
            </Link>
          </div>
        </section>

        <section className="container mx-auto px-6 py-16">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border bg-card p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Training, Inc. — Logistics Department
      </footer>
    </div>
  );
}
