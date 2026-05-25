import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Pagination from '../../components/Pagination';
import { Trash2, MessageSquare, Star } from 'lucide-react';
import axios from 'axios';

const AdminReviewPage = () => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchReviews = async (page = 1) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/reviews?page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.data) {
        setReviews(res.data.data);
        setPagination(res.data.pagination);
      } else {
        setReviews(res.data);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi tải danh sách đánh giá");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(currentPage);
  }, [currentPage]);

  const handleDelete = async (id) => {
    if (!window.confirm("Cảnh báo: Bạn có chắc chắn muốn xóa đánh giá này?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReviews(currentPage);
    } catch (err) {
      alert("Lỗi khi xóa đánh giá");
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={14} fill={i < rating ? "currentColor" : "none"} />
        ))}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Đánh giá</h1>
        <p className="text-gray-500 text-sm mt-1">Xem và quản lý (xóa) các bình luận, đánh giá của người dùng về sản phẩm.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div></div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-sm">
                    <th className="p-4 font-semibold w-16">ID</th>
                    <th className="p-4 font-semibold w-48">Người dùng</th>
                    <th className="p-4 font-semibold w-64">Sản phẩm</th>
                    <th className="p-4 font-semibold w-32">Đánh giá</th>
                    <th className="p-4 font-semibold">Nội dung</th>
                    <th className="p-4 font-semibold text-center w-24">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map(review => (
                    <tr key={review.id} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors items-start">
                      <td className="p-4 text-gray-600 font-medium align-top">#{review.id}</td>
                      <td className="p-4 align-top">
                        <div className="font-bold text-gray-800">{review.reviewer_name || 'Người dùng ẩn danh'}</div>
                        <div className="text-xs text-gray-400 mt-1">{new Date(review.created_at).toLocaleString('vi-VN')}</div>
                      </td>
                      <td className="p-4 align-top">
                        <div className="text-gray-700 font-medium line-clamp-2">{review.product_name || 'Sản phẩm không xác định'}</div>
                      </td>
                      <td className="p-4 align-top">
                        {renderStars(review.rating)}
                      </td>
                      <td className="p-4 align-top">
                        <div className="text-gray-600 bg-gray-50 p-3 rounded-xl text-sm border border-gray-100">
                          {review.comment || <span className="italic text-gray-400">Không có bình luận chữ</span>}
                        </div>
                      </td>
                      <td className="p-4 text-center align-top">
                        <div className="flex items-center justify-center space-x-2">
                          <button onClick={() => handleDelete(review.id)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition" title="Xóa đánh giá">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {reviews.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-gray-500">Chưa có đánh giá nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination pagination={pagination} onPageChange={setCurrentPage} />
        </>
      )}
    </AdminLayout>
  );
};

export default AdminReviewPage;
