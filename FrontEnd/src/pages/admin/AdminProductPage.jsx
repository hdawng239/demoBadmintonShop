import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Pagination from '../../components/Pagination';
import { Edit, Trash2, Plus, Image as ImageIcon, Package, X } from 'lucide-react';
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

  // Variant Modal State
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProductForVariants, setSelectedProductForVariants] = useState(null);
  const [variants, setVariants] = useState([]);
  
  // Variant Form Data
  const defaultVariantForm = { id: null, variant_name: '', stock_quantity: 10, price_modifier: 0, sizeAttr: '', colorAttr: '' };
  const [variantForm, setVariantForm] = useState(defaultVariantForm);

  const openVariantModal = async (product) => {
    setSelectedProductForVariants(product);
    setVariantForm(defaultVariantForm);
    setShowVariantModal(true);
    await fetchVariants(product.id);
  };

  const fetchVariants = async (productId) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || `http://localhost:5000/api`}/variants/product/${productId}`);
      setVariants(res.data.data);
    } catch (err) {
      console.error("Lỗi fetch variants", err);
    }
  };

  const getAttributeKeys = () => {
    if (variants && variants.length > 0) {
      for (const v of variants) {
        if (v.attributes) {
          const attrs = typeof v.attributes === 'string' ? JSON.parse(v.attributes) : v.attributes;
          const keys = Object.keys(attrs);
          if (keys.length > 0) {
            const sizeKey = keys.find(k => k !== 'Màu sắc') || 'Kích cỡ';
            return { sizeKey, colorKey: 'Màu sắc' };
          }
        }
      }
    }
    if (selectedProductForVariants) {
      const catId = selectedProductForVariants.category_id;
      if (catId === 1) {
        return { sizeKey: 'Trọng lượng', colorKey: 'Màu sắc' };
      }
    }
    return { sizeKey: 'Kích cỡ', colorKey: 'Màu sắc' };
  };

  const handleSubmitVariant = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Đóng gói attributes dùng khóa động
      const { sizeKey, colorKey } = getAttributeKeys();
      const attributes = {};
      if (variantForm.sizeAttr) attributes[sizeKey] = variantForm.sizeAttr;
      if (variantForm.colorAttr) attributes[colorKey] = variantForm.colorAttr;
      
      const payload = {
        product_id: selectedProductForVariants.id,
        variant_name: variantForm.variant_name || [variantForm.sizeAttr, variantForm.colorAttr].filter(Boolean).join(' - ') || 'Mặc định',
        stock_quantity: variantForm.stock_quantity,
        price_modifier: variantForm.price_modifier,
        attributes: Object.keys(attributes).length > 0 ? attributes : null
      };

      if (variantForm.id) {
        // Cập nhật
        await axios.put(`${import.meta.env.VITE_API_URL || `http://localhost:5000/api`}/variants/${variantForm.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Thêm mới
        await axios.post(`${import.meta.env.VITE_API_URL || `http://localhost:5000/api`}/variants`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      setVariantForm(defaultVariantForm);
      fetchVariants(selectedProductForVariants.id);
    } catch (err) {
      alert("Lỗi lưu phân loại");
    }
  };

  const handleEditVariantClick = (v) => {
    const { sizeKey, colorKey } = getAttributeKeys();
    let sizeAttr = '';
    let colorAttr = '';
    if (v.attributes) {
      const attrs = typeof v.attributes === 'string' ? JSON.parse(v.attributes) : v.attributes;
      sizeAttr = attrs[sizeKey] || attrs['Kích cỡ'] || attrs['Size'] || attrs['Trọng lượng'] || '';
      colorAttr = attrs[colorKey] || attrs['Màu sắc'] || '';
    }
    setVariantForm({
      id: v.id,
      variant_name: v.variant_name,
      stock_quantity: v.stock_quantity,
      price_modifier: v.price_modifier,
      sizeAttr,
      colorAttr
    });
  };

  const handleUpdateVariantStock = async (id, stock_quantity) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL || `http://localhost:5000/api`}/variants/${id}`, {
        stock_quantity: parseInt(stock_quantity)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchVariants(selectedProductForVariants.id);
    } catch (err) {
      alert("Lỗi cập nhật tồn kho");
    }
  };

  const handleDeleteVariant = async (id) => {
    if (!window.confirm("Xóa phân loại này?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL || `http://localhost:5000/api`}/variants/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchVariants(selectedProductForVariants.id);
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi xóa phân loại");
    }
  };

  const fetchData = async (page = 1) => {
    setIsLoading(true);
    try {
      const [prodRes, catRes, brandRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || `http://localhost:5000/api`}/products?page=${page}&limit=10`),
        axios.get(`${import.meta.env.VITE_API_URL || `http://localhost:5000/api`}/categories`),
        axios.get(`${import.meta.env.VITE_API_URL || `http://localhost:5000/api`}/brands`)
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
      await axios.delete(`${import.meta.env.VITE_API_URL || `http://localhost:5000/api`}/products/${id}`, {
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
        await axios.put(`${import.meta.env.VITE_API_URL || `http://localhost:5000/api`}/products/${editProduct.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL || `http://localhost:5000/api`}/products`, payload, {
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
                          <button onClick={() => openVariantModal(product)} className="text-green-600 hover:text-green-800 bg-green-50 p-2 rounded-lg transition" title="Quản lý Tồn kho & Phân loại">
                            <Package size={18} />
                          </button>
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
      {/* Variant Management Modal */}
      {showVariantModal && selectedProductForVariants && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Package className="w-5 h-5 mr-2 text-primary" />
                Phân loại & Tồn kho: {selectedProductForVariants.name}
              </h2>
              <button onClick={() => setShowVariantModal(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {/* Add/Edit Variant Form */}
              <form onSubmit={handleSubmitVariant} className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 mb-6">
                <div className="flex gap-4 items-end flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tên Phân Loại (Gõ nếu muốn ghi đè)</label>
                    <input type="text" value={variantForm.variant_name} onChange={e => setVariantForm({...variantForm, variant_name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="Tự động tạo nếu để trống" />
                  </div>
                  <div className="w-28">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">{getAttributeKeys().sizeKey}</label>
                    <input type="text" value={variantForm.sizeAttr} onChange={e => setVariantForm({...variantForm, sizeAttr: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder={getAttributeKeys().sizeKey === 'Trọng lượng' ? '3U, 4U, 5U' : 'S, M, 39, 40'} />
                  </div>
                  <div className="w-28">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">{getAttributeKeys().colorKey}</label>
                    <input type="text" value={variantForm.colorAttr} onChange={e => setVariantForm({...variantForm, colorAttr: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="Đỏ, Xanh, Cam" />
                  </div>
                  <div className="w-32">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Cộng thêm giá</label>
                    <input type="number" required value={variantForm.price_modifier} onChange={e => setVariantForm({...variantForm, price_modifier: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                  </div>
                  <div className="w-24">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tồn kho</label>
                    <input type="number" required min="0" value={variantForm.stock_quantity} onChange={e => setVariantForm({...variantForm, stock_quantity: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                  </div>
                  <button type="submit" className="bg-primary hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm whitespace-nowrap">
                    {variantForm.id ? 'Cập nhật' : 'Thêm'}
                  </button>
                  {variantForm.id && (
                    <button type="button" onClick={() => setVariantForm(defaultVariantForm)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm whitespace-nowrap">
                      Hủy
                    </button>
                  )}
                </div>
              </form>

              {/* Variants Table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 text-gray-600 text-sm">
                    <tr>
                      <th className="p-3 font-semibold">Tên phân loại / Thuộc tính</th>
                      <th className="p-3 font-semibold text-right">Giá cộng thêm</th>
                      <th className="p-3 font-semibold text-center w-32">Tồn kho</th>
                      <th className="p-3 font-semibold text-center w-24">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map(v => {
                      let attrText = '';
                      if (v.attributes) {
                        const attrs = typeof v.attributes === 'string' ? JSON.parse(v.attributes) : v.attributes;
                        attrText = Object.entries(attrs).map(([k, val]) => `${k}: ${val}`).join(' | ');
                      }
                      
                      return (
                      <tr key={v.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                        <td className="p-3">
                          <div className="font-medium text-gray-800">{v.variant_name}</div>
                          {attrText && <div className="text-xs text-gray-500 mt-1">{attrText}</div>}
                        </td>
                        <td className="p-3 text-right text-gray-600">{v.price_modifier > 0 ? '+' : ''}{parseInt(v.price_modifier).toLocaleString()} ₫</td>
                        <td className="p-3 text-center">
                          <input 
                            type="number" 
                            className="w-20 text-center border border-gray-300 rounded-lg py-1 px-2 focus:ring-2 focus:ring-primary/20 outline-none"
                            defaultValue={v.stock_quantity}
                            onBlur={(e) => {
                              if (e.target.value != v.stock_quantity) {
                                handleUpdateVariantStock(v.id, e.target.value);
                              }
                            }}
                          />
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button onClick={() => handleEditVariantClick(v)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-1.5 rounded-lg transition" title="Sửa">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDeleteVariant(v.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded-lg transition" title="Xóa">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      );
                    })}
                    {variants.length === 0 && (
                      <tr><td colSpan="4" className="p-6 text-center text-gray-500">Chưa có phân loại nào.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end bg-gray-50">
              <button onClick={() => setShowVariantModal(false)} className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProductPage;
