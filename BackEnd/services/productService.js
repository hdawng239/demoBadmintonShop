const ProductRepository = require('../repositories/productRepository');
const { analyzeProductImage } = require('./aiService');
const AppError = require('../utils/AppError');

const validateProduct = (data, partial = false) => {
    if (!partial || data.name !== undefined) {
        if (typeof data.name !== 'string' || !data.name.trim() || data.name.length > 200) {
            throw new AppError(400, 'Tên sản phẩm không hợp lệ.');
        }
    }
    if (!partial || data.base_price !== undefined) {
        const price = Number(data.base_price);
        if (!Number.isFinite(price) || price < 0 || price > 1_000_000_000) {
            throw new AppError(400, 'Giá sản phẩm không hợp lệ.');
        }
    }
    if (data.description !== undefined && data.description !== null) {
        if (typeof data.description !== 'string' || data.description.length > 20_000) {
            throw new AppError(400, 'Mô tả sản phẩm không hợp lệ hoặc quá dài.');
        }
    }
    for (const field of ['category_id', 'brand_id']) {
        if (data[field] !== undefined && data[field] !== null && (!Number.isInteger(Number(data[field])) || Number(data[field]) <= 0)) {
            throw new AppError(400, `${field} không hợp lệ.`);
        }
    }
    if (data.is_active !== undefined && typeof data.is_active !== 'boolean') {
        throw new AppError(400, 'Trạng thái sản phẩm không hợp lệ.');
    }
    if (data.image_url !== undefined && data.image_url !== null && (typeof data.image_url !== 'string' || data.image_url.length > 2000)) {
        throw new AppError(400, 'URL ảnh sản phẩm không hợp lệ.');
    }
    if (data.technical_specs !== undefined && data.technical_specs !== null) {
        if (typeof data.technical_specs !== 'object' || Array.isArray(data.technical_specs)) {
            throw new AppError(400, 'Thông số kỹ thuật phải là một object.');
        }
        if (JSON.stringify(data.technical_specs).length > 10_000) {
            throw new AppError(400, 'Thông số kỹ thuật quá lớn.');
        }
    }
};

const ProductService = {
    getAllProducts: (page, limit, categoryId, brandId, keyword, minPrice, maxPrice, sortBy, isActive = true) =>
        ProductRepository.findPaginated(page, limit, categoryId, brandId, keyword, minPrice, maxPrice, sortBy, isActive),

    getProductById: async (id, includeInactive = false) => {
        const product = await ProductRepository.findById(id);
        if (!product || (!includeInactive && product.is_active === false)) {
            throw new AppError(404, 'Không tìm thấy sản phẩm');
        }
        product.variants = await ProductRepository.findVariantsByProductId(id);
        return product;
    },

    createProduct: async (data) => {
        validateProduct(data);
        return ProductRepository.createWithDefaultVariant({ ...data, name: data.name.trim() });
    },

    updateProduct: async (id, data) => {
        validateProduct(data, true);
        const normalized = { ...data };
        if (normalized.name !== undefined) normalized.name = normalized.name.trim();
        const updated = await ProductRepository.update(id, normalized);
        if (!updated) throw new AppError(404, 'Không tìm thấy sản phẩm hoặc không có dữ liệu hợp lệ để cập nhật');
        return updated;
    },

    deleteProduct: async (id) => {
        // Chỉ ẩn sản phẩm để giữ lịch sử đơn hàng và đánh giá.
        const deleted = await ProductRepository.update(id, { is_active: false });
        if (!deleted) throw new AppError(404, 'Không tìm thấy sản phẩm');
        return deleted;
    },

    searchByImage: async (base64Image) => {
        const productList = await ProductRepository.findCatalogForSearch();
        if (!productList || productList.length === 0) return [];
        const matchedIds = await analyzeProductImage(base64Image, productList);
        if (!matchedIds || matchedIds.length === 0) return [];
        const products = await ProductRepository.findByIds(matchedIds);
        return products;
    },
};

module.exports = ProductService;
