const Variant = require('../models/variantModel');

const getVariantsByProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const variants = await Variant.getByProductId(productId);
        res.status(200).json({ data: variants });
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách phân loại", error: error.message });
    }
};

const createVariant = async (req, res) => {
    try {
        const newVariant = await Variant.create(req.body);
        res.status(201).json({ message: "Đã thêm phân loại", data: newVariant });
    } catch (error) {
        res.status(500).json({ message: "Lỗi thêm phân loại", error: error.message });
    }
};

const updateVariant = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Variant.update(id, req.body);
        if (!updated) return res.status(404).json({ message: "Không tìm thấy phân loại" });
        res.status(200).json({ message: "Đã cập nhật phân loại", data: updated });
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật", error: error.message });
    }
};

const deleteVariant = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Variant.delete(id);
        if (!deleted) return res.status(404).json({ message: "Không tìm thấy phân loại" });
        res.status(200).json({ message: "Đã xóa phân loại", data: deleted });
    } catch (error) {
        if (error.message.includes('đã có người đặt mua')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Lỗi xóa phân loại", error: error.message });
    }
};

module.exports = {
    getVariantsByProduct,
    createVariant,
    updateVariant,
    deleteVariant
};
