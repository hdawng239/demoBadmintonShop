const validateCategoryCreate = (data) => {
    const errors = [];
    if (!data.name || data.name.trim() === "") errors.push("Tên danh mục không được để trống");
    if (!data.slug || data.slug.trim() === "") errors.push("Slug danh mục không được để trống");
    return errors;
};

module.exports = { validateCategoryCreate };