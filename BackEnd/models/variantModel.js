// MODEL = định nghĩa Entity Variant: tên bảng, cột được phép cập nhật, hàm map row,
// và các helper thuần túy cho định dạng tên/SKU (không dùng DB).

const TABLE = 'product_variants';

const UPDATABLE_FIELDS = ['variant_name', 'stock_quantity', 'price_modifier', 'attributes', 'sku'];

const mapRow = (row) => {
    if (!row) return null;
    return { ...row };
};

// ── Helpers thuần (không DB) ──────────────────────────────

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
    s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^a-zA-Z0-9]/g, '');

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
            const sortedColors = Array.from(existingColors).sort();
            const idx = sortedColors.indexOf(c);
            skuParts.push('CL' + (idx !== -1 ? idx : 0));
        }
    } else {
        skuParts.push('DFT');
    }
    return skuParts.join('-');
};

module.exports = { TABLE, UPDATABLE_FIELDS, mapRow, formatVariantName, generateSKU };
