const jwt = require('jsonwebtoken');
const UserRepository = require('../repositories/userRepository');

const authenticate = async (token) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    if (decoded.type !== 'access' || !Number.isInteger(decoded.id) || !Number.isInteger(decoded.ver)) {
        throw Object.assign(new Error('Invalid access token'), { name: 'JsonWebTokenError' });
    }
    const user = await UserRepository.findAuthState(decoded.id);
    if (!user || user.auth_version !== decoded.ver) {
        throw Object.assign(new Error('Revoked session'), { name: 'JsonWebTokenError' });
    }
    return { id: user.id, role: user.role, ver: user.auth_version };
};
const isTokenError = (err) => ['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError'].includes(err.name);

const verifyToken = async (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Truy cập bị từ chối! Vui lòng đăng nhập." });
    }

    const token = authHeader.split(' ')[1];

    try {
        req.user = await authenticate(token);
        next();
    } catch (error) {
        if (!isTokenError(error)) return next(error);
        // Trả 401 khi hết hạn để frontend làm mới token; token hỏng trả 403.
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token đã hết hạn!", code: "TOKEN_EXPIRED" });
        }
        return res.status(401).json({ message: "Token không hợp lệ!", code: "TOKEN_INVALID" });
    }
};

const optionalVerifyToken = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return next();

    try {
        req.user = await authenticate(authHeader.slice(7));
    } catch (error) {
        if (!isTokenError(error)) return next(error);
        req.user = null;
    }
    next();
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: "Quyền truy cập bị từ chối! Chỉ Admin mới có thể thực hiện hành động này." });
    }
};

module.exports = { verifyToken, optionalVerifyToken, isAdmin };
