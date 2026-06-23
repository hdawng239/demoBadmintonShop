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

    clearCart: async (id) => {
        const deleted = await CartRepository.removeCart(id);
        if (!deleted) throw new AppError(404, 'Không tìm thấy giỏ hàng');
        return deleted;
    },

    addItemToCart: (data) => CartRepository.upsertItem(data),

    updateItemQuantity: async (id, quantity) => {
        const updated = await CartRepository.updateItemQuantity(id, quantity);
        if (!updated) throw new AppError(404, 'Không tìm thấy sản phẩm trong giỏ');
        return updated;
    },

    removeItemFromCart: async (id) => {
        const deleted = await CartRepository.removeItem(id);
        if (!deleted) throw new AppError(404, 'Không tìm thấy sản phẩm trong giỏ');
        return deleted;
    },
};

module.exports = CartService;
