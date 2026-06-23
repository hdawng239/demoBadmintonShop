// MODEL = định nghĩa Entity Product: tên bảng, cột được phép cập nhật, hàm map row.
// Không chứa SQL (SQL nằm ở repository).

const TABLE = 'products';

// Allowlist các cột client được phép cập nhật qua UPDATE (chống mass-assignment).
const UPDATABLE_FIELDS = [
    'category_id', 'brand_id', 'name', 'base_price',
    'description', 'technical_specs', 'is_active', 'image_url',
];

const mapRow = (row) => {
    if (!row) return null;
    return { ...row };
};

module.exports = { TABLE, UPDATABLE_FIELDS, mapRow };
