const validateCategoryCreate = (data) => {
    const errors = [];
    if (typeof data.name !== 'string' || !data.name.trim() || data.name.trim().length > 120) {
        errors.push("Tên danh mục không hợp lệ");
    }
    return errors;
};

module.exports = { validateCategoryCreate };
