const pool = require('../config/db');
const { generateDynamicUpdate } = require('../utils/queryBuilder');
const Product = {
    getAll: async (page, limit) => {
        // Tính số bản ghi cần bỏ qua (Offset)
        // Ví dụ: page = 2, limit = 10 -> offset = (2-1)*10 = 10 (bỏ qua 10 ông đầu, lấy từ ông số 11)
        const offset = (page - 1) * limit;

        // Lệnh 1: Lấy đúng số lượng sản phẩm của trang đó (Kèm JOIN tên Hãng và Danh mục cho chi tiết)
        const dataQuery = `
            SELECT p.*, b.name AS brand_name, c.name AS category_name 
            FROM products p
            LEFT JOIN brands b ON p.brand_id = b.id
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.id ASC
            LIMIT $1 OFFSET $2
        `;
        const dataResult = await pool.query(dataQuery, [limit, offset]);

        // Lệnh 2: Đếm tổng số sản phẩm đang có trong DB để Frontend tính số lượng nút bấm chuyển trang
        const countResult = await pool.query('SELECT COUNT(*) FROM products');
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
        return result.rows[0];
    },
    create: async (data) => {
        const { category_id, brand_id, name, base_price, description, technical_specs, is_active } = data;
        const query = `
            INSERT INTO products (category_id, brand_id, name, base_price, description, technical_specs, is_active) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
        `;
        const result = await pool.query(query, [
            category_id, brand_id, name, base_price, description, 
            technical_specs ? JSON.stringify(technical_specs) : null, 
            is_active ?? true
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