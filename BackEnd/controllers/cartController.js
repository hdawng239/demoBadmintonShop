const asyncHandler = require('../utils/asyncHandler');
const CartService = require('../services/cartService');

// CONTROLLER = chỉ đọc dữ liệu từ request, gọi service, trả response.
const getMyCart = asyncHandler(async (req, res) => {
    const cart = await CartService.getMyCart(req.user.id);
    res.status(200).json(cart);
});

const createCart = asyncHandler(async (req, res) => {
    const cart = await CartService.createCart(req.body.user_id);
    res.status(201).json(cart);
});

const clearCart = asyncHandler(async (req, res) => {
    const deleted = await CartService.clearCart(req.params.id);
    res.status(200).json(deleted);
});

const addItemToCart = asyncHandler(async (req, res) => {
    const item = await CartService.addItemToCart(req.body);
    res.status(201).json(item);
});

const updateItemQuantity = asyncHandler(async (req, res) => {
    const item = await CartService.updateItemQuantity(req.params.id, req.body.quantity);
    res.status(200).json(item);
});

const removeItem = asyncHandler(async (req, res) => {
    const deleted = await CartService.removeItemFromCart(req.params.id);
    res.status(200).json(deleted);
});

module.exports = { getMyCart, createCart, clearCart, addItemToCart, updateItemQuantity, removeItem };
