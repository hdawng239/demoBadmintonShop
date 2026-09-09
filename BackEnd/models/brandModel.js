const TABLE = 'brands';

const UPDATABLE_FIELDS = ['name', 'logo_url', 'description'];

const mapRow = (row) => {
    if (!row) return null;
    return { ...row };
};

module.exports = { TABLE, UPDATABLE_FIELDS, mapRow };
