import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Pill, 
  Package, 
  AlertTriangle, 
  Layers, 
  RefreshCw, 
  CheckCircle2,
  Filter
} from 'lucide-react';
import { Product, PharmacyCategory } from '../../types/pharmacy';
import { CATEGORIES as DEFAULT_CATEGORIES } from '../../data/initialProducts';
import { formatVND } from '../../utils/formatters';
import { ProductFormModal } from './ProductFormModal';

interface ProductManagementProps {
  products: Product[];
  categories?: PharmacyCategory[];
  onAddNewCategory?: (name: string) => Promise<void>;
  onAddProduct: (productData: Omit<Product, 'id'>) => Promise<void>;
  onUpdateProduct: (product: Product) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onResetDefault: () => Promise<void>;
  isLoading: boolean;
  activeCategoryFilter?: string;
  onCategoryFilterChange?: (cat: string) => void;
}

export const ProductManagement: React.FC<ProductManagementProps> = ({
  products,
  categories,
  onAddNewCategory,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onResetDefault,
  isLoading,
  activeCategoryFilter,
  onCategoryFilterChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [internalCategoryFilter, setInternalCategoryFilter] = useState('Tất cả');
  const categoryFilter = activeCategoryFilter !== undefined ? activeCategoryFilter : internalCategoryFilter;
  const setCategoryFilter = onCategoryFilterChange || setInternalCategoryFilter;

  const [selectedProductForEdit, setSelectedProductForEdit] = useState<Product | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const categoryNames = useMemo(() => {
    if (categories && categories.length > 0) {
      return ['Tất cả', ...categories.map((c) => c.name)];
    }
    return DEFAULT_CATEGORIES;
  }, [categories]);

  // Filtered List
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.activeIngredient && p.activeIngredient.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchCategory = categoryFilter === 'Tất cả' || p.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [products, searchTerm, categoryFilter]);

  // Inventory stats
  const totalStockUnits = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const lowStockCount = products.filter((p) => (p.stock || 0) <= 10).length;
  const totalCategoriesCount = categories ? categories.length : (DEFAULT_CATEGORIES.length - 1);

  const handleOpenAddModal = () => {
    setSelectedProductForEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setSelectedProductForEdit(product);
    setIsFormModalOpen(true);
  };

  const handleDeleteConfirm = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm thuốc này khỏi kho và cơ sở dữ liệu Firestore?')) {
      setDeletingId(id);
      try {
        await onDeleteProduct(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Stat Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Tổng loại thuốc</p>
              <h3 className="text-xl font-bold text-slate-900">{products.length}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Tổng số lượng tồn</p>
              <h3 className="text-xl font-bold text-slate-900">{totalStockUnits}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Sắp hết hàng (≤10)</p>
              <h3 className="text-xl font-bold text-amber-600">{lowStockCount}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Danh mục thuốc</p>
              <h3 className="text-xl font-bold text-slate-900">{totalCategoriesCount}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Action Header & Search Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <input
              id="admin-product-search"
              type="text"
              placeholder="Tìm theo tên thuốc, hoạt chất..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
            >
              {categoryNames.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onResetDefault}
            title="Khôi phục danh mục mẫu"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dữ liệu mẫu</span>
          </button>

          <button
            id="admin-add-product-btn"
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Thuốc Mới</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-3 px-4">Ảnh & Tên Thuốc</th>
                <th className="py-3 px-4">Danh Mục</th>
                <th className="py-3 px-4 text-right">Giá Bán</th>
                <th className="py-3 px-4 text-center">Đơn Vị</th>
                <th className="py-3 px-4 text-center">Tồn Kho</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Đang tải danh sách thuốc từ Firestore...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="space-y-3 max-w-sm mx-auto">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto">
                        <Pill className="w-6 h-6 -rotate-45" />
                      </div>
                      <p className="text-xs font-bold text-slate-800">Cơ sở dữ liệu Firestore hiện chưa có thuốc nào</p>
                      <p className="text-[11px] text-slate-500">
                        Nhấn nút bên dưới để thêm sản phẩm thuốc thực tế đầu tiên vào kho lưu trữ của bạn.
                      </p>
                      <button
                        type="button"
                        onClick={handleOpenAddModal}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thêm Thuốc Mới Ngay</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    Không tìm thấy sản phẩm nào phù hợp với bộ lọc "{categoryFilter}".
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Image & Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                          <img
                            src={prod.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80'}
                            alt={prod.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 max-w-xs sm:max-w-sm">
                          <h4 className="font-bold text-slate-900 truncate">{prod.name}</h4>
                          <p className="text-[11px] text-slate-500 truncate">
                            {prod.activeIngredient || prod.description}
                          </p>
                          {prod.requiresPrescription && (
                            <span className="inline-block mt-0.5 text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                              Kê đơn
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-medium rounded-lg text-[11px]">
                        {prod.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 text-right font-bold text-blue-700 font-mono">
                      {formatVND(prod.price)}
                    </td>

                    {/* Unit */}
                    <td className="py-3 px-4 text-center font-medium text-slate-600">
                      {prod.unit}
                    </td>

                    {/* Stock */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          prod.stock <= 0
                            ? 'bg-rose-100 text-rose-700'
                            : prod.stock <= 10
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {prod.stock <= 0 ? 'Hết hàng' : prod.stock}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          id={`edit-product-btn-${prod.id}`}
                          type="button"
                          onClick={() => handleOpenEditModal(prod)}
                          className="p-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-lg transition-colors"
                          title="Sửa thông tin thuốc"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`delete-product-btn-${prod.id}`}
                          type="button"
                          disabled={deletingId === prod.id}
                          onClick={() => handleDeleteConfirm(prod.id)}
                          className="p-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-lg transition-colors"
                          title="Xóa thuốc"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Form Modal */}
      {isFormModalOpen && (
        <ProductFormModal
          product={selectedProductForEdit}
          categories={categories}
          onAddNewCategory={onAddNewCategory}
          onClose={() => setIsFormModalOpen(false)}
          onSave={async (data) => {
            if ('id' in data) {
              await onUpdateProduct(data as Product);
            } else {
              await onAddProduct(data);
            }
          }}
        />
      )}
    </div>
  );
};
