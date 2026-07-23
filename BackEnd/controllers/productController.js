const asyncHandler = require('../utils/asyncHandler');
const ProductService = require('../services/productService');
const { sendSuccess, sendError } = require('../utils/response');

const getAllProducts = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const categoryId = req.query.categoryId || null;
    const brandId = req.query.brandId || null;
    const keyword = req.query.keyword || null;

    const result = await ProductService.getAllProducts(page, limit, categoryId, brandId, keyword);
    // legacy giữ hình dạng cũ (products, totalItems...) cho FE hiện tại
    sendSuccess(res, {
        data: result.products,
        meta: {
            totalItems: result.totalItems,
            totalPages: result.totalPages,
            currentPage: result.currentPage,
            limit: result.limit,
        },
        legacy: result,
    });
});

const getProductById = asyncHandler(async (req, res) => {
    const product = await ProductService.getProductById(req.params.id);
    sendSuccess(res, { data: product, legacy: product });
});

const createProduct = asyncHandler(async (req, res) => {
    const newProduct = await ProductService.createProduct(req.body);
    sendSuccess(res, { statusCode: 201, message: 'Thêm sản phẩm thành công', data: newProduct });
});

const updateProduct = asyncHandler(async (req, res) => {
    const updated = await ProductService.updateProduct(req.params.id, req.body);
    sendSuccess(res, { message: 'Cập nhật sản phẩm thành công', data: updated });
});

const deleteProduct = asyncHandler(async (req, res) => {
    const deleted = await ProductService.deleteProduct(req.params.id);
    sendSuccess(res, { message: 'Đã xóa sản phẩm thành công', data: deleted });
});

const searchByImage = asyncHandler(async (req, res) => {
    const { image } = req.body;
    if (!image) {
        return sendError(res, 400, 'Thiếu dữ liệu hình ảnh (Base64)');
    }
    const result = await ProductService.searchByImage(image);
    sendSuccess(res, { data: result, legacy: result });
});

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, searchByImage };
