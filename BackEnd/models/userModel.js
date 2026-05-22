const pool = require('../config/db');
const { generateDynamicUpdate } = require('../utils/queryBuilder');

const User = {
    getAll: async (page, limit) => {
        const offset = (page - 1) * limit;

        const countResult = await pool.query('SELECT COUNT(*) FROM users');
        const totalItems = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalItems / limit);

        const dataQuery = `
            SELECT id, full_name, email, role, phone, address, created_at 
            FROM users 
            ORDER BY id ASC 
            LIMIT $1 OFFSET $2
        `;
        const result = await pool.query(dataQuery, [limit, offset]);

        return {
            data: result.rows,
            pagination: {
                totalItems,
                totalPages,
                currentPage: page,
                limit
            }
        };
    },
    getById: async (id) => {
        const result = await pool.query('SELECT id, full_name, email, role, phone, address, created_at FROM users WHERE id = $1', [id]);
        return result.rows[0];
    },
    getByEmailForLogin: async (email) => {
        // Lấy tất cả thông tin, BAO GỒM CẢ mật khẩu băm để đem đi so sánh
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0];
    },
    create: async (data) => {
        // Tạm thời lưu thẳng password do Frontend gửi lên (Chúng ta sẽ sửa thành mã Hash ở bước sau)
        const { full_name, email, password, role, phone, address } = data;
        const query = `
            INSERT INTO users (full_name, email, password_hash, role, phone, address) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, full_name, email, role
        `;
        const result = await pool.query(query, [full_name, email, password, role || 'customer', phone, address]);
        return result.rows[0];
    },
    update: async (id, data) => {
        const { query, values } = generateDynamicUpdate('users', data, id);
        if (!query) throw new Error("Không có dữ liệu hợp lệ để cập nhật");

        const result = await pool.query(query, values);
        // Trả về dữ liệu đã update nhưng giấu password đi
        const updatedUser = result.rows[0];
        delete updatedUser.password_hash;
        return updatedUser;
    },
    delete: async (id) => {
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, full_name, email', [id]);
        return result.rows[0];
    }
};

module.exports = User;