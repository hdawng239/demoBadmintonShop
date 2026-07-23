const WishlistRepository = require('../repositories/wishlistRepository');
const ProductRepository = require('../repositories/productRepository');
const AppError = require('../utils/AppError');

const WishlistService = {
    getMyWishlist: (userId) => WishlistRepository.findByUser(userId),

    getMyProductIds: (userId) => WishlistRepository.findProductIdsByUser(userId),

    addToWishlist: async (userId, productId) => {
        if (!productId) throw new AppError(400, 'Thiếu mã sản phẩm (product_id)!');

        const product = await ProductRepository.findById(productId);
        if (!product) throw new AppError(404, 'Sản phẩm không tồn tại!');

        const added = await WishlistRepository.add(userId, productId);
        return {
            added: !!added,
            message: added ? 'Đã thêm vào danh sách yêu thích!' : 'Sản phẩm đã có trong danh sách yêu thích.',
        };
    },

    removeFromWishlist: async (userId, productId) => {
        const removed = await WishlistRepository.remove(userId, productId);
        if (!removed) throw new AppError(404, 'Sản phẩm không có trong danh sách yêu thích!');
        return { message: 'Đã xóa khỏi danh sách yêu thích!' };
    },

    // Bật/tắt yêu thích trong 1 lần gọi cho nút trái tim
    toggle: async (userId, productId) => {
        if (!productId) throw new AppError(400, 'Thiếu mã sản phẩm (product_id)!');
        const isFav = await WishlistRepository.exists(userId, productId);
        if (isFav) {
            await WishlistRepository.remove(userId, productId);
            return { isFavorite: false, message: 'Đã xóa khỏi danh sách yêu thích!' };
        }
        const product = await ProductRepository.findById(productId);
        if (!product) throw new AppError(404, 'Sản phẩm không tồn tại!');
        await WishlistRepository.add(userId, productId);
        return { isFavorite: true, message: 'Đã thêm vào danh sách yêu thích!' };
    },
};

module.exports = WishlistService;
