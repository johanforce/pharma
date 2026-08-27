import { Product } from '../types/pharmacy';

export const INITIAL_PRODUCTS: Omit<Product, 'id'>[] = [
  {
    name: 'Panadol Extra Đỏ Giảm Đau Hạ Sốt (Hộp 18 vỉ x 10 viên)',
    price: 185000,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    description: 'Thuốc giảm đau hạ sốt nhanh chóng, hiệu quả đối với các cơn đau từ nhẹ đến vừa: đau đầu, đau nửa đầu, đau cơ, sốt do cảm cúm.',
    unit: 'Hộp',
    stock: 45,
    category: 'Giảm đau - Hạ sốt',
    usage: 'Người lớn và trẻ em từ 12 tuổi: Uống 1-2 viên/lần, cách nhau 4-6 giờ. Không dùng quá 8 viên/ngày.',
    manufacturer: 'GSK GlaxoSmithKline (Anh Quốc)',
    requiresPrescription: false,
    activeIngredient: 'Paracetamol 500mg, Caffeine 65mg'
  },
  {
    name: 'Efferalgan 500mg Viên Sủi Hạ Sốt Giảm Đau',
    price: 72000,
    imageUrl: 'https://images.unsplash.com/photo-1550572017-ed200f5e6343?w=600&auto=format&fit=crop&q=80',
    description: 'Viên sủi tan nhanh trong nước, hấp thu nhanh giúp hạ sốt tức thì và giảm các triệu chứng đau răng, đau nhức mình mẩy do cảm.',
    unit: 'Tuýp',
    stock: 60,
    category: 'Giảm đau - Hạ sốt',
    usage: 'Hòa tan 1 viên vào cốc nước đầy, uống sau khi tan hoàn toàn. Dùng cách nhau tối thiểu 4 giờ.',
    manufacturer: 'UPSA SAS (Pháp)',
    requiresPrescription: false,
    activeIngredient: 'Paracetamol 500mg'
  },
  {
    name: 'Eugica Xanh Viên Nang Mềm Trị Ho Cảm Cúm (Hộp 10 vỉ x 10 viên)',
    price: 95000,
    imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80',
    description: 'Thuốc thảo dược điều trị các chứng ho, đau họng, sổ mũi, cảm cúm, sát trùng đường hô hấp, làm loãng niêm dịch.',
    unit: 'Hộp',
    stock: 38,
    category: 'Hô hấp & Cảm cúm',
    usage: 'Người lớn: Uống 2 viên/lần, ngày 3 lần. Trẻ em trên 30 tháng: Uống 1 viên/lần, ngày 2-3 lần.',
    manufacturer: 'Mega Lifesciences (Thái Lan)',
    requiresPrescription: false,
    activeIngredient: 'Tinh dầu Tràm, Tinh dầu Bạc hà, Tinh dầu Gừng, Eucalyptol'
  },
  {
    name: 'Smecta Hỗn Dịch Uống Điều Trị Tiêu Chảy Cấp (Hộp 30 gói)',
    price: 135000,
    imageUrl: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=600&auto=format&fit=crop&q=80',
    description: 'Bảo vệ niêm mạc đường tiêu hóa, cầm tiêu chảy cấp và mãn tính, giảm triệu chứng đau do viêm thực quản, dạ dày và đại tràng.',
    unit: 'Hộp',
    stock: 52,
    category: 'Dạ dày & Tiêu hoá',
    usage: 'Hòa tan gói thuốc trong 50ml nước. Người lớn: Uống trung bình 3 gói/ngày, chia làm 3 lần uống.',
    manufacturer: 'Ipsen Pharma (Pháp)',
    requiresPrescription: false,
    activeIngredient: 'Diosmectite 3g'
  },
  {
    name: 'Berberin Mộc Hoa Trắng Trị Rối Loạn Tiêu Hoá (Lọ 100 viên)',
    price: 35000,
    imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80',
    description: 'Kháng khuẩn đường ruột, hỗ trợ điều trị lỵ trực trùng, hội chứng viêm ruột thừa, viêm túi mật, đau bụng do ngộ độc thức ăn.',
    unit: 'Chai',
    stock: 80,
    category: 'Dạ dày & Tiêu hoá',
    usage: 'Người lớn: 2 - 4 viên/lần, ngày 2 lần. Uống sau bữa ăn với nước ấm.',
    manufacturer: 'Dược phẩm TW3 (Việt Nam)',
    requiresPrescription: false,
    activeIngredient: 'Berberin clorid 50mg'
  },
  {
    name: 'Vitamin C 1000mg + Kẽm Zinc Blackmores Tăng Đề Kháng (Lọ 60 viên)',
    price: 320000,
    imageUrl: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=600&auto=format&fit=crop&q=80',
    description: 'Bổ sung hàm lượng Vitamin C thiết yếu và vi chất Kẽm giúp tăng cường hệ miễn dịch, chống oxy hóa, giảm mệt mỏi.',
    unit: 'Chai',
    stock: 25,
    category: 'Vitamin & Thực phẩm chức năng',
    usage: 'Người lớn: Uống 1 viên mỗi ngày sau bữa ăn sáng hoặc theo hướng dẫn của bác sĩ.',
    manufacturer: 'Blackmores (Úc)',
    requiresPrescription: false,
    activeIngredient: 'Ascorbic Acid 1000mg, Zinc Chelate 10mg'
  },
  {
    name: 'Gaviscon Dual Action Hỗ Trợ Đau Dạ Dày Trào Ngược (Hộp 24 gói)',
    price: 165000,
    imageUrl: 'https://images.unsplash.com/photo-1550572017-4fcdbb590e53?w=600&auto=format&fit=crop&q=80',
    description: 'Tạo lớp gel bảo vệ ngăn acid trào ngược lên thực quản, làm dịu nhanh cơn ợ nóng, ợ chua và khó tiêu do viêm loét dạ dày.',
    unit: 'Hộp',
    stock: 40,
    category: 'Dạ dày & Tiêu hoá',
    usage: 'Uống 1-2 gói sau các bữa ăn chính và trước khi đi ngủ (tối đa 4 lần/ngày).',
    manufacturer: 'Reckitt Benckiser (Anh)',
    requiresPrescription: false,
    activeIngredient: 'Natri alginate 500mg, Natri bicarbonate 213mg'
  },
  {
    name: 'Nước Muối Sinh Lý Kháng Khuẩn Natri Clorid 0.9% (Chai 500ml)',
    price: 8000,
    imageUrl: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&auto=format&fit=crop&q=80',
    description: 'Dung dịch súc miệng, rửa mũi, rửa vết thương ngoài da vô trùng, loại bỏ vi khuẩn và bụi bẩn an toàn dịu nhẹ.',
    unit: 'Chai',
    stock: 120,
    category: 'Dụng cụ & Thiết bị y tế',
    usage: 'Súc miệng 2-3 lần/ngày hoặc dùng gạc vô trùng tẩm dung dịch rửa sạch vết thương ngoài da.',
    manufacturer: 'Pharmacity (Việt Nam)',
    requiresPrescription: false,
    activeIngredient: 'Natri Clorid 0.9%'
  },
  {
    name: 'Kem Bôi Da Mometasone Trị Viêm Da Dị Ứng Côn Trùng Cắn (Tuýp 15g)',
    price: 48000,
    imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&auto=format&fit=crop&q=80',
    description: 'Giảm nhanh ngứa ngáy, mẩn đỏ, viêm da cơ địa, chàm, dị ứng thời tiết và vết đốt côn trùng.',
    unit: 'Tuýp',
    stock: 35,
    category: 'Chăm sóc da & Cơ thể',
    usage: 'Bôi một lớp mỏng lên vùng da tổn thương 1 lần/ngày. Rửa sạch tay trước và sau khi bôi.',
    manufacturer: 'Dược Hậu Giang (DHG Pharma)',
    requiresPrescription: false,
    activeIngredient: 'Mometasone furoate 0.1%'
  },
  {
    name: 'Máy Đo Huyết Áp Bắp Tay Tự Động Omron HEM-7120',
    price: 890000,
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
    description: 'Thiết bị đo huyết áp và nhịp tim bắp tay công nghệ Intellisense tiên tiến, cảnh báo huyết áp cao và nhịp tim bất thường.',
    unit: 'Hộp',
    stock: 15,
    category: 'Dụng cụ & Thiết bị y tế',
    usage: 'Quấn vòng bít quanh bắp tay cách khuỷu tay 1-2cm, nhấn nút Start/Stop để bắt đầu đo tự động.',
    manufacturer: 'Omron Healthcare (Nhật Bản)',
    requiresPrescription: false,
    activeIngredient: 'Thiết bị y tế cảm biến dao động áp suất'
  },
  {
    name: 'Khẩu Trang Y Tế 4 Lớp Kháng Khuẩn Chuẩn Y Khoa (Hộp 50 cái)',
    price: 45000,
    imageUrl: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=600&auto=format&fit=crop&q=80',
    description: 'Cấu tạo 4 lớp lọc bụi mịn và vi khuẩn đến 99%, quai thun co giãn êm tai, nẹp mũi ôm khít khuôn mặt.',
    unit: 'Hộp',
    stock: 150,
    category: 'Dụng cụ & Thiết bị y tế',
    usage: 'Đeo mặt màu ra ngoài, thanh nẹp mũi hướng lên trên. Sử dụng 1 lần để đảm bảo vệ sinh.',
    manufacturer: 'Dược phẩm Danameco (Việt Nam)',
    requiresPrescription: false
  },
  {
    name: 'Men Vi Sinh Enterogermina Bào Tử Lợi Khuẩn Dạng Ống (Hộp 20 ống)',
    price: 175000,
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80',
    description: 'Bổ sung 2 tỷ bào tử Bacillus clausii giúp cân bằng hệ vi sinh đường ruột khi dùng kháng sinh kéo dài, phục hồi tiêu hoá.',
    unit: 'Hộp',
    stock: 45,
    category: 'Dạ dày & Tiêu hoá',
    usage: 'Lắc kỹ ống trước khi uống. Trẻ nhỏ: 1-2 ống/ngày; Người lớn: 2-3 ống/ngày chia đều các cữ.',
    manufacturer: 'Sanofi-Aventis (Ý)',
    requiresPrescription: false,
    activeIngredient: 'Bacillus clausii 2 tỷ bào tử'
  }
];

export const DEFAULT_CATEGORIES = [
  'Giảm đau - Hạ sốt',
  'Hô hấp & Cảm cúm',
  'Dạ dày & Tiêu hoá',
  'Vitamin & Thực phẩm chức năng',
  'Chăm sóc da & Cơ thể',
  'Dụng cụ & Thiết bị y tế',
  'Kháng sinh & Kháng viêm',
  'Thuốc Mắt - Tai - Mũi'
];

export const INITIAL_CATEGORIES_DATA = DEFAULT_CATEGORIES.map((name, index) => ({
  id: `cat-${index + 1}`,
  name,
  description: `Các loại thuốc và sản phẩm thuộc nhóm ${name}`,
  color: [
    '#3B82F6', // blue
    '#10B981', // emerald
    '#F59E0B', // amber
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#EF4444', // red
    '#14B8A6'  // teal
  ][index % 8],
  createdAt: new Date().toISOString()
}));

export const CATEGORIES = [
  'Tất cả',
  ...DEFAULT_CATEGORIES
];
