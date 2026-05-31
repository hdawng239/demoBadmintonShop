const validateUserCreate = (data) => {
    const errors = [];
    if (!data.full_name || data.full_name.trim() === "") errors.push("Họ tên không được để trống");
    if (!data.email || !/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(data.email)) errors.push("Email phải có đuôi @gmail.com");
    if (data.phone && !/^0(3|5|7|8|9)\d{8}$/.test(data.phone)) errors.push("Số điện thoại phải có 10 chữ số và bắt đầu bằng 03, 05, 07, 08, 09");
    if (!data.password || data.password.length < 6) errors.push("Mật khẩu phải có ít nhất 6 ký tự");
    return errors;
};

module.exports = { validateUserCreate };