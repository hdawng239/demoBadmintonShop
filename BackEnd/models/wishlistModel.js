const TABLE = 'wishlists';

const mapRow = (row) => {
    if (!row) return null;
    return { ...row };
};

module.exports = { TABLE, mapRow };
