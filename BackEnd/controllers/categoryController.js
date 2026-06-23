const asyncHandler = require('../utils/asyncHandler');
const CategoryService = require('../services/categoryService');

// CONTROLLER = chỉ đọc request, gọi service, trả response.
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
    res.status(201).json({ message: 'Tạo danh mục thành công', data: newCategory });
});

const updateCategory = asyncHandler(async (req, res) => {
    const updated = await CategoryService.updateCategory(req.params.id, req.body);
    res.status(200).json({ message: 'Cập nhật danh mục thành công', data: updated });
});

const deleteCategory = asyncHandler(async (req, res) => {
    const deleted = await CategoryService.deleteCategory(req.params.id);
    res.status(200).json({ message: 'Xóa danh mục thành công', data: deleted });
});

module.exports = { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
