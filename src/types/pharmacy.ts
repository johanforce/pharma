export interface Product {
  id: string; // ID e.g. "4780"
  code?: string; // Mã SP e.g. "T01963"
  name: string; // Tên sản phẩm
  packaging?: string; // Quy cách đóng gói e.g. "Hộp 24 gói x 1.5g thuốc bột uống"
  unit: string; // Hộp, Lọ, Chai, Tuýp, Vỉ, Gói, etc.
  category: string; // Danh mục / Nhóm dược lý
  tags?: string[]; // Tags e.g. ["#Bán_chạy", "#Vui_tết"]
  price: number; // in VNĐ (0 nếu chưa có giá)
  rawPrice?: string; // Nguyên bản chuỗi giá từ Cột J
  hasPrice?: boolean; // false nếu không có giá / 0, true nếu có giá cụ thể
  priceDisplay?: string; // "Giá liên hệ" hoặc tiền tệ VND e.g. "47.000 ₫"
  stock: number; // Số lượng số
  rawStock?: string; // Nguyên bản chuỗi từ Cột I
  isOutOfStock?: boolean; // true nếu ghi "hết hàng" hoặc số lượng = 0
  hasSpecificStock?: boolean; // true nếu có số lượng cụ thể > 0
  hasStockInfo?: boolean; // true nếu có thông tin số lượng (hoặc hết hàng), false nếu để trống
  stockDisplay?: string; // Chuỗi hiển thị ("Hết hàng", "Còn 100 Hộp", hoặc rỗng)
  productUrl?: string; // Link sản phẩm
  imageUrl: string; // Link ảnh
  usage?: string;
  description?: string;
  requiresPrescription?: boolean;
  manufacturer?: string;
  activeIngredient?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PharmacyCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  iconName?: string;
  createdAt?: string;
  updatedAt?: string;
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

export type OrderStatus = 'mới' | 'đang xử lý' | 'đã xác nhận' | 'đang giao' | 'đã giao' | 'hoàn thành' | 'đã hủy';

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  note?: string;
  paymentMethod: 'cod' | 'banking';
  items: OrderItem[];
  totalAmount: number;
  shippingFee?: number;
  status: OrderStatus;
  createdAt: string;
}

export interface SheetMeta {
  sheetId: string;
  gid: string;
  sheetUrl: string;
  totalProducts: number;
  hasPriceCount?: number;
  contactPriceCount?: number;
  outOfStockCount?: number;
  hasQuantityCount?: number;
  noStockInfoCount?: number;
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
