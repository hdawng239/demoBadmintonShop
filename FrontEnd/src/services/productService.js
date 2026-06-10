import axios from 'axios';

// Đổi port cho khớp với Backend của bạn
const API_URL = `${import.meta.env.VITE_API_URL || `http://localhost:5000/api`}/products`;

export const productService = {
    getAllProducts: async (page = 1, limit = 8, categoryId = null, brandId = null, keyword = null) => {
        try {
            let url = `${API_URL}?page=${page}&limit=${limit}`;
            if (categoryId) url += `&categoryId=${categoryId}`;
            if (brandId) url += `&brandId=${brandId}`;
            if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
            
            const response = await axios.get(url);
            // Backup nếu API backend trả về array cũ hoặc object mới
            if (response.data && response.data.products) {
                return response.data; // Trả về nguyên object để lấy cả products và totalPages
            }
            if (response.data && response.data.data) {
                return response.data;
            }
            return response.data; 
        } catch (error) {
            console.error('Lỗi khi lấy danh sách sản phẩm:', error);
            return [];
        }
    },
    getProductById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết sản phẩm:', error);
            return null;
        }
    },
    searchByImage: async (base64Image) => {
        try {
            const response = await axios.post(`${API_URL}/search-image`, { image: base64Image });
            return response.data;
        } catch (error) {
            console.error('Lỗi khi tìm kiếm sản phẩm bằng hình ảnh:', error);
            throw error;
        }
    }
};
