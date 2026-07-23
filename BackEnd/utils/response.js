// Chuẩn hóa response về dạng { success, message?, data, meta? }.
// `legacy` để kèm thêm các key cũ cho FE chưa cập nhật, sẽ bỏ dần.
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
