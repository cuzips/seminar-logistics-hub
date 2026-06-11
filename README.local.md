# Chạy project trên VSCode (local dev)

Hướng dẫn này giúp bạn clone project về máy, mở bằng VSCode và chạy ở chế độ dev. Backend (database, auth, storage) vẫn dùng Lovable Cloud sẵn có — bạn **không cần** cài Supabase hay tạo database mới.

---

## 1. Yêu cầu cài đặt

| Công cụ | Phiên bản | Ghi chú |
|---|---|---|
| **Node.js** | 20 trở lên | https://nodejs.org |
| **Bun** | mới nhất | Trình chạy nhanh nhất cho project này |
| **Git** | bất kỳ | https://git-scm.com |
| **VSCode** | mới nhất | https://code.visualstudio.com |

### Cài Bun

**macOS / Linux:**
```bash
curl -fsSL https://bun.sh/install | bash
```

**Windows (PowerShell):**
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Kiểm tra: `bun --version`

### Extension VSCode nên cài

- **ESLint** (dbaeumer.vscode-eslint)
- **Prettier - Code formatter** (esbenp.prettier-vscode)
- **Tailwind CSS IntelliSense** (bradlc.vscode-tailwindcss)
- **TypeScript and JavaScript Language Features** (mặc định)

---

## 2. Clone & mở project

```bash
git clone <URL_REPO_CUA_BAN>
cd <ten-thu-muc>
code .
```

> Tip: trên Lovable, bạn có thể export sang GitHub (nút GitHub ở góc trên), sau đó copy URL về và `git clone`.

---

## 3. Tạo file `.env`

Ở thư mục gốc, tạo file `.env` (cùng cấp với `package.json`) với nội dung **chính xác** như sau:

```env
SUPABASE_PROJECT_ID="hgkrfytkaqmqbsbhiqxu"
SUPABASE_URL="https://hgkrfytkaqmqbsbhiqxu.supabase.co"
SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhna3JmeXRrYXFtcWJzYmhpcXh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwOTUzMjgsImV4cCI6MjA5NjY3MTMyOH0.cvAk5IBI4GJHlZl3arcVe_dRKaRrMGEfMdl9BBqkLGA"

VITE_SUPABASE_PROJECT_ID="hgkrfytkaqmqbsbhiqxu"
VITE_SUPABASE_URL="https://hgkrfytkaqmqbsbhiqxu.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhna3JmeXRrYXFtcWJzYmhpcXh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwOTUzMjgsImV4cCI6MjA5NjY3MTMyOH0.cvAk5IBI4GJHlZl3arcVe_dRKaRrMGEfMdl9BBqkLGA"
```

> Các key trên là **publishable key** (an toàn để chạy ở client). RLS ở backend vẫn bảo vệ data.

---

## 4. Cài dependencies & chạy dev

```bash
bun install
bun run dev
```

Mở trình duyệt: **http://localhost:8080**

App sẽ kết nối thẳng tới database Lovable Cloud — bạn đăng nhập bằng đúng tài khoản đang dùng trên preview Lovable.

---

## 5. Các lệnh hữu ích

```bash
bun run dev       # chạy dev server (hot reload)
bun run lint      # kiểm tra eslint
bun run format    # format code bằng prettier
```

---

## 6. Troubleshooting

**Port 8080 đã bị chiếm**
Vite sẽ tự đổi sang port khác và in URL trong terminal. Hoặc tắt process đang dùng 8080.

**Lỗi `Missing Supabase environment variable(s)`**
File `.env` chưa đúng vị trí (phải ở root, cùng cấp `package.json`) hoặc thiếu biến. Kiểm tra lại bước 3 rồi chạy lại `bun run dev`.

**Đăng nhập Google không redirect về localhost**
Provider Google đang cấu hình redirect về preview URL. Hai cách:
- Đăng nhập bằng email/password để test local, hoặc
- Báo để mình thêm `http://localhost:8080` vào danh sách Redirect URLs của backend.

**Cache Vite bị lỗi sau khi đổi `.env` hoặc `vite.config.ts`**
```bash
rm -rf node_modules/.vite .vinxi .output
bun run dev
```

**Lỗi `bun: command not found` sau khi cài**
Mở terminal mới, hoặc thêm Bun vào PATH:
```bash
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
```

---

## 7. Lưu ý quan trọng

- Mọi thay đổi dữ liệu khi chạy local đều ghi vào **cùng database** đang dùng trên Lovable preview — hãy cẩn thận khi xóa/sửa.
- **Không commit** file `.env` lên Git công khai (đã có sẵn `.gitignore` xử lý).
- File `src/integrations/supabase/client.ts` và `src/routeTree.gen.ts` là **auto-generated** — không sửa tay.
