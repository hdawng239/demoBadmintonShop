const asyncHandler = require('../utils/asyncHandler');
const BrandService = require('../services/brandService');

// CONTROLLER = chỉ đọc dữ liệu từ request, gọi service, trả response.
// Không chứa business logic, không truy cập DB trực tiếp, không try/catch (đã có asyncHandler + error middleware).
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
    res.status(201).json({ message: 'Tạo thương hiệu thành công', data: newBrand });
});

const updateBrand = asyncHandler(async (req, res) => {
    const updated = await BrandService.updateBrand(req.params.id, req.body);
    res.status(200).json({ message: 'Cập nhật thương hiệu thành công', data: updated });
});

const deleteBrand = asyncHandler(async (req, res) => {
    const deleted = await BrandService.deleteBrand(req.params.id);
    res.status(200).json({ message: 'Xóa thương hiệu thành công', data: deleted });
});

module.exports = { getAllBrands, getBrandById, createBrand, updateBrand, deleteBrand };
