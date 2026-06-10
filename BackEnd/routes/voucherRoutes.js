const express = require('express');
const router = express.Router();
const {
    applyVoucher,
    getActiveVouchers,
    getAllVouchers,
    getVoucherById,
    createVoucher,
    updateVoucher,
    deleteVoucher
} = require('../controllers/voucherController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

// Public endpoints (Customer)
router.post('/apply', verifyToken, applyVoucher);
router.get('/active', verifyToken, getActiveVouchers);

// Admin endpoints
router.get('/admin', verifyToken, isAdmin, getAllVouchers);
router.get('/admin/:id', verifyToken, isAdmin, getVoucherById);
router.post('/admin', verifyToken, isAdmin, createVoucher);
router.put('/admin/:id', verifyToken, isAdmin, updateVoucher);
router.delete('/admin/:id', verifyToken, isAdmin, deleteVoucher);

module.exports = router;
