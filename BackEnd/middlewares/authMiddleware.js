const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Truy cập bị từ chối! Vui lòng đăng nhập." });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        // Hết hạn trả 401 để FE biết gọi /refresh-token, token hỏng trả 403
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token đã hết hạn!", code: "TOKEN_EXPIRED" });
        }
        return res.status(403).json({ message: "Token không hợp lệ!" });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: "Quyền truy cập bị từ chối! Chỉ Admin mới có thể thực hiện hành động này." });
    }
};

module.exports = { verifyToken, isAdmin };
