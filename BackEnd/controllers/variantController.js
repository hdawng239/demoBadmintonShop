const asyncHandler = require('../utils/asyncHandler');
const VariantService = require('../services/variantService');
const { sendSuccess } = require('../utils/response');

const getVariantsByProduct = asyncHandler(async (req, res) => {
    const variants = await VariantService.getVariantsByProduct(req.params.productId);
    sendSuccess(res, { data: variants });
});

const createVariant = asyncHandler(async (req, res) => {
    const newVariant = await VariantService.createVariant(req.body);
    sendSuccess(res, { statusCode: 201, message: 'Đã thêm phân loại', data: newVariant });
});

const updateVariant = asyncHandler(async (req, res) => {
    const updated = await VariantService.updateVariant(req.params.id, req.body);
    sendSuccess(res, { message: 'Đã cập nhật phân loại', data: updated });
});

const deleteVariant = asyncHandler(async (req, res) => {
    const deleted = await VariantService.deleteVariant(req.params.id);
    sendSuccess(res, { message: 'Đã xóa phân loại', data: deleted });
});

module.exports = { getVariantsByProduct, createVariant, updateVariant, deleteVariant };
