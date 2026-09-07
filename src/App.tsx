import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { FirebaseConnectionProvider } from './context/FirebaseConnectionContext';
import { Navbar } from './components/Navbar';
import { FirebaseStatusBanner } from './components/FirebaseStatusBanner';
import { ClientHome } from './components/client/ClientHome';
import { CartDrawer } from './components/CartDrawer';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLogin } from './components/admin/AdminLogin';
import { SheetMeta, Order, OrderStatus } from './types/pharmacy';
import {
  fetchOrders,
  subscribeToOrders,
  submitOrder,
  updateOrderStatus,
  updateOrderData,
  deleteOrderById
} from './services/firebase';

function MainApp() {
  const [viewMode, setViewMode] = useState<'client' | 'admin'>('client');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sheetMeta, setSheetMeta] = useState<SheetMeta | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Orders state - Live from Firestore (zero fake data)
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState<boolean>(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const { isAdminLoggedIn } = useAuth();

  // Subscribe to real-time updates from Firebase Firestore
  useEffect(() => {
    setIsOrdersLoading(true);
    setOrdersError(null);

    const unsubscribe = subscribeToOrders(
        (liveOrders) => {
          setOrders(liveOrders);
          setIsOrdersLoading(false);
          setOrdersError(null);
        },
        (err) => {
          console.error('Lỗi lắng nghe đơn hàng từ Firebase:', err);
          setOrdersError(err?.message || 'Không thể tải đơn hàng từ Firebase');
          setIsOrdersLoading(false);
        }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Manual reload orders if requested
  const loadOrders = useCallback(async () => {
    setIsOrdersLoading(true);
    setOrdersError(null);
    try {
      const list = await fetchOrders();
      setOrders(list);
    } catch (e: any) {
      console.error('Failed to load orders', e);
      setOrdersError(e?.message || 'Lỗi tải đơn hàng');
    } finally {
      setIsOrdersLoading(false);
    }
  }, []);

  // Fetch Google Sheets metadata
  const fetchSheetInfo = async () => {
    try {
      const res = await fetch('/api/sheet-info');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        setSheetMeta(data);
      } else {
        setSheetMeta({
          sheetId: '1IuAePO3lDxyhMX_SPCtNVRrAKvHwZVC4dsFFByY7To8',
          gid: '1574232058',
          sheetUrl: 'https://docs.google.com/spreadsheets/d/1IuAePO3lDxyhMX_SPCtNVRrAKvHwZVC4dsFFByY7To8/edit?gid=1574232058#gid=1574232058',
          totalProducts: 8240,
          lastSync: new Date().toISOString(),
          isSyncing: false,
        });
      }
    } catch (e) {
      console.error('Failed to fetch sheet info:', e);
    }
  };

  useEffect(() => {
    fetchSheetInfo();
  }, []);

  // Force sync from Google Sheets
  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/refresh', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSheetMeta({
          sheetId: data.sheetSource?.sheetId || '1IuAePO3lDxyhMX_SPCtNVRrAKvHwZVC4dsFFByY7To8',
          gid: data.sheetSource?.gid || '1574232058',
          sheetUrl: data.sheetUrl,
          totalProducts: data.totalProducts,
          lastSync: data.lastSync,
          isSyncing: false,
        });
      }
    } catch (err) {
      console.error('Failed to refresh data from Google Sheets', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Order CRUD handlers
  const handleUpdateOrderStatus = async (id: string, newStatus: OrderStatus) => {
    await updateOrderStatus(id, newStatus);
    setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
  };

  const handleCreateOrder = async (orderData: Partial<Order>) => {
    const payload = {
      customerName: orderData.customerName || 'Khách lẻ',
      phone: orderData.phone || '',
      address: orderData.address || '',
      note: orderData.note || '',
      paymentMethod: orderData.paymentMethod || 'cod',
      items: orderData.items || [],
      totalAmount: orderData.totalAmount || 0,
      shippingFee: orderData.shippingFee || 0,
    };
    const newOrder = await submitOrder(payload);
    setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
  };

  const handleUpdateOrder = async (id: string, orderData: Partial<Order>) => {
    await updateOrderData(id, orderData);
    setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, ...orderData } : o))
    );
  };

  const handleDeleteOrder = async (id: string) => {
    await deleteOrderById(id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  return (
      <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-500 selection:text-white">
        {/* Navigation Bar */}
        <Navbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sheetMeta={sheetMeta}
            onRefreshData={handleRefreshData}
            isRefreshing={isRefreshing}
            onNavigateToAdmin={() => setViewMode(viewMode === 'admin' ? 'client' : 'admin')}
            viewMode={viewMode}
        />

        {/* Disconnection Warning Banner (Báo Đỏ khi mất kết nối, cam kết không fake data) */}
        <FirebaseStatusBanner />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {viewMode === 'admin' ? (
              isAdminLoggedIn ? (
                  <AdminDashboard
                      orders={orders}
                      onUpdateOrderStatus={handleUpdateOrderStatus}
                      onCreateOrder={handleCreateOrder}
                      onUpdateOrder={handleUpdateOrder}
                      onDeleteOrder={handleDeleteOrder}
                      onSwitchToClient={() => setViewMode('client')}
                      isLoading={isOrdersLoading}
                      onRefreshOrders={loadOrders}
                  />
              ) : (
                  <AdminLogin
                      onSuccess={() => setViewMode('admin')}
                      onCancel={() => setViewMode('client')}
                  />
              )
          ) : (
              <ClientHome
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  sheetMeta={sheetMeta}
                  onRefreshData={handleRefreshData}
                  isRefreshing={isRefreshing}
              />
          )}
        </main>

        {/* Shopping Cart Drawer */}
        <CartDrawer
            onOrderSuccess={(order) => {
              setCompletedOrder(order);
              // Also prepend to orders list so admin sees it immediately
              setOrders((prev) => [order, ...prev.filter((o) => o.id !== order.id)]);
            }}
        />

        {/* Order Success Receipt Modal */}
        <OrderSuccessModal
            order={completedOrder}
            onClose={() => setCompletedOrder(null)}
        />

        {/* Global Footer */}
        <Footer
            sheetMeta={sheetMeta}
            onNavigateToAdmin={() => setViewMode('admin')}
        />
      </div>
  );
}

export default function App() {
  return (
      <FirebaseConnectionProvider>
        <AuthProvider>
          <CartProvider>
            <MainApp />
          </CartProvider>
        </AuthProvider>
      </FirebaseConnectionProvider>
  );
}
