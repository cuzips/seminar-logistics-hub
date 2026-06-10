## Bối cảnh
Sau khi đối chiếu lại md5 từng file giữa zip và `/dev-server`:
- Toàn bộ mã nguồn ứng dụng (`src/`, `package.json`, configs…) đã copy đầy đủ, không có file nào chênh lệch nội dung.
- `src/integrations/supabase/*.ts` và `.env` đã có (do Lovable Cloud tự sinh đúng cho project hiện tại — không nên dùng bản trong zip vì trỏ tới project Supabase cũ).
- **3 file SQL migration trong `supabase/migrations/` chưa có trên đĩa** dù nội dung đã được chạy vào database.

## Việc cần làm
Copy thêm 3 file SQL từ zip vào `/dev-server/supabase/migrations/` để repo khớp 100% với zip gốc:

```
supabase/migrations/20260604050437_21197760-2308-4061-9fdc-be781b856bed.sql
supabase/migrations/20260604050506_aa59d9af-bc72-48d1-86b7-b25af33e2717.sql
supabase/migrations/20260604051638_30455c9b-5205-4323-b86e-ba46b3206ac2.sql
```

Không cần chạy lại migration (database đã có schema và 4 tài khoản demo từ lần chạy trước).

## Không thay đổi
- Không sửa `.env`, `src/integrations/supabase/*.ts` — đã chuẩn cho Cloud hiện tại.
- Không động vào database.
- Không sửa mã nguồn ứng dụng.

## Kết quả
Repo sẽ có cấu trúc thư mục giống hệt zip gốc (trừ các file Cloud auto-generate phải khác).
