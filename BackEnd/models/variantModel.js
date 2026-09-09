const crypto = require('crypto');


const TABLE = 'product_variants';

const UPDATABLE_FIELDS = ['variant_name', 'stock_quantity', 'price_modifier', 'attributes', 'sku'];

const mapRow = (row) => {
    if (!row) return null;
    return { ...row };
};


const formatVariantName = (category_id, attrs) => {
    if (!attrs) return 'Mặc định';
    const color = attrs['Màu sắc'];
    if (category_id === 1) {
        const weight = attrs['Trọng lượng'];
        if (weight && color) return `${weight} - ${color}`;
        if (weight) return weight;
        if (color) return color;
    } else {
        const size = attrs['Kích cỡ'];
        if (size && color) {
            const prefix = /^\d+$/.test(size) ? 'Size ' : '';
            return `${prefix}${size} - ${color}`;
        }
        if (size) {
            const prefix = /^\d+$/.test(size) ? 'Size ' : '';
            return `${prefix}${size}`;
        }
        if (color) return color;
    }
    return 'Mặc định';
};

const cleanStr = (s) =>
    String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^a-zA-Z0-9]/g, '');

const generateSKU = (product_id, category_id, parsedAttrs, existingColors) => {
    let skuParts = ['PR', product_id];
    if (parsedAttrs) {
        if (category_id === 1) {
            const w = parsedAttrs['Trọng lượng'] || parsedAttrs['weight'];
            if (w) skuParts.push(cleanStr(w));
        } else {
            const s = parsedAttrs['Kích cỡ'] || parsedAttrs['size'] || parsedAttrs['Size'];
            if (s) skuParts.push('SZ' + cleanStr(s));
        }
        const c = parsedAttrs['Màu sắc'] || parsedAttrs['color'];
        if (c) {
            const normalizedColor = cleanStr(String(c)).toUpperCase();
            const colorHash = crypto.createHash('sha1').update(String(c).trim().toLowerCase()).digest('hex').slice(0, 6).toUpperCase();
            skuParts.push(`CL${normalizedColor.slice(0, 8) || 'COLOR'}-${colorHash}`);
        }
    } else {
        skuParts.push('DFT');
    }
    return skuParts.join('-');
};

module.exports = { TABLE, UPDATABLE_FIELDS, mapRow, formatVariantName, generateSKU };
