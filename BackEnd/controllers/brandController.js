const asyncHandler = require('../utils/asyncHandler');
const BrandService = require('../services/brandService');
const { sendSuccess } = require('../utils/response');

// getAll/getById giữ nguyên hình dạng cũ vì FE đọc trực tiếp
const getAllBrands = asyncHandler(async (req, res) => {
    const brands = await BrandService.getAllBrands();
    res.status(200).json(brands);
});

const getBrandById = asyncHandler(async (req, res) => {
    const brand = await BrandService.getBrandById(req.params.id);
    res.status(200).json(brand);
});

const createBrand = asyncHandler(async (req, res) => {
    const newBrand = await BrandService.createBrand(req.body);
    sendSuccess(res, { statusCode: 201, message: 'Tạo thương hiệu thành công', data: newBrand });
});

const updateBrand = asyncHandler(async (req, res) => {
    const updated = await BrandService.updateBrand(req.params.id, req.body);
    sendSuccess(res, { message: 'Cập nhật thương hiệu thành công', data: updated });
});

const deleteBrand = asyncHandler(async (req, res) => {
    const deleted = await BrandService.deleteBrand(req.params.id);
    sendSuccess(res, { message: 'Xóa thương hiệu thành công', data: deleted });
});

module.exports = { getAllBrands, getBrandById, createBrand, updateBrand, deleteBrand };
