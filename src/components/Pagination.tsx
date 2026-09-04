import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
                                                          currentPage,
                                                          totalPages,
                                                          totalItems,
                                                          itemsPerPage,
                                                          onPageChange,
                                                      }) => {
    const [jumpPage, setJumpPage] = useState('');

    if (totalPages <= 1 && totalItems <= itemsPerPage) {
        return (
            <div className="flex items-center justify-between text-xs text-slate-500 py-4 px-2">
                <span>Hiển thị tất cả <strong>{totalItems}</strong> loại thuốc (40 thuốc/trang)</span>
                <span>Trang 1 / 1</span>
            </div>
        );
    }

    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    // Generate page numbers with ellipses
    const getPageNumbers = () => {
        const delta = 2; // Pages to show on each side of current
        const range: (number | string)[] = [];
        const rangeWithDots: (number | string)[] = [];
        let l: number | undefined;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i);
            }
        }

        for (const i of range) {
            if (typeof i === 'number') {
                if (l) {
                    if (i - l === 2) {
                        rangeWithDots.push(l + 1);
                    } else if (i - l !== 1) {
                        rangeWithDots.push('...');
                    }
                }
                rangeWithDots.push(i);
                l = i;
            }
        }

        return rangeWithDots;
    };

    const handleJumpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const pageNum = parseInt(jumpPage, 10);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
            onPageChange(pageNum);
            setJumpPage('');
        }
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-6 px-2 border-t border-slate-200">
            {/* Items info */}
            <div className="text-xs text-slate-600 font-medium">
                Hiển thị <strong className="text-slate-900">{startItem.toLocaleString('vi-VN')}</strong> –{' '}
                <strong className="text-slate-900">{endItem.toLocaleString('vi-VN')}</strong> trong tổng số{' '}
                <strong className="text-blue-700">{totalItems.toLocaleString('vi-VN')}</strong> loại thuốc
                <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-semibold text-[11px] border border-blue-100">
          40 thuốc/trang
        </span>
            </div>

            {/* Pagination controls */}
            <div className="flex flex-wrap items-center gap-1.5">
                {/* First Page */}
                <button
                    id="first-page-btn"
                    type="button"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors text-xs font-medium"
                    title="Trang đầu tiên (Trang 1)"
                >
                    <ChevronsLeft className="w-4 h-4" />
                </button>

                {/* Prev Page */}
                <button
                    id="prev-page-btn"
                    type="button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors text-xs font-medium flex items-center gap-1"
                    title="Trang trước"
                >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Trước</span>
                </button>

                {/* Number buttons */}
                <div className="flex items-center gap-1">
                    {pageNumbers.map((p, idx) => {
                        if (p === '...') {
                            return (
                                <span key={`dots-${idx}`} className="px-2 text-slate-400 text-xs font-bold select-none">
                  ...
                </span>
                            );
                        }

                        const pageNum = Number(p);
                        const isCurrent = pageNum === currentPage;

                        return (
                            <button
                                key={`page-${pageNum}`}
                                id={`page-btn-${pageNum}`}
                                type="button"
                                onClick={() => onPageChange(pageNum)}
                                className={`min-w-[36px] h-9 px-2 rounded-lg text-xs font-bold transition-all ${
                                    isCurrent
                                        ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/30 ring-2 ring-blue-600/20'
                                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                                }`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                </div>

                {/* Next Page */}
                <button
                    id="next-page-btn"
                    type="button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors text-xs font-medium flex items-center gap-1"
                    title="Trang sau"
                >
                    <span className="hidden sm:inline">Sau</span>
                    <ChevronRight className="w-4 h-4" />
                </button>

                {/* Last Page */}
                <button
                    id="last-page-btn"
                    type="button"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors text-xs font-medium"
                    title={`Trang cuối cùng (Trang ${totalPages})`}
                >
                    <ChevronsRight className="w-4 h-4" />
                </button>
            </div>

            {/* Jump to page form */}
            <form onSubmit={handleJumpSubmit} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span>Tới trang:</span>
                <input
                    type="number"
                    min={1}
                    max={totalPages}
                    placeholder={String(currentPage)}
                    value={jumpPage}
                    onChange={(e) => setJumpPage(e.target.value)}
                    className="w-14 px-2 py-1 bg-white border border-slate-200 rounded-lg text-center text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                />
                <span className="text-slate-400">/ {totalPages}</span>
                <button
                    type="submit"
                    disabled={!jumpPage}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    Đi
                </button>
            </form>
        </div>
    );
};
