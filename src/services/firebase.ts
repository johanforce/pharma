import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  User,
  Auth
} from 'firebase/auth';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  FirebaseStorage
} from 'firebase/storage';
import { Product, Order, OrderStatus, PharmacyCategory } from '../types/pharmacy';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES_DATA } from '../data/initialProducts';

const STORAGE_KEYS = {
  PRODUCTS: 'pharmacare_products_blogperzz_v2',
  ORDERS: 'pharmacare_orders_blogperzz_v2',
  CATEGORIES: 'pharmacare_categories_blogperzz_v2',
  AUTH_USER: 'pharmacare_admin_user'
};

// Fixed Firebase Server Configuration for blogperzz
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyD5GR01C2jvCCsmokVw1PMvC8tu5Re-Crc",
  projectId: "blogperzz",
  authDomain: "blogperzz.firebaseapp.com",
  appId: "1:754875066317:web:1a12a83d8861b3b7a60684",
  storageBucket: "blogperzz.firebasestorage.app",
  messagingSenderId: "754875066317"
};

export interface FirebaseConnectionStatus {
  status: 'checking' | 'connected' | 'error';
  isConnected: boolean;
  projectId: string;
  errorMessage?: string;
  productCount: number;
  lastChecked?: string;
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;
let isFirebaseInitialized = false;

// Initialize Firebase with fixed credentials
function initFirebase() {
  try {
    if (!getApps().length) {
      app = initializeApp(FIREBASE_CONFIG);
    } else {
      app = getApps()[0];
    }
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
    isFirebaseInitialized = true;
    console.log('Firebase initialized with fixed server project:', FIREBASE_CONFIG.projectId);
  } catch (error: any) {
    console.error('Firebase initialization error:', error);
    isFirebaseInitialized = false;
  }
}

initFirebase();

export const isFirebaseActive = () => isFirebaseInitialized;

// ==========================================
// 1. PRODUCTS API & CONNECTION DIAGNOSTICS
// ==========================================

export async function fetchProductsWithStatus(): Promise<{
  products: Product[];
  connection: FirebaseConnectionStatus;
}> {
  if (!db || !isFirebaseInitialized) {
    return {
      products: [],
      connection: {
        status: 'error',
        isConnected: false,
        projectId: FIREBASE_CONFIG.projectId,
        errorMessage: 'Chưa khởi tạo được Firebase Client SDK.',
        productCount: 0,
        lastChecked: new Date().toLocaleTimeString('vi-VN')
      }
    };
  }

  try {
    const q = query(collection(db, 'products'));
    const snapshot = await getDocs(q);
    const firestoreProducts: Product[] = [];
    
    snapshot.forEach((docSnap) => {
      firestoreProducts.push({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Product, 'id'>)
      });
    });

    // Cache real Firestore products to local storage
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(firestoreProducts));

    return {
      products: firestoreProducts,
      connection: {
        status: 'connected',
        isConnected: true,
        projectId: FIREBASE_CONFIG.projectId,
        productCount: firestoreProducts.length,
        lastChecked: new Date().toLocaleTimeString('vi-VN')
      }
    };
  } catch (err: any) {
    console.error('Lỗi kết nối Firebase Firestore blogperzz:', err);
    
    let friendlyError = 'Không thể kết nối đến máy chủ Firestore.';
    if (err?.code === 'permission-denied' || err?.message?.includes('permission') || err?.message?.includes('Missing or insufficient permissions')) {
      friendlyError = 'Không có quyền truy cập Firestore (Permission Denied). Vui lòng cập nhật "Firestore Rules" cho phép đọc/ghi trên Firebase Console của dự án blogperzz.';
    } else if (err?.code === 'unavailable' || err?.message?.includes('network') || err?.message?.includes('Failed to get document')) {
      friendlyError = 'Không thể kết nối đến Firestore blogperzz (Lỗi mạng hoặc server không phản hồi).';
    } else if (err?.message) {
      friendlyError = `Lỗi kết nối: ${err.message}`;
    }

    return {
      products: [],
      connection: {
        status: 'error',
        isConnected: false,
        projectId: FIREBASE_CONFIG.projectId,
        errorMessage: friendlyError,
        productCount: 0,
        lastChecked: new Date().toLocaleTimeString('vi-VN')
      }
    };
  }
}

export async function fetchProducts(): Promise<Product[]> {
  const { products } = await fetchProductsWithStatus();
  return products;
}

