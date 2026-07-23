const express = require('express');
const router = express.Router();
const { register, login, getCaptcha, forgotPassword, resetPassword, refreshToken, logout } = require('../controllers/authController');
const { authLimiter } = require('../middlewares/rateLimiter');

// authLimiter: siết chặt các route dễ bị brute-force (dò mật khẩu / spam OTP).
router.post('/register', register);
router.post('/login', authLimiter, login);
router.get('/captcha', getCaptcha);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

module.exports = router;