export interface Product {
  id: string; // ID e.g. "4780"
  code: string; // Mã SP e.g. "T01963"
  name: string; // Tên sản phẩm
  packaging: string; // Quy cách đóng gói e.g. "Hộp 24 gói x 1.5g thuốc bột uống"
  unit: string; // Hộp, Lọ, Chai, Tuýp, Vỉ, Gói, etc.
  category: string; // Danh mục / Nhóm dược lý
  tags: string[]; // Tags e.g. ["#Bán_chạy", "#Vui_tết"]
  price: number; // in VNĐ
  stock: number;
  productUrl?: string; // Link sản phẩm
  imageUrl: string; // Link ảnh
  usage?: string;
  description?: string;
  requiresPrescription?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  code?: string;
  name: string;
  price: number;
  quantity: number;
  unit?: string;
  imageUrl?: string;
}

export type OrderStatus = 'mới' | 'đang xử lý' | 'đã xác nhận' | 'đang giao' | 'hoàn thành' | 'đã hủy';

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  note?: string;
  paymentMethod: 'cod' | 'banking';
  items: OrderItem[];
  totalAmount: number;
  shippingFee: number;
  status: OrderStatus;
  createdAt: string;
}

export interface SheetMeta {
  sheetId: string;
  gid: string;
  sheetUrl: string;
  totalProducts: number;
  lastSync: string;
  isSyncing: boolean;
  error?: string;
}

export interface PaginatedProductsResponse {
  success: boolean;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  products: Product[];
  tags: string[];
  categories: string[];
  packagings: string[];
  lastSync: string;
  sheetSource: {
    sheetId: string;
    gid: string;
    sheetUrl: string;
  };
}
