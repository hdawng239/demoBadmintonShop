const validateBrandCreate = (data) => {
    const errors = [];
    if (!data.name || data.name.trim() === "") errors.push("Tên thương hiệu không được để trống");
    return errors;
};

module.exports = { validateBrandCreate };