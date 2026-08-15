# Naro Badminton Shop

Website thương mại điện tử chuyên kinh doanh vợt, giày và phụ kiện cầu lông chính hãng. Dự án hỗ trợ tính phí vận chuyển tự động qua Giao Hàng Nhanh (GHN), thanh toán quét mã VietQR và trang quản trị Admin.

---

## 💻 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, Axios, React Router 7
- **Backend**: Node.js, Express.js, PostgreSQL (`pg`)
- **Tích hợp**: GHN API (Vận chuyển), VietQR / SePay (Thanh toán), Gemini API (Tìm kiếm hình ảnh)

---

## ✨ Tính năng chính

### Khách hàng
- Xem danh mục sản phẩm phân cấp, lọc theo hãng (Yonex, Lining, Victor, Kumpoo...), tầm giá, trọng lượng (3U/4U/5U).
- Tìm kiếm từ khóa chính xác và tìm kiếm bằng hình ảnh (AI Visual Search).
- Quản lý giỏ hàng, chọn phân loại hàng, kiểm tra tồn kho theo thời gian thực.
- Đặt hàng & thanh toán: Tính cước GHN tự động theo địa chỉ, áp dụng mã voucher/freeship, thanh toán QR hoặc COD.
- Đánh giá sản phẩm (1-5★), danh sách yêu thích, theo dõi trạng thái đơn hàng.

### Quản trị (Admin)
- Dashboard thống kê doanh thu và đơn hàng theo 7 ngày, 30 ngày, năm.
- Quản lý sản phẩm (biến thể, tồn kho, ẩn/hiện sản phẩm).
- Xử lý đơn hàng, đổi trạng thái giao hàng, in hóa đơn.
- Quản lý mã giảm giá, bài viết tin tức, danh mục và phân quyền tài khoản.

---

## 🚀 Cài đặt & Khởi chạy

### 1. Cấu hình Backend
```bash
cd BackEnd
npm install
```
Tạo file `.env` trong thư mục `BackEnd`:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=navishop
DB_USER=postgres
DB_PASSWORD=your_db_password

JWT_SECRET=your_jwt_secret

# Giao Hàng Nhanh API
SHOP_DISTRICT_ID=your_district_id
SHOP_WARD_CODE=your_ward_code
KEY_IDSHOP=your_ghn_shop_id
KEY_TOKEN_SHOP=your_ghn_token

# Google Gemini API
KEY_GEMINI=your_gemini_api_key
```
Chạy server:
```bash
npm run dev
```

### 2. Cấu hình Frontend
```bash
cd FrontEnd
npm install
```
Tạo file `.env` trong thư mục `FrontEnd`:
```env
VITE_API_URL=http://localhost:5000/api
```
Chạy ứng dụng:
```bash
npm run dev
```

---

## 📁 Cấu trúc thư mục

```text
├── BackEnd/
│   ├── config/          # Kết nối cơ sở dữ liệu
│   ├── controllers/     # Điều hướng Request / Response
│   ├── models/          # Schema dữ liệu
│   ├── repositories/    # Truy vấn PostgreSQL
│   ├── routes/          # API Endpoints
│   ├── services/        # Logic nghiệp vụ
│   └── app.js           # Server entry point
│
└── FrontEnd/
    ├── public/          # Static assets
    └── src/
        ├── components/  # Reusable UI components
        ├── pages/       # Storefront & Admin pages
        ├── services/    # API clients (Axios)
        └── App.jsx      # Routing
```
