// MODEL = định nghĩa Entity User: tên bảng, cột được phép cập nhật, hàm map row.
// Không chứa SQL (SQL nằm ở repository).

const TABLE = 'users';

// Allowlist các cột client được phép cập nhật qua UPDATE (chống mass-assignment).
const UPDATABLE_FIELDS = ['full_name', 'email', 'password_hash', 'role', 'phone', 'address'];

// Map 1 row thô từ PostgreSQL sang object User thống nhất, loại bỏ cột nhạy cảm.
const mapRow = (row) => {
    if (!row) return null;
    // Luôn xóa password_hash khỏi response để không lộ ra ngoài
    const { password_hash, otp_code, otp_expires, ...safe } = row;
    return safe;
};

// Map row cho nội bộ auth (cần password_hash, otp_code, otp_expires để xác thực).
const mapRowInternal = (row) => {
    if (!row) return null;
    return { ...row };
};

module.exports = { TABLE, UPDATABLE_FIELDS, mapRow, mapRowInternal };
