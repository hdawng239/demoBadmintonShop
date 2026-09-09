const BrandRepository = require('../repositories/brandRepository');
const AppError = require('../utils/AppError');

const normalizeBrand = (data, partial = false) => {
    const result = {};
    if (!partial || data.name !== undefined) {
        if (typeof data.name !== 'string' || !data.name.trim() || data.name.trim().length > 120) {
            throw new AppError(400, 'Tên thương hiệu không hợp lệ');
        }
        result.name = data.name.trim();
    }
    for (const [field, max] of [['logo_url', 2000], ['description', 2000]]) {
        if (data[field] !== undefined) {
            if (data[field] !== null && typeof data[field] !== 'string') throw new AppError(400, `${field} không hợp lệ`);
            if (String(data[field] || '').length > max) throw new AppError(400, `${field} vượt quá giới hạn`);
            result[field] = data[field]?.trim() || null;
        }
    }
    return result;
};

const BrandService = {
    getAllBrands: () => BrandRepository.findAll(),

    getBrandById: async (id) => {
        const brand = await BrandRepository.findById(id);
        if (!brand) throw new AppError(404, 'Không tìm thấy thương hiệu');
        return brand;
    },

    createBrand: async (data) => {
        const normalized = normalizeBrand(data);
        try {
            return await BrandRepository.create(normalized);
        } catch (err) {
            if (err.code === '23505') throw new AppError(409, 'Tên thương hiệu đã tồn tại!');
            throw err;
        }
    },

    updateBrand: async (id, data) => {
        const normalized = normalizeBrand(data, true);
        try {
            const updated = await BrandRepository.update(id, normalized);
            if (!updated) {
                throw new AppError(404, 'Không tìm thấy thương hiệu hoặc không có dữ liệu hợp lệ để cập nhật');
            }
            return updated;
        } catch (err) {
            if (err.code === '23505') throw new AppError(409, 'Tên thương hiệu đã tồn tại!');
            throw err;
        }
    },

    deleteBrand: async (id) => {
        const deleted = await BrandRepository.remove(id);
        if (!deleted) throw new AppError(404, 'Không tìm thấy thương hiệu');
        return deleted;
    },
};

module.exports = BrandService;
