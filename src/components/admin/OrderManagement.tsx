import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Search,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Truck,
  User,
  Phone,
  DollarSign,
  Filter,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { Order, OrderStatus } from '../../types/pharmacy';
import { formatVND, formatDateVN } from '../../utils/formatters';
import { OrderDetailModal } from './OrderDetailModal';
import { OrderFormModal } from './OrderFormModal';

interface OrderManagementProps {
  orders: Order[];
  onUpdateStatus: (id: string, newStatus: OrderStatus) => Promise<void>;
  onCreateOrder?: (orderData: Partial<Order>) => Promise<void>;
  onUpdateOrder?: (id: string, orderData: Partial<Order>) => Promise<void>;
  onDeleteOrder?: (id: string) => Promise<void>;
  isLoading: boolean;
}

export const OrderManagement: React.FC<OrderManagementProps> = ({
                                                                  orders,
                                                                  onUpdateStatus,
                                                                  onCreateOrder,
                                                                  onUpdateOrder,
                                                                  onDeleteOrder,
                                                                  isLoading
                                                                }) => {
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Form modal states (create or edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Status Counts
  const countMoi = orders.filter((o) => o.status === 'mới').length;
  const countDangXuLy = orders.filter((o) => o.status === 'đang xử lý').length;
  const countDaGiao = orders.filter((o) => o.status === 'đã giao').length;
  const countDaHuy = orders.filter((o) => o.status === 'đã hủy').length;

  const totalRevenue = orders
      .filter((o) => o.status === 'đã giao')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
          !q ||
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.phone.includes(q) ||
          o.address.toLowerCase().includes(q);

      return matchStatus && matchSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case 'mới':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'đang xử lý':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'đã giao':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'đã hủy':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleOpenCreateForm = () => {
    setEditingOrder(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (order: Order) => {
    setEditingOrder(order);
    setIsFormOpen(true);
  };

  const handleDelete = async (order: Order) => {
    if (!onDeleteOrder) return;
    const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa đơn hàng #${order.id} của ${order.customerName}?`);
    if (!confirmDelete) return;

    try {
      await onDeleteOrder(order.id);
      if (selectedOrder?.id === order.id) {
        setSelectedOrder(null);
      }
    } catch (err) {
      alert('Không thể xóa đơn hàng. Vui lòng thử lại!');
    }
  };

  const handleFormSubmit = async (data: Partial<Order>) => {
    if (editingOrder && onUpdateOrder) {
      await onUpdateOrder(editingOrder.id, data);
    } else if (onCreateOrder) {
      await onCreateOrder(data);
    }
  };

  return (
      <div className="space-y-6">
        {/* Top Stat Metrics & Add Order Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              <span>Danh Sách Đơn Hàng</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {orders.length} đơn
            </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Xem, thêm đơn mới, chỉnh sửa thông tin, cập nhật trạng thái và xóa đơn hàng.
            </p>
          </div>

          {onCreateOrder && (
              <button
                  id="admin-add-order-btn"
                  type="button"
                  onClick={handleOpenCreateForm}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Đơn Mới</span>
              </button>
          )}
        </div>

        {/* Top Stat Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Tổng số đơn hàng</p>
                <h3 className="text-xl font-bold text-slate-900">{orders.length}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Đơn mới chờ duyệt</p>
                <h3 className="text-xl font-bold text-amber-600">{countMoi}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Đã giao thành công</p>
                <h3 className="text-xl font-bold text-emerald-600">{countDaGiao}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Doanh thu hoàn tất</p>
                <h3 className="text-base font-bold text-indigo-700 font-mono truncate">
                  {formatVND(totalRevenue)}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    statusFilter === 'all'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
              Tất cả ({orders.length})
            </button>

            <button
                type="button"
                onClick={() => setStatusFilter('mới')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    statusFilter === 'mới'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
            >
              <span>Mới</span>
              {countMoi > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                {countMoi}
              </span>
              )}
            </button>

            <button
                type="button"
                onClick={() => setStatusFilter('đang xử lý')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    statusFilter === 'đang xử lý'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                }`}
            >
              Đang xử lý ({countDangXuLy})
            </button>

            <button
                type="button"
                onClick={() => setStatusFilter('đã giao')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    statusFilter === 'đã giao'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
            >
              Đã giao ({countDaGiao})
            </button>

            <button
                type="button"
                onClick={() => setStatusFilter('đã hủy')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    statusFilter === 'đã hủy'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                }`}
            >
              Đã hủy ({countDaHuy})
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <input
                id="admin-order-search"
                type="text"
                placeholder="Tìm theo mã đơn (DH-..., ORD-...), tên khách, số điện thoại, địa chỉ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-3 px-4">Mã Đơn & Thời Gian</th>
                <th className="py-3 px-4">Khách Hàng</th>
                <th className="py-3 px-4">Sản Phẩm</th>
                <th className="py-3 px-4 text-right">Tổng Tiền</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      Đang tải danh sách đơn hàng...
                    </td>
                  </tr>
              ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">
                      Không có đơn hàng nào phù hợp với bộ lọc tìm kiếm.
                    </td>
                  </tr>
              ) : (
                  filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Order ID & Time */}
                        <td className="py-3 px-4">
                          <div>
                        <span className="font-mono font-bold text-blue-700 block">
                          #{order.id}
                        </span>
                            <span className="text-[11px] text-slate-400">
                          {formatDateVN(order.createdAt)}
                        </span>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="py-3 px-4">
                          <div>
                            <span className="font-bold text-slate-900 block">{order.customerName}</span>
                            <span className="text-[11px] text-slate-500 font-mono">{order.phone}</span>
                            <span className="text-[10px] text-slate-400 block truncate max-w-xs">{order.address}</span>
                          </div>
                        </td>

                        {/* Items */}
                        <td className="py-3 px-4">
                          <div className="max-w-xs">
                        <span className="font-medium text-slate-700 block">
                          {order.items.length} loại thuốc ({order.items.reduce((s, i) => s + (Number(i.quantity) || 0), 0)} món)
                        </span>
                            <span className="text-[11px] text-slate-400 truncate block">
                          {order.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                        </span>
                          </div>
                        </td>

                        {/* Total Amount */}
                        <td className="py-3 px-4 text-right font-bold text-blue-700 font-mono text-sm">
                          {formatVND(order.totalAmount)}
                        </td>

                        {/* Status with Quick Dropdown */}
                        <td className="py-3 px-4 text-center">
                          <select
                              value={order.status}
                              onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
                              className={`text-xs font-bold py-1 px-2 rounded-lg border outline-none cursor-pointer uppercase ${getStatusBadgeClass(
                                  order.status
                              )}`}
                          >
                            <option value="mới">Mới</option>
                            <option value="đang xử lý">Đang xử lý</option>
                            <option value="đã giao">Đã giao</option>
                            <option value="đã hủy">Đã hủy</option>
                          </select>
                        </td>

                        {/* Actions: View, Edit, Delete */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                                id={`view-order-detail-btn-${order.id}`}
                                type="button"
                                onClick={() => setSelectedOrder(order)}
                                className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                title="Xem chi tiết đơn"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {onUpdateOrder && (
                                <button
                                    id={`edit-order-btn-${order.id}`}
                                    type="button"
                                    onClick={() => handleOpenEditForm(order)}
                                    className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                    title="Sửa thông tin đơn"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                            )}

                            {onDeleteOrder && (
                                <button
                                    id={`delete-order-btn-${order.id}`}
                                    type="button"
                                    onClick={() => handleDelete(order)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                    title="Xóa đơn hàng"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                          </div>
                        </td>
                      </tr>
                  ))
              )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Detail Modal */}
        <OrderDetailModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onUpdateStatus={async (id, newStatus) => {
              await onUpdateStatus(id, newStatus);
              if (selectedOrder) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
              }
            }}
            onEditOrder={(order) => {
              setSelectedOrder(null);
              handleOpenEditForm(order);
            }}
            onDeleteOrder={async (id) => {
              if (onDeleteOrder) {
                await onDeleteOrder(id);
                setSelectedOrder(null);
              }
            }}
        />

        {/* Create / Edit Order Modal */}
        <OrderFormModal
            isOpen={isFormOpen}
            orderToEdit={editingOrder}
            onClose={() => {
              setIsFormOpen(false);
              setEditingOrder(null);
            }}
            onSubmit={handleFormSubmit}
        />
      </div>
  );
};
