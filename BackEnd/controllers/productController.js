const Product = require('../models/productModel');
const pool = require('../config/db');
const { analyzeProductImage } = require('../services/aiService');

const getAllProducts = async (req, res) => {
    try {
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

const searchByImage = async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) {
            return res.status(400).json({ message: "Thiếu dữ liệu hình ảnh (Base64)" });
        }

        // 1. Lấy danh sách sản phẩm để gửi cho AI làm ngữ cảnh đối chiếu
        const catalogQuery = `
            SELECT p.id, p.name, p.description, c.name AS category_name, b.name AS brand_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN brands b ON p.brand_id = b.id
            WHERE p.is_active = true
        `;
        const catalogRes = await pool.query(catalogQuery);
        const productList = catalogRes.rows;

        if (productList.length === 0) {
            return res.status(200).json([]);
        }

        // 2. Gọi AI phân tích ảnh và trả về danh sách ID phù hợp
        const matchedIds = await analyzeProductImage(image, productList);

        if (!matchedIds || matchedIds.length === 0) {
            return res.status(200).json([]);
        }

        // 3. Lấy thông tin chi tiết của các sản phẩm khớp
        const detailsQuery = `
            SELECT p.*, b.name AS brand_name, c.name AS category_name 
            FROM products p
            LEFT JOIN brands b ON p.brand_id = b.id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ANY($1) AND p.is_active = true
        `;
        const detailsRes = await pool.query(detailsQuery, [matchedIds]);
        const detailsRows = detailsRes.rows;

        // Sắp xếp lại chi tiết theo thứ tự ID do AI trả về
        const sortedProducts = matchedIds
            .map(id => detailsRows.find(p => p.id === id))
            .filter(Boolean);

        res.status(200).json(sortedProducts);
    } catch (error) {
        console.error("❌ Lỗi trong controller searchByImage:", error);
        res.status(500).json({ message: "Lỗi phân tích hình ảnh của sản phẩm", error: error.message });
    }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, searchByImage };