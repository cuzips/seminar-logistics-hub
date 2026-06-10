# Phân quyền theo vai trò (không ảnh hưởng chức năng hiện có)

| Vai trò | Menu thấy được |
|---|---|
| **coordinator** | Tất cả menu hiện tại |
| **sales_manager** | Seminar, Hợp đồng |
| **materials** | Materials |
| **consultant** | Travel, Giảng viên *(chỉ xem)* |

Chỉ thêm lớp lọc UI + route guard; **không** đụng vào logic / RLS / database hiện có.

## Thay đổi

1. **`src/hooks/useCurrentUser.ts`** — thêm hook `useCurrentRole()` (đọc từ `user_roles`, trả role đầu tiên).
2. **`src/components/AppSidebar.tsx`** — mỗi item gắn `roles: string[]`; lọc theo role hiện tại trước khi render. Coordinator giữ nguyên đầy đủ.
3. **`src/routes/_authenticated/route.tsx`** — sau khi xác thực, đọc role; nếu pathname không nằm trong danh sách được phép → `navigate` về trang đầu tiên được phép + toast "Không có quyền".
4. **`src/routes/_authenticated/consultants.tsx`** — nếu role = `consultant`, ẩn các nút Thêm / Sửa / Xóa (chỉ render danh sách). Các role khác giữ nguyên.
5. **Trang sau đăng nhập (`auth.tsx`)** — sau khi đăng nhập thành công, điều hướng đến route đầu tiên user có quyền (coordinator → `/dashboard`, sales → `/seminars`, materials → `/materials`, consultant → `/travel`).

Không sửa RLS, không sửa form, không sửa các trang khác.
