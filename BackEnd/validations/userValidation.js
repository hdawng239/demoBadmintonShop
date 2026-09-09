const validateUserCreate = (data) => {
    const errors = [];
    if (typeof data.full_name !== 'string' || !data.full_name.trim() || data.full_name.trim().length > 150) errors.push("Họ tên không hợp lệ");
    if (typeof data.email !== 'string' || data.email.length > 254 || !/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(data.email.trim())) errors.push("Email phải có đuôi @gmail.com");
    if (data.phone && (typeof data.phone !== 'string' || !/^0(3|5|7|8|9)\d{8}$/.test(data.phone.trim()))) errors.push("Số điện thoại phải có 10 chữ số và bắt đầu bằng 03, 05, 07, 08, 09");
    if (typeof data.password !== 'string' || data.password.length < 10) errors.push("Mật khẩu phải có ít nhất 10 ký tự");
    if (typeof data.password === 'string' && Buffer.byteLength(data.password, 'utf8') > 72) errors.push('Mật khẩu không được vượt quá 72 byte');
    return errors;
};

module.exports = { validateUserCreate };
