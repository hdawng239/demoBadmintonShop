// MODEL = định nghĩa Entity Review: tên bảng, cột được phép cập nhật, hàm map row.

const TABLE = 'reviews';

// Review thường chỉ tạo/xóa, không update. Nhưng để dự phòng.
const UPDATABLE_FIELDS = ['rating', 'comment'];

const mapRow = (row) => {
    if (!row) return null;
    return { ...row };
};

module.exports = { TABLE, UPDATABLE_FIELDS, mapRow };
