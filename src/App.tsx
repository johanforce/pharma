import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { ClientHome } from './components/client/ClientHome';
import { CartDrawer } from './components/CartDrawer';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { Footer } from './components/Footer';
import { SheetMeta, Order } from './types/pharmacy';

export default function App() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sheetMeta, setSheetMeta] = useState<SheetMeta | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

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

  return (
      <CartProvider>
        <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-500 selection:text-white">
          {/* Navigation Bar */}
          <Navbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sheetMeta={sheetMeta}
              onRefreshData={handleRefreshData}
              isRefreshing={isRefreshing}
          />

          {/* Main Content Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <ClientHome
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sheetMeta={sheetMeta}
                onRefreshData={handleRefreshData}
                isRefreshing={isRefreshing}
            />
          </main>

          {/* Shopping Cart Drawer */}
          <CartDrawer
              onOrderSuccess={(order) => {
                setCompletedOrder(order);
              }}
          />

          {/* Order Success Receipt Modal */}
          <OrderSuccessModal
              order={completedOrder}
              onClose={() => setCompletedOrder(null)}
          />

          {/* Global Footer */}
          <Footer sheetMeta={sheetMeta} />
        </div>
      </CartProvider>
  );
}
