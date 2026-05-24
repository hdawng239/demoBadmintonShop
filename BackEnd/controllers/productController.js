const Product = require('../models/productModel');

const getAllProducts = async (req, res) => {
    try {
        // Lấy page và limit từ query string trên URL. 
        // Nếu khách không truyền (?page=1&limit=10) thì tự động mặc định là trang 1, mỗi trang lấy 10 món.
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        // Nhận thêm tham số lọc
        const categoryId = req.query.categoryId || null;
        const brandId = req.query.brandId || null;
        const keyword = req.query.keyword || null;

        const paginationResult = await Product.getAll(page, limit, categoryId, brandId, keyword);
        res.status(200).json(paginationResult);
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.getById(req.params.id);
        if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};

const createProduct = async (req, res) => {
    try {
        const newProduct = await Product.create(req.body);
        res.status(201).json({ message: "Thêm sản phẩm thành công", data: newProduct });
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};
const updateProduct = async (req, res) => {
    try {
        const updated = await Product.update(req.params.id, req.body);
        if (!updated) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        res.status(200).json({ message: "Cập nhật sản phẩm thành công", data: updated });
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const deleted = await Product.delete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        res.status(200).json({ message: "Đã xóa sản phẩm thành công", data: deleted });
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };