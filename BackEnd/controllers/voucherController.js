const asyncHandler = require('../utils/asyncHandler');
const VoucherService = require('../services/voucherService');

// CONTROLLER = chỉ đọc request, gọi service, trả response. Không chứa business logic.
const applyVoucher = asyncHandler(async (req, res) => {
    const { code, cartTotal } = req.body;
    const result = await VoucherService.applyVoucher(code, cartTotal);
    res.status(200).json({ message: 'Áp dụng mã giảm giá thành công!', ...result });
});

const getActiveVouchers = asyncHandler(async (req, res) => {
    res.status(200).json(await VoucherService.getActiveVouchers());
});

const getAllVouchers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    res.status(200).json(await VoucherService.getAllVouchers(page, limit));
});

const getVoucherById = asyncHandler(async (req, res) => {
    res.status(200).json(await VoucherService.getVoucherById(req.params.id));
});

const createVoucher = asyncHandler(async (req, res) => {
    const newVoucher = await VoucherService.createVoucher(req.body);
    res.status(201).json({ message: 'Tạo voucher mới thành công!', data: newVoucher });
});

const updateVoucher = asyncHandler(async (req, res) => {
    const updated = await VoucherService.updateVoucher(req.params.id, req.body);
    res.status(200).json({ message: 'Cập nhật thành công!', data: updated });
});

const deleteVoucher = asyncHandler(async (req, res) => {
    await VoucherService.deleteVoucher(req.params.id);
    res.status(200).json({ message: 'Đã xóa voucher thành công!' });
});

module.exports = {
    applyVoucher,
    getActiveVouchers,
    getAllVouchers,
    getVoucherById,
    createVoucher,
    updateVoucher,
    deleteVoucher,
};
