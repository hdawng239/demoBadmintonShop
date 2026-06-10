const pool = require('../config/db');

function formatVariantName(category_id, attrs) {
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
}

const Variant = {
    getByProductId: async (productId) => {
        const query = 'SELECT * FROM product_variants WHERE product_id = $1 ORDER BY id ASC';
        const result = await pool.query(query, [productId]);
        return result.rows;
    },
    create: async (data) => {
        const { product_id, stock_quantity, price_modifier, attributes } = data;
        let variant_name = data.variant_name;
        let sku = data.sku;
        
        let category_id = null;
        try {
            const prodRes = await pool.query('SELECT category_id FROM products WHERE id = $1', [product_id]);
            category_id = prodRes.rows[0]?.category_id;
        } catch (err) {
            console.error("Lỗi lấy category_id:", err);
        }

        const parsedAttrs = attributes ? (typeof attributes === 'string' ? JSON.parse(attributes) : attributes) : null;

        // Tự động đặt tên nếu để trống hoặc có dạng mặc định
        if (!variant_name || variant_name === 'Mặc định' || /^Phiên bản\s+\d+$/i.test(variant_name)) {
            variant_name = formatVariantName(category_id, parsedAttrs);
        }

        if (!sku) {
            try {
                // Lấy các variant cùng sản phẩm để tính index màu sắc
                const varRes = await pool.query('SELECT attributes FROM product_variants WHERE product_id = $1', [product_id]);
                
                const colors = new Set();
                for (const row of varRes.rows) {
                    if (row.attributes) {
                        const attrs = typeof row.attributes === 'string' ? JSON.parse(row.attributes) : row.attributes;
                        const c = attrs['Màu sắc'] || attrs['color'];
                        if (c) colors.add(c);
                    }
                }
                if (parsedAttrs) {
                    const c = parsedAttrs['Màu sắc'] || parsedAttrs['color'];
                    if (c) colors.add(c);
                }
                const sortedColors = Array.from(colors).sort();

                const clean = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").replace(/[^a-zA-Z0-9]/g, "");

                let skuParts = ['PR', product_id];
                if (parsedAttrs) {
                    if (category_id === 1) {
                        const w = parsedAttrs['Trọng lượng'] || parsedAttrs['weight'];
                        if (w) skuParts.push(clean(w));
                    } else {
                        const s = parsedAttrs['Kích cỡ'] || parsedAttrs['size'] || parsedAttrs['Size'];
                        if (s) skuParts.push('SZ' + clean(s));
                    }
                    const c = parsedAttrs['Màu sắc'] || parsedAttrs['color'];
                    if (c) {
                        const idx = sortedColors.indexOf(c);
                        skuParts.push('CL' + (idx !== -1 ? idx : 0));
                    }
                } else {
                    skuParts.push('DFT');
                }
                sku = skuParts.join('-');
            } catch (err) {
                console.error("Lỗi sinh SKU:", err);
                sku = `PR-${product_id}-${Date.now()}`;
            }
        }

        const query = `
            INSERT INTO product_variants (product_id, variant_name, stock_quantity, price_modifier, attributes, sku) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
        `;
        const result = await pool.query(query, [
            product_id, 
            variant_name, 
            stock_quantity || 0, 
            price_modifier || 0,
            attributes ? (typeof attributes === 'string' ? attributes : JSON.stringify(attributes)) : null,
            sku
        ]);
        return result.rows[0];
    },
    update: async (id, data) => {
        const { stock_quantity, price_modifier, attributes, sku } = data;
        let variant_name = data.variant_name;
        let finalSku = sku;

        let category_id = null;
        let product_id = null;
        try {
            const varRes = await pool.query('SELECT product_id FROM product_variants WHERE id = $1', [id]);
            product_id = varRes.rows[0]?.product_id;
            if (product_id) {
                const prodRes = await pool.query('SELECT category_id FROM products WHERE id = $1', [product_id]);
                category_id = prodRes.rows[0]?.category_id;
            }
        } catch (err) {
            console.error("Lỗi lấy thông tin sản phẩm khi update:", err);
        }

        const parsedAttrs = attributes ? (typeof attributes === 'string' ? JSON.parse(attributes) : attributes) : null;

        // Tự động cập nhật tên nếu để trống hoặc có dạng mặc định
        if (attributes && (!variant_name || variant_name === 'Mặc định' || /^Phiên bản\s+\d+$/i.test(variant_name))) {
            variant_name = formatVariantName(category_id, parsedAttrs);
        }

        if (attributes && !sku && product_id) {
            try {
                const siblingsRes = await pool.query('SELECT attributes FROM product_variants WHERE product_id = $1 AND id != $2', [product_id, id]);
                const colors = new Set();
                for (const row of siblingsRes.rows) {
                    if (row.attributes) {
                        const attrs = typeof row.attributes === 'string' ? JSON.parse(row.attributes) : row.attributes;
                        const c = attrs['Màu sắc'] || attrs['color'];
                        if (c) colors.add(c);
                    }
                }
                if (parsedAttrs) {
                    const c = parsedAttrs['Màu sắc'] || parsedAttrs['color'];
                    if (c) colors.add(c);
                }
                const sortedColors = Array.from(colors).sort();
                
                const clean = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").replace(/[^a-zA-Z0-9]/g, "");
                
                let skuParts = ['PR', product_id];
                if (parsedAttrs) {
                    if (category_id === 1) {
                        const w = parsedAttrs['Trọng lượng'] || parsedAttrs['weight'];
                        if (w) skuParts.push(clean(w));
                    } else {
                        const s = parsedAttrs['Kích cỡ'] || parsedAttrs['size'] || parsedAttrs['Size'];
                        if (s) skuParts.push('SZ' + clean(s));
                    }
                    const c = parsedAttrs['Màu sắc'] || parsedAttrs['color'];
                    if (c) {
                        const idx = sortedColors.indexOf(c);
                        skuParts.push('CL' + (idx !== -1 ? idx : 0));
                    }
                } else {
                    skuParts.push('DFT');
                }
                finalSku = skuParts.join('-');
            } catch (err) {
                console.error("Lỗi sinh SKU khi update:", err);
            }
        }

        const query = `
            UPDATE product_variants 
            SET variant_name = COALESCE($1, variant_name), 
                stock_quantity = COALESCE($2, stock_quantity), 
                price_modifier = COALESCE($3, price_modifier),
                attributes = COALESCE($4, attributes),
                sku = COALESCE($5, sku)
            WHERE id = $6 RETURNING *
        `;
        const result = await pool.query(query, [
            variant_name, 
            stock_quantity, 
            price_modifier, 
            attributes ? (typeof attributes === 'string' ? attributes : JSON.stringify(attributes)) : null,
            finalSku,
            id
        ]);
        return result.rows[0];
    },
    delete: async (id) => {
        // Kiểm tra xem variant này có nằm trong đơn hàng nào không
        const checkQuery = 'SELECT id FROM order_items WHERE variant_id = $1 LIMIT 1';
        const checkResult = await pool.query(checkQuery, [id]);
        if (checkResult.rows.length > 0) {
            throw new Error('Không thể xóa phân loại này vì đã có người đặt mua.');
        }

        // Cập nhật giỏ hàng: Xóa các sản phẩm trong giỏ hàng có variant_id này (tuỳ chọn)
        await pool.query('DELETE FROM cart_items WHERE variant_id = $1', [id]);

        const query = 'DELETE FROM product_variants WHERE id = $1 RETURNING *';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }
};

module.exports = Variant;
