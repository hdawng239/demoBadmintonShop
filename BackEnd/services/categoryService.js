const CategoryRepository = require('../repositories/categoryRepository');
const AppError = require('../utils/AppError');

// SERVICE = nghiệp vụ Category: phân trang, kiểm tra tồn tại, map lỗi nghiệp vụ.
const CategoryService = {
    getAllCategories: async (page = 1, limit = 10, search = '') => {
        const { rows, totalItems } = await CategoryRepository.findAll(page, limit, search);
        return {
            data: rows,
            pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: parseInt(page),
                limit: parseInt(limit),
            },
        };
    },

    getCategoryById: async (id) => {
        const category = await CategoryRepository.findById(id);
        if (!category) throw new AppError(404, 'Không tìm thấy danh mục');
        return category;
    },

    createCategory: async (data) => {
        try {
            return await CategoryRepository.create(data);
        } catch (err) {
            if (err.code === '23505') throw new AppError(409, 'Slug hoặc danh mục đã tồn tại!');
            throw err;
        }
    },

    updateCategory: async (id, data) => {
        try {
            const updated = await CategoryRepository.update(id, data);
            if (!updated) {
                throw new AppError(404, 'Không tìm thấy danh mục hoặc không có dữ liệu hợp lệ để cập nhật');
            }
            return updated;
        } catch (err) {
            if (err.code === '23505') throw new AppError(409, 'Slug hoặc danh mục đã tồn tại!');
            throw err;
        }
    },

    deleteCategory: async (id) => {
        const deleted = await CategoryRepository.remove(id);
        if (!deleted) throw new AppError(404, 'Không tìm thấy danh mục');
        return deleted;
    },
};

module.exports = CategoryService;
