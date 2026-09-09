const validateBrandCreate = (data) => {
    const errors = [];
    if (typeof data.name !== 'string' || !data.name.trim() || data.name.trim().length > 120) {
        errors.push("Tên thương hiệu không hợp lệ");
    }
    return errors;
};

module.exports = { validateBrandCreate };
