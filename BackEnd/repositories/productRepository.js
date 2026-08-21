const pool = require('../config/db');
const { generateDynamicUpdate } = require('../utils/queryBuilder');
const { TABLE, UPDATABLE_FIELDS, mapRow } = require('../models/productModel');

const ProductRepository = {
    findPaginated: async (page = 1, limit = 12, categoryId = null, brandId = null, keyword = null, minPrice = null, maxPrice = null, sortBy = 'newest', isActive = true) => {
        const offset = (page - 1) * limit;
        const whereClauses = [];
        const queryParams = [];

        // Lọc theo trạng thái kinh doanh (Ẩn / Hiện). Nếu isActive = null => Admin lấy toàn bộ
        if (isActive !== null && isActive !== undefined) {
            const idx = queryParams.length + 1;
            whereClauses.push(`p.is_active = $${idx}`);
            queryParams.push(Boolean(isActive));
        }

        // Lọc theo category cha thì lấy luôn sản phẩm của các category con
        if (categoryId) {
            const idx = queryParams.length + 1;
            whereClauses.push(`(p.category_id = $${idx} OR p.category_id IN (SELECT id FROM categories WHERE parent_id = $${idx}))`);
            queryParams.push(parseInt(categoryId));
        }

        if (brandId) {
            const idx = queryParams.length + 1;
            const isNum = !isNaN(parseInt(brandId)) && String(parseInt(brandId)) === String(brandId).trim();
            if (isNum) {
                whereClauses.push(`p.brand_id = $${idx}`);
                queryParams.push(parseInt(brandId));
            } else {
                whereClauses.push(`b.name ILIKE $${idx}`);
                queryParams.push(`%${brandId}%`);
            }
        }

        if (keyword) {
            const cleanKeyword = String(keyword).substring(0, 100).trim();
            const terms = cleanKeyword.split(/\s+/).slice(0, 5);
            terms.forEach((term) => {
                const idx = queryParams.length + 1;
                whereClauses.push(`p.name ILIKE $${idx}`);
                queryParams.push(`%${term}%`);
            });
        }

        if (minPrice !== undefined && minPrice !== null && minPrice !== '') {
            const idx = queryParams.length + 1;
            whereClauses.push(`p.base_price >= $${idx}`);
            queryParams.push(parseFloat(minPrice));
        }

        if (maxPrice !== undefined && maxPrice !== null && maxPrice !== '') {
            const idx = queryParams.length + 1;
            whereClauses.push(`p.base_price <= $${idx}`);
            queryParams.push(parseFloat(maxPrice));
        }

        const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        let orderClause = 'ORDER BY p.id ASC';
        if (sortBy === 'newest') orderClause = 'ORDER BY p.created_at DESC NULLS LAST, p.id DESC';
        if (sortBy === 'price-asc') orderClause = 'ORDER BY p.base_price ASC';
        if (sortBy === 'price-desc') orderClause = 'ORDER BY p.base_price DESC';

        const dataQuery = `
            SELECT p.*, b.name AS brand_name, c.name AS category_name
            FROM ${TABLE} p
            LEFT JOIN brands b ON p.brand_id = b.id
            LEFT JOIN categories c ON p.category_id = c.id
            ${whereString}
            ${orderClause}
            LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
        `;

        const dataResult = await pool.query(dataQuery, [...queryParams, limit, offset]);

        const countQuery = `
            SELECT COUNT(*) 
            FROM ${TABLE} p 
            LEFT JOIN brands b ON p.brand_id = b.id
            ${whereString}
        `;
        const countResult = await pool.query(countQuery, queryParams);
        const totalItems = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalItems / limit);

        return {
            totalItems,
            totalPages,
            currentPage: page,
            limit,
            products: dataResult.rows,
        };
    },

    findById: async (id) => {
        const query = `
            SELECT p.*, b.name AS brand_name, c.name AS category_name
            FROM ${TABLE} p
            LEFT JOIN brands b ON p.brand_id = b.id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = $1
        `;
        const result = await pool.query(query, [id]);
        return mapRow(result.rows[0]);
    },

    findVariantsByProductId: async (productId) => {
        const result = await pool.query(
            'SELECT * FROM product_variants WHERE product_id = $1 ORDER BY id ASC',
            [productId]
        );
        return result.rows;
    },

    create: async (data) => {
        const query = `
            INSERT INTO ${TABLE} (name, category_id, brand_id, base_price, description, image_url, technical_specs, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const values = [
            data.name,
            data.category_id,
            data.brand_id,
            data.base_price,
            data.description || null,
            data.image_url || null,
            data.technical_specs || null,
            data.is_active !== undefined ? data.is_active : true,
        ];
        const result = await pool.query(query, values);
        return mapRow(result.rows[0]);
    },

    createDefaultVariant: async (productId) => {
        const query = `
            INSERT INTO product_variants (product_id, variant_name, stock_quantity, price_modifier, attributes)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [productId, 'Mặc định', 10, 0, null];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    update: async (id, data) => {
        const { setClause, values } = generateDynamicUpdate(data, UPDATABLE_FIELDS);
        if (!setClause) return null;

        const query = `
            UPDATE ${TABLE} 
            SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $${values.length + 1} 
            RETURNING *
        `;
        const result = await pool.query(query, [...values, id]);
        return mapRow(result.rows[0]);
    },

    remove: async (id) => {
        const result = await pool.query(`DELETE FROM ${TABLE} WHERE id = $1 RETURNING *`, [id]);
        return mapRow(result.rows[0]);
    },

    findCatalogForSearch: async () => {
        const result = await pool.query(
            `SELECT p.id, p.name, p.image_url, b.name AS brand, c.name AS category 
             FROM ${TABLE} p
             LEFT JOIN brands b ON p.brand_id = b.id
             LEFT JOIN categories c ON p.category_id = c.id
             WHERE p.is_active = true`
        );
        return result.rows;
    },

    findByIds: async (ids) => {
        if (!ids || !ids.length) return [];
        const query = `
            SELECT p.*, b.name AS brand_name, c.name AS category_name
            FROM ${TABLE} p
            LEFT JOIN brands b ON p.brand_id = b.id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ANY($1::int[]) AND p.is_active = true
        `;
        const result = await pool.query(query, [ids]);
        const rows = result.rows;
        // Giữ đúng thứ tự ưu tiên độ khớp mà AI đã xếp hạng
        return ids.map(id => rows.find(r => r.id === id)).filter(Boolean);
    }
};

module.exports = ProductRepository;
