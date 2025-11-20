# Website Manager

Website Manager là một dự án full‑stack giúp bạn quản lý và giám sát các website của mình (hoặc của team/khách hàng) một cách tập trung.

## Mục đích

- Tổng hợp thông tin quan trọng của từng website: domain, hosting, SSL, DNS, backup, tags, người phụ trách…
- Theo dõi tình trạng hoạt động (uptime) và một số cảnh báo cơ bản (web down, domain sắp hết hạn, SSL sắp hết hạn).
- Cung cấp giao diện quản trị để phân quyền user/role, quản lý API token, webhooks, activity logs…
- Làm nền tảng để bạn có thể mở rộng sang các automation khác (auto restart service, tạo ticket, gửi thông báo Slack, v.v.).

## Chức năng chính

- **Xác thực & Phân quyền**  
  Đăng nhập bằng JWT, phân quyền theo **roles/permissions** (RBAC). Mỗi API quan trọng đều yêu cầu permission tương ứng.

- **Quản lý Websites**  
  - Thêm/sửa/xoá website với các thông tin:
    - Tên, domain
    - Registrar, hosting provider, hosting plan, server IP
    - Trạng thái monitoring (bật/tắt uptime check)
    - Ghi chú, backup info
  - Xem chi tiết website (Overview, Members, Tags, DNS Records, Checks/Stats).

- **Monitoring & Alerts**  
  - Cron job kiểm tra **uptime** định kỳ, cập nhật `status` (online/degraded/offline).
  - Cron job kiểm tra **hạn domain** và **hạn SSL** (theo dữ liệu đã lưu).
  - Khi phát hiện sự cố (web down nhiều lần liên tiếp, domain sắp hết hạn…):
    - Tạo `WebsiteAlert` trong DB
    - Tạo `Notification` kênh **email** và **webhook**
    - Worker gửi **email** tới địa chỉ cấu hình trong Settings

- **Settings (Alert Email, SMTP)**  
  - Trang Settings trên frontend cho phép cấu hình **Alert email** (email nhận mọi cảnh báo).
  - Backend đọc config này để gửi mail qua SMTP (Gmail hoặc SMTP server khác).

- **Teams, Users, Roles & Permissions**  
  - Quản lý user, kích hoạt/vô hiệu hoá.
  - Quản lý team và gán user vào team.
  - Quản lý role, permission, gán role cho user, gán permission cho role.

- **API Tokens & Webhooks**  
  - API Tokens: tạo/revoke token cho user để dùng với API bên ngoài.
  - Webhooks: cấu hình URL + event; hệ thống sẽ tạo Notification kênh `webhook` khi có sự kiện để bạn gửi HTTP callback.

- **Activity Logs**  
  - Ghi lại các hành động quan trọng (endpoint, method, user, payload, IP, user‑agent).
  - Frontend có trang để lọc / xem danh sách activity logs.

## Công nghệ sử dụng

- **Backend**: Node.js, Express, Sequelize, MySQL, JWT, cron jobs
- **Frontend**: React + Vite, React Router, Axios, React Query, Material‑UI (MUI)

## Cách chạy (tóm tắt)

- Backend: cấu hình `.env` (DB, JWT, SMTP, v.v.) và chạy:

  ```bash
  cd "New folder"
  npm install
  npm run dev # hoặc node src/server.js
  ```

- Frontend: cấu hình `Front-end/.env` với `VITE_API_BASE_URL=http://localhost:3000` và chạy:

  ```bash
  cd Front-end
  npm install
  npm run dev
  ```

Bạn có thể tùy biến thêm tuỳ theo nhu cầu (thêm metric khác, tích hợp Slack, thêm dashboard, v.v.).
