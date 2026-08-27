import React, { useState } from 'react';
import { 
  FolderPlus, 
  Edit3, 
  Trash2, 
  Layers, 
  Pill, 
  Check, 
  X, 
  AlertTriangle, 
  RefreshCw, 
  Search, 
  Sparkles,
  Tag,
  CheckCircle2,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { PharmacyCategory, Product } from '../../types/pharmacy';

interface CategoryManagementProps {
  categories: PharmacyCategory[];
  products: Product[];
  onAddCategory: (categoryData: Omit<PharmacyCategory, 'id'>) => Promise<void>;
  onUpdateCategory: (id: string, newName: string, description?: string, color?: string, oldName?: string) => Promise<void>;
  onDeleteCategory: (id: string, categoryName: string) => Promise<void>;
  onResetCategories: () => Promise<void>;
  isLoading: boolean;
  onSelectCategoryFilter?: (categoryName: string) => void;
}

const PRESET_COLORS = [
  { label: 'Xanh Dương', hex: '#3B82F6', bgClass: 'bg-blue-500' },
  { label: 'Xanh Lá', hex: '#10B981', bgClass: 'bg-emerald-500' },
  { label: 'Cam Ấm', hex: '#F59E0B', bgClass: 'bg-amber-500' },
  { label: 'Tím', hex: '#8B5CF6', bgClass: 'bg-purple-500' },
  { label: 'Hồng Đỏ', hex: '#EC4899', bgClass: 'bg-pink-500' },
  { label: 'Xanh Mòng Két', hex: '#06B6D4', bgClass: 'bg-cyan-500' },
  { label: 'Đỏ Y Tế', hex: '#EF4444', bgClass: 'bg-red-500' },
  { label: 'Xanh Biển Sâu', hex: '#0284C7', bgClass: 'bg-sky-600' }
];

export const CategoryManagement: React.FC<CategoryManagementProps> = ({
  categories,
  products,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onResetCategories,
  isLoading,
  onSelectCategoryFilter
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatColor, setNewCatColor] = useState('#3B82F6');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Edit State
  const [editingCategory, setEditingCategory] = useState<PharmacyCategory | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editColor, setEditColor] = useState('#3B82F6');
  const [updateProductsWithOldName, setUpdateProductsWithOldName] = useState(true);

  // Filtered categories
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getProductCountForCategory = (catName: string) => {
    return products.filter((p) => p.category?.toLowerCase() === catName.toLowerCase()).length;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    // Check duplicate
    const exists = categories.some(
      (c) => c.name.trim().toLowerCase() === newCatName.trim().toLowerCase()
    );
    if (exists) {
      alert(`Danh mục "${newCatName.trim()}" đã tồn tại trên hệ thống!`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddCategory({
        name: newCatName.trim(),
        description: newCatDesc.trim() || `Các loại thuốc và dược phẩm nhóm ${newCatName.trim()}`,
        color: newCatColor,
        iconName: 'Pill'
      });
      setNewCatName('');
      setNewCatDesc('');
      setActionSuccessMessage(`Đã thêm thành công danh mục mới "${newCatName.trim()}"`);
      setTimeout(() => setActionSuccessMessage(null), 3000);
    } catch (err: any) {
      alert(err?.message || 'Có lỗi xảy ra khi tạo danh mục mới');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (cat: PharmacyCategory) => {
    setEditingCategory(cat);
    setEditName(cat.name);
    setEditDesc(cat.description || '');
    setEditColor(cat.color || '#3B82F6');
    setUpdateProductsWithOldName(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editName.trim()) return;

    setIsSubmitting(true);
    try {
      const oldName = editingCategory.name;
      await onUpdateCategory(
        editingCategory.id,
        editName.trim(),
        editDesc.trim(),
        editColor,
        updateProductsWithOldName ? oldName : undefined
      );
      setEditingCategory(null);
      setActionSuccessMessage(`Đã cập nhật danh mục "${editName.trim()}"`);
      setTimeout(() => setActionSuccessMessage(null), 3000);
    } catch (err: any) {
      alert(err?.message || 'Có lỗi xảy ra khi cập nhật danh mục');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (cat: PharmacyCategory) => {
    const count = getProductCountForCategory(cat.name);
    let confirmMsg = `Bạn có chắc chắn muốn xóa danh mục "${cat.name}"?`;
    if (count > 0) {
      confirmMsg = `CẢNH BÁO: Hiện đang có ${count} sản phẩm thuốc thuộc danh mục "${cat.name}".\nNếu xóa, các sản phẩm này vẫn sẽ tồn tại nhưng sẽ không có danh mục hiển thị. Bạn có chắc muốn xóa không?`;
    }

    if (window.confirm(confirmMsg)) {
      try {
        await onDeleteCategory(cat.id, cat.name);
        setActionSuccessMessage(`Đã xóa danh mục "${cat.name}"`);
        setTimeout(() => setActionSuccessMessage(null), 3000);
      } catch (err: any) {
        alert(err?.message || 'Lỗi khi xóa danh mục');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {actionSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
          <button onClick={() => setActionSuccessMessage(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tổng số danh mục</p>
            <h3 className="text-xl font-bold text-slate-900">{categories.length}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Danh mục có chứa thuốc</p>
            <h3 className="text-xl font-bold text-emerald-600">
              {categories.filter((c) => getProductCountForCategory(c.name) > 0).length}
            </h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Danh mục chưa có thuốc</p>
            <h3 className="text-xl font-bold text-amber-600">
              {categories.filter((c) => getProductCountForCategory(c.name) === 0).length}
            </h3>
          </div>
        </div>
      </div>

      {/* Create New Category Card */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Thêm Danh Mục Thuốc Mới</h3>
              <p className="text-xs text-slate-500">Tạo nhóm phân loại mới cho danh mục sản phẩm nhà thuốc</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onResetCategories}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Khôi phục lại 8 danh mục chuẩn ban đầu"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Khôi phục chuẩn</span>
          </button>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Name */}
            <div className="md:col-span-5">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên danh mục <span className="text-rose-500">*</span>
              </label>
              <input
                id="new-category-name"
                type="text"
                required
                placeholder="VD: Thuốc Kháng Sinh, Cơ Xương Khớp..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl outline-none"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mô tả ngắn (tùy chọn)
              </label>
              <input
                type="text"
                placeholder="VD: Các loại thuốc điều trị nhiễm khuẩn..."
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl outline-none"
              />
            </div>

            {/* Color Tag */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Màu sắc nhận diện
              </label>
              <div className="flex items-center gap-1.5 py-1">
                {PRESET_COLORS.map((col) => (
                  <button
                    key={col.hex}
                    type="button"
                    title={col.label}
                    onClick={() => setNewCatColor(col.hex)}
                    className={`w-6 h-6 rounded-full transition-transform flex items-center justify-center ${
                      newCatColor === col.hex ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: col.hex }}
                  >
                    {newCatColor === col.hex && <Check className="w-3 h-3 text-white stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              id="submit-create-category-btn"
              type="submit"
              disabled={isSubmitting || !newCatName.trim()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang thêm...' : 'Thêm Danh Mục Ngay'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Category List & Search */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Danh Sách Danh Mục Hiện Tại ({categories.length})
            </h4>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Tìm kiếm danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Categories Table / List */}
        <div className="divide-y divide-slate-100">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Không tìm thấy danh mục nào phù hợp.
            </div>
          ) : (
            filteredCategories.map((cat) => {
              const productCount = getProductCountForCategory(cat.name);
              return (
                <div 
                  key={cat.id} 
                  className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    {/* Color dot */}
                    <span 
                      className="w-4 h-4 rounded-full shrink-0 shadow-2xs" 
                      style={{ backgroundColor: cat.color || '#3B82F6' }}
                    />

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{cat.name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          productCount > 0 
                            ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {productCount} loại thuốc
                        </span>
                      </div>
                      {cat.description && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{cat.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {productCount > 0 && onSelectCategoryFilter && (
                      <button
                        type="button"
                        onClick={() => onSelectCategoryFilter(cat.name)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Xem danh sách thuốc thuộc nhóm này"
                      >
                        <span>Xem thuốc</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleStartEdit(cat)}
                      className="p-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-xl transition-colors"
                      title="Sửa tên danh mục"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(cat)}
                      className="p-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl transition-colors"
                      title="Xóa danh mục này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-600" />
                <span>Chỉnh Sửa Danh Mục: {editingCategory.name}</span>
              </h3>
              <button
                onClick={() => setEditingCategory(null)}
                className="w-7 h-7 rounded-full bg-white hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên danh mục mới <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mô tả danh mục
                </label>
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Màu sắc
                </label>
                <div className="flex items-center gap-1.5 py-1">
                  {PRESET_COLORS.map((col) => (
                    <button
                      key={col.hex}
                      type="button"
                      title={col.label}
                      onClick={() => setEditColor(col.hex)}
                      className={`w-6 h-6 rounded-full transition-transform flex items-center justify-center ${
                        editColor === col.hex ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: col.hex }}
                    >
                      {editColor === col.hex && <Check className="w-3 h-3 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Migrate existing products checkbox if name changed */}
              {editingCategory.name !== editName && getProductCountForCategory(editingCategory.name) > 0 && (
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
                  <input
                    id="update-products-category-checkbox"
                    type="checkbox"
                    checked={updateProductsWithOldName}
                    onChange={(e) => setUpdateProductsWithOldName(e.target.checked)}
                    className="mt-0.5 text-blue-600 rounded"
                  />
                  <label htmlFor="update-products-category-checkbox" className="cursor-pointer text-[11px] leading-relaxed">
                    Tự động cập nhật <strong>{getProductCountForCategory(editingCategory.name)} thuốc</strong> đang thuộc danh mục "{editingCategory.name}" sang tên danh mục mới "{editName}".
                  </label>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !editName.trim()}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