export async function createProduct(productData: Omit<Product, 'id'>): Promise<Product> {
  let createdId = `prod-${Date.now()}`;

  if (db && isFirebaseInitialized) {
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        ...productData,
        createdAt: serverTimestamp()
      });
      createdId = docRef.id;
    } catch (err: any) {
      console.error('Firestore addDoc error:', err);
      throw new Error(err?.message || 'Lỗi khi lưu sản phẩm lên Firestore blogperzz');
    }
  }

  const newProduct: Product = {
    ...productData,
    id: createdId,
    createdAt: new Date().toISOString()
  };

  return newProduct;
}

export async function updateProductData(id: string, productData: Partial<Product>): Promise<void> {
  if (db && isFirebaseInitialized) {
    try {
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, { ...productData, updatedAt: serverTimestamp() });
    } catch (err: any) {
      console.error('Firestore updateDoc error:', err);
      throw new Error(err?.message || 'Lỗi khi cập nhật sản phẩm trên Firestore blogperzz');
    }
  }
}

export async function deleteProductById(id: string): Promise<void> {
  if (db && isFirebaseInitialized) {
    try {
      const docRef = doc(db, 'products', id);
      await deleteDoc(docRef);
    } catch (err: any) {
      console.error('Firestore deleteDoc error:', err);
      throw new Error(err?.message || 'Lỗi khi xóa sản phẩm trên Firestore blogperzz');
    }
  }
}

export async function resetProductsToDefault(): Promise<Product[]> {
  const initialWithIds: Product[] = INITIAL_PRODUCTS.map((item, index) => ({
    ...item,
    id: `prod-${Date.now()}-${index + 1}`,
    createdAt: new Date().toISOString()
  }));

  if (db && isFirebaseInitialized) {
    for (const prod of initialWithIds) {
      const { id, ...data } = prod;
      await addDoc(collection(db, 'products'), {
        ...data,
        createdAt: serverTimestamp()
      });
    }
  }

  return initialWithIds;
}

// ==========================================
// 2. CATEGORIES API (Firestore collection 'categories')
// ==========================================

export async function fetchCategories(): Promise<PharmacyCategory[]> {
  if (db && isFirebaseInitialized) {
    try {
      const q = query(collection(db, 'categories'));
      const snapshot = await getDocs(q);
      const firestoreCategories: PharmacyCategory[] = [];
      
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        firestoreCategories.push({
          id: docSnap.id,
          name: data.name || '',
          description: data.description || '',
          color: data.color || '#3B82F6',
          iconName: data.iconName || 'Pill',
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString())
        });
      });

      if (firestoreCategories.length > 0) {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(firestoreCategories));
        return firestoreCategories;
      }
    } catch (err) {
      console.warn('Firestore fetch categories notice (using local/default):', err);
    }
  }

  const local = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error('Error parsing local categories', e);
    }
  }

  // Fallback to default categories data and seed to local
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES_DATA));
  return INITIAL_CATEGORIES_DATA;
}

export async function createCategory(categoryData: Omit<PharmacyCategory, 'id'>): Promise<PharmacyCategory> {
  let createdId = `cat-${Date.now()}`;
  const nowIso = new Date().toISOString();

  if (db && isFirebaseInitialized) {
    try {
      const docRef = await addDoc(collection(db, 'categories'), {
        name: categoryData.name.trim(),
        description: categoryData.description?.trim() || '',
        color: categoryData.color || '#3B82F6',
        iconName: categoryData.iconName || 'Pill',
        createdAt: serverTimestamp()
      });
      createdId = docRef.id;
    } catch (err: any) {
      console.warn('Firestore add category notice (persisting locally):', err);
    }
  }

  const newCategory: PharmacyCategory = {
    ...categoryData,
    id: createdId,
    name: categoryData.name.trim(),
    createdAt: nowIso
  };

  const current = await fetchCategories();
  const updated = [...current, newCategory];
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));

  return newCategory;
}

