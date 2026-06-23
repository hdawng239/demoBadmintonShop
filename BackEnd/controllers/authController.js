const asyncHandler = require('../utils/asyncHandler');
const AuthService = require('../services/authService');

// CONTROLLER = chỉ đọc dữ liệu từ request, gọi service, trả response.
// Không chứa business logic, không truy cập DB trực tiếp.
const register = asyncHandler(async (req, res) => {
    const newUser = await AuthService.register(req.body);
    res.status(201).json({ message: 'Đăng ký tài khoản thành công!', data: newUser });
});

const login = asyncHandler(async (req, res) => {
    const result = await AuthService.login(req.body.email, req.body.password);
    res.status(200).json({ message: 'Đăng nhập thành công!', ...result });
});

const getCaptcha = asyncHandler(async (req, res) => {
    const result = AuthService.getCaptcha();
    res.status(200).json(result);
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email, captchaAnswer, captchaToken } = req.body;
    const result = await AuthService.forgotPassword(email, captchaAnswer, captchaToken);
    res.status(200).json(result);
});

const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const result = await AuthService.resetPassword(email, otp, newPassword);
    res.status(200).json(result);
});

module.exports = { register, login, getCaptcha, forgotPassword, resetPassword };
