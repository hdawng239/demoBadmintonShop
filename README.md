# Naro Badminton Shop

Đồ án website bán dụng cụ cầu lông, gồm giao diện khách hàng, trang quản trị và backend API.

## Chức năng

- Xem, tìm kiếm, lọc sản phẩm và lựa chọn biến thể.
- Giỏ hàng, yêu thích, voucher, đặt hàng; thanh toán COD, QR qua SePay hoặc nhận tại cửa hàng.
- Tính phí, tạo vận đơn và đối soát GHN; theo dõi trạng thái đơn hàng.
- Đăng ký, đăng nhập, quản lý hồ sơ; khôi phục mật khẩu và xác nhận đổi email bằng OTP.
- Đánh giá, tin tức, liên hệ; chatbot tư vấn và tìm sản phẩm bằng hình ảnh.
- Quản trị sản phẩm, tồn kho, danh mục, người dùng, đơn hàng, voucher, bài viết và thống kê.

## Công nghệ

- **Frontend:** React, Vite, React Router, Tailwind CSS.
- **Backend:** Node.js, Express; PostgreSQL trên Supabase.
- **Xác thực và bảo mật:** JWT, bcrypt, HttpOnly cookie, Helmet, CORS, express-rate-limit, Turnstile.
- **Dịch vụ:** GHN, SePay/VietQR, Gemini, Resend.
- **Thư viện giao diện:** Axios, Recharts, Swiper, Lucide React.

## Cài đặt và chạy

Yêu cầu Node.js 22.13+ hoặc 24+, npm và PostgreSQL có schema của project. Backend không tự tạo schema khi khởi động.

Trong cả `BackEnd` và `FrontEnd`, sao chép `.env.example` thành `.env` nếu chưa có, rồi điền cấu hình. `.env.example` là mẫu công khai; `.env` chứa giá trị thật và không được commit.

Để chạy localhost, cấu hình:

| File | Biến | Giá trị |
| --- | --- | --- |
| BackEnd/.env | NODE_ENV | development |
| BackEnd/.env | COOKIE_SAME_SITE | lax |
| BackEnd/.env | FRONTEND_URL | http://localhost:5173 |
| FrontEnd/.env | VITE_API_URL | http://localhost:5000/api |

Backend cần các biến `DB_*` phù hợp với database và hai khóa `JWT_SECRET`, `JWT_REFRESH_SECRET` khác nhau, mỗi khóa dài ít nhất 32 ký tự. Giữ cấu hình SSL khi kết nối Supabase.

Mở hai terminal từ thư mục project:

**Backend:**

```powershell
cd BackEnd
npm ci
npm run dev
```

**Frontend:**

```powershell
cd FrontEnd
npm ci
npm run dev
```

Mở [website](http://localhost:5173) hoặc [trang quản trị](http://localhost:5173/admin/login). `npm ci` cài toàn bộ thư viện; những lần chạy sau chỉ cần `npm run dev` trong mỗi thư mục.

## Cấu hình dịch vụ

| Dịch vụ | Backend | Frontend |
| --- | --- | --- |
| GHN | KEY_TOKEN_SHOP, KEY_IDSHOP, SHOP_DISTRICT_ID, SHOP_WARD_CODE | — |
| SePay/VietQR | KEY_SEPAY | BANK_STK, BANK_NAME, BANK_ID |
| Gemini | KEY_GEMINI | — |
| Resend | RESEND_API_KEY, EMAIL_FROM, EMAIL_ADMIN | — |
| Turnstile | TURNSTILE_SECRET_KEY | VITE_TURNSTILE_SITE_KEY |

Đồ án dùng GHN sandbox: đặt `GHN_API_URL=https://dev-online-gateway.ghn.vn/shiip/public-api` cả trên Render; giữ `NODE_ENV=production` khi deploy. Vận đơn sandbox không giao hàng thật. Cấu hình này không đổi SePay sang sandbox: quét QR và xác nhận chuyển khoản vẫn có thể chuyển tiền thật.

SePay cần liên kết đúng tài khoản ngân hàng dùng tạo QR và gửi webhook về `<URL backend>/api/sepay/webhook`, xác thực API Key trùng `KEY_SEPAY`. Nội dung chuyển khoản của website là `NARO<mã đơn>`; chỉ tạo được QR chưa có nghĩa là đã nhận được thanh toán.

Turnstile chống bot ở chức năng quên mật khẩu. Lấy cặp khóa trong Cloudflare → Turnstile, thêm hostname website; thêm `localhost` nếu dùng khi phát triển. Secret key chỉ đặt ở backend.

Resend dùng địa chỉ gửi thử `onboarding@resend.dev` chỉ gửi tới email chủ tài khoản. Để gửi OTP cho khách khác, cần tên miền đã xác minh và `EMAIL_FROM` thuộc tên miền đó.

## Deploy

- **Render:** thư mục `BackEnd`, cài bằng `npm ci --omit=dev`, chạy `npm start`; import `BackEnd/.env`.
- **Vercel:** thư mục `FrontEnd`, build bằng `npm run build`, đầu ra `dist`; import `FrontEnd/.env`.

Trước khi import, đặt backend `NODE_ENV=production`, `FRONTEND_URL` bằng HTTPS origin của frontend. Với frontend Vercel và backend Render khác site, dùng `COOKIE_SAME_SITE=none`. Đặt frontend `VITE_API_URL` bằng URL backend kèm `/api`.

Production cần đủ các khóa dịch vụ backend trong `.env.example`, bao gồm Turnstile. Hai khóa Turnstile phải thuộc cùng widget; không dùng khóa thử nghiệm. Không tắt xác minh SSL database.

Cập nhật đè các giá trị cũ trên hosting và redeploy cả hai bên. Không đưa env backend vào frontend hoặc đẩy `.env` lên GitHub. Kiểm tra đăng nhập, OTP, đặt hàng, thanh toán và GHN sau deploy trước khi nhận đơn thật.
