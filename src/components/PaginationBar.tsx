import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  pageNumbers: (number | 'ellipsis')[];
  itemLabel?: string;
  onSelectPage: (page: number) => void;
}

export const PaginationBar: React.FC<PaginationBarProps> = ({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  pageNumbers,
  itemLabel = 'posts',
  onSelectPage,
}) => {
  if (totalPages <= 1) return null;

  const handlePageClick = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onSelectPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav
      aria-label="Pagination"
      data-testid="pagination-bar"
      className="pt-2 pb-4 flex flex-col sm:flex-row items-center justify-between gap-3"
    >
      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono-tabular">
        Showing {startIndex + 1}–{endIndex} of {totalItems} {itemLabel} · Page {currentPage} of{' '}
        {totalPages}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <button
          type="button"
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
          className="min-h-[40px] min-w-[40px] px-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pageNumbers.map((entry, idx) =>
          entry === 'ellipsis' ? (
            <span
              key={`ellipsis-${idx}`}
              aria-hidden="true"
              className="px-1.5 text-xs text-zinc-400 dark:text-zinc-500 font-mono-tabular select-none"
            >
              …
            </span>
          ) : (
            <button
              key={entry}
              type="button"
              onClick={() => handlePageClick(entry)}
              aria-label={`Page ${entry}`}
              aria-current={entry === currentPage ? 'page' : undefined}
              className={`min-h-[40px] min-w-[40px] px-3 rounded-xl text-xs font-mono-tabular font-semibold flex items-center justify-center border transition-colors ${
                entry === currentPage
                  ? 'bg-amber-600 text-zinc-950 border-amber-500 dark:bg-amber-500 dark:text-zinc-950 dark:border-amber-400 shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800'
              }`}
            >
              {entry}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
          className="min-h-[40px] min-w-[40px] px-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
};
