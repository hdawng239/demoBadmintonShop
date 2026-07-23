const TABLE = 'reviews';

const UPDATABLE_FIELDS = ['rating', 'comment'];

const mapRow = (row) => {
    if (!row) return null;
    return { ...row };
};

module.exports = { TABLE, UPDATABLE_FIELDS, mapRow };
