const Voucher = require('../models/voucherModel');

const applyVoucher = async (req, res) => {
    try {
        const { code, cartTotal } = req.body;
        if (!code) {
            return res.status(400).json({ message: "Vui lòng nhập mã giảm giá." });
        }

        const voucher = await Voucher.getByCode(code);
        if (!voucher) {
            return res.status(404).json({ message: "Mã giảm giá không tồn tại." });
        }

        // 1. Kiểm tra trạng thái hoạt động
        if (!voucher.is_active) {
            return res.status(400).json({ message: "Mã giảm giá hiện tại đang bị khóa." });
        }

        // 2. Kiểm tra thời hạn áp dụng
        const now = new Date();
        const start = new Date(voucher.start_date);
        const end = new Date(voucher.end_date);
        if (now < start) {
            return res.status(400).json({ message: "Mã giảm giá chưa đến thời gian áp dụng." });
        }
        if (now > end) {
            return res.status(400).json({ message: "Mã giảm giá đã hết hạn sử dụng." });
        }

        // 3. Kiểm tra số lượng lượt dùng
        if (parseInt(voucher.used_count) >= parseInt(voucher.usage_limit)) {
            return res.status(400).json({ message: "Mã giảm giá đã hết lượt sử dụng trên hệ thống." });
        }

        // 4. Kiểm tra tổng đơn hàng tối thiểu
        const total = parseFloat(cartTotal || 0);
        const minVal = parseFloat(voucher.min_order_value || 0);
        if (total < minVal) {
            return res.status(400).json({ 
                message: `Đơn hàng tối thiểu phải đạt ${minVal.toLocaleString()} ₫ để áp dụng mã này.` 
            });
        }

        // 5. Tính toán số tiền được giảm
        let discountAmount = 0;
        const discountVal = parseFloat(voucher.discount_value);

        if (voucher.discount_type === 'fixed') {
            discountAmount = discountVal;
        } else if (voucher.discount_type === 'percentage') {
            discountAmount = total * (discountVal / 100);
            if (voucher.max_discount) {
                const maxD = parseFloat(voucher.max_discount);
                if (discountAmount > maxD) {
                    discountAmount = maxD;
                }
            }
        } else if (voucher.discount_type === 'shipping') {
            // Giảm tiền ship, frontend tự xử lý giảm trừ vào phí vận chuyển.
            // Trả về discountAmount tối đa là discountVal.
            discountAmount = discountVal;
        }

        // Cap discount amount at order total (except for shipping discount which is capped by frontend shipping fee)
        if (voucher.discount_type !== 'shipping' && discountAmount > total) {
            discountAmount = total;
        }

        return res.status(200).json({
            message: "Áp dụng mã giảm giá thành công!",
            code: voucher.code,
            discountType: voucher.discount_type,
            discountValue: discountVal,
            discountAmount: discountAmount,
            minOrderValue: minVal
        });

    } catch (error) {
        console.error("Lỗi áp dụng voucher:", error);
        return res.status(500).json({ message: "Lỗi hệ thống khi áp dụng voucher", error: error.message });
    }
};

const getActiveVouchers = async (req, res) => {
    try {
        const vouchers = await Voucher.getActiveVouchers();
        return res.status(200).json(vouchers);
    } catch (error) {
        console.error("Lỗi lấy danh sách voucher hoạt động:", error);
        return res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};

// Admin CRUD
const getAllVouchers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await Voucher.getAll(page, limit);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ message: "Lỗi lấy danh sách voucher", error: error.message });
    }
};

const getVoucherById = async (req, res) => {
    try {
        const voucher = await Voucher.getById(req.params.id);
        if (!voucher) return res.status(404).json({ message: "Không tìm thấy voucher" });
        return res.status(200).json(voucher);
    } catch (error) {
        return res.status(500).json({ message: "Lỗi lấy chi tiết voucher", error: error.message });
    }
};

const createVoucher = async (req, res) => {
    try {
        const existing = await Voucher.getByCode(req.body.code);
        if (existing) {
            return res.status(400).json({ message: "Mã giảm giá này đã tồn tại trên hệ thống!" });
        }
        const newVoucher = await Voucher.create(req.body);
        return res.status(201).json({ message: "Tạo voucher mới thành công!", data: newVoucher });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi tạo voucher", error: error.message });
    }
};

const updateVoucher = async (req, res) => {
    try {
        const updated = await Voucher.update(req.params.id, req.body);
        if (!updated) return res.status(404).json({ message: "Không tìm thấy voucher để cập nhật" });
        return res.status(200).json({ message: "Cập nhật thành công!", data: updated });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi cập nhật voucher", error: error.message });
    }
};

const deleteVoucher = async (req, res) => {
    try {
        const deleted = await Voucher.delete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Không tìm thấy voucher để xóa" });
        return res.status(200).json({ message: "Đã xóa voucher thành công!" });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi xóa voucher", error: error.message });
    }
};

module.exports = {
    applyVoucher,
    getActiveVouchers,
    getAllVouchers,
    getVoucherById,
    createVoucher,
    updateVoucher,
    deleteVoucher
};
