const TABLE = 'orders';

const UPDATABLE_FIELDS = [
    'status', 'payment_status', 'tracking_code',
    'shipping_name', 'shipping_phone', 'shipping_address',
    'to_district_id', 'to_ward_code',
];

const mapRow = (row) => {
    if (!row) return null;
    return { ...row };
};

module.exports = { TABLE, UPDATABLE_FIELDS, mapRow };
