import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Pagination from '../../components/Pagination';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Ticket, 
  Calendar, 
  Percent, 
  DollarSign, 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  Tag,
  Truck,
  Check
} from 'lucide-react';
import axios from 'axios';

const AdminVoucherPage = () => {
  const [vouchers, setVouchers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_amount: '0',
    max_discount_amount: '',
    usage_limit: '100',
    start_date: '',
    end_date: '',
    is_active: true
  });

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchVouchers = async (page = 1) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/vouchers/admin?page=${page}&limit=10`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.data) {
        setVouchers(res.data.data);
        setPagination(res.data.pagination || res.data.meta || null);
      } else {
        setVouchers(res.data || []);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách voucher:', err);
      setVouchers([]);
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
        code: voucher.code || '',
        discount_type: voucher.discount_type === 'fixed' ? 'fixed_amount' : (voucher.discount_type || 'percentage'),
        discount_value: voucher.discount_value || '',
        min_order_amount: voucher.min_order_value !== undefined ? voucher.min_order_value : (voucher.min_order_amount || '0'),
        max_discount_amount: voucher.max_discount !== undefined ? voucher.max_discount : (voucher.max_discount_amount || ''),
        usage_limit: voucher.usage_limit || '',
        start_date: formatDateForInput(voucher.start_date),
        end_date: formatDateForInput(voucher.end_date),
        is_active: voucher.is_active !== undefined ? voucher.is_active : true
      });
    } else {
      const now = new Date();
      const nextMonth = new Date();
      nextMonth.setDate(now.getDate() + 30);

      setFormData({
        id: null,
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        min_order_amount: '0',
        max_discount_amount: '',
        usage_limit: '100',
        start_date: formatDateForInput(now.toISOString()),
        end_date: formatDateForInput(nextMonth.toISOString()),
        is_active: true
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || formData.discount_value === '' || !formData.start_date || !formData.end_date) {
      showToast("Vui lòng điền đầy đủ thông tin bắt buộc!", "error");
      return;
    }

    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      showToast("Ngày bắt đầu phải trước ngày hết hạn!", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        code: formData.code.toUpperCase().trim(),
        discount_type: formData.discount_type,
        discount_value: Number(formData.discount_value || 0),
        min_order_value: Number(formData.min_order_amount) || 0,
        max_discount: formData.discount_type === 'percentage' && formData.max_discount_amount ? Number(formData.max_discount_amount) : null,
        usage_limit: formData.usage_limit ? Number(formData.usage_limit) : 100,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        is_active: formData.is_active
      };

      if (formData.id) {
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/vouchers/admin/${formData.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast("Cập nhật voucher thành công!");
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/vouchers/admin`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast("Tạo voucher mới thành công!");
      }
      setShowModal(false);
      fetchVouchers(currentPage);
    } catch (err) {
      showToast(err.response?.data?.message || "Lỗi lưu voucher", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa voucher này?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/vouchers/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast("Đã xóa voucher thành công!");
      fetchVouchers(currentPage);
    } catch (err) {
      showToast("Lỗi khi xóa voucher", "error");
    }
  };

  const filteredVouchers = vouchers.filter(v => {
    const codeMatch = v.code?.toLowerCase().includes(searchTerm.toLowerCase());
    if (!codeMatch) return false;
    if (filterType === 'ALL') return true;
    if (filterType === 'percentage') return v.discount_type === 'percentage';
    if (filterType === 'fixed_amount') return v.discount_type === 'fixed' || v.discount_type === 'fixed_amount';
    if (filterType === 'shipping') return v.discount_type === 'shipping' || v.discount_type === 'freeship' || v.discount_type === 'free_shipping';
    return true;
  });

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            <Ticket className="text-[#ea580c]" size={24} /> Quản Lý Khuyến Mãi (Vouchers)
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">Tạo và quản lý các mã giảm giá %, giảm tiền và Freeship</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-[#ea580c] hover:bg-[#c2410c] text-white px-5 py-2.5 rounded-xl flex items-center justify-center transition shadow-md shadow-orange-500/20 font-bold text-xs uppercase tracking-wider cursor-pointer shrink-0"
        >
          <Plus size={18} className="mr-1.5" /> Thêm Voucher Mới
        </button>
      </div>

      {toastMessage && (
        <div className={`p-4 mb-6 rounded-2xl text-xs flex items-center gap-2 border shadow-xs animate-in fade-in ${
          toastMessage.type === 'error' 
            ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300' 
            : 'bg-lime-50 dark:bg-lime-950/50 border-lime-200 dark:border-lime-800 text-lime-800 dark:text-lime-300'
        }`}>
          {toastMessage.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-[#12131a] p-4 rounded-2xl shadow-xs border border-zinc-200 dark:border-zinc-800 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Tìm theo mã voucher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl text-xs outline-none focus:border-[#ea580c] transition"
          />
          <Search size={16} className="absolute left-3.5 top-2.5 text-zinc-400" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'percentage', label: 'Giảm %' },
            { key: 'fixed_amount', label: 'Giảm tiền' },
            { key: 'shipping', label: 'Freeship' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilterType(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterType === tab.key 
                  ? 'bg-[#ea580c] text-white shadow-xs' 
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vouchers Table */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ea580c]"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#12131a] rounded-2xl shadow-xs border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 dark:bg-[#181a24] border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Mã Voucher</th>
                  <th className="p-4">Loại & Mức giảm</th>
                  <th className="p-4">Đơn tối thiểu</th>
                  <th className="p-4">Đã dùng / Giới hạn</th>
                  <th className="p-4">Thời gian hiệu lực</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredVouchers.length > 0 ? (
                  filteredVouchers.map((v) => {
                    const isExpired = new Date(v.end_date) < new Date();
                    const isUsedUp = v.usage_limit && v.used_count >= v.usage_limit;
                    const isFreeship = v.discount_type === 'shipping' || v.discount_type === 'freeship' || v.discount_type === 'free_shipping';
                    const isPercent = v.discount_type === 'percentage';

                    return (
                      <tr key={v.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="p-4">
                          <span className="font-mono font-black text-xs px-2.5 py-1 bg-orange-50 dark:bg-orange-950/40 text-[#ea580c] rounded-lg border border-orange-200 dark:border-orange-800">
                            {v.code}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white">
                            {isFreeship ? (
                              <span className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400">
                                <Truck size={14} /> Freeship {Number(v.discount_value) > 0 ? `tối đa ${Number(v.discount_value).toLocaleString('vi-VN')} ₫` : '100%'}
                              </span>
                            ) : isPercent ? (
                              <span className="inline-flex items-center gap-1 text-[#ea580c]">
                                <Percent size={14} /> Giảm {v.discount_value}% {v.max_discount && `(Tối đa ${Number(v.max_discount).toLocaleString('vi-VN')} ₫)`}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                <DollarSign size={14} /> Giảm {Number(v.discount_value).toLocaleString('vi-VN')} ₫
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-4 text-zinc-600 dark:text-zinc-400">
                          {Number(v.min_order_value || v.min_order_amount || 0) > 0 
                            ? `${Number(v.min_order_value || v.min_order_amount).toLocaleString('vi-VN')} ₫` 
                            : 'Không giới hạn'}
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-800 dark:text-zinc-200">{v.used_count || 0}</span>
                            <span className="text-zinc-400">/</span>
                            <span className="text-zinc-600 dark:text-zinc-400">{v.usage_limit || '∞'}</span>
                          </div>
                          {v.usage_limit && (
                            <div className="w-24 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full mt-1.5 overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${isUsedUp ? 'bg-rose-500' : 'bg-[#ea580c]'}`} 
                                style={{ width: `${Math.min(100, ((v.used_count || 0) / v.usage_limit) * 100)}%` }}
                              />
                            </div>
                          )}
                        </td>

                        <td className="p-4 text-[11px] text-zinc-500 dark:text-zinc-400 space-y-0.5">
                          <p>Từ: {new Date(v.start_date).toLocaleDateString('vi-VN')}</p>
                          <p>Đến: {new Date(v.end_date).toLocaleDateString('vi-VN')}</p>
                        </td>

                        <td className="p-4">
                          {isExpired ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 uppercase">
                              Hết hạn
                            </span>
                          ) : isUsedUp ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 uppercase">
                              Hết lượt
                            </span>
                          ) : v.is_active ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-lime-50 dark:bg-lime-950/40 text-lime-700 dark:text-lime-400 border border-lime-200 dark:border-lime-800 uppercase">
                              Hoạt động
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-400 uppercase">
                              Đang khóa
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => openModal(v)}
                            className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Chỉnh sửa"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(v.id)}
                            className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="p-12 text-center text-zinc-400 dark:text-zinc-500">
                      Chưa có voucher nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {pagination && (
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
              <Pagination 
                pagination={pagination} 
                onPageChange={(page) => setCurrentPage(page)} 
              />
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#12131a] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-4">
              <h2 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2">
                <Tag size={20} className="text-[#ea580c]" /> {formData.id ? 'Chỉnh Sửa Voucher' : 'Tạo Voucher Khuyến Mãi Mới'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-bold p-1 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-bold uppercase mb-1">Mã Voucher (Code) *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: YONEX20, FREESHIP30, SALET5"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full p-2.5 bg-zinc-50 dark:bg-[#181a24] border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl font-mono uppercase outline-none focus:border-[#ea580c] font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-bold uppercase mb-1">Loại giảm giá</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-[#181a24] border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl outline-none focus:border-[#ea580c] font-medium"
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed_amount">Số tiền cố định (₫)</option>
                    <option value="shipping">Miễn phí vận chuyển (Freeship)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-bold uppercase mb-1">
                    {formData.discount_type === 'shipping' 
                      ? 'Mức giảm ship tối đa (₫)' 
                      : formData.discount_type === 'percentage' 
                      ? 'Phần trăm giảm (%) *' 
                      : 'Số tiền giảm (₫) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder={
                      formData.discount_type === 'shipping' 
                        ? 'VD: 30000 (0 = Freeship 100%)' 
                        : formData.discount_type === 'percentage' 
                        ? 'VD: 15 (15%)' 
                        : 'VD: 50000 (50k)'
                    }
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-[#181a24] border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl outline-none focus:border-[#ea580c]"
                  />
                </div>
              </div>

              {formData.discount_type === 'shipping' && (
                <div className="p-3 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-xl text-[11px] text-sky-800 dark:text-sky-300">
                  💡 <strong>Freeship:</strong> Mã này sẽ tự động giảm thẳng vào phí vận chuyển GHN khi khách tiến hành thanh toán đơn hàng.
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-bold uppercase mb-1">Đơn tối thiểu (₫)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 = Không yêu cầu"
                    value={formData.min_order_amount}
                    onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-[#181a24] border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl outline-none focus:border-[#ea580c]"
                  />
                </div>

                {formData.discount_type === 'percentage' ? (
                  <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 font-bold uppercase mb-1">Giảm tối đa (₫)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Để trống = Không giới hạn"
                      value={formData.max_discount_amount}
                      onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                      className="w-full p-2.5 bg-zinc-50 dark:bg-[#181a24] border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl outline-none focus:border-[#ea580c]"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 font-bold uppercase mb-1">Tổng số lượt sử dụng</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="VD: 100 lượt"
                      value={formData.usage_limit}
                      onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                      className="w-full p-2.5 bg-zinc-50 dark:bg-[#181a24] border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl outline-none focus:border-[#ea580c]"
                    />
                  </div>
                )}
              </div>

              {formData.discount_type === 'percentage' && (
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-bold uppercase mb-1">Tổng số lượt sử dụng</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="VD: 100 lượt"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-[#181a24] border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl outline-none focus:border-[#ea580c]"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-bold uppercase mb-1">Bắt đầu *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-[#181a24] border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl outline-none focus:border-[#ea580c]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-bold uppercase mb-1">Hết hạn *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-[#181a24] border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl outline-none focus:border-[#ea580c]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="voucher_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 accent-[#ea580c] cursor-pointer"
                />
                <label htmlFor="voucher_active" className="text-zinc-700 dark:text-zinc-300 font-bold select-none cursor-pointer">
                  Kích hoạt sử dụng voucher này ngay
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#ea580c] text-white rounded-xl hover:bg-[#c2410c] shadow-md shadow-orange-500/20 font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : (formData.id ? 'Cập nhật' : 'Tạo mới')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminVoucherPage;
