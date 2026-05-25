import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Pagination from '../../components/Pagination';
import { Edit, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

const AdminProductPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Form state
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '', category_id: '', brand_id: '', base_price: '', description: '', image_url: '', is_active: true,
    length: '', width: '', height: '', weight_g: ''
  });

  const fetchData = async (page = 1) => {
    setIsLoading(true);
    try {
      const [prodRes, catRes, brandRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/products?page=${page}&limit=10`),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/categories`),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/brands`)
      ]);
      
      if (prodRes.data.products) {
        setProducts(prodRes.data.products);
        setPagination({
          currentPage: prodRes.data.currentPage || 1,
          totalPages: prodRes.data.totalPages || 1
        });
      } else if (prodRes.data.data) {
        setProducts(prodRes.data.data);
        setPagination(prodRes.data.pagination);
      } else {
        setProducts(prodRes.data || []);
      }
      
      // Category API from our new pagination structure might return .data
      setCategories(catRes.data.data || catRes.data || []);
      setBrands(brandRes.data || []);
    } catch (err) {
      console.error(err);
      alert("Lỗi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData(currentPage);
    } catch (err) {
      alert("Lỗi khi xóa sản phẩm");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = { ...formData };
      
      const existingSpecs = editProduct && editProduct.technical_specs 
        ? (typeof editProduct.technical_specs === 'string' ? JSON.parse(editProduct.technical_specs) : editProduct.technical_specs) 
        : {};
        
      payload.technical_specs = {
        ...existingSpecs,
        length: parseInt(payload.length) || 0,
        width: parseInt(payload.width) || 0,
        height: parseInt(payload.height) || 0,
        weight_g: parseInt(payload.weight_g) || 0
      };
      
      delete payload.length;
      delete payload.width;
      delete payload.height;
      delete payload.weight_g;

      if (editProduct) {
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/products/${editProduct.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/products`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowModal(false);
      fetchData(currentPage);
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi lưu dữ liệu");
    }
  };

  const openAddModal = () => {
    setEditProduct(null);
    setFormData({ name: '', category_id: categories[0]?.id || '', brand_id: brands[0]?.id || '', base_price: '', description: '', image_url: '', is_active: true, length: '', width: '', height: '', weight_g: '' });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditProduct(product);
    const specs = typeof product.technical_specs === 'string' ? JSON.parse(product.technical_specs || '{}') : (product.technical_specs || {});
    setFormData({
      name: product.name,
      category_id: product.category_id,
      brand_id: product.brand_id,
      base_price: product.base_price,
      description: product.description || '',
      image_url: product.image_url || '',
      is_active: product.is_active,
      length: specs.length || '',
      width: specs.width || '',
      height: specs.height || '',
      weight_g: specs.weight_g || ''
    });
    setShowModal(true);
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Sản phẩm</h1>
          <p className="text-gray-500 text-sm mt-1">Danh sách sản phẩm trong hệ thống.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-primary hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl flex items-center transition-colors shadow-sm font-medium"
        >
          <Plus size={20} className="mr-2" /> Thêm mới
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div></div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-sm">
                    <th className="p-4 font-semibold w-16 text-center">Ảnh</th>
                    <th className="p-4 font-semibold">Tên sản phẩm</th>
                    <th className="p-4 font-semibold">Danh mục</th>
                    <th className="p-4 font-semibold">Thương hiệu</th>
                    <th className="p-4 font-semibold">Giá cơ bản</th>
                    <th className="p-4 font-semibold text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors">
                      <td className="p-4 text-center">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-12 h-12 object-cover rounded-xl shadow-sm border border-gray-100" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 border border-gray-100"><ImageIcon size={20} /></div>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-gray-800 line-clamp-2">{product.name}</td>
                      <td className="p-4 text-gray-600">{product.category_name}</td>
                      <td className="p-4 text-gray-600">{product.brand_name}</td>
                      <td className="p-4 text-primary font-bold">{parseInt(product.base_price).toLocaleString()} ₫</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button onClick={() => openEditModal(product)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-lg transition" title="Sửa">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition" title="Xóa">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-gray-500">Chưa có sản phẩm nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination pagination={pagination} onPageChange={setCurrentPage} />
        </>
      )}

      {/* Modal Thêm/Sửa */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-gray-100 flex-shrink-0 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">{editProduct ? 'Sửa Sản phẩm' : 'Thêm Sản phẩm mới'}</h2>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="productForm" onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm <span className="text-red-500">*</span></label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                  <select value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thương hiệu</label>
                  <select value={formData.brand_id} onChange={e => setFormData({...formData, brand_id: e.target.value})} className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition">
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá cơ bản <span className="text-red-500">*</span></label>
                  <input required type="number" value={formData.base_price} onChange={e => setFormData({...formData, base_price: e.target.value})} className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select value={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.value === 'true'})} className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition">
                    <option value="true">Đang bán</option>
                    <option value="false">Ngừng kinh doanh</option>
                  </select>
                </div>
                
                <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                  <div className="md:col-span-4 mb-[-8px]">
                    <h4 className="text-sm font-bold text-gray-800">Thông số Vận chuyển (GHN)</h4>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dài (cm)</label>
                    <input type="number" value={formData.length} onChange={e => setFormData({...formData, length: e.target.value})} className="w-full border border-gray-300 rounded-xl p-2 focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rộng (cm)</label>
                    <input type="number" value={formData.width} onChange={e => setFormData({...formData, width: e.target.value})} className="w-full border border-gray-300 rounded-xl p-2 focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cao (cm)</label>
                    <input type="number" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} className="w-full border border-gray-300 rounded-xl p-2 focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nặng (gram)</label>
                    <input type="number" value={formData.weight_g} onChange={e => setFormData({...formData, weight_g: e.target.value})} className="w-full border border-gray-300 rounded-xl p-2 focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Ảnh (Link từ Web khác hoặc Imgur)</label>
                  <input type="text" placeholder="https://..." value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition" />
                  {formData.image_url && (
                    <div className="mt-3 text-center border border-gray-100 rounded-xl p-3 bg-gray-50">
                      <p className="text-xs text-gray-500 mb-2 font-medium">Xem trước ảnh:</p>
                      <img src={formData.image_url} alt="Preview" className="h-32 object-contain mx-auto rounded-lg" onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=Lỗi+Ảnh'} />
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"></textarea>
                </div>
              </form>
            </div>
            
            <div className="p-5 border-t border-gray-100 flex justify-end space-x-3 flex-shrink-0 bg-gray-50 rounded-b-2xl">
              <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-white font-medium transition">Hủy</button>
              <button type="submit" form="productForm" className="px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-orange-600 shadow-sm font-medium transition">Lưu sản phẩm</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProductPage;
