const ProductRepository = require('../repositories/productRepository');
const { analyzeProductImage } = require('./aiService');
const AppError = require('../utils/AppError');

// SERVICE = tầng nghiệp vụ: kiểm tra điều kiện, điều phối repository, gọi AI service.
const ProductService = {
    getAllProducts: (page, limit, categoryId, brandId, keyword, minPrice, maxPrice, sortBy, isActive = true) =>
        ProductRepository.findPaginated(page, limit, categoryId, brandId, keyword, minPrice, maxPrice, sortBy, isActive),

    getProductById: async (id) => {
        const product = await ProductRepository.findById(id);
        if (!product) throw new AppError(404, 'Không tìm thấy sản phẩm');
        product.variants = await ProductRepository.findVariantsByProductId(id);
        return product;
    },

    createProduct: async (data) => {
        const newProduct = await ProductRepository.create(data);
        // Tự động tạo variant mặc định
        await ProductRepository.createDefaultVariant(newProduct.id);
        return newProduct;
    },

    updateProduct: async (id, data) => {
        const updated = await ProductRepository.update(id, data);
        if (!updated) throw new AppError(404, 'Không tìm thấy sản phẩm hoặc không có dữ liệu hợp lệ để cập nhật');
        return updated;
    },

    deleteProduct: async (id) => {
        const deleted = await ProductRepository.remove(id);
        if (!deleted) throw new AppError(404, 'Không tìm thấy sản phẩm');
        return deleted;
    },

    searchByImage: async (base64Image) => {
        const productList = await ProductRepository.findCatalogForSearch();
        const geminiResult = await analyzeProductImage(base64Image, productList);
        return geminiResult;
    },
};

module.exports = ProductService;
