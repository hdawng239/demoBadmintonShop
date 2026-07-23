const asyncHandler = require('../utils/asyncHandler');
const AuthService = require('../services/authService');
const { sendSuccess } = require('../utils/response');

// Auth trả nhiều field ở top-level (token, user...) mà FE đang đọc nên giữ qua legacy
const register = asyncHandler(async (req, res) => {
    const newUser = await AuthService.register(req.body);
    sendSuccess(res, { statusCode: 201, message: 'Đăng ký tài khoản thành công!', data: newUser });
});

const login = asyncHandler(async (req, res) => {
    const result = await AuthService.login(req.body.email, req.body.password);
    sendSuccess(res, { message: 'Đăng nhập thành công!', data: result, legacy: result });
});

const getCaptcha = asyncHandler(async (req, res) => {
    const result = AuthService.getCaptcha();
    sendSuccess(res, { data: result, legacy: result });
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email, captchaAnswer, captchaToken } = req.body;
    const result = await AuthService.forgotPassword(email, captchaAnswer, captchaToken);
    sendSuccess(res, { message: result.message, data: result, legacy: result });
});

const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const result = await AuthService.resetPassword(email, otp, newPassword);
    sendSuccess(res, { message: result.message, data: result, legacy: result });
});

const refreshToken = asyncHandler(async (req, res) => {
    const result = await AuthService.refreshAccessToken(req.body.refreshToken);
    sendSuccess(res, { message: 'Làm mới token thành công!', data: result, legacy: result });
});

const logout = asyncHandler(async (req, res) => {
    const result = await AuthService.logout(req.body.refreshToken);
    sendSuccess(res, { message: result.message, data: result, legacy: result });
});

module.exports = { register, login, getCaptcha, forgotPassword, resetPassword, refreshToken, logout };
