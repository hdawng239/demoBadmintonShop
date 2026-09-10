const REQUIRED_IN_PRODUCTION = [
    'DB_HOST',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'FRONTEND_URL',
    'KEY_SEPAY',
    'TURNSTILE_SECRET_KEY',
    'SHOP_DISTRICT_ID',
    'SHOP_WARD_CODE',
    'KEY_IDSHOP',
    'KEY_TOKEN_SHOP',
    'KEY_GEMINI',
    'BREVO_API_KEY',
    'EMAIL_FROM',
    'EMAIL_ADMIN',
];

const validateEnvironment = () => {
    for (const name of ['AI_HOURLY_REQUEST_LIMIT', 'GLOBAL_RATE_LIMIT', 'DB_POOL_MAX', 'DB_IDLE_TIMEOUT_MS', 'DB_CONNECT_TIMEOUT_MS']) {
        if (process.env[name] !== undefined && (!/^\d+$/.test(process.env[name]) || !Number.isSafeInteger(Number(process.env[name])) || Number(process.env[name]) < 1)) {
            throw new Error(`${name} phải là số nguyên dương.`);
        }
    }
    if (process.env.NODE_ENV !== 'production') return;
    if (process.env.DB_SSL_REJECT_UNAUTHORIZED === 'false') {
        throw new Error('Production không được tắt xác minh chứng chỉ database. Cấu hình DB_SSL_CA hợp lệ.');
    }
    if (process.env.GHN_CLIENT_PREFIX && !/^[A-Za-z0-9_-]{1,25}$/.test(process.env.GHN_CLIENT_PREFIX)) {
        throw new Error('GHN_CLIENT_PREFIX chỉ gồm chữ, số, gạch ngang/gạch dưới, tối đa 25 ký tự.');
    }

    const missing = REQUIRED_IN_PRODUCTION.filter((name) => !String(process.env[name] || '').trim());
    if (missing.length > 0) {
        throw new Error(`Thiếu biến môi trường production: ${missing.join(', ')}`);
    }

    if (process.env.JWT_SECRET.length < 32 || process.env.JWT_REFRESH_SECRET.length < 32) {
        throw new Error('JWT_SECRET và JWT_REFRESH_SECRET phải có ít nhất 32 ký tự trong production.');
    }
    if (process.env.JWT_SECRET === process.env.JWT_REFRESH_SECRET) {
        throw new Error('JWT_SECRET và JWT_REFRESH_SECRET phải là hai secret khác nhau.');
    }
    const origins = process.env.FRONTEND_URL.split(',').map((origin) => origin.trim());
    if (origins.some((origin) => origin === '*')) {
        throw new Error('FRONTEND_URL không được chứa wildcard (*) trong production.');
    }
    for (const origin of origins) {
        let parsed;
        try {
            parsed = new URL(origin);
        } catch {
            throw new Error(`FRONTEND_URL chứa origin không hợp lệ: ${origin}`);
        }
        if (parsed.origin !== origin.replace(/\/$/, '') || parsed.protocol !== 'https:') {
            throw new Error(`FRONTEND_URL production phải là HTTPS origin, không chứa path: ${origin}`);
        }
    }
    if (process.env.COOKIE_SAME_SITE && !['lax', 'strict', 'none'].includes(process.env.COOKIE_SAME_SITE.toLowerCase())) {
        throw new Error('COOKIE_SAME_SITE chỉ nhận lax, strict hoặc none.');
    }
};

module.exports = { validateEnvironment };
