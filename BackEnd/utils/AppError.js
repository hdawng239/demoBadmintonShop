// Lỗi nghiệp vụ có HTTP status rõ ràng, do Service/Controller chủ động ném ra.
// Error middleware sẽ bắt và trả về response chuẩn.
// Phân biệt với lỗi hệ thống (bug, lỗi DB ngoài dự kiến) để không lộ chi tiết nội bộ.
class AppError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // lỗi chủ động, đã lường trước
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
