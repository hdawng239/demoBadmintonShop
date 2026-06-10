const express = require('express');
const router = express.Router();
const variantController = require('../controllers/variantController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.get('/product/:productId', variantController.getVariantsByProduct);
router.post('/', verifyToken, isAdmin, variantController.createVariant);
router.put('/:id', verifyToken, isAdmin, variantController.updateVariant);
router.delete('/:id', verifyToken, isAdmin, variantController.deleteVariant);

module.exports = router;
