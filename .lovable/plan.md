# Cho phép chọn cả vé chuyến về trong tab Travel

Hiện tại "Lịch chuyến bay khả dụng" trong tab Travel của trang chi tiết seminar chỉ liệt kê chuyến đi và bấm vào chỉ điền ô **Chuyến đi**. Coordinator không có cách chọn nhanh chuyến về.

## Thay đổi (chỉ trong `src/routes/_authenticated/seminars.$id.tsx`, hàm `TravelTab`)

1. Tạo thêm mảng `returnSchedules` (chiều ngược lại: `seminar.city → home_airport`) với 3 khung giờ buổi chiều/tối.
2. Đổi card "Lịch chuyến bay khả dụng" thành **2 cột**:
   - **Chuyến đi** — danh sách `flightSchedules`, click → set `outbound`.
   - **Chuyến về** — danh sách `returnSchedules`, click → set `ret`.
3. Thêm nút **"Chọn cặp khứ hồi"** ở mỗi hàng chuyến đi: chọn nhanh chuyến đi + chuyến về cùng cặp khung giờ tương ứng (đi sáng ↔ về tối cùng ngày kết thúc).
4. Giữ nguyên 2 ô Input "Chuyến đi" / "Chuyến về" bên dưới để vẫn có thể sửa tay.

Không sửa schema, không sửa file khác, không ảnh hưởng các tab khác.
