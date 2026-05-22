const Post = require('../models/postModel');
const Comment = require('../models/commentModel');

const getAllPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        res.status(200).json(await Post.getAll(page, limit));
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
};

const getPostById = async (req, res) => {
    try {
        const post = await Post.getById(req.params.id);
        if (!post) return res.status(404).json({ message: "Không tìm thấy bài viết" });
        res.status(200).json(post);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const createPost = async (req, res) => {
    try { res.status(201).json(await Post.create(req.body)); } 
    catch (err) { res.status(500).json({ error: err.message }); }
};

const updatePost = async (req, res) => {
    try { res.status(200).json(await Post.update(req.params.id, req.body)); } 
    catch (err) { res.status(500).json({ error: err.message }); }
};

const deletePost = async (req, res) => {
    try { res.status(200).json(await Post.delete(req.params.id)); } 
    catch (err) { res.status(500).json({ error: err.message }); }
};

// Hàm dành riêng cho Comment
const addComment = async (req, res) => {
    try { res.status(201).json(await Comment.create({ ...req.body, post_id: req.params.postId })); } 
    catch (err) { res.status(500).json({ error: err.message }); }
};
const deleteComment = async (req, res) => {
    try { res.status(200).json(await Comment.delete(req.params.id)); } 
    catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getAllPosts, getPostById, createPost, updatePost, deletePost, addComment, deleteComment };