import React, { useState } from 'react';
import { 
  Pill, 
  ShoppingBag, 
  Database, 
  LogOut, 
  Store, 
  ShieldCheck, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  ExternalLink,
  Server,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  FolderTree
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Product, Order, OrderStatus, PharmacyCategory } from '../../types/pharmacy';
import { ProductManagement } from './ProductManagement';
import { CategoryManagement } from './CategoryManagement';
import { OrderManagement } from './OrderManagement';
import { FirebaseConnectionStatus, FIREBASE_CONFIG } from '../../services/firebase';

interface AdminDashboardProps {
  products: Product[];
  categories: PharmacyCategory[];
  orders: Order[];
  onAddProduct: (productData: Omit<Product, 'id'>) => Promise<void>;
  onUpdateProduct: (product: Product) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onResetDefault: () => Promise<void>;
  onAddCategory: (categoryData: Omit<PharmacyCategory, 'id'>) => Promise<void>;
  onUpdateCategory: (id: string, newName: string, description?: string, color?: string, oldName?: string) => Promise<void>;
  onDeleteCategory: (id: string, categoryName: string) => Promise<void>;
  onResetCategories: () => Promise<void>;
  onUpdateOrderStatus: (id: string, newStatus: OrderStatus) => Promise<void>;
  onSwitchToClient: () => void;
  isLoading: boolean;
  connectionStatus?: FirebaseConnectionStatus;
  onRetryConnection?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  categories,
  orders,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onResetDefault,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onResetCategories,
  onUpdateOrderStatus,
  onSwitchToClient,
  isLoading,
  connectionStatus,
  onRetryConnection
}) => {
  const { adminUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'orders' | 'database'>('products');
  const [categoryFilterFromNav, setCategoryFilterFromNav] = useState<string>('Tất cả');
  const [isPushingData, setIsPushingData] = useState(false);

  const newOrdersCount = orders.filter((o) => o.status === 'mới').length;

  const handlePushSampleData = async () => {
    setIsPushingData(true);
    try {
      await onResetDefault();
    } finally {
      setIsPushingData(false);
    }
  };

  const handleNavigateToCategoryProducts = (catName: string) => {
    setCategoryFilterFromNav(catName);
    setActiveTab('products');
  };

  return (
    <div className="min-h-[85vh] bg-slate-100/60 rounded-3xl border border-slate-200 overflow-hidden flex flex-col md:flex-row shadow-sm">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 p-5 flex flex-col justify-between shrink-0 border-r border-slate-800">
        <div className="space-y-6">
          {/* Admin Header */}
          <div className="pb-4 border-b border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <Pill className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Hệ Thống Quản Trị</h2>
              <p className="text-[11px] text-teal-400 font-medium">PharmaCare Admin v1.0</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1.5">
            {/* Tab 1: Products */}
            <button
              id="admin-nav-products-btn"
              type="button"
              onClick={() => {
                setCategoryFilterFromNav('Tất cả');
                setActiveTab('products');
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'products'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Pill className="w-4 h-4" />
                <span>Quản Lý Thuốc</span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                  activeTab === 'products' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {products.length}
              </span>
            </button>

            {/* Tab 2: Categories */}
            <button
              id="admin-nav-categories-btn"
              type="button"
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'categories'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FolderTree className="w-4 h-4" />
                <span>Quản Lý Danh Mục</span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                  activeTab === 'categories' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {categories.length}
              </span>
            </button>

            {/* Tab 3: Orders */}
            <button
              id="admin-nav-orders-btn"
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'orders'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4" />
                <span>Quản Lý Đơn Hàng</span>
              </div>
              {newOrdersCount > 0 ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500 text-white animate-pulse">
                  {newOrdersCount} mới
                </span>
              ) : (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                    activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {orders.length}
                </span>
              )}
            </button>

            {/* Tab 4: Database */}
            <button
              id="admin-nav-database-btn"
              type="button"
              onClick={() => setActiveTab('database')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'database'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4" />
                <span>Cơ Sở Dữ Liệu & Cloud</span>
              </div>
              <span className={`w-2 h-2 rounded-full ${
                connectionStatus?.status === 'connected' 
                  ? 'bg-emerald-400' 
                  : connectionStatus?.status === 'error'
                  ? 'bg-rose-400 animate-pulse'
                  : 'bg-amber-400 animate-spin'
              }`}></span>
            </button>
          </nav>
        </div>

        {/* Bottom User & Switchers */}
        <div className="pt-6 border-t border-slate-800 space-y-3">
          {/* User Info */}
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">
              AD
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{adminUser?.email || ''}</p>
              <p className="text-[10px] text-teal-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Quản trị viên
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <button
              type="button"
              onClick={onSwitchToClient}
              className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Xem Trang Khách Mua</span>
            </button>

            <button
              type="button"
              onClick={() => logout()}
              className="w-full py-2 px-3 hover:bg-rose-950/60 text-rose-400 hover:text-rose-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất Admin</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin View Container */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6">
        {/* Top View Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {activeTab === 'products' && 'Quản Lý Thuốc & Kho Dược Phẩm'}
              {activeTab === 'categories' && 'Quản Lý Danh Mục Thuốc'}
              {activeTab === 'orders' && 'Quản Lý & Xử Lý Đơn Đặt Hàng'}
              {activeTab === 'database' && 'Cơ Sở Dữ Liệu Firebase blogperzz'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeTab === 'products' && 'Thêm, sửa, xóa, tải ảnh thuốc và theo dõi số lượng tồn kho'}
              {activeTab === 'categories' && 'Thêm mới, đổi tên, xóa và tổ chức các nhóm danh mục thuốc'}
              {activeTab === 'orders' && 'Xem chi tiết khách hàng và cập nhật tiến độ xử lý đơn thuốc'}
              {activeTab === 'database' && 'Trạng thái kết nối máy chủ Firebase và đồng bộ Firestore collections'}
            </p>
          </div>

          {/* Database Indicator Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-slate-200 text-xs shadow-2xs">
            <span className={`w-2.5 h-2.5 rounded-full ${
              connectionStatus?.status === 'connected'
                ? 'bg-emerald-500'
                : connectionStatus?.status === 'error'
                ? 'bg-rose-500 animate-pulse'
                : 'bg-amber-500 animate-spin'
            }`}></span>
            <span className="text-slate-600 font-medium">Firebase ({FIREBASE_CONFIG.projectId}):</span>
            <span className={`font-bold ${
              connectionStatus?.status === 'connected'
                ? 'text-emerald-700'
                : connectionStatus?.status === 'error'
                ? 'text-rose-700'
                : 'text-amber-700'
            }`}>
              {connectionStatus?.status === 'connected' 
                ? 'Đã kết nối thành công' 
                : connectionStatus?.status === 'error'
                ? 'Lỗi kết nối'
                : 'Đang kiểm tra...'}
            </span>
          </div>
        </div>

        {/* Tab 1: Product Management */}
        {activeTab === 'products' && (
          <ProductManagement
            products={products}
            categories={categories}
            activeCategoryFilter={categoryFilterFromNav}
            onCategoryFilterChange={setCategoryFilterFromNav}
            onAddNewCategory={async (catName) => {
              await onAddCategory({
                name: catName,
                description: `Các loại thuốc nhóm ${catName}`,
                color: '#3B82F6',
                iconName: 'Pill'
              });
            }}
            onAddProduct={onAddProduct}
            onUpdateProduct={onUpdateProduct}
            onDeleteProduct={onDeleteProduct}
            onResetDefault={onResetDefault}
            isLoading={isLoading}
          />
        )}

        {/* Tab 2: Category Management */}
        {activeTab === 'categories' && (
          <CategoryManagement
            categories={categories}
            products={products}
            onAddCategory={onAddCategory}
            onUpdateCategory={onUpdateCategory}
            onDeleteCategory={onDeleteCategory}
            onResetCategories={onResetCategories}
            isLoading={isLoading}
            onSelectCategoryFilter={handleNavigateToCategoryProducts}
          />
        )}

        {/* Tab 3: Order Management */}
        {activeTab === 'orders' && (
          <OrderManagement
            orders={orders}
            onUpdateStatus={onUpdateOrderStatus}
            isLoading={isLoading}
          />
        )}

        {/* Tab 4: Database & Cloud Integration */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            {/* Status Card */}
            <div className={`p-6 rounded-3xl border shadow-2xs space-y-4 ${
              connectionStatus?.status === 'connected'
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : connectionStatus?.status === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-950'
                : 'bg-sky-50 border-sky-200 text-sky-950'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${
                    connectionStatus?.status === 'connected' ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}>
                    {connectionStatus?.status === 'connected' ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <AlertTriangle className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold">
                      {connectionStatus?.status === 'connected'
                        ? 'Đã kết nối hoàn tất đến Firebase Firestore'
                        : connectionStatus?.status === 'error'
                        ? 'Không thể kết nối đến máy chủ Firestore'
                        : 'Đang kiểm tra kết nối...'}
                    </h3>
                    <p className="text-xs opacity-90 mt-0.5">
                      {connectionStatus?.status === 'connected'
                        ? `Máy chủ "${FIREBASE_CONFIG.projectId}" đang hoạt động bình thường. Đã tải ${connectionStatus.productCount} sản phẩm và ${categories.length} danh mục.`
                        : connectionStatus?.errorMessage || 'Vui lòng kiểm tra quyền Firestore Rules.'}
                    </p>
                  </div>
                </div>

                {onRetryConnection && (
                  <button
                    type="button"
                    onClick={onRetryConnection}
                    className="px-3.5 py-2 bg-white text-slate-800 hover:bg-slate-100 rounded-xl text-xs font-bold border border-slate-200 shadow-2xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Kiểm tra lại</span>
                  </button>
                )}
              </div>
            </div>

            {/* Collections Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Collection</span>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md">
                    /products
                  </span>
                </div>
                <h4 className="text-2xl font-bold text-slate-900">{products.length}</h4>
                <p className="text-xs text-slate-500">Sản phẩm thuốc trong cơ sở dữ liệu</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Collection</span>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-md">
                    /categories
                  </span>
                </div>
                <h4 className="text-2xl font-bold text-slate-900">{categories.length}</h4>
                <p className="text-xs text-slate-500">Danh mục thuốc đang hoạt động</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Collection</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md">
                    /orders
                  </span>
                </div>
                <h4 className="text-2xl font-bold text-slate-900">{orders.length}</h4>
                <p className="text-xs text-slate-500">Đơn hàng đã được ghi nhận</p>
              </div>
            </div>

            {/* Action Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Đồng Bộ & Khôi Phục Dữ Liệu Mẫu</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Đẩy toàn bộ 8 sản phẩm thuốc mẫu và 8 danh mục chuẩn vào Firestore của bạn.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isPushingData}
                    onClick={onResetCategories}
                    className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Khôi phục Danh mục</span>
                  </button>
                  <button
                    id="admin-push-sample-data-btn"
                    type="button"
                    disabled={isPushingData}
                    onClick={handlePushSampleData}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-all flex items-center gap-2"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>{isPushingData ? 'Đang đẩy dữ liệu...' : 'Nạp dữ liệu thuốc mẫu'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

