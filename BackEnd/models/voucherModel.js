// MODEL = Entity Voucher: tên bảng, cột được phép cập nhật, hàm map row.
const TABLE = 'vouchers';

// Allowlist cột client được phép cập nhật (chống mass-assignment).
// Lưu ý: KHÔNG cho cập nhật used_count qua đây (chỉ tăng qua incrementUsedCount khi đặt hàng).
const UPDATABLE_FIELDS = [
    'code', 'description', 'discount_type', 'discount_value',
    'min_order_value', 'max_discount', 'usage_limit',
    'start_date', 'end_date', 'is_active',
];

const mapRow = (row) => {
    if (!row) return null;
    return { ...row };
};

module.exports = { TABLE, UPDATABLE_FIELDS, mapRow };
