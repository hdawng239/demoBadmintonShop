const PostRepository = require('../repositories/postRepository');
const AppError = require('../utils/AppError');

// SERVICE = nghiệp vụ Post: phân trang, kiểm tra tồn tại, map lỗi nghiệp vụ.
const PostService = {
    getAllPosts: async (page = 1, limit = 10, search = '') => {
        const { rows, totalItems } = await PostRepository.findAll(page, limit, search);
        return {
            data: rows,
            pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: page,
                limit,
            },
        };
    },

    getPostById: async (id) => {
        const post = await PostRepository.findById(id);
        if (!post) throw new AppError(404, 'Không tìm thấy bài viết');
        return post;
    },

    createPost: async (data) => {
        try {
            return await PostRepository.create(data);
        } catch (err) {
            if (err.code === '23505') throw new AppError(409, 'Slug bài viết đã tồn tại!');
            throw err;
        }
    },

    updatePost: async (id, data) => {
        try {
            const updated = await PostRepository.update(id, data);
            if (!updated) {
                throw new AppError(404, 'Không tìm thấy bài viết hoặc không có dữ liệu hợp lệ để cập nhật');
            }
            return updated;
        } catch (err) {
            if (err.code === '23505') throw new AppError(409, 'Slug bài viết đã tồn tại!');
            throw err;
        }
    },

    deletePost: async (id) => {
        const deleted = await PostRepository.remove(id);
        if (!deleted) throw new AppError(404, 'Không tìm thấy bài viết');
        return deleted;
    },
};

module.exports = PostService;
