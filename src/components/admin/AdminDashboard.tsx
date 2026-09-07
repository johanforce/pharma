import React from 'react';
import {
  ShoppingBag,
  LogOut,
  Store,
  ShieldCheck,
  RefreshCw,
  ClipboardList,
  Database,
  CheckCircle2,
  AlertTriangle,
  ServerOff,
  Link2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFirebaseConnection } from '../../context/FirebaseConnectionContext';
import { Order, OrderStatus } from '../../types/pharmacy';
import { OrderManagement } from './OrderManagement';
import { UrlShortenerModal } from '../common/UrlShortenerModal';

interface AdminDashboardProps {
  orders: Order[];
  onUpdateOrderStatus: (id: string, newStatus: OrderStatus) => Promise<void>;
  onCreateOrder?: (orderData: Partial<Order>) => Promise<void>;
  onUpdateOrder?: (id: string, orderData: Partial<Order>) => Promise<void>;
  onDeleteOrder?: (id: string) => Promise<void>;
  onSwitchToClient: () => void;
  isLoading: boolean;
  onRefreshOrders?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
                                                                orders,
                                                                onUpdateOrderStatus,
                                                                onCreateOrder,
                                                                onUpdateOrder,
                                                                onDeleteOrder,
                                                                onSwitchToClient,
                                                                isLoading,
                                                                onRefreshOrders
                                                              }) => {
  const { adminUser, logout } = useAuth();
  const {
    status,
    isConnected,
    projectId,
    latencyMs,
    isChecking,
    checkConnection,
    errorMessage
  } = useFirebaseConnection();

  const isGreen = status === 'connected' && isConnected;
  const isRed = status === 'error' || (!isConnected && status !== 'checking');
  const newOrdersCount = orders.filter((o) => o.status === 'mới').length;
  const [isShortenerOpen, setIsShortenerOpen] = React.useState(false);

  return (
      <div className="min-h-[85vh] bg-slate-100/60 rounded-3xl border border-slate-200 overflow-hidden flex flex-col md:flex-row shadow-sm">
        {/* Admin Sidebar */}
        <aside className="w-full md:w-64 bg-slate-900 text-slate-300 p-5 flex flex-col justify-between shrink-0 border-r border-slate-800">
          <div className="space-y-6">
            {/* Admin Header */}
            <div className="pb-4 border-b border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">Hệ Thống Quản Trị</h2>
                <p className="text-[11px] text-teal-400 font-medium">Quản lý Đơn Hàng v2.0</p>
              </div>
            </div>

            {/* Navigation Menu - Focused solely on Order Management */}
            <nav className="space-y-1.5">
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Nghiệp Vụ Đơn Hàng
              </div>

              <div className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 text-white shadow-xs">
                <div className="flex items-center gap-2.5">
                  <ClipboardList className="w-4 h-4" />
                  <span>Quản Lý Đơn Hàng</span>
                </div>
                {newOrdersCount > 0 ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500 text-white animate-pulse">
                  {newOrdersCount} mới
                </span>
                ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-white/20 text-white">
                  {orders.length}
                </span>
                )}
              </div>

              {/* Firebase Live Connection Status Box in Admin Sidebar */}
              <div className={`p-3 rounded-xl border transition-all text-xs ${
                  isGreen
                      ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                      : isRed
                          ? 'bg-rose-950/60 border-rose-800 text-rose-200 animate-pulse'
                          : 'bg-amber-950/40 border-amber-800/60 text-amber-200'
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Database className="w-3.5 h-3.5" />
                    <span>Kết Nối Firebase</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                      isGreen
                          ? 'bg-emerald-500 text-slate-900'
                          : isRed
                              ? 'bg-rose-600 text-white'
                              : 'bg-amber-500 text-slate-900'
                  }`}>
                  {isGreen ? 'BÁO XANH' : isRed ? 'BÁO ĐỎ' : 'KIỂM TRA'}
                </span>
                </div>

                <div className="text-[11px] opacity-90 space-y-0.5">
                  <p>Project: <span className="font-mono font-bold text-white">{projectId}</span></p>
                  <p>Đơn trong DB: <span className="font-bold text-white">{orders.length} đơn thực</span></p>
                  {latencyMs !== undefined && <p>Độ trễ: <span className="font-mono text-emerald-400">{latencyMs}ms</span></p>}
                  <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-700/50">
                    {isGreen ? '✓ 100% dữ liệu thực tế (Zero fake)' : '✗ Ngưng tải để tránh fake data'}
                  </p>
                </div>

                <button
                    type="button"
                    onClick={() => checkConnection()}
                    disabled={isChecking}
                    className="mt-2.5 w-full py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
                  <span>{isChecking ? 'Đang ping...' : 'Ping kiểm tra'}</span>
                </button>
              </div>

              <div className="p-3 mt-4 bg-slate-800/40 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                Dữ liệu thuốc và danh mục được đồng bộ tự động từ Google Sheet. Trang quản trị này tập trung vào xử lý, thêm, sửa và xóa đơn đặt hàng của khách.
              </div>
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
                <p className="text-xs font-bold text-white truncate">{adminUser?.email || 'admin@pharmacare.vn'}</p>
                <p className="text-[10px] text-teal-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Quản trị đơn hàng
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              {onRefreshOrders && (
                  <button
                      type="button"
                      onClick={onRefreshOrders}
                      className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Làm mới đơn</span>
                  </button>
              )}

              <button
                  id="admin-shorten-link-btn"
                  type="button"
                  onClick={() => setIsShortenerOpen(true)}
                  className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  title="Tạo liên kết rút gọn tương tự Bit.ly"
              >
                <Link2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Tạo Link Rút Gọn</span>
              </button>

              <button
                  id="admin-switch-to-client-btn"
                  type="button"
                  onClick={onSwitchToClient}
                  className="w-full py-2 px-3 bg-blue-700/80 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Xem Trang Khách Mua</span>
              </button>

              <button
                  type="button"
                  onClick={() => logout()}
                  className="w-full py-2 px-3 hover:bg-rose-950/60 text-rose-400 hover:text-rose-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất Admin</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Admin View Container */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6">
          {/* Firebase Live Status Card in Admin Header */}
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              isGreen
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : isRed
                      ? 'bg-rose-50 border-rose-300 text-rose-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-start sm:items-center gap-3">
              <div className={`p-2 rounded-xl shrink-0 ${
                  isGreen ? 'bg-emerald-100 text-emerald-700' : isRed ? 'bg-rose-100 text-rose-700 animate-bounce' : 'bg-amber-100 text-amber-700'
              }`}>
                {isGreen ? <CheckCircle2 className="w-5 h-5" /> : isRed ? <ServerOff className="w-5 h-5" /> : <Database className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                    isGreen
                        ? 'bg-emerald-600 text-white'
                        : isRed
                            ? 'bg-rose-600 text-white'
                            : 'bg-amber-600 text-white'
                }`}>
                  {isGreen ? 'BÁO XANH: ĐÃ KẾT NỐI' : isRed ? 'BÁO ĐỎ: MẤT KẾT NỐI' : 'ĐANG KIỂM TRA'}
                </span>
                  <h3 className="text-xs sm:text-sm font-bold">
                    Firebase Firestore: <span className="font-mono underline">{projectId}</span>
                  </h3>
                </div>
                <p className="text-xs opacity-85 mt-0.5 leading-relaxed">
                  {isGreen ? (
                      <>
                        Đang đồng bộ trực tiếp thời gian thực. Tổng số <strong className="font-bold">{orders.length} đơn hàng thực</strong> được lưu trữ trong Firestore.
                        <span className="font-semibold text-emerald-800"> (Cam kết 0% Fake Data)</span>
                        {latencyMs !== undefined && <span className="ml-1 text-[11px] text-emerald-700 font-mono">[{latencyMs}ms]</span>}
                      </>
                  ) : isRed ? (
                      <>
                        Không có kết nối tới cơ sở dữ liệu Firebase. <strong className="font-extrabold text-rose-700">Hệ thống kiên quyết không hiển thị dữ liệu giả lập (Fake Data)</strong>.
                        {errorMessage && <span className="block text-[11px] font-mono mt-0.5 text-rose-600">{errorMessage}</span>}
                      </>
                  ) : (
                      'Đang kiểm tra trạng thái kết nối tới máy chủ Firestore...'
                  )}
                </p>
              </div>
            </div>

            <button
                type="button"
                onClick={() => checkConnection()}
                disabled={isChecking}
                className={`self-end sm:self-center shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                    isGreen
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Đang ping...' : 'Ping kiểm tra'}</span>
            </button>
          </div>

          <OrderManagement
              orders={orders}
              onUpdateStatus={onUpdateOrderStatus}
              onCreateOrder={onCreateOrder}
              onUpdateOrder={onUpdateOrder}
              onDeleteOrder={onDeleteOrder}
              isLoading={isLoading}
          />
        </main>

        {/* URL Shortener Modal */}
        <UrlShortenerModal
            isOpen={isShortenerOpen}
            onClose={() => setIsShortenerOpen(false)}
        />
      </div>
  );
};
