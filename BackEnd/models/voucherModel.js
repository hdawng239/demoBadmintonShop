const TABLE = 'vouchers';

// used_count không cho sửa trực tiếp, chỉ tăng khi đặt hàng
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
