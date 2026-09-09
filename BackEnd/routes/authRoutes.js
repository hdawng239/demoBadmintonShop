const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword, refreshToken, logout } = require('../controllers/authController');
const { authLimiter, registerLimiter, passwordResetLimiter } = require('../middlewares/rateLimiter');

router.post('/register', registerLimiter, register);
router.post('/login', authLimiter, login);
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/reset-password', passwordResetLimiter, resetPassword);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

module.exports = router;
