const BrandRepository = require('../repositories/brandRepository');
const AppError = require('../utils/AppError');

// SERVICE = tầng nghiệp vụ: kiểm tra điều kiện, điều phối repository, ném lỗi nghiệp vụ rõ ràng.
// Không biết gì về req/res (HTTP).
const BrandService = {
    getAllBrands: () => BrandRepository.findAll(),

    getBrandById: async (id) => {
        const brand = await BrandRepository.findById(id);
        if (!brand) throw new AppError(404, 'Không tìm thấy thương hiệu');
        return brand;
    },

    createBrand: async (data) => {
        try {
            return await BrandRepository.create(data);
        } catch (err) {
            if (err.code === '23505') throw new AppError(409, 'Tên thương hiệu đã tồn tại!');
            throw err;
        }
    },

    updateBrand: async (id, data) => {
        try {
            const updated = await BrandRepository.update(id, data);
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
