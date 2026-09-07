import React, { useState } from 'react';
import {
    X,
    Plus,
    Trash2,
    Save,
    Loader2,
    User,
    Phone,
    MapPin,
    FileText,
    CreditCard,
    ShoppingBag,
    PackagePlus
} from 'lucide-react';
import { Order, OrderItem, OrderStatus } from '../../types/pharmacy';
import { formatVND } from '../../utils/formatters';

interface OrderFormModalProps {
    isOpen: boolean;
    orderToEdit?: Order | null;
    onClose: () => void;
    onSubmit: (orderData: Partial<Order>) => Promise<void>;
}

export const OrderFormModal: React.FC<OrderFormModalProps> = ({
                                                                  isOpen,
                                                                  orderToEdit,
                                                                  onClose,
                                                                  onSubmit
                                                              }) => {
    if (!isOpen) return null;

    const isEditing = Boolean(orderToEdit);

    const [customerName, setCustomerName] = useState(orderToEdit?.customerName || '');
    const [phone, setPhone] = useState(orderToEdit?.phone || '');
    const [address, setAddress] = useState(orderToEdit?.address || '');
    const [note, setNote] = useState(orderToEdit?.note || '');
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'banking'>(orderToEdit?.paymentMethod || 'cod');
    const [status, setStatus] = useState<OrderStatus>(orderToEdit?.status || 'mới');
    const [shippingFee, setShippingFee] = useState<number>(orderToEdit?.shippingFee || 0);

    const [items, setItems] = useState<OrderItem[]>(
        orderToEdit?.items && orderToEdit.items.length > 0
            ? orderToEdit.items
            : [
                {
                    productId: `manual-${Date.now()}`,
                    name: '',
                    price: 0,
                    quantity: 1,
                    unit: 'Hộp'
                }
            ]
    );

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    // Calculate items total
    const itemsTotal = items.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0);
    const totalAmount = itemsTotal + (Number(shippingFee) || 0);

    const handleAddItem = () => {
        setItems([
            ...items,
            {
                productId: `manual-${Date.now()}-${Math.random().toString().slice(-4)}`,
                name: '',
                price: 0,
                quantity: 1,
                unit: 'Hộp'
            }
        ]);
    };

    const handleRemoveItem = (index: number) => {
        if (items.length <= 1) {
            alert('Đơn hàng cần tối thiểu 1 mặt hàng thuốc!');
            return;
        }
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
        const nextItems = [...items];
        nextItems[index] = {
            ...nextItems[index],
            [field]: field === 'price' || field === 'quantity' ? Math.max(0, Number(value) || 0) : value
        };
        setItems(nextItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        if (!customerName.trim()) {
            setFormError('Vui lòng nhập họ tên khách hàng');
            return;
        }
        if (!phone.trim()) {
            setFormError('Vui lòng nhập số điện thoại');
            return;
        }
        if (!address.trim()) {
            setFormError('Vui lòng nhập địa chỉ giao hàng');
            return;
        }

        const validItems = items.filter((it) => it.name.trim().length > 0);
        if (validItems.length === 0) {
            setFormError('Vui lòng nhập ít nhất 1 sản phẩm thuốc với tên đầy đủ');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                customerName: customerName.trim(),
                phone: phone.trim(),
                address: address.trim(),
                note: note.trim(),
                paymentMethod,
                status,
                shippingFee: Number(shippingFee) || 0,
                items: validItems,
                totalAmount
            });
            onClose();
        } catch (err: any) {
            setFormError(err?.message || 'Có lỗi xảy ra khi lưu đơn hàng. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
        <div
            id="order-form-modal"
    className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
    <div className="flex items-center gap-2.5">
    <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
    {isEditing ? <FileText className="w-4 h-4" /> : <PackagePlus className="w-4 h-4" />}
    </div>
    <div>
    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
        {isEditing ? `Sửa Đơn Hàng #${orderToEdit?.id}` : 'Thêm Đơn Hàng Mới'}
        </h3>
        <p className="text-[11px] text-slate-500">
        {isEditing ? 'Cập nhật thông tin khách và mặt hàng trong đơn' : 'Tạo đơn thuốc thủ công cho khách đặt qua điện thoại/Zalo'}
        </p>
        </div>
        </div>
        <button
    type="button"
    onClick={onClose}
    className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
    >
    <X className="w-4 h-4" />
        </button>
        </div>

    {/* Modal Body Form */}
    <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1">
        {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
                {formError}
                </div>
        )}

    {/* Section 1: Customer Information */}
    <div className="space-y-3">
    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
    <User className="w-3.5 h-3.5 text-blue-600" />
        <span>Thông Tin Khách Hàng</span>
    </h4>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
        Họ tên khách hàng <span className="text-rose-500">*</span>
        </label>
        <input
    type="text"
    required
    placeholder="Ví dụ: Nguyễn Văn An"
    value={customerName}
    onChange={(e) => setCustomerName(e.target.value)}
    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
    />
    </div>

    <div>
    <label className="block text-xs font-semibold text-slate-700 mb-1">
        Số điện thoại <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
    <input
        type="tel"
    required
    placeholder="Ví dụ: 0988123456"
    value={phone}
    onChange={(e) => setPhone(e.target.value)}
    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none font-mono"
    />
    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
    </div>
    </div>
    </div>

    <div>
    <label className="block text-xs font-semibold text-slate-700 mb-1">
        Địa chỉ nhận hàng <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
    <input
        type="text"
    required
    placeholder="Số nhà, đường/phố, phường/xã, quận/huyện, tỉnh/thành..."
    value={address}
    onChange={(e) => setAddress(e.target.value)}
    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
    />
    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
    </div>
    </div>

    <div>
    <label className="block text-xs font-semibold text-slate-700 mb-1">
        Ghi chú giao hàng / dặn dò
    </label>
    <input
    type="text"
    placeholder="Ví dụ: Giao giờ hành chính, gọi trước 15 phút..."
    value={note}
    onChange={(e) => setNote(e.target.value)}
    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
        />
        </div>
        </div>

    {/* Section 2: Order Status & Payment */}
    <div className="pt-2 border-t border-slate-100 space-y-3">
    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
    <CreditCard className="w-3.5 h-3.5 text-teal-600" />
        <span>Trạng Thái & Thanh Toán</span>
    </h4>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
        Trạng thái đơn hàng
    </label>
    <select
    value={status}
    onChange={(e) => setStatus(e.target.value as OrderStatus)}
    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold uppercase cursor-pointer outline-none"
    >
    <option value="mới">Mới</option>
        <option value="đang xử lý">Đang xử lý</option>
    <option value="đã giao">Đã giao</option>
    <option value="đã hủy">Đã hủy</option>
    </select>
    </div>

    <div>
    <label className="block text-xs font-semibold text-slate-700 mb-1">
        Hình thức thanh toán
    </label>
    <select
    value={paymentMethod}
    onChange={(e) => setPaymentMethod(e.target.value as 'cod' | 'banking')}
    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold cursor-pointer outline-none"
    >
    <option value="cod">Tiền mặt khi nhận (COD)</option>
    <option value="banking">Chuyển khoản QR ngân hàng</option>
    </select>
    </div>
    </div>
    </div>

    {/* Section 3: Order Items */}
    <div className="pt-2 border-t border-slate-100 space-y-3">
    <div className="flex items-center justify-between">
    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
    <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
        <span>Mặt Hàng Thuốc ({items.length})</span>
    </h4>
    <button
    type="button"
    onClick={handleAddItem}
    className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
    >
    <Plus className="w-3.5 h-3.5" />
        <span>Thêm thuốc</span>
    </button>
    </div>

    <div className="space-y-2.5">
        {items.map((item, idx) => (
                <div key={item.productId || idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-600">Thuốc #{idx + 1}</span>
    {items.length > 1 && (
        <button
            type="button"
        onClick={() => handleRemoveItem(idx)}
        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
        title="Xóa mặt hàng này"
        >
        <Trash2 className="w-3.5 h-3.5" />
            </button>
    )}
    </div>

    <div>
    <input
        type="text"
    required
    placeholder="Tên thuốc / dược phẩm (VD: Berberin, Bé Ho...)"
    value={item.name}
    onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-semibold"
        />
        </div>

        <div className="grid grid-cols-3 gap-2">
    <div>
        <label className="block text-[10px] text-slate-500 mb-0.5">Đơn vị tính</label>
    <input
    type="text"
    placeholder="Hộp/Lọ/Vỉ"
    value={item.unit || 'Hộp'}
    onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-none"
    />
    </div>

    <div>
    <label className="block text-[10px] text-slate-500 mb-0.5">Đơn giá (VNĐ)</label>
    <input
    type="number"
    min="0"
    step="1000"
    value={item.price || 0}
    onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-none font-mono"
    />
    </div>

    <div>
    <label className="block text-[10px] text-slate-500 mb-0.5">Số lượng</label>
    <input
    type="number"
    min="1"
    value={item.quantity || 1}
    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-none font-mono font-bold"
        />
        </div>
        </div>

        <div className="text-right text-[11px] text-slate-500">
        Thành tiền: <strong className="text-blue-700 font-mono">{formatVND((Number(item.price) || 0) * (Number(item.quantity) || 1))}</strong>
    </div>
    </div>
))}
    </div>
    </div>

    {/* Section 4: Summary & Total */}
    <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl space-y-2">
    <div className="flex items-center justify-between text-xs text-slate-600">
        <span>Tiền hàng:</span>
    <span className="font-mono font-bold">{formatVND(itemsTotal)}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-600">
        <span>Phí vận chuyển:</span>
    <div className="flex items-center gap-1">
    <input
        type="number"
    min="0"
    step="5000"
    value={shippingFee}
    onChange={(e) => setShippingFee(Number(e.target.value) || 0)}
    className="w-24 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono text-right"
    />
    <span className="text-[11px] text-slate-500">₫</span>
        </div>
        </div>
        <div className="pt-2 border-t border-blue-200/80 flex items-center justify-between text-sm font-bold text-slate-900">
        <span>Tổng tiền đơn hàng:</span>
    <span className="text-blue-700 text-base font-black font-mono">{formatVND(totalAmount)}</span>
        </div>
        </div>

    {/* Footer Submit Button */}
    <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
    <button
        type="button"
    onClick={onClose}
    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
        Hủy
        </button>
        <button
    type="submit"
    disabled={isSubmitting}
    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all disabled:bg-slate-300 cursor-pointer"
        >
        {isSubmitting ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang lưu...</span>
            </>
) : (
        <>
            <Save className="w-4 h-4" />
            <span>{isEditing ? 'LƯU THAY ĐỔI' : 'TẠO ĐƠN HÀNG'}</span>
            </>
    )}
    </button>
    </div>
    </form>
    </div>
    </div>
);
};
