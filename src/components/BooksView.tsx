import React, { useState } from 'react';
import {
  BookOpen,
  Headphones,
  Download,
  Check,
  Bookmark,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type {
  DhammaBook,
  OfflineReadingPacket,
  ReadingProgressMap,
} from '../utils/waharakaLogic';
import { getReadingProgressPercent } from '../utils/waharakaLogic';

interface BooksViewProps {
  books: DhammaBook[];
  offlineReadings: Record<string, OfflineReadingPacket>;
  readingProgress: ReadingProgressMap;
  onOpenReader: (
    book: DhammaBook,
    startAudio?: boolean,
    initialPageNumber?: number
  ) => void;
  onToggleOfflineBook: (book: DhammaBook) => void;
}

export const BooksView: React.FC<BooksViewProps> = ({
  books,
  offlineReadings,
  readingProgress,
  onOpenReader,
  onToggleOfflineBook,
}) => {
  const [expandedBookToc, setExpandedBookToc] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4 border-b border-stone-200 dark:border-stone-800 pb-3 sm:pb-4">
        <div>
          <p className="text-xs font-medium text-amber-800 dark:text-amber-400">
            සදහම් ග්‍රන්ථ එකතුව · Official Waharaka Printed & Digital Books ({books.length} Books)
          </p>
          <h1 className="text-xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 font-serif-display">
            All {books.length} Authentic Waharaka Dhamma Books
          </h1>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md">
          Open any book in the Clean Reader to read all pages of the official Waharaka edition with interactive Table of Contents (පටුන), Night Mode, and companion Deshana audio.
        </p>
      </div>

      {books.length === 0 ? (
        <div className="p-10 text-center rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
          <p className="text-sm sm:text-base font-medium text-stone-800 dark:text-stone-200">
            No Dhamma books match your current search or offline filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-5">
          {books.map((book, idx) => {
            const isSaved = Boolean(offlineReadings[book.id]);
            const progress = readingProgress[book.id];
            const progressPct = progress
              ? getReadingProgressPercent(
                  progress.pageNumber,
                  progress.totalPages || 100
                )
              : 0;
            const isTocOpen = Boolean(expandedBookToc[book.id]);

            return (
              <article
                key={book.id}
                className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 sm:p-6 space-y-3.5"
              >
                {/* Mobile-Friendly Side-by-Side Header Row: Cover Sprite + Book Title & Metadata */}
                <div className="flex items-start gap-3.5 sm:gap-5">
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div
                      aria-label={book.title}
                      className="w-[60px] h-[85px] rounded-lg overflow-hidden bg-stone-800 border border-stone-300 dark:border-stone-700 shadow-xs"
                      style={{
                        backgroundImage: `url(${book.spriteUrl})`,
                        backgroundPosition: `0px ${book.spriteOffsetY}px`,
                        backgroundRepeat: 'no-repeat',
                      }}
                    />
                    <span className="text-[10px] font-mono-tabular text-stone-400">
                      #{String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 font-mono-tabular">
                      <span className="font-sans font-semibold text-amber-800 dark:text-amber-400">
                        {book.author}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-sans">{book.compiler}</span>
                      <span aria-hidden="true">·</span>
                      <span>{book.toc.length} Topics</span>
                      {isSaved && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-sans font-semibold text-emerald-700 dark:text-emerald-400">
                            Offline
                          </span>
                        </>
                      )}
                      {progress?.bookmarked && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-sans font-medium text-amber-700 dark:text-amber-300 inline-flex items-center gap-1">
                            <Bookmark className="w-3 h-3 fill-current" /> p.{progress.pageNumber}
                          </span>
                        </>
                      )}
                    </div>

                    <h2 className="text-lg sm:text-2xl font-bold text-stone-900 dark:text-stone-100 font-serif-display leading-snug">
                      {book.title}
                    </h2>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 font-mono-tabular truncate">
                      {book.urlName}
                    </p>
                  </div>
                </div>

                {/* Interactive Table of Contents (පටුන) */}
                <div className="border-t border-stone-200/80 dark:border-stone-800 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      පටුන · Table of Contents ({book.toc.length} Topics)
                    </span>
                    {book.toc.length > 6 && (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedBookToc((prev) => ({
                            ...prev,
                            [book.id]: !isTocOpen,
                          }))
                        }
                        className="text-xs font-medium text-amber-800 dark:text-amber-400 hover:underline flex items-center gap-1"
                      >
                        <span>
                          {isTocOpen
                            ? 'Show Less'
                            : `All ${book.toc.length} Topics`}
                        </span>
                        {isTocOpen ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1">
                    {(isTocOpen ? book.toc : book.toc.slice(0, 6)).map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() =>
                          onOpenReader(book, false, entry.pdfPageNo)
                        }
                        className="text-left px-2.5 py-1.5 rounded-lg text-xs text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-stone-800 flex items-center justify-between gap-2 border border-stone-200/60 dark:border-stone-800 transition-colors"
                      >
                        <span className="truncate">
                          <span className="font-mono-tabular text-stone-400 mr-1.5">
                            {entry.index}.
                          </span>
                          {entry.title}
                        </span>
                        <span className="font-mono-tabular text-[11px] text-amber-800 dark:text-amber-400 shrink-0">
                          p.{entry.printedPageNo}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {progressPct > 0 && (
                  <div className="max-w-sm pt-1 space-y-1">
                    <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-mono-tabular">
                      <span>
                        Page {progress?.pageNumber ?? 1} of {progress?.totalPages ?? '...'}
                      </span>
                      <span>{progressPct}% Read</span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-700 dark:bg-amber-500 rounded-full"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Mobile-Optimized Actions */}
                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenReader(book, false)}
                    className="flex-1 sm:flex-initial min-h-[42px] px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 text-white dark:text-stone-950 text-xs font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Open Clean Reader</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenReader(book, true)}
                    className="min-h-[42px] px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-white dark:text-stone-950 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                  >
                    <Headphones className="w-3.5 h-3.5" />
                    <span>Read & Listen</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleOfflineBook(book)}
                    aria-label={
                      isSaved
                        ? `Remove ${book.title} from offline local storage`
                        : `Save ${book.title} PDF for offline reading`
                    }
                    className={`min-h-[42px] px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 border transition-colors whitespace-nowrap shrink-0 ${
                      isSaved
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 border-stone-200 dark:border-stone-700 hover:bg-stone-200/70 dark:hover:bg-stone-700'
                    }`}
                  >
                    {isSaved ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Offline</span>
                      </>
                    )}
                  </button>

                  <a
                    href={book.directPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[42px] px-2.5 py-2 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 flex items-center gap-1 whitespace-nowrap shrink-0"
                  >
                    <span>PDF</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
