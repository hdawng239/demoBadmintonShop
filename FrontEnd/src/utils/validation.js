/**
 * Tiện ích kiểm tra tính hợp lệ dữ liệu nhập (Form Validation)
 */

export const validateEmail = (email, { requireGmail = false } = {}) => {
  if (!email || !email.trim()) {
    return 'Vui lòng nhập địa chỉ email!';
  }
  const trimmed = email.trim().toLowerCase();

  // Định dạng regex email chuẩn RFC
  const emailRegex = /^[a-z0-9]([a-z0-9._%+-]*[a-z0-9])?@([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;
  if (!emailRegex.test(trimmed)) {
    return 'Địa chỉ email không đúng định dạng (Ví dụ: yourname@gmail.com)!';
  }

  // Chặn các đuôi gõ sai phổ biến (.coz, .con, .comm...)
  const invalidTlds = ['.coz', '.con', '.comm', '.cpm', '.cmo', '.gmai', '.gmaill'];
  if (invalidTlds.some(tld => trimmed.endsWith(tld))) {
    return 'Đuôi tên miền email không hợp lệ (Ví dụ: phải là .com, .vn, .net)!';
  }

  // Nếu là Gmail hoặc form yêu cầu Gmail
  if (requireGmail || trimmed.includes('gmail.')) {
    if (!trimmed.endsWith('@gmail.com')) {
      return 'Email Gmail bắt buộc phải có đuôi chính xác là @gmail.com!';
    }
  }

  return '';
};

export const validatePhone = (phone, { required = true } = {}) => {
  if (!phone || !phone.trim()) {
    return required ? 'Vui lòng nhập số điện thoại!' : '';
  }
  const trimmed = phone.trim();
  const phoneRegex = /^0(3|5|7|8|9)\d{8}$/;
  if (!phoneRegex.test(trimmed)) {
    return 'Số điện thoại phải có đúng 10 số và bắt đầu bằng số 0 (Ví dụ: 0912345678)!';
  }
  return '';
};

export const validateFullName = (name) => {
  if (!name || !name.trim()) {
    return 'Vui lòng nhập họ và tên của bạn!';
  }
  if (name.trim().length < 2) {
    return 'Họ và tên phải có tối thiểu 2 ký tự!';
  }
  if (name.trim().length > 50) {
    return 'Họ và tên không được vượt quá 50 ký tự!';
  }
  return '';
};

export const validatePassword = (password) => {
  if (!password) {
    return 'Vui lòng nhập mật khẩu!';
  }
  if (password.length < 6) {
    return 'Mật khẩu phải có tối thiểu 6 ký tự!';
  }
  if (password.length > 50) {
    return 'Mật khẩu không được vượt quá 50 ký tự!';
  }
  return '';
};

export const validateAddress = (address) => {
  if (!address || !address.trim()) {
    return 'Vui lòng nhập địa chỉ nhận hàng!';
  }
  if (address.trim().length < 3) {
    return 'Địa chỉ quá ngắn, vui lòng nhập rõ ràng!';
  }
  if (address.trim().length > 255) {
    return 'Địa chỉ không được vượt quá 255 ký tự!';
  }
  return '';
};