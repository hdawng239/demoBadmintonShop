const express = require('express');
const router = express.Router();
const { verifyToken, optionalVerifyToken, isAdmin } = require('../middlewares/authMiddleware');
const { expensiveOperationLimiter, aiBudgetLimiter } = require('../middlewares/rateLimiter');
const aiConcurrency = require('../middlewares/aiConcurrency');
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, searchByImage } = require('../controllers/productController');

router.get('/', optionalVerifyToken, getAllProducts);
router.post('/search-image', expensiveOperationLimiter, aiBudgetLimiter, aiConcurrency, searchByImage);
router.get('/:id', optionalVerifyToken, getProductById);
router.post('/', verifyToken, isAdmin, createProduct);
router.put('/:id', verifyToken, isAdmin, updateProduct);
router.delete('/:id', verifyToken, isAdmin, deleteProduct);
module.exports = router;
