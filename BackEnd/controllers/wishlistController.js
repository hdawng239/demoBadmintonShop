const asyncHandler = require('../utils/asyncHandler');
const WishlistService = require('../services/wishlistService');
const { sendSuccess } = require('../utils/response');

// user_id luôn lấy từ token
const getMyWishlist = asyncHandler(async (req, res) => {
    const items = await WishlistService.getMyWishlist(req.user.id);
    sendSuccess(res, { data: items, legacy: { items } });
});

const getMyProductIds = asyncHandler(async (req, res) => {
    const ids = await WishlistService.getMyProductIds(req.user.id);
    sendSuccess(res, { data: ids, legacy: { productIds: ids } });
});

const addToWishlist = asyncHandler(async (req, res) => {
    const result = await WishlistService.addToWishlist(req.user.id, req.body.product_id);
    sendSuccess(res, { statusCode: 201, message: result.message, data: result, legacy: result });
});

const removeFromWishlist = asyncHandler(async (req, res) => {
    const result = await WishlistService.removeFromWishlist(req.user.id, req.params.productId);
    sendSuccess(res, { message: result.message, data: result, legacy: result });
});

const toggleWishlist = asyncHandler(async (req, res) => {
    const result = await WishlistService.toggle(req.user.id, req.body.product_id);
    sendSuccess(res, { message: result.message, data: result, legacy: result });
});

module.exports = { getMyWishlist, getMyProductIds, addToWishlist, removeFromWishlist, toggleWishlist };
