const pool = require('../config/db');
const { TABLE, mapRow } = require('../models/variantModel');

// REPOSITORY = tầng truy cập dữ liệu: CHỈ chứa SQL thuần cho bảng product_variants.
// Không chứa business logic (định dạng tên/SKU nằm ở model/service), không xử lý req/res.
const VariantRepository = {
    findByProductId: async (productId) => {
        const result = await pool.query(
            `SELECT * FROM ${TABLE} WHERE product_id = $1 ORDER BY id ASC`,
            [productId]
        );
        return result.rows;
    },

    findById: async (id) => {
        const result = await pool.query(`SELECT * FROM ${TABLE} WHERE id = $1`, [id]);
        return mapRow(result.rows[0]);
    },

    findProductCategoryId: async (productId) => {
        const result = await pool.query('SELECT category_id FROM products WHERE id = $1', [productId]);
        return result.rows[0]?.category_id || null;
    },

    findExistingColors: async (productId, excludeId = null) => {
        const params = [productId];
        let query = `SELECT attributes FROM ${TABLE} WHERE product_id = $1`;
        if (excludeId) {
            query += ' AND id != $2';
            params.push(excludeId);
        }
        const result = await pool.query(query, params);
        const colors = new Set();
        for (const row of result.rows) {
            if (row.attributes) {
                const attrs = typeof row.attributes === 'string' ? JSON.parse(row.attributes) : row.attributes;
                const c = attrs['Màu sắc'] || attrs['color'];
                if (c) colors.add(c);
            }
        }
        return colors;
    },

    create: async (data) => {
        const { product_id, variant_name, stock_quantity, price_modifier, attributes, sku } = data;
        const query = `
            INSERT INTO ${TABLE} (product_id, variant_name, stock_quantity, price_modifier, attributes, sku)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
        `;
        const result = await pool.query(query, [
            product_id,
            variant_name,
            stock_quantity || 0,
            price_modifier || 0,
            attributes ? (typeof attributes === 'string' ? attributes : JSON.stringify(attributes)) : null,
            sku,
        ]);
        return mapRow(result.rows[0]);
    },

    update: async (id, data) => {
        const { variant_name, stock_quantity, price_modifier, attributes, sku } = data;
        const query = `
            UPDATE ${TABLE}
            SET variant_name = COALESCE($1, variant_name),
                stock_quantity = COALESCE($2, stock_quantity),
                price_modifier = COALESCE($3, price_modifier),
                attributes = COALESCE($4, attributes),
                sku = COALESCE($5, sku)
            WHERE id = $6 RETURNING *
        `;
        const result = await pool.query(query, [
            variant_name ?? null,
            stock_quantity ?? null,
            price_modifier ?? null,
            attributes !== undefined
                ? (attributes ? (typeof attributes === 'string' ? attributes : JSON.stringify(attributes)) : null)
                : null,
            sku ?? null,
            id,
        ]);
        return mapRow(result.rows[0]);
    },

    hasOrderItems: async (variantId) => {
        const result = await pool.query('SELECT id FROM order_items WHERE variant_id = $1 LIMIT 1', [variantId]);
        return result.rows.length > 0;
    },

    removeFromCart: async (variantId) => {
        await pool.query('DELETE FROM cart_items WHERE variant_id = $1', [variantId]);
    },

    remove: async (id) => {
        const result = await pool.query(`DELETE FROM ${TABLE} WHERE id = $1 RETURNING *`, [id]);
        return mapRow(result.rows[0]);
    },
};

module.exports = VariantRepository;
