export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount).replace('₫', 'đ');
}

export function formatDateVN(dateInput: string | number | any): string {
  if (!dateInput) return '';
  try {
    const d = typeof dateInput === 'string' || typeof dateInput === 'number'
      ? new Date(dateInput)
      : (dateInput?.toDate ? dateInput.toDate() : new Date());
    
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(d);
  } catch (e) {
    return String(dateInput);
  }
}
