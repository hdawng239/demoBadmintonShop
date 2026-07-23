const express = require('express');
const router = express.Router();
const { getAllBrands, getBrandById, createBrand, updateBrand, deleteBrand } = require('../controllers/brandController');
const { handleBrandValidation } = require('../middlewares/validationMiddleware');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.get('/', getAllBrands);
router.get('/:id', getBrandById);
router.post('/', verifyToken, isAdmin, handleBrandValidation, createBrand);
router.put('/:id', verifyToken, isAdmin, updateBrand); // Chỉ admin được phép sửa đổi
router.delete('/:id', verifyToken, isAdmin, deleteBrand); // Chỉ admin được phép xóa

module.exports = router;