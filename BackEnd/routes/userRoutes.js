const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { handleUserValidation } = require('../middlewares/validationMiddleware');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');
const { emailChangeRequestLimiter, emailChangeConfirmLimiter } = require('../middlewares/rateLimiter');
const asyncHandler = require('../utils/asyncHandler');
const EmailChangeService = require('../services/emailChangeService');

router.post('/email-change/request', verifyToken, emailChangeRequestLimiter, asyncHandler(async (req, res) => {
    res.json(await EmailChangeService.request(req.user, req.body.email, req.body.currentPassword));
}));
router.post('/email-change/confirm', verifyToken, emailChangeConfirmLimiter, asyncHandler(async (req, res) => {
    res.json(await EmailChangeService.confirm(req.user, req.body.email, req.body.otp));
}));


router.get('/', verifyToken, isAdmin, getAllUsers);
router.get('/:id', verifyToken, getUserById);
router.post('/', verifyToken, isAdmin, handleUserValidation, createUser);
router.put('/:id', verifyToken, updateUser);
router.delete('/:id', verifyToken, isAdmin, deleteUser);

module.exports = router;
