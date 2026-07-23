const TABLE = 'cart_items';

const UPDATABLE_FIELDS = ['quantity'];

const mapRow = (row) => {
    if (!row) return null;
    return { ...row };
};

module.exports = { TABLE, UPDATABLE_FIELDS, mapRow };
