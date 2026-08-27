export interface Product {
  id: string;
  name: string;
  price: number; // in VNĐ
  imageUrl: string;
  description: string;
  unit: string; // e.g. Hộp, Vỉ, Chai, Gói, Tuýp
  stock: number;
  category: string;
  usage?: string;
  manufacturer?: string;
  requiresPrescription?: boolean;
  activeIngredient?: string;
  createdAt?: string | number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit?: string;
  imageUrl?: string;
}

export type OrderStatus = 'mới' | 'đang xử lý' | 'đã giao' | 'đã hủy';

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  note?: string;
  paymentMethod?: 'cod' | 'banking';
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string | number;
}

export interface PharmacyCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  iconName?: string;
  createdAt?: string | number;
}
