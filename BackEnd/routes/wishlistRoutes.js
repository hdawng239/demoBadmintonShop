const express = require('express');
const router = express.Router();
const {
    getMyWishlist,
    getMyProductIds,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
} = require('../controllers/wishlistController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, getMyWishlist);
router.get('/ids', verifyToken, getMyProductIds);
router.post('/', verifyToken, addToWishlist);
router.post('/toggle', verifyToken, toggleWishlist);
router.delete('/:productId', verifyToken, removeFromWishlist);

module.exports = router;
