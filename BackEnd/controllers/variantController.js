const asyncHandler = require('../utils/asyncHandler');
const VariantService = require('../services/variantService');

// CONTROLLER = chỉ đọc dữ liệu từ request, gọi service, trả response.
const getVariantsByProduct = asyncHandler(async (req, res) => {
    const variants = await VariantService.getVariantsByProduct(req.params.productId);
    res.status(200).json({ data: variants });
});

const createVariant = asyncHandler(async (req, res) => {
    const newVariant = await VariantService.createVariant(req.body);
    res.status(201).json({ message: 'Đã thêm phân loại', data: newVariant });
});

const updateVariant = asyncHandler(async (req, res) => {
    const updated = await VariantService.updateVariant(req.params.id, req.body);
    res.status(200).json({ message: 'Đã cập nhật phân loại', data: updated });
});

const deleteVariant = asyncHandler(async (req, res) => {
    const deleted = await VariantService.deleteVariant(req.params.id);
    res.status(200).json({ message: 'Đã xóa phân loại', data: deleted });
});

module.exports = { getVariantsByProduct, createVariant, updateVariant, deleteVariant };
