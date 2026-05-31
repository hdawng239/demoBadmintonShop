import axios from 'axios';

// Đổi port cho khớp với Backend của bạn
const API_URL = `${import.meta.env.VITE_API_URL || `http://localhost:5000/api`}/products`;

export const productService = {
    // Lấy danh sách sản phẩm có phân trang và lọc
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
    // Lấy thông tin chi tiết 1 sản phẩm
    getProductById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết sản phẩm:', error);
            return null;
        }
    }
};
