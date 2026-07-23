const VoucherRepository = require('../repositories/voucherRepository');
const AppError = require('../utils/AppError');

// Chuẩn hoá dữ liệu voucher khi tạo mới
const normalizeForCreate = (data) => ({
    code: String(data.code).trim().toUpperCase(),
    description: data.description || '',
    discount_type: data.discount_type, // 'fixed' | 'percentage' | 'shipping'
    discount_value: parseFloat(data.discount_value),
    min_order_value: parseFloat(data.min_order_value || 0),
    max_discount: data.max_discount ? parseFloat(data.max_discount) : null,
    usage_limit: parseInt(data.usage_limit || 1),
    start_date: new Date(data.start_date),
    end_date: new Date(data.end_date),
    is_active: data.is_active !== undefined ? data.is_active : true,
});

// Chuẩn hoá khi cập nhật, chỉ đụng field có trong payload
const normalizeForUpdate = (data) => {
    const d = { ...data };
    if (d.code) d.code = d.code.trim().toUpperCase();
    if (d.discount_value !== undefined) d.discount_value = parseFloat(d.discount_value);
    if (d.min_order_value !== undefined) d.min_order_value = parseFloat(d.min_order_value);
    if (d.max_discount !== undefined) d.max_discount = d.max_discount ? parseFloat(d.max_discount) : null;
    if (d.usage_limit !== undefined) d.usage_limit = parseInt(d.usage_limit);
    if (d.start_date !== undefined) d.start_date = new Date(d.start_date);
    if (d.end_date !== undefined) d.end_date = new Date(d.end_date);
    return d;
};

const VoucherService = {
    applyVoucher: async (code, cartTotal) => {
        if (!code) throw new AppError(400, 'Vui lòng nhập mã giảm giá.');

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

        const total = parseFloat(cartTotal || 0);
        const minVal = parseFloat(voucher.min_order_value || 0);
        if (total < minVal) {
            throw new AppError(400, `Đơn hàng tối thiểu phải đạt ${minVal.toLocaleString()} ₫ để áp dụng mã này.`);
        }

        let discountAmount = 0;
        const discountVal = parseFloat(voucher.discount_value);

        if (voucher.discount_type === 'fixed') {
            discountAmount = discountVal;
        } else if (voucher.discount_type === 'percentage') {
            discountAmount = total * (discountVal / 100);
            if (voucher.max_discount) {
                const maxD = parseFloat(voucher.max_discount);
                if (discountAmount > maxD) discountAmount = maxD;
            }
        } else if (voucher.discount_type === 'shipping') {
            // Giảm tiền ship, FE tự trừ vào phí vận chuyển
            discountAmount = discountVal;
        }

        // Không cho giảm vượt quá tổng đơn (trừ shipping do FE cap theo phí ship)
        if (voucher.discount_type !== 'shipping' && discountAmount > total) {
            discountAmount = total;
        }

        return {
            code: voucher.code,
            discountType: voucher.discount_type,
            discountValue: discountVal,
            discountAmount,
            minOrderValue: minVal,
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
        const existing = await VoucherRepository.findByCode(data.code);
        if (existing) throw new AppError(409, 'Mã giảm giá này đã tồn tại trên hệ thống!');
        return VoucherRepository.create(normalizeForCreate(data));
    },

    updateVoucher: async (id, data) => {
        const updated = await VoucherRepository.update(id, normalizeForUpdate(data));
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
