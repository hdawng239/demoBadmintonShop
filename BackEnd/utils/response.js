// Giữ các trường cũ để tương thích frontend.
const sendSuccess = (res, { statusCode = 200, message, data = null, meta = null, legacy = {} } = {}) => {
    const body = { success: true };
    if (message !== undefined) body.message = message;
    body.data = data;
    if (meta) body.meta = meta;
    Object.assign(body, legacy);
    return res.status(statusCode).json(body);
};

const sendError = (res, statusCode, message) => {
    return res.status(statusCode).json({ success: false, message });
};

module.exports = { sendSuccess, sendError };
