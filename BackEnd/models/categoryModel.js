const pool = require('../config/db');
const { generateDynamicUpdate } = require('../utils/queryBuilder');

const Category = {
    getAll: async (page = 1, limit = 10, search = '') => {
        const offset = (page - 1) * limit;
        
        let countQuery = 'SELECT COUNT(*) FROM categories';
        let dataQuery = `
            SELECT c1.*, c2.name AS parent_name 
            FROM categories c1
            LEFT JOIN categories c2 ON c1.parent_id = c2.id
        `;
        let countParams = [];
        let dataParams = [limit, offset];

        if (search) {
            countQuery += ' WHERE name ILIKE $1';
            dataQuery += ' WHERE c1.name ILIKE $3';
            countParams.push(`%${search}%`);
            dataParams.push(`%${search}%`);
        }

        dataQuery += ' ORDER BY c1.id ASC LIMIT $1 OFFSET $2';

        const countResult = await pool.query(countQuery, countParams);
        const totalItems = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalItems / limit);

        const result = await pool.query(dataQuery, dataParams);
        
        return {
            data: result.rows,
            pagination: {
                totalItems,
                totalPages,
                currentPage: parseInt(page),
                limit: parseInt(limit)
            }
        };
    },
    getById: async (id) => {
        const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
        return result.rows[0];
    },
    create: async (data) => {
        const { parent_id, name, slug } = data;
        const query = `
            INSERT INTO categories (parent_id, name, slug) 
            VALUES ($1, $2, $3) RETURNING *
        `;
        const result = await pool.query(query, [parent_id || null, name, slug]);
        return result.rows[0];
    },
    update: async (id, data) => {
        // Cỗ máy tự động sinh SQL giúp cập nhật sâu tất cả các trường
        const { query, values } = generateDynamicUpdate('categories', data, id);
        if (!query) throw new Error("Không có dữ liệu hợp lệ để cập nhật");
        
        const result = await pool.query(query, values);
        return result.rows[0];
    },
    delete: async (id) => {
        const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
};

module.exports = Category;