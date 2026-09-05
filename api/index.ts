import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
app.use(express.json());

const GOOGLE_SHEET_ID = '1IuAePO3lDxyhMX_SPCtNVRrAKvHwZVC4dsFFByY7To8';
const GOOGLE_SHEET_GID = '1574232058';
const GOOGLE_SHEET_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/edit?gid=${GOOGLE_SHEET_GID}#gid=${GOOGLE_SHEET_GID}`;
const GOOGLE_SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/export?format=csv&gid=${GOOGLE_SHEET_GID}`;

export interface Product {
    id: string;
    code: string;
    name: string;
    packaging: string;
    unit: string;
    category: string;
    tags: string[];
    price: number;
    rawPrice?: string;
    hasPrice: boolean;
    priceDisplay: string;
    stock: number;
    rawStock?: string;
    isOutOfStock: boolean;
    hasSpecificStock: boolean;
    hasStockInfo: boolean;
    stockDisplay?: string;
    productUrl?: string;
    imageUrl: string;
    usage?: string;
    description?: string;
    requiresPrescription?: boolean;
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
    status: 'mới' | 'đang xử lý' | 'đã xác nhận' | 'đang giao' | 'hoàn thành' | 'đã hủy';
    createdAt: string;
}

// In-memory cache
let cachedProducts: Product[] = [];
let allTags: string[] = [];
let allCategories: string[] = [];
let allPackagings: string[] = [];
let lastSyncTime = new Date().toISOString();
let isSyncing = false;
let syncError: string | null = null;
const ordersList: Order[] = [];
let initPromise: Promise<void> | null = null;

// Helper: Normalize Vietnamese text for search
function normalizeVietnamese(str: string): string {
    if (!str) return '';
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .trim();
}

// Helper: Determine unit from packaging string
function extractUnit(packaging: string): string {
    const p = packaging.trim().toLowerCase();
    if (p.startsWith('hộp')) return 'Hộp';
    if (p.startsWith('lọ')) return 'Lọ';
    if (p.startsWith('chai')) return 'Chai';
    if (p.startsWith('tuýp')) return 'Tuýp';
    if (p.startsWith('vỉ')) return 'Vỉ';
    if (p.startsWith('gói')) return 'Gói';
    if (p.startsWith('ống')) return 'Ống';
    if (p.startsWith('bơm tiêm') || p.startsWith('cái')) return 'Cái';
    if (p.startsWith('bình')) return 'Bình';
    if (p.startsWith('thùng')) return 'Thùng';
    return 'Đơn vị';
}

// Helper: Categorize based on medicine name and packaging
function deriveCategory(name: string, packaging: string, tagsStr: string): string {
    const n = name.toLowerCase();
    if (
        n.includes('ho') ||
        n.includes('phổi') ||
        n.includes('cold') ||
        n.includes('siro ho') ||
        n.includes('xoang') ||
        n.includes('xịt mũi') ||
        n.includes('mũi') ||
        n.includes('họng') ||
        n.includes('eugica') ||
        n.includes('prospan')
    ) {
        return 'Hô hấp & Cảm cúm';
    }
    if (
        n.includes('kháng sinh') ||
        n.includes('cefixim') ||
        n.includes('cefu') ||
        n.includes('amox') ||
        n.includes('augmentin') ||
        n.includes('clari') ||
        n.includes('tetra') ||
        n.includes('azithro') ||
        n.includes('klamentin') ||
        n.includes('cipro')
    ) {
        return 'Kháng sinh & Kháng khuẩn';
    }
    if (
        n.includes('paracetamol') ||
        n.includes('panadol') ||
        n.includes('hạ sốt') ||
        n.includes('giảm đau') ||
        n.includes('sủi') ||
        n.includes('efferalgan') ||
        n.includes('ibuprofen') ||
        n.includes('meloxicam') ||
        n.includes('diclofenac')
    ) {
        return 'Giảm đau & Hạ sốt';
    }
    if (
        n.includes('tiêu hóa') ||
        n.includes('men vi sinh') ||
        n.includes('dạ dày') ||
        n.includes('đại tràng') ||
        n.includes('berberin') ||
        n.includes('oresol') ||
        n.includes('smecta') ||
        n.includes('omepra') ||
        n.includes('esomepra') ||
        n.includes('ruột')
    ) {
        return 'Tiêu hóa & Dạ dày';
    }
    if (
        n.includes('calci') ||
        n.includes('calcium') ||
        n.includes('vitamin') ||
        n.includes('folic') ||
        n.includes('sắt') ||
        n.includes('kẽm') ||
        n.includes('magne') ||
        n.includes('khoáng chất') ||
        n.includes('d3') ||
        n.includes('dưỡng chất')
    ) {
        return 'Vitamin & Khoáng chất';
    }
    if (
        n.includes('kem') ||
        n.includes('gel') ||
        n.includes('mụn') ||
        n.includes('nghệ') ||
        n.includes('nấm') ||
        n.includes('liễu') ||
        n.includes('bôi') ||
        n.includes('mỡ') ||
        n.includes('dị ứng') ||
        n.includes('chàm')
    ) {
        return 'Da liễu & Bôi ngoài da';
    }
    if (
        n.includes('tim mạch') ||
        n.includes('huyết áp') ||
        n.includes('amlodipin') ||
        n.includes('statin') ||
        n.includes('mỡ máu') ||
        n.includes('xarelto') ||
        n.includes('tiểu đường') ||
        n.includes('đường huyết')
    ) {
        return 'Tim mạch & Tiểu đường';
    }
    if (
        n.includes('bơm tiêm') ||
        n.includes('bao cao su') ||
        n.includes('băng keo') ||
        n.includes('gạc') ||
        n.includes('khẩu trang') ||
        n.includes('nhiệt kế') ||
        n.includes('muối') ||
        n.includes('que thử') ||
        n.includes('rửa mũi')
    ) {
        return 'Thiết bị & Dụng cụ y tế';
    }
    if (
        n.includes('bổ') ||
        n.includes('gan') ||
        n.includes('thận') ||
        n.includes('não') ||
        n.includes('hoạt huyết') ||
        n.includes('đông y') ||
        n.includes('thảo dược') ||
        n.includes('cao') ||
        n.includes('trà') ||
        n.includes('hoa sen')
    ) {
        return 'Dược liệu & Bổ trợ sức khỏe';
    }
    return 'Dược phẩm thiết yếu';
}

function formatVND(amount: number): string {
    if (isNaN(amount) || amount <= 0) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(amount);
}

// Xử lý giá thuốc từ Cột J của Google Sheet:
// - Nếu không có thông tin (hoặc bằng 0, rỗng, không có giá) -> ghi "Giá liên hệ"
// - Nếu có thông tin -> hiển thị số tiền tương ứng
function parseSheetPrice(raw: string | undefined): { price: number; rawPrice: string; hasPrice: boolean; priceDisplay: string } {
    if (!raw) {
        return { price: 0, rawPrice: '', hasPrice: false, priceDisplay: 'Giá liên hệ' };
    }
    const cleanStr = raw.trim();
    if (!cleanStr || cleanStr === '0' || cleanStr.toLowerCase() === 'liên hệ' || cleanStr.toLowerCase() === 'giá liên hệ') {
        return { price: 0, rawPrice: cleanStr, hasPrice: false, priceDisplay: 'Giá liên hệ' };
    }
    // Lọc bỏ ký tự không phải số (ví dụ: "47.000" -> 47000, "1.120.000" -> 1120000)
    const digitsOnly = cleanStr.replace(/[^\d]/g, '');
    const num = parseInt(digitsOnly, 10);
    if (isNaN(num) || num <= 0) {
        return { price: 0, rawPrice: cleanStr, hasPrice: false, priceDisplay: 'Giá liên hệ' };
    }
    return {
        price: num,
        rawPrice: cleanStr,
        hasPrice: true,
        priceDisplay: formatVND(num),
    };
}

// Xử lý số lượng từ Cột I của Google Sheet:
// - Nếu có số lượng cụ thể -> ghi ra (vd: "Còn 100 Hộp" hoặc "Số lượng: 100")
// - Nếu hết hàng ("hết hàng", "het hang", "0") -> ghi "Hết hàng" (trạng thái view màu đỏ)
// - Không có thông tin (rỗng) -> không ghi gì cả (hasStockInfo = false, stockDisplay = '')
function parseSheetStock(raw: string | undefined, unit: string): {
    stock: number;
    rawStock: string;
    isOutOfStock: boolean;
    hasSpecificStock: boolean;
    hasStockInfo: boolean;
    stockDisplay: string;
} {
    if (!raw) {
        return {
            stock: 0,
            rawStock: '',
            isOutOfStock: false,
            hasSpecificStock: false,
            hasStockInfo: false,
            stockDisplay: '',
        };
    }
    const cleanStr = raw.trim();
    if (!cleanStr) {
        return {
            stock: 0,
            rawStock: '',
            isOutOfStock: false,
            hasSpecificStock: false,
            hasStockInfo: false,
            stockDisplay: '',
        };
    }

    const norm = normalizeVietnamese(cleanStr).toLowerCase();
    // Báo hết hàng
    if (norm.includes('het hang') || norm.includes('tam het') || cleanStr === '0') {
        return {
            stock: 0,
            rawStock: cleanStr,
            isOutOfStock: true,
            hasSpecificStock: false,
            hasStockInfo: true,
            stockDisplay: 'Hết hàng',
        };
    }

    // Có số lượng cụ thể
    const digits = cleanStr.replace(/[^\d]/g, '');
    const num = parseInt(digits, 10);
    if (!isNaN(num) && num > 0) {
        return {
            stock: num,
            rawStock: cleanStr,
            isOutOfStock: false,
            hasSpecificStock: true,
            hasStockInfo: true,
            stockDisplay: `Còn ${num} ${unit || 'SP'}`,
        };
    }

    // Không nhận diện được số lượng hoặc rỗng -> coi như không có thông tin, không ghi gì
    return {
        stock: 0,
        rawStock: cleanStr,
        isOutOfStock: false,
        hasSpecificStock: false,
        hasStockInfo: false,
        stockDisplay: '',
    };
}

// Robust CSV Parser
function parseCSV(text: string): string[][] {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentVal = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (inQuotes) {
            if (char === '"') {
                if (nextChar === '"') {
                    currentVal += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                currentVal += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === ',') {
                currentRow.push(currentVal.trim());
                currentVal = '';
            } else if (char === '\r') {
                if (nextChar === '\n') i++;
                currentRow.push(currentVal.trim());
                rows.push(currentRow);
                currentRow = [];
                currentVal = '';
            } else if (char === '\n') {
                currentRow.push(currentVal.trim());
                rows.push(currentRow);
                currentRow = [];
                currentVal = '';
            } else {
                currentVal += char;
            }
        }
    }

    if (currentVal.length > 0 || currentRow.length > 0) {
        currentRow.push(currentVal.trim());
        rows.push(currentRow);
    }

    return rows;
}

function processCSVData(csvText: string): Product[] {
    const rows = parseCSV(csvText);
    if (rows.length < 2) return [];

    const products: Product[] = [];
    const tagsSet = new Set<string>();
    const catSet = new Set<string>();
    const packagingSet = new Set<string>();

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length < 4 || !row[0]) continue;

        const id = row[0].trim();
        const code = row[1] ? row[1].trim() : `T${id}`;
        const rawCategory = row[2] ? row[2].trim() : '';
        const name = row[3] ? row[3].trim() : '';
        if (!name) continue;

        const packaging = row[4] ? row[4].trim() : 'Theo hộp/vỉ';
        const rawTags = row[5] ? row[5].trim() : '';
        const productUrl = row[6] ? row[6].trim() : '';
        const imageUrl = row[7] ? row[7].trim() : '';

        const tags = rawTags
            ? rawTags
                .split(',')
                .map((t) => t.trim())
                .filter((t) => t.length > 0)
            : [];

        tags.forEach((t) => tagsSet.add(t));

        const unit = extractUnit(packaging);
        packagingSet.add(unit);

        const category = rawCategory || deriveCategory(name, packaging, rawTags);
        catSet.add(category);

        // Cột I (index 8): Số lượng, Cột J (index 9): Giá bán
        const rawStock = row[8] !== undefined ? row[8].trim() : '';
        const rawPrice = row[9] !== undefined ? row[9].trim() : '';

        const priceInfo = parseSheetPrice(rawPrice);
        const stockInfo = parseSheetStock(rawStock, unit);

        const requiresPrescription =
            category.includes('Kháng sinh') ||
            category.includes('Tim mạch') ||
            name.toLowerCase().includes('rx') ||
            name.toLowerCase().includes('đơn');

        products.push({
            id,
            code,
            name,
            packaging,
            unit,
            category,
            tags,
            price: priceInfo.price,
            rawPrice: priceInfo.rawPrice,
            hasPrice: priceInfo.hasPrice,
            priceDisplay: priceInfo.priceDisplay,
            stock: stockInfo.stock,
            rawStock: stockInfo.rawStock,
            isOutOfStock: stockInfo.isOutOfStock,
            hasSpecificStock: stockInfo.hasSpecificStock,
            hasStockInfo: stockInfo.hasStockInfo,
            stockDisplay: stockInfo.stockDisplay,
            productUrl,
            imageUrl: imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
            description: `Sản phẩm ${name}, quy cách: ${packaging}. Phân phối chính hãng qua hệ thống PharmaCare từ kho trực tiếp.`,
            usage: `Dùng theo liều lượng ghi trên vỏ ${unit.toLowerCase()} hoặc tuân thủ hướng dẫn chi tiết của bác sĩ/dược sĩ chuyên khoa.`,
            requiresPrescription,
        });
    }

    allTags = Array.from(tagsSet);
    allCategories = Array.from(catSet);
    allPackagings = Array.from(packagingSet);

    return products;
}

// Load initial data
async function loadInitialData() {
    // 1. Try local CSV snapshot bundled with project
    try {
        const localCandidates = [
            path.join(process.cwd(), 'src', 'data', 'sheet_data.csv'),
            path.join(process.cwd(), 'dist', 'src', 'data', 'sheet_data.csv'),
            path.join(process.cwd(), 'data', 'sheet_data.csv'),
        ];
        for (const p of localCandidates) {
            if (fs.existsSync(p)) {
                const localCsv = fs.readFileSync(p, 'utf-8');
                const loaded = processCSVData(localCsv);
                if (loaded.length > 0) {
                    cachedProducts = loaded;
                    lastSyncTime = new Date().toISOString();
                    console.log(`[API] Loaded ${loaded.length} medicines from local snapshot`);
                    break;
                }
            }
        }
    } catch (err) {
        console.warn('[API] Could not load local snapshot CSV:', err);
    }

    // 2. If no products yet or running fresh, try fetching Google Sheets
    if (cachedProducts.length === 0) {
        await syncFromGoogleSheets();
    } else {
        // Non-blocking background sync if already have local cache
        syncFromGoogleSheets().catch((err) => {
            console.warn('[API] Background Google Sheets sync note:', err.message);
        });
    }
}

async function syncFromGoogleSheets(): Promise<{ success: boolean; count: number; error?: string }> {
    if (isSyncing) {
        return { success: true, count: cachedProducts.length };
    }

    isSyncing = true;
    syncError = null;

    try {
        const res = await fetch(GOOGLE_SHEET_CSV_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                Accept: 'text/csv,text/plain,*/*',
            },
            redirect: 'follow',
        });

        if (!res.ok) {
            throw new Error(`Google Sheets responded with status ${res.status}: ${res.statusText}`);
        }

        const csvText = await res.text();
        if (!csvText || csvText.length < 500) {
            throw new Error('Google Sheets returned incomplete or empty CSV data');
        }

        const products = processCSVData(csvText);
        if (products.length === 0) {
            throw new Error('No valid products parsed from Google Sheets CSV');
        }

        cachedProducts = products;
        lastSyncTime = new Date().toISOString();
        console.log(`[API] Google Sheets live sync succeeded! ${products.length} products loaded.`);

        // Try saving snapshot if filesystem is writable (non-critical in serverless)
        try {
            const localCsvPath = path.join(process.cwd(), 'src', 'data', 'sheet_data.csv');
            fs.writeFileSync(localCsvPath, csvText, 'utf-8');
        } catch {
            // Ignore read-only filesystem errors on Vercel
        }

        return { success: true, count: products.length };
    } catch (err: any) {
        console.error('[API] Google Sheets sync error:', err.message);
        syncError = err.message;
        return { success: false, count: cachedProducts.length, error: err.message };
    } finally {
        isSyncing = false;
    }
}

// Lazy initialization wrapper to guarantee data is loaded during serverless execution
async function ensureDataLoaded() {
    if (cachedProducts.length > 0) return;
    if (!initPromise) {
        initPromise = loadInitialData();
    }
    await initPromise;
}

// Router to support both /api/... and /... (handles Vercel rewrite variations)
const apiRouter = express.Router();

// Middleware: ensure data is loaded before route handlers execute
apiRouter.use(async (req, res, next) => {
    try {
        await ensureDataLoaded();
    } catch (e) {
        console.error('[API] Error in ensureDataLoaded:', e);
    }
    next();
});

// Health check
apiRouter.get('/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// 1. Sheet info & health check
apiRouter.get('/sheet-info', (req, res) => {
    const hasPriceCount = cachedProducts.filter((p) => p.hasPrice).length;
    const contactPriceCount = cachedProducts.filter((p) => !p.hasPrice).length;
    const outOfStockCount = cachedProducts.filter((p) => p.isOutOfStock).length;
    const hasQuantityCount = cachedProducts.filter((p) => p.hasSpecificStock).length;
    const noStockInfoCount = cachedProducts.filter((p) => !p.hasStockInfo).length;

    res.json({
        success: true,
        sheetId: GOOGLE_SHEET_ID,
        gid: GOOGLE_SHEET_GID,
        sheetUrl: GOOGLE_SHEET_URL,
        totalProducts: cachedProducts.length,
        hasPriceCount,
        contactPriceCount,
        outOfStockCount,
        hasQuantityCount,
        noStockInfoCount,
        lastSync: lastSyncTime,
        isSyncing,
        syncError,
        tags: allTags,
        categories: allCategories,
        packagings: allPackagings,
    });
});

// 2. Force Refresh Google Sheets
apiRouter.post('/refresh', async (req, res) => {
    const result = await syncFromGoogleSheets();
    res.json({
        ...result,
        totalProducts: cachedProducts.length,
        lastSync: lastSyncTime,
        sheetUrl: GOOGLE_SHEET_URL,
    });
});

// 3. Paginated Products (Default 40 products per page)
apiRouter.get('/products', (req, res) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 40));
    const search = (req.query.search as string) || '';
    const tag = (req.query.tag as string) || '';
    const category = (req.query.category as string) || '';
    const packaging = (req.query.packaging as string) || '';
    const sort = (req.query.sort as string) || 'default';
    const stockFilter = (req.query.stockFilter as string) || 'all';
    const priceFilter = (req.query.priceFilter as string) || 'all';

    let filtered = cachedProducts;

    if (tag && tag !== 'all') {
        filtered = filtered.filter((p) => p.tags && p.tags.includes(tag));
    }

    if (category && category !== 'all') {
        filtered = filtered.filter((p) => p.category === category);
    }

    if (packaging && packaging !== 'all') {
        filtered = filtered.filter((p) => p.unit === packaging);
    }

    if (stockFilter === 'out-of-stock') {
        filtered = filtered.filter((p) => p.isOutOfStock);
    } else if (stockFilter === 'has-quantity') {
        filtered = filtered.filter((p) => p.hasSpecificStock);
    } else if (stockFilter === 'in-stock') {
        filtered = filtered.filter((p) => !p.isOutOfStock);
    } else if (stockFilter === 'no-info') {
        filtered = filtered.filter((p) => !p.hasStockInfo);
    }

    if (priceFilter === 'has-price') {
        filtered = filtered.filter((p) => p.hasPrice);
    } else if (priceFilter === 'contact-price') {
        filtered = filtered.filter((p) => !p.hasPrice);
    }

    if (search.trim()) {
        const normQuery = normalizeVietnamese(search);
        filtered = filtered.filter((p) => {
            return (
                normalizeVietnamese(p.name).includes(normQuery) ||
                normalizeVietnamese(p.code).includes(normQuery) ||
                p.id.includes(normQuery) ||
                normalizeVietnamese(p.packaging).includes(normQuery) ||
                (p.tags && p.tags.some((t) => normalizeVietnamese(t).includes(normQuery))) ||
                normalizeVietnamese(p.category).includes(normQuery)
            );
        });
    }

    if (sort === 'name-asc') {
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    } else if (sort === 'name-desc') {
        filtered = [...filtered].sort((a, b) => b.name.localeCompare(a.name, 'vi'));
    } else if (sort === 'price-asc') {
        filtered = [...filtered].sort((a, b) => {
            if (a.hasPrice && b.hasPrice) return a.price - b.price;
            if (a.hasPrice && !b.hasPrice) return -1;
            if (!a.hasPrice && b.hasPrice) return 1;
            return 0;
        });
    } else if (sort === 'price-desc') {
        filtered = [...filtered].sort((a, b) => {
            if (a.hasPrice && b.hasPrice) return b.price - a.price;
            if (a.hasPrice && !b.hasPrice) return -1;
            if (!a.hasPrice && b.hasPrice) return 1;
            return 0;
        });
    } else if (sort === 'stock-desc') {
        filtered = [...filtered].sort((a, b) => b.stock - a.stock);
    } else if (sort === 'id-asc') {
        filtered = [...filtered].sort((a, b) => parseInt(a.id) - parseInt(b.id));
    } else if (sort === 'id-desc') {
        filtered = [...filtered].sort((a, b) => parseInt(b.id) - parseInt(a.id));
    }

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * limit;
    const paginatedProducts = filtered.slice(startIndex, startIndex + limit);

    res.json({
        success: true,
        total,
        page: currentPage,
        limit,
        totalPages,
        products: paginatedProducts,
        tags: allTags,
        categories: allCategories,
        packagings: allPackagings,
        lastSync: lastSyncTime,
        sheetSource: {
            sheetId: GOOGLE_SHEET_ID,
            gid: GOOGLE_SHEET_GID,
            sheetUrl: GOOGLE_SHEET_URL,
        },
    });
});

// 4. Get product by ID or Code
apiRouter.get('/products/:id', (req, res) => {
    const product = cachedProducts.find((p) => p.id === req.params.id || p.code === req.params.id);
    if (!product) {
        return res.status(404).json({ success: false, error: 'Không tìm thấy sản phẩm' });
    }
    res.json({ success: true, product });
});

// 4. Create Order
apiRouter.post('/orders', (req, res) => {
    const { customerName, phone, address, note, paymentMethod, items, totalAmount, shippingFee } = req.body;

    if (!customerName || !phone || !address || !items || !items.length) {
        return res.status(400).json({ success: false, error: 'Thiếu thông tin đơn hàng bắt buộc' });
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `DH-${Date.now().toString().slice(-4)}${randomSuffix}`;

    const newOrder: Order = {
        id: orderId,
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        note: note ? note.trim() : '',
        paymentMethod: paymentMethod || 'cod',
        items,
        totalAmount: totalAmount || 0,
        shippingFee: shippingFee || 0,
        status: 'mới',
        createdAt: new Date().toISOString(),
    };

    ordersList.unshift(newOrder);

    res.json({
        success: true,
        message: 'Đặt hàng thành công!',
        order: newOrder,
    });
});

// 5. Get orders list
apiRouter.get('/orders', (req, res) => {
    res.json({
        success: true,
        orders: ordersList,
    });
});

// Mount at /api so all API endpoints are cleanly scoped
app.use('/api', apiRouter);

export { app, ensureDataLoaded };
export default app;
