## Mục tiêu
Khôi phục đầy đủ ứng dụng **Seminar Logistics Hub** từ file zip vừa tải lên vào project hiện tại và chạy được trên preview.

## Nội dung zip (đã kiểm tra)
- Mã nguồn React/TanStack Start đầy đủ (~99 file)
- Routes: `/auth`, `/_authenticated/{dashboard, seminars, contracts, consultants, materials, sites, travel, notifications, seminar-types, ...}`
- Lib: `src/integrations/supabase/*`, `src/lib/seminar-utils.ts`, `src/hooks/useCurrentUser.ts`, `src/components/AppSidebar.tsx`
- 3 file migration SQL (~348 dòng) tạo schema hội thảo, hợp đồng, vật tư, công tác, RLS, roles
- `.lovable/plan.md` mô tả mục tiêu tiếp theo: seed 4 tài khoản demo

## Các bước thực hiện

1. **Bật Lovable Cloud** cho project (cần backend Supabase để xác thực và lưu dữ liệu).
2. **Copy mã nguồn từ zip** vào `/dev-server`, loại trừ `.git`, `node_modules`, `bun.lock`, `.lovable/`, `.env` (giữ lại file Cloud tự sinh):
   - `src/components/AppSidebar.tsx`
   - `src/hooks/useCurrentUser.ts`
   - `src/lib/seminar-utils.ts`
   - Toàn bộ `src/routes/auth.tsx`, `src/routes/index.tsx`, `src/routes/_authenticated/*`
   - Ghi đè `src/routes/__root.tsx` (nếu khác)
3. **Cài thêm dependencies** còn thiếu nếu có (so sánh `package.json`): chủ yếu các gói `@radix-ui/*`, `recharts`, `date-fns`, `cmdk`, `vaul`, `embla-carousel-react` (phần lớn đã có sẵn).
4. **Chạy 3 migrations SQL** để tạo schema (enum roles, bảng `profiles`, `user_roles`, `seminars`, `contracts`, `consultants`, `materials`, `sites`, `travel`, `notifications`, RLS policies, hàm `has_role`).
5. **Seed 4 tài khoản demo** theo `.lovable/plan.md` (coordinator / sales / consultant / materials, mật khẩu `Demo@1234`) bằng migration mới, kèm `email_confirmed_at = now()`.
6. **Kiểm tra**: build sạch, mở `/auth` đăng nhập với một tài khoản demo, vào `/dashboard`, đảm bảo sidebar và các route con render.

## Lưu ý kỹ thuật
- File `src/integrations/supabase/*` trong zip sẽ bị **bỏ qua** — sau khi bật Lovable Cloud, các file này được tự sinh đúng cho project mới (URL/key khác). Code app đã import theo alias `@/integrations/supabase/*` nên vẫn hoạt động.
- File `src/routeTree.gen.ts` trong zip sẽ ghi đè rồi Vite tự regenerate.
- Không copy `.git/`, `node_modules/`, `bun.lock` (sẽ regenerate sau `bun install`).
- `.env` trong zip sẽ KHÔNG copy — Cloud tự inject biến môi trường.

## Kết quả mong đợi
Sau khi hoàn tất, người dùng có thể đăng nhập tại `/auth` bằng một trong 4 tài khoản demo và sử dụng đầy đủ tính năng quản lý hội thảo.
