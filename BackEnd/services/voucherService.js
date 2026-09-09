const VoucherRepository = require('../repositories/voucherRepository');
const AppError = require('../utils/AppError');
const { calculateDiscounts } = require('../utils/pricing');

const validateVoucher = (voucher) => {
    if (!voucher.code || !/^[A-Z0-9_-]{3,40}$/.test(voucher.code)) {
        throw new AppError(400, 'Mã voucher chỉ gồm chữ, số, gạch ngang/gạch dưới và dài 3-40 ký tự.');
    }
    if (!['fixed', 'percentage', 'shipping'].includes(voucher.discount_type)) {
        throw new AppError(400, 'Loại voucher không hợp lệ.');
    }
    if (!Number.isFinite(voucher.discount_value) || voucher.discount_value < 0) {
        throw new AppError(400, 'Giá trị giảm không hợp lệ.');
    }
    if (voucher.discount_type === 'percentage' && voucher.discount_value > 100) {
        throw new AppError(400, 'Phần trăm giảm không được vượt quá 100%.');
    }
    if (!Number.isInteger(voucher.usage_limit) || voucher.usage_limit < 1) {
        throw new AppError(400, 'Giới hạn sử dụng không hợp lệ.');
    }
    if (!Number.isFinite(voucher.min_order_value) || voucher.min_order_value < 0) {
        throw new AppError(400, 'Giá trị đơn hàng tối thiểu không hợp lệ.');
    }
    if (voucher.max_discount !== null && (!Number.isFinite(voucher.max_discount) || voucher.max_discount < 0)) {
        throw new AppError(400, 'Mức giảm tối đa không hợp lệ.');
    }
    if (typeof voucher.is_active !== 'boolean') {
        throw new AppError(400, 'Trạng thái voucher không hợp lệ.');
    }
    if (Number.isNaN(voucher.start_date.getTime()) || Number.isNaN(voucher.end_date.getTime()) || voucher.end_date <= voucher.start_date) {
        throw new AppError(400, 'Khoảng thời gian voucher không hợp lệ.');
    }
};

const normalizeForCreate = (data) => {
    if (typeof data.code !== 'string') throw new AppError(400, 'Mã voucher không hợp lệ.');
    if (data.description !== undefined && data.description !== null && (typeof data.description !== 'string' || data.description.length > 2000)) {
        throw new AppError(400, 'Mô tả voucher không hợp lệ hoặc quá dài.');
    }
    let type = data.discount_type;
    if (type === 'fixed_amount') type = 'fixed';
    if (type === 'free_shipping' || type === 'freeship') type = 'shipping';

    return {
        code: String(data.code).trim().toUpperCase(),
        description: data.description?.trim() || '',
        discount_type: type || 'percentage',
        discount_value: parseFloat(data.discount_value || 0),
        min_order_value: parseFloat(data.min_order_value !== undefined ? data.min_order_value : (data.min_order_amount || 0)),
        max_discount: data.max_discount !== undefined ? (data.max_discount ? parseFloat(data.max_discount) : null) : (data.max_discount_amount ? parseFloat(data.max_discount_amount) : null),
        usage_limit: parseInt(data.usage_limit || 100),
        start_date: new Date(data.start_date),
        end_date: new Date(data.end_date),
        is_active: data.is_active !== undefined ? data.is_active : true,
    };
};

const normalizeForUpdate = (data) => {
    const d = { ...data };
    if (d.code !== undefined && typeof d.code !== 'string') throw new AppError(400, 'Mã voucher không hợp lệ.');
    if (d.code) d.code = d.code.trim().toUpperCase();
    if (d.description !== undefined && d.description !== null && (typeof d.description !== 'string' || d.description.length > 2000)) {
        throw new AppError(400, 'Mô tả voucher không hợp lệ hoặc quá dài.');
    }
    if (d.description !== undefined) d.description = d.description?.trim() || '';
    if (d.discount_type) {
        if (d.discount_type === 'fixed_amount') d.discount_type = 'fixed';
        if (d.discount_type === 'free_shipping' || d.discount_type === 'freeship') d.discount_type = 'shipping';
    }
    if (d.discount_value !== undefined) d.discount_value = parseFloat(d.discount_value || 0);
    if (d.min_order_value !== undefined || d.min_order_amount !== undefined) {
        d.min_order_value = parseFloat(d.min_order_value !== undefined ? d.min_order_value : (d.min_order_amount || 0));
        delete d.min_order_amount;
    }
    if (d.max_discount !== undefined || d.max_discount_amount !== undefined) {
        const val = d.max_discount !== undefined ? d.max_discount : d.max_discount_amount;
        d.max_discount = val ? parseFloat(val) : null;
        delete d.max_discount_amount;
    }
    if (d.usage_limit !== undefined) d.usage_limit = parseInt(d.usage_limit);
    if (d.start_date !== undefined) d.start_date = new Date(d.start_date);
    if (d.end_date !== undefined) d.end_date = new Date(d.end_date);
    return d;
};

