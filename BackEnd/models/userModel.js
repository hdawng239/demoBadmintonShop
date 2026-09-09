const TABLE = 'users';

const UPDATABLE_FIELDS = ['full_name', 'email', 'password_hash', 'role', 'phone', 'address'];

const mapRow = (row) => {
    if (!row) return null;
    const {
        password_hash,
        otp_code,
        otp_expires,
        otp_attempts,
        otp_last_sent_at,
        deleted_at,
        auth_version,
        ...safe
    } = row;
    return safe;
};

// Chỉ dùng nội bộ xác thực vì có dữ liệu nhạy cảm.
const mapRowInternal = (row) => {
    if (!row) return null;
    return { ...row };
};

module.exports = { TABLE, UPDATABLE_FIELDS, mapRow, mapRowInternal };
