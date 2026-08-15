const TABLE = 'posts';

const UPDATABLE_FIELDS = ['author_id', 'title', 'slug', 'summary', 'content', 'thumbnail_url', 'is_published'];

const mapRow = (row) => {
    if (!row) return null;
    return { ...row };
};

module.exports = { TABLE, UPDATABLE_FIELDS, mapRow };
