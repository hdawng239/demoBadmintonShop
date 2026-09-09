const express = require('express');
const router = express.Router();
const { getAllPosts, getPostById, createPost, updatePost, deletePost } = require('../controllers/postController');

const { verifyToken, optionalVerifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.get('/', optionalVerifyToken, getAllPosts);
router.get('/:id', optionalVerifyToken, getPostById);
router.post('/', verifyToken, isAdmin, createPost);
router.put('/:id', verifyToken, isAdmin, updatePost);
router.delete('/:id', verifyToken, isAdmin, deletePost);

module.exports = router;
