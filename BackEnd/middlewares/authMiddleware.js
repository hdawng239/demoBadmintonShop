const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    // 1. Khách hàng giấu Token trong Header với tên là 'Authorization'
    const authHeader = req.header('Authorization');

    // 2. Kiểm tra xem có Token không và có đúng chuẩn 'Bearer [Token]' không
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Truy cập bị từ chối! Vui lòng đăng nhập." });
    }

    // 3. Cắt bỏ chữ 'Bearer ' để lấy chính xác cái chuỗi mã JWT
    const token = authHeader.split(' ')[1];

    try {
        // 4. Lấy chìa khóa trong két sắt (.env) ra để giải mã Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 5. Giải mã thành công! Gắn thông tin (id, role) vào req để Controller dùng
        req.user = decoded; 
        
        // 6. Cho phép đi tiếp vào Controller
        next(); 
    } catch (error) {
        return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn!" });
    }
};

const isAdmin = (req, res, next) => {
    // Vì verifyToken đã giải mã JWT và gắn thông tin vào req.user rồi, 
    // nên ở đây ta mới có thể lôi req.user.role ra để kiểm tra.
    
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: "Quyền truy cập bị từ chối! Chỉ Admin mới có thể thực hiện hành động này." });
    }
};

module.exports = { verifyToken, isAdmin };