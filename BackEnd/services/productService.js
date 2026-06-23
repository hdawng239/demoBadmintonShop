const ProductRepository = require('../repositories/productRepository');
const { analyzeProductImage } = require('./aiService');
const AppError = require('../utils/AppError');

// SERVICE = tầng nghiệp vụ: kiểm tra điều kiện, điều phối repository, gọi AI service.
// Không biết gì về req/res (HTTP).
const ProductService = {
    getAllProducts: (page, limit, categoryId, brandId, keyword) =>
        ProductRepository.findPaginated(page, limit, categoryId, brandId, keyword),

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

    // ── Tìm kiếm bằng hình ảnh ─────────────────────────────
    searchByImage: async (base64Image) => {
        // 1. Lấy danh mục sản phẩm
        const productList = await ProductRepository.findCatalogForSearch();
        if (productList.length === 0) return [];

        // 2. Gọi AI phân tích
        const matchedIds = await analyzeProductImage(base64Image, productList);
        if (!matchedIds || matchedIds.length === 0) return [];

        // 3. Lấy chi tiết sản phẩm khớp
        const detailsRows = await ProductRepository.findByIds(matchedIds);

        // 4. Sắp xếp theo thứ tự AI trả về
        return matchedIds
            .map((id) => detailsRows.find((p) => p.id === id))
            .filter(Boolean);
    },
};

module.exports = ProductService;
