const express = require('express');
const router = express.Router();
const { getAllPosts, getPostById, createPost, updatePost, deletePost } = require('../controllers/postController');

const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

// Quản lý Tin tức
router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.post('/', verifyToken, isAdmin, createPost);
router.put('/:id', verifyToken, isAdmin, updatePost);
router.delete('/:id', verifyToken, isAdmin, deletePost);

module.exports = router;