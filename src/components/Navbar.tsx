import React from 'react';
import { 
  ShoppingBag, 
  ShieldCheck, 
  PhoneCall, 
  Search, 
  SlidersHorizontal,
  LayoutDashboard, 
  Store,
  Pill,
  Sparkles,
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  MapPin
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FirebaseConnectionStatus } from '../services/firebase';

interface NavbarProps {
  currentView: 'client' | 'admin';
  onViewChange: (view: 'client' | 'admin') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  connectionStatus?: FirebaseConnectionStatus;
  onRetryConnection?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  searchQuery,
  onSearchChange,
  connectionStatus,
  onRetryConnection
}) => {
  const { totalItems, setIsCartOpen } = useCart();
  const { isAdminLoggedIn, adminUser, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-blue-700 via-sky-600 to-teal-600 text-white text-xs px-4 py-2 sm:py-1.5">
        <div className="max-w-7xl mx-auto flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">

          {/* Contact details stay first and are always visible, including on mobile. */}
          <div className="order-1 flex min-w-0 items-start gap-2 text-blue-50 sm:items-center">
            <PhoneCall className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300 sm:mt-0" />
            <div className="min-w-0 leading-relaxed">
              <a href="tel:0386626187" className="font-bold text-white hover:text-amber-100 transition-colors">
                SĐT: 0386 626 187
              </a>
              <span className="mx-1.5 text-white/60">•</span>
              <span className="inline-flex items-start gap-1">
                <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-amber-300" />
                <span>Số 92, Ngõ 98, Nguyễn Hưởng Dung, P. Thái Thụy, Hưng Yên</span>
              </span>
            </div>
          </div>

          {/* Server Status Indicator */}
          <div className="order-2 flex items-center gap-3 sm:order-none">
            {connectionStatus && (
              <div className="flex max-w-full items-center gap-1.5 rounded-full bg-black/20 px-2.5 py-0.5 text-[11px] backdrop-blur-xs transition-colors hover:bg-black/30">
                <Database className="w-3 h-3 text-sky-200" />
                {connectionStatus.status === 'checking' ? (
                  <span className="text-sky-200 flex items-center gap-1">
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Đang kết nối blogperzz...
                  </span>
                ) : connectionStatus.status === 'connected' ? (
                  <span className="text-emerald-200 flex items-center gap-1 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="hidden sm:inline">Firebase: <strong>{connectionStatus.projectId}</strong> </span>
                    <span className="text-white/80">({connectionStatus.productCount} thuốc)</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={onRetryConnection}
                    className="text-rose-200 hover:text-white flex items-center gap-1 font-medium underline"
                    title="Bấm để thử kết nối lại"
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
                    Lỗi kết nối ({connectionStatus.projectId}) - Thử lại
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 flex-wrap items-center justify-between gap-2 py-2 sm:h-18 sm:flex-nowrap sm:gap-4 sm:py-0">
          {/* Logo */}
          <div 
            id="brand-logo-btn"
            onClick={() => onViewChange('client')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <Pill className="w-6 h-6 transform -rotate-45" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">Pharma</span>
                <span className="text-lg font-bold tracking-tight text-blue-600 sm:text-xl">Care</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-teal-50 text-teal-700 font-semibold border border-teal-200 rounded">
                  24/7
                </span>
              </div>
              <p className="hidden text-[11px] font-medium text-slate-500 sm:block sm:-mt-0.5">Hệ Thống Dược Phẩm & Y Tế Trực Tuyến</p>
            </div>
          </div>

          {/* Search Bar (When in client view) */}
          {currentView === 'client' && (
            <div className="flex-1 max-w-xl mx-4 hidden md:block">
              <div className="relative">
                <input
                  id="client-search-input"
                  type="text"
                  placeholder="Tìm tên thuốc, hoạt chất, triệu chứng (VD: Panadol, Cảm cúm, Tiêu chảy...)"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/15 outline-none transition-all"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-full w-4 h-4 flex items-center justify-center"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="order-3 flex w-full items-center justify-between gap-2 sm:order-none sm:w-auto sm:gap-3">
            {/* Toggle View: Client vs Admin */}
            <div className="flex flex-1 items-center rounded-xl border border-slate-200 bg-slate-100 p-1 text-xs font-medium sm:flex-none">
              <button
                id="toggle-client-view-btn"
                onClick={() => onViewChange('client')}
                className={`flex flex-1 items-center justify-center gap-1.5 px-2 py-2 rounded-lg transition-all sm:flex-none sm:px-3 sm:py-1.5 ${
                  currentView === 'client'
                    ? 'bg-white text-blue-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Trang Khách Mua</span>
              </button>

              <button
                id="toggle-admin-view-btn"
                onClick={() => onViewChange('admin')}
                className={`flex flex-1 items-center justify-center gap-1.5 px-2 py-2 rounded-lg transition-all sm:flex-none sm:px-3 sm:py-1.5 ${
                  currentView === 'admin'
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Trang Quản Trị</span>
                {isAdminLoggedIn && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                )}
              </button>
            </div>

            {/* Cart Button (Client View) */}
            {currentView === 'client' && (
              <button
                id="open-cart-drawer-btn"
                onClick={() => setIsCartOpen(true)}
                className="relative flex shrink-0 items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition-all group hover:bg-blue-100 sm:px-3.5"
              >
                <ShoppingBag className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline font-semibold">Giỏ hàng</span>
                {totalItems > 0 ? (
                  <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-xs">
                    {totalItems}
                  </span>
                ) : (
                  <span className="bg-blue-200/80 text-blue-800 text-xs px-1.5 py-0.2 rounded-full">
                    0
                  </span>
                )}
              </button>
            )}

            {/* Admin Logout button if logged in and in admin view */}
            {currentView === 'admin' && isAdminLoggedIn && (
              <button
                id="admin-logout-btn"
                onClick={() => logout()}
                className="text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-xl border border-rose-200 font-medium transition-colors"
              >
                Đăng xuất
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        {currentView === 'client' && (
          <div className="pb-3 md:hidden">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm thuốc, dược phẩm, vỉ/hộp..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 focus:bg-white text-sm text-slate-900 placeholder:text-slate-400 rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
