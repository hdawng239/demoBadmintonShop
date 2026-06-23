// MODEL = Entity Post: tên bảng, cột được phép cập nhật, hàm map row.
const TABLE = 'posts';

// Allowlist cột client được phép cập nhật (chống mass-assignment).
const UPDATABLE_FIELDS = ['author_id', 'title', 'slug', 'content', 'thumbnail_url'];

const mapRow = (row) => {
    if (!row) return null;
    return { ...row };
};

module.exports = { TABLE, UPDATABLE_FIELDS, mapRow };
