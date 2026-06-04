const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const AuthService = {
    hashPassword: async (plainPassword) => {
        const saltRounds = 10; // Mức độ băm nát (Càng cao càng bảo mật nhưng server chạy lâu hơn, 10 là mức tiêu chuẩn)
        return await bcrypt.hash(plainPassword, saltRounds);
    },

    comparePassword: async (plainPassword, hashedPassword) => {
        return await bcrypt.compare(plainPassword, hashedPassword);
    },

    generateToken: (user) => {
        return jwt.sign(
            { id: user.id, role: user.role }, // Những thông tin muốn giấu vào trong thẻ
            process.env.JWT_SECRET,           // Chìa khóa lấy từ két sắt .env
            { expiresIn: process.env.JWT_EXPIRES_IN } // Hạn sử dụng của thẻ
        );
    }
};

module.exports = AuthService;