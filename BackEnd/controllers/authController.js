const asyncHandler = require('../utils/asyncHandler');
const AuthService = require('../services/authService');
const { sendSuccess } = require('../utils/response');

const refreshCookieOptions = (expires) => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.COOKIE_SAME_SITE?.toLowerCase() || (process.env.NODE_ENV === 'production' ? 'none' : 'lax'),
    path: '/api/auth',
    expires,
});

const setRefreshCookie = (res, result) => {
    res.cookie('refreshToken', result.refreshToken, refreshCookieOptions(result.refreshExpiresAt));
    delete result.refreshToken;
    delete result.refreshExpiresAt;
};

const register = asyncHandler(async (req, res) => {
    const newUser = await AuthService.register(req.body);
    sendSuccess(res, { statusCode: 201, message: 'Đăng ký tài khoản thành công!', data: newUser });
});

const login = asyncHandler(async (req, res) => {
    const result = await AuthService.login(req.body.email, req.body.password);
    setRefreshCookie(res, result);
    sendSuccess(res, { message: 'Đăng nhập thành công!', data: result, legacy: result });
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email, turnstileToken } = req.body;
    const result = await AuthService.forgotPassword(email, turnstileToken, req.ip);
    sendSuccess(res, { message: result.message, data: result, legacy: result });
});

const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const result = await AuthService.resetPassword(email, otp, newPassword);
    sendSuccess(res, { message: result.message, data: result, legacy: result });
});

const refreshToken = asyncHandler(async (req, res) => {
    const legacyToken = process.env.ALLOW_LEGACY_REFRESH_TOKEN_BODY === 'true' ? req.body.refreshToken : null;
    const result = await AuthService.refreshAccessToken(
        req.cookies.refreshToken || legacyToken,
        req.header('x-csrf-token')
    );
    setRefreshCookie(res, result);
    sendSuccess(res, { message: 'Làm mới token thành công!', data: result, legacy: result });
});

const logout = asyncHandler(async (req, res) => {
    const legacyToken = process.env.ALLOW_LEGACY_REFRESH_TOKEN_BODY === 'true' ? req.body.refreshToken : null;
    const result = await AuthService.logout(
        req.cookies.refreshToken || legacyToken,
        req.header('x-csrf-token')
    );
    res.clearCookie('refreshToken', refreshCookieOptions());
    sendSuccess(res, { message: result.message, data: result, legacy: result });
});

module.exports = { register, login, forgotPassword, resetPassword, refreshToken, logout };
