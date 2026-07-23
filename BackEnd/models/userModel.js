const TABLE = 'users';

const UPDATABLE_FIELDS = ['full_name', 'email', 'password_hash', 'role', 'phone', 'address'];

// Bỏ các cột nhạy cảm trước khi trả ra ngoài
const mapRow = (row) => {
    if (!row) return null;
    const { password_hash, otp_code, otp_expires, ...safe } = row;
    return safe;
};

// Bản đầy đủ cho nội bộ auth (cần password_hash, otp để xác thực)
const mapRowInternal = (row) => {
    if (!row) return null;
    return { ...row };
};

module.exports = { TABLE, UPDATABLE_FIELDS, mapRow, mapRowInternal };
