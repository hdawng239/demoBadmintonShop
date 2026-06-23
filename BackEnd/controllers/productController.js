const asyncHandler = require('../utils/asyncHandler');
const ProductService = require('../services/productService');

// CONTROLLER = chỉ đọc dữ liệu từ request, gọi service, trả response.
// Không chứa business logic, không truy cập DB trực tiếp.
const getAllProducts = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const categoryId = req.query.categoryId || null;
    const brandId = req.query.brandId || null;
    const keyword = req.query.keyword || null;

    const result = await ProductService.getAllProducts(page, limit, categoryId, brandId, keyword);
    res.status(200).json(result);
});

const getProductById = asyncHandler(async (req, res) => {
    const product = await ProductService.getProductById(req.params.id);
    res.status(200).json(product);
});

const createProduct = asyncHandler(async (req, res) => {
    const newProduct = await ProductService.createProduct(req.body);
    res.status(201).json({ message: 'Thêm sản phẩm thành công', data: newProduct });
});

const updateProduct = asyncHandler(async (req, res) => {
    const updated = await ProductService.updateProduct(req.params.id, req.body);
    res.status(200).json({ message: 'Cập nhật sản phẩm thành công', data: updated });
});

const deleteProduct = asyncHandler(async (req, res) => {
    const deleted = await ProductService.deleteProduct(req.params.id);
    res.status(200).json({ message: 'Đã xóa sản phẩm thành công', data: deleted });
});

const searchByImage = asyncHandler(async (req, res) => {
    const { image } = req.body;
    if (!image) {
        return res.status(400).json({ message: 'Thiếu dữ liệu hình ảnh (Base64)' });
    }
    const result = await ProductService.searchByImage(image);
    res.status(200).json(result);
});

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, searchByImage };
