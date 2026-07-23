const TABLE = 'brands';

// Các cột client được phép sửa qua API update
const UPDATABLE_FIELDS = ['name', 'logo_url', 'description'];

const mapRow = (row) => {
    if (!row) return null;
    return { ...row };
};

module.exports = { TABLE, UPDATABLE_FIELDS, mapRow };
