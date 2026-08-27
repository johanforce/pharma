import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Product, Order, OrderStatus, PharmacyCategory } from './types/pharmacy';
import { 
  fetchProductsWithStatus, 
  fetchCategories,
  createCategory,
  updateCategoryData,
  deleteCategoryById,
  resetCategoriesToDefault,
  fetchOrders, 
  createProduct, 
  updateProductData, 
  deleteProductById, 
  resetProductsToDefault, 
  updateOrderStatus,
  FirebaseConnectionStatus,
  FIREBASE_CONFIG
} from './services/firebase';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ClientHome } from './components/client/ClientHome';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CartDrawer } from './components/CartDrawer';
import { OrderSuccessModal } from './components/OrderSuccessModal';

function MainAppContent() {
  const { isAdminLoggedIn } = useAuth();
  const [currentView, setCurrentView] = useState<'client' | 'admin'>('client');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<PharmacyCategory[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<FirebaseConnectionStatus>({
    status: 'checking',
    isConnected: false,
    projectId: FIREBASE_CONFIG.projectId,
    productCount: 0
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [productResult, loadedCategories, loadedOrders] = await Promise.all([
        fetchProductsWithStatus(),
        fetchCategories(),
        fetchOrders()
      ]);
      setProducts(productResult.products);
      setCategories(loadedCategories);
      setConnectionStatus(productResult.connection);
      setOrders(loadedOrders);
    } catch (err: any) {
      console.error('Error loading data from Firebase:', err);
      setConnectionStatus({
        status: 'error',
        isConnected: false,
        projectId: FIREBASE_CONFIG.projectId,
        errorMessage: err?.message || 'Không thể kết nối đến máy chủ Firebase.',
        productCount: 0,
        lastChecked: new Date().toLocaleTimeString('vi-VN')
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers for Categories
  const handleAddCategory = async (categoryData: Omit<PharmacyCategory, 'id'>) => {
    const newCat = await createCategory(categoryData);
    setCategories((prev) => [...prev, newCat]);
  };

  const handleUpdateCategory = async (
    id: string, 
    newName: string, 
    description?: string, 
    color?: string, 
    oldName?: string
  ) => {
    await updateCategoryData(id, { name: newName, description, color });
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: newName, description, color } : c))
    );

    // If old name was changed and oldName is provided, migrate affected products
    if (oldName && oldName !== newName) {
      const affectedProducts = products.filter((p) => p.category === oldName);
      for (const prod of affectedProducts) {
        const updated = { ...prod, category: newName };
        await updateProductData(prod.id, updated);
      }
      setProducts((prev) =>
        prev.map((p) => (p.category === oldName ? { ...p, category: newName } : p))
      );
    }
  };

  const handleDeleteCategory = async (id: string, categoryName: string) => {
    await deleteCategoryById(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const handleResetCategories = async () => {
    if (window.confirm('Khôi phục danh mục thuốc về danh sách 8 nhóm chuẩn ban đầu?')) {
      const resetCats = await resetCategoriesToDefault();
      setCategories(resetCats);
    }
  };

  // Handlers for Products
  const handleAddProduct = async (productData: Omit<Product, 'id'>) => {
    const newProd = await createProduct(productData);
    setProducts((prev) => [newProd, ...prev]);
    setConnectionStatus((prev) => ({
      ...prev,
      productCount: prev.productCount + 1
    }));
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    await updateProductData(updatedProduct.id, updatedProduct);
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  const handleDeleteProduct = async (id: string) => {
    await deleteProductById(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setConnectionStatus((prev) => ({
      ...prev,
      productCount: Math.max(0, prev.productCount - 1)
    }));
  };

  const handleResetDefault = async () => {
    if (window.confirm('Khôi phục danh sách thuốc về dữ liệu mặc định chuẩn của nhà thuốc?')) {
      setIsLoading(true);
      try {
        const [initial, initialCats] = await Promise.all([
          resetProductsToDefault(),
          resetCategoriesToDefault()
        ]);
        setProducts(initial);
        setCategories(initialCats);
        setConnectionStatus((prev) => ({
          ...prev,
          productCount: initial.length
        }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handlers for Orders
  const handleUpdateOrderStatus = async (id: string, newStatus: OrderStatus) => {
    await updateOrderStatus(id, newStatus);
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
  };

  const handleOrderSuccess = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setPlacedOrder(newOrder);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900 font-sans antialiased selection:bg-blue-500 selection:text-white">
      <div>
        {/* Navigation Bar */}
        <Navbar
          currentView={currentView}
          onViewChange={(view) => setCurrentView(view)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          connectionStatus={connectionStatus}
          onRetryConnection={loadData}
        />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {currentView === 'client' ? (
            <ClientHome
              products={products}
              categories={categories}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              isLoading={isLoading}
              connectionStatus={connectionStatus}
              onRetryConnection={loadData}
            />
          ) : (
            /* Admin View */
            isAdminLoggedIn ? (
              <AdminDashboard
                products={products}
                categories={categories}
                orders={orders}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                onResetDefault={handleResetDefault}
                onAddCategory={handleAddCategory}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
                onResetCategories={handleResetCategories}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onSwitchToClient={() => setCurrentView('client')}
                isLoading={isLoading}
                connectionStatus={connectionStatus}
                onRetryConnection={loadData}
              />
            ) : (
              <AdminLogin onSuccess={() => setCurrentView('admin')} />
            )
          )}
        </main>
      </div>

      {/* Shopping Cart Drawer */}
      <CartDrawer onOrderSuccess={handleOrderSuccess} />

      {/* Order Success Celebratory Modal */}
      <OrderSuccessModal
        order={placedOrder}
        onClose={() => setPlacedOrder(null)}
      />

      {/* Footer */}
      <Footer connectionStatus={connectionStatus} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainAppContent />
      </CartProvider>
    </AuthProvider>
  );
}

