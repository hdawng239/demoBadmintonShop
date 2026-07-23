const CartRepository = require('../repositories/cartRepository');
const AppError = require('../utils/AppError');

// SERVICE = tầng nghiệp vụ cho giỏ hàng.
const CartService = {
    getMyCart: async (userId) => {
        const cart = await CartRepository.findByUserId(userId);
        if (!cart) throw new AppError(404, 'Giỏ hàng trống');
        return cart;
    },

    createCart: (userId) => CartRepository.createCart(userId),

    clearCart: async (id, currentUser) => {
        const cart = await CartRepository.findCartById(id);
        if (!cart) throw new AppError(404, 'Không tìm thấy giỏ hàng');
        if (currentUser.role !== 'admin' && cart.user_id !== currentUser.id) {
            throw new AppError(403, 'Bạn không có quyền xóa giỏ hàng này!');
        }
        const deleted = await CartRepository.removeCart(id);
        return deleted;
    },

    addItemToCart: async (userId, { variant_id, quantity }) => {
        let cart = await CartRepository.findByUserId(userId);
        if (!cart) {
            cart = await CartRepository.createCart(userId);
        }
        return CartRepository.upsertItem({ cart_id: cart.id, variant_id, quantity });
    },

    updateItemQuantity: async (id, quantity, currentUser) => {
        const item = await CartRepository.findItemById(id);
        if (!item) throw new AppError(404, 'Không tìm thấy sản phẩm trong giỏ');
        if (currentUser.role !== 'admin' && item.user_id !== currentUser.id) {
            throw new AppError(403, 'Bạn không có quyền chỉnh sửa sản phẩm này!');
        }
        const updated = await CartRepository.updateItemQuantity(id, quantity);
        return updated;
    },

    removeItemFromCart: async (id, currentUser) => {
        const item = await CartRepository.findItemById(id);
        if (!item) throw new AppError(404, 'Không tìm thấy sản phẩm trong giỏ');
        if (currentUser.role !== 'admin' && item.user_id !== currentUser.id) {
            throw new AppError(403, 'Bạn không có quyền xóa sản phẩm này!');
        }
        const deleted = await CartRepository.removeItem(id);
        return deleted;
    },
};

module.exports = CartService;