const VoucherService = {
    applyVoucher: async (code, cartTotal) => {
        if (!code) throw new AppError(400, 'Vui lòng nhập mã giảm giá.');

        const total = Number(cartTotal);
        if (!Number.isFinite(total) || total < 0) throw new AppError(400, 'Giá trị giỏ hàng không hợp lệ.');

        const voucher = await VoucherRepository.findByCode(code);
        if (!voucher) throw new AppError(404, 'Mã giảm giá không tồn tại.');

        if (!voucher.is_active) throw new AppError(400, 'Mã giảm giá hiện tại đang bị khóa.');

        const now = new Date();
        if (now < new Date(voucher.start_date)) {
            throw new AppError(400, 'Mã giảm giá chưa đến thời gian áp dụng.');
        }
        if (now > new Date(voucher.end_date)) {
            throw new AppError(400, 'Mã giảm giá đã hết hạn sử dụng.');
        }

        if (parseInt(voucher.used_count) >= parseInt(voucher.usage_limit)) {
            throw new AppError(400, 'Mã giảm giá đã hết lượt sử dụng trên hệ thống.');
        }

        const minVal = parseFloat(voucher.min_order_value || 0);
        if (total < minVal) {
            throw new AppError(400, `Đơn hàng tối thiểu phải đạt ${minVal.toLocaleString()} ₫ để áp dụng mã này.`);
        }

        const discountVal = parseFloat(voucher.discount_value);
        const { orderDiscount } = calculateDiscounts({
            voucher,
            subtotal: total,
            shippingFee: 0,
        });
        // Phí ship thực tế chỉ được tính khi tạo đơn.
        const discountAmount = ['shipping', 'freeship', 'free_shipping'].includes(voucher.discount_type)
            ? discountVal
            : orderDiscount;

        return {
            code: voucher.code,
            discountType: voucher.discount_type,
            discountValue: discountVal,
            discountAmount,
            minOrderValue: minVal,
            maxDiscount: voucher.max_discount,
        };
    },

    getActiveVouchers: () => VoucherRepository.findActive(),

    getAllVouchers: async (page = 1, limit = 10) => {
        const { rows, totalItems } = await VoucherRepository.findAll(page, limit);
        return {
            data: rows,
            pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: page,
                limit,
            },
        };
    },

    getVoucherById: async (id) => {
        const voucher = await VoucherRepository.findById(id);
        if (!voucher) throw new AppError(404, 'Không tìm thấy voucher');
        return voucher;
    },

    createVoucher: async (data) => {
        const normalized = normalizeForCreate(data);
        validateVoucher(normalized);
        const existing = await VoucherRepository.findByCode(normalized.code);
        if (existing) throw new AppError(409, 'Mã giảm giá này đã tồn tại trên hệ thống!');
        return VoucherRepository.create(normalized);
    },

    updateVoucher: async (id, data) => {
        const current = await VoucherRepository.findById(id);
        if (!current) throw new AppError(404, 'Không tìm thấy voucher để cập nhật');
        const normalized = normalizeForUpdate(data);
        const candidate = normalizeForCreate({ ...current, ...normalized });
        validateVoucher(candidate);
        const updated = await VoucherRepository.update(id, normalized);
        if (!updated) throw new AppError(404, 'Không tìm thấy voucher để cập nhật');
        return updated;
    },

    deleteVoucher: async (id) => {
        const deleted = await VoucherRepository.remove(id);
        if (!deleted) throw new AppError(404, 'Không tìm thấy voucher để xóa');
        return deleted;
    },
};

module.exports = VoucherService;
