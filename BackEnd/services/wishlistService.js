const WishlistRepository = require('../repositories/wishlistRepository');
const ProductRepository = require('../repositories/productRepository');
const AppError = require('../utils/AppError');

const WishlistService = {
    getMyWishlist: (userId) => WishlistRepository.findByUser(userId),

    getMyProductIds: (userId) => WishlistRepository.findProductIdsByUser(userId),

    addToWishlist: async (userId, productId) => {
        const validProductId = Number(productId);
        if (!Number.isInteger(validProductId) || validProductId <= 0) throw new AppError(400, 'Mã sản phẩm không hợp lệ!');

        const product = await ProductRepository.findById(validProductId);
        if (!product || product.is_active === false) throw new AppError(404, 'Sản phẩm không tồn tại!');

        const added = await WishlistRepository.add(userId, validProductId);
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

    toggle: async (userId, productId) => {
        const validProductId = Number(productId);
        if (!Number.isInteger(validProductId) || validProductId <= 0) throw new AppError(400, 'Mã sản phẩm không hợp lệ!');
        const isFav = await WishlistRepository.exists(userId, validProductId);
        if (isFav) {
            await WishlistRepository.remove(userId, validProductId);
            return { isFavorite: false, message: 'Đã xóa khỏi danh sách yêu thích!' };
        }
        const product = await ProductRepository.findById(validProductId);
        if (!product || product.is_active === false) throw new AppError(404, 'Sản phẩm không tồn tại!');
        await WishlistRepository.add(userId, validProductId);
        return { isFavorite: true, message: 'Đã thêm vào danh sách yêu thích!' };
    },
};

module.exports = WishlistService;
