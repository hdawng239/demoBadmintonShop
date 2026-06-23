# Badminton Shop - Fullstack Application

Tài liệu hướng dẫn cài đặt và chạy dự án Badminton Shop (FrontEnd & BackEnd) trên môi trường local sau khi tải (pull/clone) mã nguồn từ GitHub về.

## Yêu cầu chuẩn bị (Prerequisites)
- Đã cài đặt **[Node.js](https://nodejs.org/)** (Khuyến nghị phiên bản LTS).
- Máy đã có hệ quản trị cơ sở dữ liệu **PostgreSQL** đang chạy.

---

## Hướng dẫn cài đặt chi tiết

Dự án được chia làm 2 phần riêng biệt: **BackEnd** (NodeJS/Express) và **FrontEnd** (React/Vite). Bạn cần thực hiện cấu hình và chạy cả hai phần này.

### 1. Cài đặt & Chạy BackEnd

1. Di chuyển vào thư mục `BackEnd`:
   ```bash
   cd BackEnd
   ```
2. Cài đặt các gói thư viện cần thiết:
   ```bash
   npm install
   ```
3. Cấu hình các biến môi trường:
   * Copy file cấu hình mẫu `.env.example` thành file `.env` thực tế:
     * Trên Windows (Command Prompt): `copy .env.example .env`
     * Trên Windows (PowerShell) / macOS / Linux: `cp .env.example .env`
   * Mở file `.env` vừa tạo và điền thông tin kết nối PostgreSQL cũng như cổng chạy server của bạn:
     ```env
     DB_USER=your_postgres_user       # Tên người dùng database
     DB_HOST=localhost                # Địa chỉ database server
     DB_NAME=your_database_name       # Tên cơ sở dữ liệu đã tạo trên PostgreSQL
     DB_PASSWORD=your_db_password     # Mật khẩu database
     DB_PORT=5432                     # Cổng chạy PostgreSQL (mặc định là 5432)
     PORT=5000                        # Cổng chạy API Backend (ví dụ: 5000)
     ```
4. Khởi chạy Server ở chế độ phát triển (tự động cập nhật code khi thay đổi):
   ```bash
   npm run dev
   ```
   *(Server Backend của bạn sẽ được kích hoạt tại địa chỉ: `http://localhost:5000`)*

---

### 2. Cài đặt & Chạy FrontEnd

1. Di chuyển vào thư mục `FrontEnd`:
   * Từ thư mục gốc dự án:
     ```bash
     cd FrontEnd
     ```
2. Cài đặt các gói thư viện cần thiết:
   ```bash
   npm install
   ```
3. Cấu hình API và thông tin ngân hàng cho FrontEnd:
   * Copy file cấu hình mẫu `.env.example` thành file `.env` thực tế:
     * Trên Windows (Command Prompt): `copy .env.example .env`
     * Trên Windows (PowerShell) / macOS / Linux: `cp .env.example .env`
   * Mở file `.env` vừa tạo và điền các thông tin tương ứng:
     ```env
     VITE_API_URL=http://localhost:5000   # Trỏ link đến API Backend đang chạy
     BANK_STK=123456789                  # Số tài khoản ngân hàng nhận thanh toán
     BANK_NAME=NGUYEN VAN A              # Tên chủ tài khoản
     BANK_ID=vcb                         # Mã định danh ngân hàng (ví dụ: vcb, tcb...)
     ```
4. Khởi chạy FrontEnd:
   ```bash
   npm run dev
   ```
   *(Nhấp vào đường link localhost hiển thị trên Terminal - thường là `http://localhost:5173` - để xem giao diện web)*