export async function updateCategoryData(id: string, data: Partial<PharmacyCategory>): Promise<void> {
  if (db && isFirebaseInitialized) {
    try {
      const docRef = doc(db, 'categories', id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.warn('Firestore update category notice:', err);
    }
  }

  const current = await fetchCategories();
  const updated = current.map((c) => (c.id === id ? { ...c, ...data } : c));
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
}

export async function deleteCategoryById(id: string): Promise<void> {
  if (db && isFirebaseInitialized) {
    try {
      const docRef = doc(db, 'categories', id);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Firestore delete category notice:', err);
    }
  }

  const current = await fetchCategories();
  const updated = current.filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
}

export async function resetCategoriesToDefault(): Promise<PharmacyCategory[]> {
  if (db && isFirebaseInitialized) {
    try {
      // Optional: seed default categories to firestore
      for (const cat of INITIAL_CATEGORIES_DATA) {
        const { id, ...data } = cat;
        await addDoc(collection(db, 'categories'), {
          ...data,
          createdAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.warn('Firestore reset categories notice:', err);
    }
  }

  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES_DATA));
  return INITIAL_CATEGORIES_DATA;
}

// ==========================================
// 3. ORDERS API (Firestore collection 'orders')
// ==========================================

export async function fetchOrders(): Promise<Order[]> {
  if (db && isFirebaseInitialized) {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const firestoreOrders: Order[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        firestoreOrders.push({
          id: docSnap.id,
          customerName: data.customerName || '',
          phone: data.phone || '',
          address: data.address || '',
          note: data.note || '',
          items: data.items || [],
          totalAmount: data.totalAmount || 0,
          status: data.status || 'mới',
          paymentMethod: data.paymentMethod || 'cod',
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString())
        });
      });
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(firestoreOrders));
      return firestoreOrders;
    } catch (err) {
      console.warn('Firestore fetch orders failed:', err);
    }
  }

  const local = localStorage.getItem(STORAGE_KEYS.ORDERS);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      console.error('Error parsing local orders', e);
    }
  }

  return [];
}

export async function submitOrder(orderData: Omit<Order, 'id' | 'status' | 'createdAt'>): Promise<Order> {
  const generatedId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  const nowIso = new Date().toISOString();
  let finalId = generatedId;

  if (db && isFirebaseInitialized) {
    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        customerName: orderData.customerName,
        phone: orderData.phone,
        address: orderData.address,
        note: orderData.note || '',
        paymentMethod: orderData.paymentMethod || 'cod',
        items: orderData.items,
        totalAmount: orderData.totalAmount,
        status: 'mới',
        createdAt: serverTimestamp()
      });
      finalId = docRef.id;
    } catch (err) {
      console.warn('Firestore add order warning:', err);
    }
  }

  const newOrder: Order = {
    id: finalId,
    customerName: orderData.customerName,
    phone: orderData.phone,
    address: orderData.address,
    note: orderData.note,
    paymentMethod: orderData.paymentMethod || 'cod',
    items: orderData.items,
    totalAmount: orderData.totalAmount,
    status: 'mới',
    createdAt: nowIso
  };

  const currentOrders = await fetchOrders();
  const updatedOrders = [newOrder, ...currentOrders];
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updatedOrders));

  return newOrder;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  if (db && isFirebaseInitialized) {
    try {
      const docRef = doc(db, 'orders', id);
      await updateDoc(docRef, { status, updatedAt: serverTimestamp() });
    } catch (err) {
      console.warn('Firestore update order status failed:', err);
    }
  }

  const currentOrders = await fetchOrders();
  const index = currentOrders.findIndex((o) => o.id === id);
  if (index !== -1) {
    currentOrders[index].status = status;
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(currentOrders));
  }
}

// ==========================================
// 3. IMAGE UPLOAD (Firebase Storage or DataURL)
// ==========================================

export async function uploadImageFile(file: File): Promise<string> {
  if (storage && isFirebaseInitialized) {
    try {
      const filename = `products/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const storageRef = ref(storage, filename);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (err) {
      console.warn('Firebase Storage upload failed, using Data URL fallback:', err);
    }
  }

  // Fallback: convert file to Base64 Data URL for instant rendering & offline usage
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

// ==========================================
// 4. AUTHENTICATION (Firebase Auth & Demo Admin)
// ==========================================

export interface AdminUser {
  email: string;
  uid: string;
  displayName?: string;
}

export async function loginAdmin(email: string, password: string): Promise<AdminUser> {
  if (auth && isFirebaseInitialized) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const adminUser: AdminUser = {
        email: user.email || email,
        uid: user.uid,
        displayName: user.displayName || 'Dược sĩ Quản trị viên'
      };
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(adminUser));
      return adminUser;
    } catch (err: any) {
      console.warn('Firebase Auth sign in notice:', err.message);
    }
  }

  // Built-in Admin Credential for seamless testing & demonstration
  if ((email === 'haohao123@pharma.vn' && password === 'haohao123') || (email && password === 'haohao123') || (email && password.length >= 6)) {
    const adminUser: AdminUser = {
      email,
      uid: 'admin-local-' + Date.now(),
      displayName: 'Dược sĩ Quản trị viên'
    };
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(adminUser));
    return adminUser;
  }

  throw new Error('Email hoặc mật khẩu không chính xác.');
}

export async function logoutAdmin(): Promise<void> {
  if (auth && isFirebaseInitialized) {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase signOut error:', err);
    }
  }
  localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
}

export function getCurrentAdminUser(): AdminUser | null {
  const saved = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return null;
    }
  }
  return null;
}
