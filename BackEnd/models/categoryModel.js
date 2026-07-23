const TABLE = 'categories';

const UPDATABLE_FIELDS = ['parent_id', 'name', 'slug'];

const mapRow = (row) => {
    if (!row) return null;
    return { ...row };
};

module.exports = { TABLE, UPDATABLE_FIELDS, mapRow };
