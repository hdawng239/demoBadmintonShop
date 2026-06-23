// MODEL = định nghĩa Entity Brand: tên bảng, cột được phép cập nhật, và hàm map row.
// Không chứa SQL (SQL nằm ở repository).

const TABLE = 'brands';

// Allowlist các cột client được phép cập nhật qua UPDATE (chống mass-assignment).
const UPDATABLE_FIELDS = ['name', 'logo_url', 'description'];

// Map 1 row thô từ PostgreSQL sang object Brand thống nhất cho toàn hệ thống.
// Hiện giữ nguyên các cột để không phá vỡ response FE đang dùng; đây là nơi duy nhất
// để định hình/đổi tên field về sau nếu cần.
const mapRow = (row) => {
    if (!row) return null;
    return { ...row };
};

module.exports = { TABLE, UPDATABLE_FIELDS, mapRow };
