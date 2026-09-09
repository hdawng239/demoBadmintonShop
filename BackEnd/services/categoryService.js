const CategoryRepository = require('../repositories/categoryRepository');
const AppError = require('../utils/AppError');

const slugify = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 140);

const normalizeCategory = (data, partial = false) => {
    const normalized = {};
    if (!partial || data.name !== undefined) {
        if (typeof data.name !== 'string' || !data.name.trim() || data.name.trim().length > 120) {
            throw new AppError(400, 'Tên danh mục không hợp lệ');
        }
        normalized.name = data.name.trim();
        if (!partial) normalized.slug = slugify(data.slug || normalized.name);
    } else if (data.slug !== undefined) {
        normalized.slug = slugify(data.slug);
    }
    if (!normalized.slug && (!partial || data.slug !== undefined)) {
        throw new AppError(400, 'Không thể tạo slug hợp lệ cho danh mục');
    }
    if (data.parent_id !== undefined) {
        const parentId = data.parent_id === null || data.parent_id === '' ? null : Number(data.parent_id);
        if (parentId !== null && (!Number.isInteger(parentId) || parentId <= 0)) {
            throw new AppError(400, 'Danh mục cha không hợp lệ');
        }
        normalized.parent_id = parentId;
    }
    return normalized;
};

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
        const normalized = normalizeCategory(data);
        try {
            return await CategoryRepository.create(normalized);
        } catch (err) {
            if (err.code === '23505') throw new AppError(409, 'Slug hoặc danh mục đã tồn tại!');
            throw err;
        }
    },

    updateCategory: async (id, data) => {
        const normalized = normalizeCategory(data, true);
        if (normalized.parent_id !== undefined && normalized.parent_id !== null) {
            if (Number(id) === normalized.parent_id || await CategoryRepository.wouldCreateCycle(id, normalized.parent_id)) {
                throw new AppError(400, 'Danh mục cha tạo thành vòng lặp phân cấp');
            }
        }
        try {
            const updated = await CategoryRepository.update(id, normalized);
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
