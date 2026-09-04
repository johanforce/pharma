export function formatVND(amount: number): string {
  if (isNaN(amount) || amount <= 0) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStringOrTimestamp: string | number): string {
  try {
    const d = new Date(dateStringOrTimestamp);
    return new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(d);
  } catch {
    return String(dateStringOrTimestamp);
  }
}

export const formatDateVN = formatDate;

export function normalizeVietnamese(str: string): string {
  if (!str) return '';
  return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .trim();
}
