const pool = require('../config/db');
const { generateDynamicUpdate } = require('../utils/queryBuilder');
const { TABLE, UPDATABLE_FIELDS, mapRow } = require('../models/productModel');

const ProductRepository = {
    findPaginated: async (page, limit, categoryId, brandId, keyword) => {
        const offset = (page - 1) * limit;
        const whereClauses = [];
        const queryParams = [];

        // Lọc theo category cha thì lấy luôn sản phẩm của các category con
        if (categoryId) {
            const idx = whereClauses.length + 1;
            whereClauses.push(`(p.category_id = $${idx} OR p.category_id IN (SELECT id FROM categories WHERE parent_id = $${idx}))`);
            queryParams.push(categoryId);
        }
        if (brandId) {
            whereClauses.push(`p.brand_id = $${whereClauses.length + 1}`);
            queryParams.push(brandId);
        }
        if (keyword) {
            // Giới hạn độ dài từ khóa tối đa 100 ký tự và lấy tối đa 5 từ để tránh DoS
            const cleanKeyword = String(keyword).substring(0, 100).trim();
            const terms = cleanKeyword.split(/\s+/).slice(0, 5);
            terms.forEach((term) => {
                whereClauses.push(`p.name ILIKE $${whereClauses.length + 1}`);
                queryParams.push(`%${term}%`);
            });
        }

        const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        const dataQuery = `
            SELECT p.*, b.name AS brand_name, c.name AS category_name
            FROM ${TABLE} p
            LEFT JOIN brands b ON p.brand_id = b.id
            LEFT JOIN categories c ON p.category_id = c.id
            ${whereString}
            ORDER BY p.id ASC
            LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
        `;

        const dataResult = await pool.query(dataQuery, [...queryParams, limit, offset]);

        const countQuery = `SELECT COUNT(*) FROM ${TABLE} p ${whereString}`;
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
            SELECT p.*, c.name AS category_name, b.name AS brand_name
            FROM ${TABLE} p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN brands b ON p.brand_id = b.id
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
        const { category_id, brand_id, name, base_price, description, technical_specs, is_active, image_url } = data;
        const query = `
            INSERT INTO ${TABLE} (category_id, brand_id, name, base_price, description, technical_specs, is_active, image_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
        `;
        const result = await pool.query(query, [
            category_id, brand_id, name, base_price, description,
            technical_specs ? JSON.stringify(technical_specs) : null,
            is_active ?? true,
            image_url || null,
        ]);
        return mapRow(result.rows[0]);
    },

    createDefaultVariant: async (productId) => {
        await pool.query(
            'INSERT INTO product_variants (product_id, variant_name, stock_quantity, price_modifier) VALUES ($1, $2, $3, $4)',
            [productId, 'Mặc định', 100, 0]
        );
    },

    update: async (id, data) => {
        const updateData = { ...data };
        if (updateData.technical_specs && typeof updateData.technical_specs === 'object') {
            updateData.technical_specs = JSON.stringify(updateData.technical_specs);
        }
        const { query, values } = generateDynamicUpdate(TABLE, updateData, id, UPDATABLE_FIELDS);
        if (!query) return null;
        const result = await pool.query(query, values);
        return mapRow(result.rows[0]);
    },

    remove: async (id) => {
        const result = await pool.query(`DELETE FROM ${TABLE} WHERE id = $1 RETURNING *`, [id]);
        return mapRow(result.rows[0]);
    },

    // Dùng cho search bằng hình ảnh
    findCatalogForSearch: async () => {
        const query = `
            SELECT p.id, p.name, p.description, c.name AS category_name, b.name AS brand_name
            FROM ${TABLE} p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN brands b ON p.brand_id = b.id
            WHERE p.is_active = true
        `;
        const result = await pool.query(query);
        return result.rows;
    },

    findByIds: async (ids) => {
        const query = `
            SELECT p.*, b.name AS brand_name, c.name AS category_name
            FROM ${TABLE} p
            LEFT JOIN brands b ON p.brand_id = b.id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ANY($1) AND p.is_active = true
        `;
        const result = await pool.query(query, [ids]);
        return result.rows.map(mapRow);
    },
};

module.exports = ProductRepository;
