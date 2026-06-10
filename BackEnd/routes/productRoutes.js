const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, searchByImage } = require('../controllers/productController');

router.get('/', getAllProducts);
router.post('/search-image', searchByImage);
router.get('/:id', getProductById);
router.post('/', verifyToken, isAdmin, createProduct);
router.put('/:id', verifyToken, isAdmin, updateProduct);
router.delete('/:id', verifyToken, isAdmin, deleteProduct);
module.exports = router;