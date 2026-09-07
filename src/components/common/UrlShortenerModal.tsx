import React, { useState } from 'react';
import {
    Link2,
    Copy,
    Check,
    ExternalLink,
    X,
    Loader2,
    Sparkles,
    Share2
} from 'lucide-react';

interface UrlShortenerModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultUrl?: string;
}

export const UrlShortenerModal: React.FC<UrlShortenerModalProps> = ({
                                                                        isOpen,
                                                                        onClose,
                                                                        defaultUrl = ''
                                                                    }) => {
    const [url, setUrl] = useState(defaultUrl || (typeof window !== 'undefined' ? window.location.href : ''));
    const [shortUrl, setShortUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleShorten = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim()) return;

        setLoading(true);
        setError(null);
        setShortUrl(null);

        try {
            const res = await fetch('/api/shorten', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: url.trim() })
            });
            const data = await res.json();
            if (res.ok && data.success && data.shortUrl) {
                setShortUrl(data.shortUrl);
            } else {
                setError(data.error || 'Không thể rút gọn đường dẫn này. Vui lòng kiểm tra lại URL.');
            }
        } catch (err: any) {
            setError(err?.message || 'Lỗi mạng khi rút gọn đường dẫn.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!shortUrl) return;
        navigator.clipboard.writeText(shortUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div
                className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden p-5 sm:p-6 space-y-4"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Link2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Tạo Link Rút Gọn</h3>
                            <p className="text-[11px] text-slate-500">Rút ngắn liên kết chia sẻ (tương tự Bit.ly)</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Input Form */}
                <form onSubmit={handleShorten} className="space-y-3">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Đường dẫn gốc cần rút gọn:
                        </label>
                        <input
                            type="url"
                            required
                            placeholder="https://..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !url.trim()}
                        className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Đang tạo liên kết rút gọn...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                <span>Rút Gọn Link Ngay</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Error message */}
                {error && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                        {error}
                    </div>
                )}

                {/* Result */}
                {shortUrl && (
                    <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-2.5 animate-in slide-in-from-bottom-2 duration-150">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
              Liên kết rút gọn thành công:
            </span>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                readOnly
                                value={shortUrl}
                                className="flex-1 px-3 py-2 text-xs font-mono font-bold text-emerald-900 bg-white border border-emerald-300 rounded-xl outline-none select-all"
                            />
                            <button
                                type="button"
                                onClick={handleCopy}
                                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                    copied
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                                }`}
                            >
                                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
                            </button>
                        </div>
                        <div className="flex justify-end">
                            <a
                                href={shortUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                            >
                                <span>Mở thử liên kết</span>
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
