const asyncHandler = require('../utils/asyncHandler');
const VoucherService = require('../services/voucherService');
const { sendSuccess } = require('../utils/response');

const applyVoucher = asyncHandler(async (req, res) => {
    const { code, cartTotal } = req.body;
    const result = await VoucherService.applyVoucher(code, cartTotal);
    // FE đọc discountAmount/discountType ở top-level nên giữ qua legacy
    sendSuccess(res, { message: 'Áp dụng mã giảm giá thành công!', data: result, legacy: result });
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
    sendSuccess(res, { statusCode: 201, message: 'Tạo voucher mới thành công!', data: newVoucher });
});

const updateVoucher = asyncHandler(async (req, res) => {
    const updated = await VoucherService.updateVoucher(req.params.id, req.body);
    sendSuccess(res, { message: 'Cập nhật thành công!', data: updated });
});

const deleteVoucher = asyncHandler(async (req, res) => {
    await VoucherService.deleteVoucher(req.params.id);
    sendSuccess(res, { message: 'Đã xóa voucher thành công!' });
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
