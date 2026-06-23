// MODEL = Entity Category: tên bảng, cột được phép cập nhật, hàm map row.
const TABLE = 'categories';

// Allowlist cột client được phép cập nhật (chống mass-assignment).
const UPDATABLE_FIELDS = ['parent_id', 'name', 'slug'];

const mapRow = (row) => {
    if (!row) return null;
    return { ...row };
};

module.exports = { TABLE, UPDATABLE_FIELDS, mapRow };
