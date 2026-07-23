const asyncHandler = require('../utils/asyncHandler');
const CategoryService = require('../services/categoryService');
const { sendSuccess } = require('../utils/response');

// getAll/getById giữ nguyên hình dạng cũ vì FE đọc trực tiếp
const getAllCategories = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const categories = await CategoryService.getAllCategories(page, limit, search);
    res.status(200).json(categories);
});

const getCategoryById = asyncHandler(async (req, res) => {
    const category = await CategoryService.getCategoryById(req.params.id);
    res.status(200).json(category);
});

const createCategory = asyncHandler(async (req, res) => {
    const newCategory = await CategoryService.createCategory(req.body);
    sendSuccess(res, { statusCode: 201, message: 'Tạo danh mục thành công', data: newCategory });
});

const updateCategory = asyncHandler(async (req, res) => {
    const updated = await CategoryService.updateCategory(req.params.id, req.body);
    sendSuccess(res, { message: 'Cập nhật danh mục thành công', data: updated });
});

const deleteCategory = asyncHandler(async (req, res) => {
    const deleted = await CategoryService.deleteCategory(req.params.id);
    sendSuccess(res, { message: 'Xóa danh mục thành công', data: deleted });
});

module.exports = { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
