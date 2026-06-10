import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Pagination from '../../components/Pagination';
import { Edit, Trash2, Plus, Ticket, HelpCircle, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';

const AdminVoucherPage = () => {
  const [vouchers, setVouchers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    code: '',
    description: '',
    discount_type: 'fixed',
    discount_value: '',
    min_order_value: '0',
    max_discount: '',
    usage_limit: '100',
    start_date: '',
    end_date: '',
    is_active: true
  });

  const fetchVouchers = async (page = 1) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL || `http://localhost:5000/api`}/vouchers/admin?page=${page}&limit=10`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.data) {
        setVouchers(res.data.data);
        setPagination(res.data.pagination);
      } else {
        setVouchers(res.data);
      }
    } catch (err) {
      console.error("Lỗi tải voucher:", err);
      alert("Lỗi tải danh sách voucher");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers(currentPage);
  }, [currentPage]);

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const pad = (n) => String(n).padStart(2, '0');
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  const openModal = (voucher = null) => {
    if (voucher) {
      setFormData({
        id: voucher.id,
        code: voucher.code,
        description: voucher.description || '',
        discount_type: voucher.discount_type,
        discount_value: voucher.discount_value,
        min_order_value: voucher.min_order_value,
        max_discount: voucher.max_discount || '',
        usage_limit: voucher.usage_limit,
        start_date: formatDateForInput(voucher.start_date),
        end_date: formatDateForInput(voucher.end_date),
        is_active: voucher.is_active
      });
    } else {
      // Default to current date for start, and +30 days for end date
      const now = new Date();
      const nextMonth = new Date();
      nextMonth.setDate(now.getDate() + 30);
      
      setFormData({
        id: null,
        code: '',
        description: '',
        discount_type: 'fixed',
        discount_value: '',
        min_order_value: '0',
        max_discount: '',
        usage_limit: '100',
        start_date: formatDateForInput(now.toISOString()),
        end_date: formatDateForInput(nextMonth.toISOString()),
        is_active: true
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discount_value || !formData.start_date || !formData.end_date) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      alert("Ngày bắt đầu phải trước ngày hết hạn!");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null
      };

      if (formData.id) {
        await axios.put(
          `${import.meta.env.VITE_API_URL || `http://localhost:5000/api`}/vouchers/admin/${formData.id}`, 
          payload, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL || `http://localhost:5000/api`}/vouchers/admin`, 
          payload, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setShowModal(false);
      fetchVouchers(currentPage);
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi lưu voucher");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa voucher này?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${import.meta.env.VITE_API_URL || `http://localhost:5000/api`}/vouchers/admin/${id}`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchVouchers(currentPage);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa voucher");
    }
  };

  const getVoucherBadge = (type) => {
    switch (type) {
      case 'fixed': return <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-full text-xs font-bold uppercase">Giảm Tiền</span>;
      case 'percentage': return <span className="bg-purple-50 text-purple-600 border border-purple-100 px-2.5 py-1 rounded-full text-xs font-bold uppercase">Giảm %</span>;
      case 'shipping': return <span className="bg-green-50 text-green-600 border border-green-100 px-2.5 py-1 rounded-full text-xs font-bold uppercase">Freeship</span>;
      default: return <span className="bg-gray-50 text-gray-500 px-2.5 py-1 rounded-full text-xs font-bold uppercase">Khác</span>;
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Ticket className="w-6 h-6 mr-2 text-primary" />
            Quản lý Voucher
          </h1>
          <p className="text-gray-500 text-sm mt-1">Cài đặt và tạo các mã giảm giá áp dụng cho toàn cửa hàng</p>
        </div>
        <button 
          onClick={() => openModal()} 
          className="flex items-center px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-orange-600 transition shadow-sm font-bold text-sm cursor-pointer"
        >
          <Plus size={18} className="mr-2" />
          TẠO VOUCHER MỚI
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-xs font-bold uppercase">
                    <th className="p-4">Mã Voucher</th>
                    <th className="p-4">Loại Giảm Giá</th>
                    <th className="p-4">Giá Trị Giảm</th>
                    <th className="p-4">Đơn Tối Thiểu</th>
                    <th className="p-4">Đã Dùng / Giới Hạn</th>
                    <th className="p-4">Thời Gian Hoạt Động</th>
                    <th className="p-4 text-center">Trạng Thái</th>
                    <th className="p-4 text-center w-28">Hành động</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {vouchers.map(v => {
                    const isExpired = new Date() > new Date(v.end_date);
                    const isUsedUp = parseInt(v.used_count) >= parseInt(v.usage_limit);
                    
                    return (
                      <tr key={v.id} className="border-b border-gray-50 hover:bg-orange-50/20 transition-colors">
                        <td className="p-4 font-bold text-gray-800">
                          <span className="bg-gray-100 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-mono text-xs uppercase tracking-wider">
                            {v.code}
                          </span>
                          {v.description && <p className="text-xs text-gray-400 font-normal mt-2.5 max-w-xs truncate">{v.description}</p>}
                        </td>
                        <td className="p-4">{getVoucherBadge(v.discount_type)}</td>
                        <td className="p-4 font-bold text-primary">
                          {v.discount_type === 'percentage' 
                            ? `${parseFloat(v.discount_value)} %` 
                            : `${parseFloat(v.discount_value).toLocaleString()} ₫`}
                        </td>
                        <td className="p-4 text-gray-600 font-medium">
                          {parseFloat(v.min_order_value || 0).toLocaleString()} ₫
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-gray-700">{v.used_count}</span>
                            <span className="text-gray-300">/</span>
                            <span className="text-gray-400">{v.usage_limit}</span>
                          </div>
                          <div className="w-20 bg-gray-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${isUsedUp ? 'bg-red-500' : 'bg-primary'}`} 
                              style={{ width: `${Math.min(100, (v.used_count / v.usage_limit) * 100)}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="p-4 text-xs text-gray-500 space-y-1">
                          <p><span className="text-gray-400">Từ:</span> {new Date(v.start_date).toLocaleString('vi-VN')}</p>
                          <p><span className="text-gray-400">Đến:</span> {new Date(v.end_date).toLocaleString('vi-VN')}</p>
                        </td>
                        <td className="p-4 text-center">
                          {isExpired ? (
                            <span className="bg-red-50 text-red-500 px-2.5 py-1 rounded-md text-xs font-bold">Hết hạn</span>
                          ) : isUsedUp ? (
                            <span className="bg-orange-50 text-orange-500 px-2.5 py-1 rounded-md text-xs font-bold">Hết lượt</span>
                          ) : v.is_active ? (
                            <span className="bg-green-50 text-green-600 px-2.5 py-1 rounded-md text-xs font-bold flex items-center justify-center w-fit mx-auto"><CheckCircle size={12} className="mr-1" /> Active</span>
                          ) : (
                            <span className="bg-gray-50 text-gray-400 px-2.5 py-1 rounded-md text-xs font-bold flex items-center justify-center w-fit mx-auto"><XCircle size={12} className="mr-1" /> Tắt</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center space-x-3">
                            <button onClick={() => openModal(v)} className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-1.5 rounded-lg transition cursor-pointer" title="Sửa">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDelete(v.id)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg transition cursor-pointer" title="Xóa">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {vouchers.length === 0 && (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-gray-400 italic">Chưa có voucher nào được tạo.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {pagination && <Pagination pagination={pagination} onPageChange={setCurrentPage} />}
        </>
      )}

      {/* Modal form */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 my-8">
            <h2 className="text-xl font-bold mb-5 flex items-center text-gray-800">
              <Ticket className="mr-2 text-primary w-5 h-5" />
              {formData.id ? 'Cập Nhật Voucher' : 'Tạo Voucher Khuyến Mãi Mới'}
            </h2>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mã Code <span className="text-red-500">*</span></label>
                  <input 
                    required 
                    type="text" 
                    placeholder="VD: CNTT-01"
                    value={formData.code} 
                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} 
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Loại Giảm Giá</label>
                  <select 
                    value={formData.discount_type} 
                    onChange={e => setFormData({ ...formData, discount_type: e.target.value, discount_value: '', max_discount: '' })} 
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                  >
                    <option value="fixed">Giảm tiền trực tiếp (₫)</option>
                    <option value="percentage">Giảm theo phần trăm (%)</option>
                    <option value="shipping">Giảm phí ship (₫)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mô tả hiển thị</label>
                <input 
                  type="text" 
                  placeholder="VD: Giảm 200k cho đơn từ 1 triệu"
                  value={formData.description} 
                  onChange={e => setFormData({ ...formData, description: e.target.value })} 
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Giá trị giảm <span className="text-red-500">*</span>
                  </label>
                  <input 
                    required 
                    type="number" 
                    min="1"
                    placeholder={formData.discount_type === 'percentage' ? "Ví dụ: 10 (%)" : "Ví dụ: 200000 (₫)"}
                    value={formData.discount_value} 
                    onChange={e => setFormData({ ...formData, discount_value: e.target.value })} 
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tổng tiền đơn tối thiểu (₫)</label>
                  <input 
                    type="number" 
                    min="0"
                    placeholder="VD: 500000"
                    value={formData.min_order_value} 
                    onChange={e => setFormData({ ...formData, min_order_value: e.target.value })} 
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Lượt dùng tối đa</label>
                  <input 
                    required 
                    type="number" 
                    min="1"
                    placeholder="VD: 100"
                    value={formData.usage_limit} 
                    onChange={e => setFormData({ ...formData, usage_limit: e.target.value })} 
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Giảm tối đa (₫) <span className="text-gray-400 font-normal">({formData.discount_type === 'percentage' ? 'Bắt buộc' : 'Không dùng'})</span>
                  </label>
                  <input 
                    type="number" 
                    min="1"
                    disabled={formData.discount_type !== 'percentage'}
                    placeholder="VD: 50000"
                    value={formData.max_discount} 
                    onChange={e => setFormData({ ...formData, max_discount: e.target.value })} 
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition disabled:bg-gray-100 disabled:text-gray-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ngày Bắt Đầu <span className="text-red-500">*</span></label>
                  <input 
                    required 
                    type="datetime-local" 
                    value={formData.start_date} 
                    onChange={e => setFormData({ ...formData, start_date: e.target.value })} 
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ngày Hết Hạn <span className="text-red-500">*</span></label>
                  <input 
                    required 
                    type="datetime-local" 
                    value={formData.end_date} 
                    onChange={e => setFormData({ ...formData, end_date: e.target.value })} 
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 py-2">
                <input 
                  type="checkbox" 
                  id="is_active"
                  checked={formData.is_active} 
                  onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2 outline-none cursor-pointer"
                />
                <label htmlFor="is_active" className="text-sm font-semibold text-gray-700 cursor-pointer select-none">
                  Kích hoạt hoạt động (Cho phép sử dụng ngay)
                </label>
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-bold text-sm cursor-pointer">Hủy</button>
                <button type="submit" className="px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-orange-600 font-bold text-sm shadow-sm cursor-pointer">{formData.id ? 'CẬP NHẬT' : 'TẠO MỚI'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminVoucherPage;
