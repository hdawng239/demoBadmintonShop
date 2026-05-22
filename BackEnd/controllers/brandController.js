const Brand = require('../models/brandModel');

const getAllBrands = async (req, res) => {
    try {
        const brands = await Brand.getAll();
        res.status(200).json(brands);
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};

const getBrandById = async (req, res) => {
    try {
        const brand = await Brand.getById(req.params.id);
        if (!brand) return res.status(404).json({ message: "Không tìm thấy thương hiệu" });
        res.status(200).json(brand);
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};

const createBrand = async (req, res) => {
    try {
        const newBrand = await Brand.create(req.body);
        res.status(201).json({ message: "Tạo thương hiệu thành công", data: newBrand });
    } catch (error) {
        if (error.code === '23505') return res.status(400).json({ message: "Tên thương hiệu đã tồn tại!" });
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};

const updateBrand = async (req, res) => {
    try {
        const updated = await Brand.update(req.params.id, req.body);
        if (!updated) return res.status(404).json({ message: "Không tìm thấy thương hiệu" });
        res.status(200).json({ message: "Cập nhật thương hiệu thành công", data: updated });
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};

const deleteBrand = async (req, res) => {
    try {
        const deleted = await Brand.delete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Không tìm thấy thương hiệu" });
        res.status(200).json({ message: "Xóa thương hiệu thành công", data: deleted });
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};

module.exports = { getAllBrands, getBrandById, createBrand, updateBrand, deleteBrand };