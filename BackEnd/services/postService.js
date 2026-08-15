const PostRepository = require('../repositories/postRepository');
const AppError = require('../utils/AppError');

const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
};

// SERVICE = nghiệp vụ Post: phân trang, kiểm tra tồn tại, map lỗi nghiệp vụ.
const PostService = {
    getAllPosts: async (page = 1, limit = 10, search = '', publishedOnly = false) => {
        const { rows, totalItems } = await PostRepository.findAll(page, limit, search, publishedOnly);
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

    createPost: async (data, user) => {
        if (!data.title || !data.content) {
            throw new AppError(400, 'Vui lòng nhập đầy đủ tiêu đề và nội dung bài viết!');
        }

        if (!data.slug) {
            const base = slugify(data.title);
            data.slug = (base || 'tin-tuc') + '-' + Date.now().toString().slice(-6);
        }

        if (!data.author_id && user?.id) {
            data.author_id = user.id;
        }

        try {
            return await PostRepository.create(data);
        } catch (err) {
            if (err.code === '23505') {
                data.slug = slugify(data.title) + '-' + Date.now();
                return await PostRepository.create(data);
            }
            throw err;
        }
    },

    updatePost: async (id, data) => {
        if (data.title && !data.slug) {
            const base = slugify(data.title);
            data.slug = (base || 'tin-tuc') + '-' + Date.now().toString().slice(-4);
        }

        try {
            const updated = await PostRepository.update(id, data);
            if (!updated) {
                throw new AppError(404, 'Không tìm thấy bài viết hoặc không có dữ liệu hợp lệ để cập nhật');
            }
            return updated;
        } catch (err) {
            if (err.code === '23505') {
                data.slug = slugify(data.title) + '-' + Date.now();
                return await PostRepository.update(id, data);
            }
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
