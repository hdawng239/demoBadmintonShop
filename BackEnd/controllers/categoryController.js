const Category = require('../models/categoryModel');

const getAllCategories = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const categories = await Category.getAll(page, limit, search);
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};

const getCategoryById = async (req, res) => {
    try {
        const category = await Category.getById(req.params.id);
        if (!category) return res.status(404).json({ message: "Không tìm thấy danh mục" });
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};

const createCategory = async (req, res) => {
    try {
        const newCategory = await Category.create(req.body);
        res.status(201).json({ message: "Tạo danh mục thành công", data: newCategory });
    } catch (error) {
        if (error.code === '23505') return res.status(400).json({ message: "Slug hoặc danh mục đã tồn tại!" });
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};

const updateCategory = async (req, res) => {
    try {
        const updated = await Category.update(req.params.id, req.body);
        if (!updated) return res.status(404).json({ message: "Không tìm thấy danh mục" });
        res.status(200).json({ message: "Cập nhật danh mục thành công", data: updated });
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const deleted = await Category.delete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Không tìm thấy danh mục" });
        res.status(200).json({ message: "Xóa danh mục thành công", data: deleted });
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};

module.exports = { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory };