const TABLE = 'products';

const UPDATABLE_FIELDS = [
    'category_id', 'brand_id', 'name', 'base_price',
    'description', 'technical_specs', 'is_active', 'image_url',
];

const mapRow = (row) => {
    if (!row) return null;
    return { ...row };
};

module.exports = { TABLE, UPDATABLE_FIELDS, mapRow };
