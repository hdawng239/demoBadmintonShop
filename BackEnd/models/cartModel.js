// MODEL = định nghĩa Entity Cart: tên bảng, hàm map row.
// Bảng carts chỉ có id và user_id, không có cột cần cập nhật động.

const TABLE = 'carts';

const mapRow = (row) => {
    if (!row) return null;
    return { ...row };
};

module.exports = { TABLE, mapRow };
