const pool = require('../config/db');
const { generateDynamicUpdate } = require('../utils/queryBuilder');
const Product = {
    getAll: async (page, limit, categoryId, brandId, keyword) => {
        // Tính số bản ghi cần bỏ qua (Offset)
        const offset = (page - 1) * limit;

        let whereClauses = [];
        let queryParams = [];
        
        // Thêm điều kiện lọc vào mảng
        if (categoryId) {
            const index = whereClauses.length + 1;
            whereClauses.push(`(p.category_id = $${index} OR p.category_id IN (SELECT id FROM categories WHERE parent_id = $${index}))`);
            queryParams.push(categoryId);
        }
        if (brandId) {
            whereClauses.push(`p.brand_id = $${whereClauses.length + 1}`);
            queryParams.push(brandId);
        }
        if (keyword) {
            whereClauses.push(`p.name ILIKE $${whereClauses.length + 1}`);
            queryParams.push(`%${keyword}%`);
        }
        
        const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        // Lệnh 1: Lấy đúng số lượng sản phẩm của trang đó
        const dataQuery = `
            SELECT p.*, b.name AS brand_name, c.name AS category_name 
            FROM products p
            LEFT JOIN brands b ON p.brand_id = b.id
            LEFT JOIN categories c ON p.category_id = c.id
            ${whereString}
            ORDER BY p.id ASC
            LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
        `;
        
        const dataParams = [...queryParams, limit, offset];
        const dataResult = await pool.query(dataQuery, dataParams);

        // Lệnh 2: Đếm tổng số sản phẩm
        const countQuery = `SELECT COUNT(*) FROM products p ${whereString}`;
        const countResult = await pool.query(countQuery, queryParams);
        const totalItems = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalItems / limit);

        // Trả về một object đầy đủ thông số phân trang
        return {
            totalItems,
            totalPages,
            currentPage: page,
            limit,
            products: dataResult.rows
        };
    },
    getById: async (id) => {
        const query = `
            SELECT p.*, c.name AS category_name, b.name AS brand_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN brands b ON p.brand_id = b.id
            WHERE p.id = $1
        `;
        const result = await pool.query(query, [id]);
        const product = result.rows[0];
        
        if (product) {
            const variantQuery = `SELECT * FROM product_variants WHERE product_id = $1 ORDER BY id ASC`;
            const varResult = await pool.query(variantQuery, [id]);
            product.variants = varResult.rows;
        }
        
        return product;
    },
    create: async (data) => {
        const { category_id, brand_id, name, base_price, description, technical_specs, is_active, image_url } = data;
        const query = `
            INSERT INTO products (category_id, brand_id, name, base_price, description, technical_specs, is_active, image_url) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
        `;
        const result = await pool.query(query, [
            category_id, brand_id, name, base_price, description, 
            technical_specs ? JSON.stringify(technical_specs) : null, 
            is_active ?? true,
            image_url || null
        ]);
        return result.rows[0];
    },
        update: async (id, data) => {
        // Tự động sinh SQL cho bảng 'products'
        const { query, values } = generateDynamicUpdate('products', data, id);
        
        if (!query) throw new Error("Không có dữ liệu hợp lệ để cập nhật");

        // Nếu có trường technical_specs (JSONB), cần ép kiểu thành chuỗi JSON trước khi lưu
        if (data.technical_specs) {
            const specIndex = Object.keys(data).indexOf('technical_specs');
            values[specIndex] = JSON.stringify(data.technical_specs);
        }

        const result = await pool.query(query, values);
        return result.rows[0];
    },

    delete: async (id) => {
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
};

module.exports = Product;