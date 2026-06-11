# Kế hoạch: Chạy project trên VSCode (local dev)

Mục tiêu: clone project về máy, mở bằng VSCode, chạy `bun run dev` và xem app trong trình duyệt. Backend vẫn dùng Lovable Cloud hiện tại (không cần setup database).

## Thay đổi trong code

Thực tế project hiện đã sẵn sàng chạy local — không cần sửa source code. Chỉ bổ sung 1 file tài liệu hướng dẫn:

1. **Tạo `README.local.md`** ở root, gồm:
   - Yêu cầu cài đặt (Node 20+, Bun, Git, VSCode + extension gợi ý)
   - Các bước setup (clone, tạo `.env`, `bun install`, `bun run dev`)
   - Nội dung `.env` cần copy (các biến `VITE_SUPABASE_*` và `SUPABASE_*` đang có)
   - Cách mở preview ở `http://localhost:8080`
   - Troubleshooting thường gặp (port bận, lỗi auth Google redirect, cache Vite)

Không sửa `vite.config.ts`, `package.json`, `.env`, hay bất kỳ file source nào — project đã chạy được sẵn với Bun.

## Các bước người dùng sẽ làm trên máy

```text
1. Cài Bun:           curl -fsSL https://bun.sh/install | bash
2. Clone repo:        git clone <repo-url> && cd <repo>
3. Tạo file .env:     copy đúng nội dung như README.local.md mô tả
4. Cài dependencies:  bun install
5. Chạy dev server:   bun run dev
6. Mở trình duyệt:    http://localhost:8080
```

## Lưu ý kỹ thuật

- Backend (database, auth, storage) vẫn trỏ tới Lovable Cloud thông qua `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY`. Mọi thay đổi data ở local sẽ ghi vào cùng database đang dùng trên preview.
- `bun run dev` chạy Vite + TanStack Start. Không cần `build` cho mục đích dev.
- Nếu Google OAuth redirect về preview URL thay vì localhost, cần thêm `http://localhost:8080` vào Authorized redirect URLs ở backend (sẽ ghi chú trong README).
- Extension VSCode gợi ý: ESLint, Prettier, Tailwind CSS IntelliSense, TypeScript.

## Deliverable

Một file mới: `README.local.md` với hướng dẫn đầy đủ bằng tiếng Việt.
