const validateUserCreate = (data) => {
    const errors = [];
    if (!data.full_name || data.full_name.trim() === "") errors.push("Họ tên không được để trống");
    if (!data.email || !data.email.includes("@")) errors.push("Email không đúng định dạng");
    if (!data.password || data.password.length < 6) errors.push("Mật khẩu phải có ít nhất 6 ký tự");
    return errors;
};

module.exports = { validateUserCreate };