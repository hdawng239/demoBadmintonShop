const TABLE = 'posts';

const UPDATABLE_FIELDS = ['author_id', 'title', 'slug', 'content', 'thumbnail_url'];

const mapRow = (row) => {
    if (!row) return null;
    return { ...row };
};

module.exports = { TABLE, UPDATABLE_FIELDS, mapRow };
