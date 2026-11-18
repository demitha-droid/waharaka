import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Download,
  Check,
  Headphones,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  paginateItems,
  getReadingProgressPercent,
  type MagazineIssue,
  type OfflineReadingPacket,
  type ReadingProgressMap,
} from '../utils/waharakaLogic';
import { PaginationBar } from './PaginationBar';

const MAGAZINES_PER_PAGE = 15;

interface MagazinesViewProps {
  magazines: MagazineIssue[];
  offlineReadings: Record<string, OfflineReadingPacket>;
  readingProgress: ReadingProgressMap;
  onOpenReader: (
    issue: MagazineIssue,
    startAudio?: boolean,
    initialPageNumber?: number
  ) => void;
  onToggleOfflineMagazine: (issue: MagazineIssue) => void;
}

const MAGAZINE_YEARS: (number | 'All')[] = [
  'All',
  2019,
  2018,
  2017,
  2016,
  2015,
  2014,
  2013,
  2012,
  2011,
];

export const MagazinesView: React.FC<MagazinesViewProps> = ({
  magazines,
  offlineReadings,
  readingProgress,
  onOpenReader,
  onToggleOfflineMagazine,
}) => {
  const [selectedYear, setSelectedYear] = useState<number | 'All'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedTocMap, setExpandedTocMap] = useState<Record<string, boolean>>({
    'hbp-100': true,
    'hbp-99': true,
  });

  const visibleMagazines = useMemo(
    () =>
      magazines.filter(
        (m) => selectedYear === 'All' || m.publishedYear === selectedYear
      ),
    [magazines, selectedYear]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedYear, visibleMagazines.length]);

  const pagination = useMemo(
    () => paginateItems(visibleMagazines, currentPage, MAGAZINES_PER_PAGE),
    [visibleMagazines, currentPage]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
        <div>
          <p className="text-xs font-medium text-amber-800 dark:text-amber-400">
            හෙළ බොදු පියුම · Complete Official Periodical Archive ({magazines.length} Volumes)
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 font-serif-display">
            All {magazines.length} Hela Bodu Piyuma Magazine Issues
          </h1>
        </div>

        {/* Year Filter Bar */}
        <div
          role="tablist"
          aria-label="Filter magazines by publication year"
          className="flex items-center gap-1 p-1 bg-stone-200/70 dark:bg-zinc-950 rounded-xl overflow-x-auto max-w-full border border-stone-200 dark:border-stone-800"
        >
          {MAGAZINE_YEARS.map((yr) => {
            const active = selectedYear === yr;
            return (
              <button
                key={String(yr)}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedYear(yr)}
                className={`min-h-[34px] px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold shadow-xs'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                {yr === 'All' ? `All (${magazines.length})` : yr}
              </button>
            );
          })}
        </div>
      </div>

      {visibleMagazines.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-zinc-950">
          <p className="text-base font-medium text-stone-800 dark:text-stone-200">
            No magazine issues match your current search or year filter.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pagination.items.map((issue) => {
              const isSaved = Boolean(offlineReadings[issue.id]);
              const progressEntry = readingProgress[issue.id];
              const progressPct = progressEntry
                ? getReadingProgressPercent(
                    progressEntry.pageNumber,
                    progressEntry.totalPages || 44
                  )
                : 0;
              const isTocExpanded = Boolean(expandedTocMap[issue.id]);

              return (
                <article
                  key={issue.id}
                  className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-zinc-950 overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-5 space-y-3.5">
                    <div className="flex gap-4 items-start">
                      {/* Authentic Waharaka Magazine Cover Thumbnail Sprite */}
                      <div
                        aria-label={issue.title}
                        className="w-[60px] h-[85px] rounded-lg overflow-hidden shrink-0 border border-stone-300 dark:border-stone-700 bg-stone-800 shadow-xs"
                        style={{
                          backgroundImage: `url(${issue.spriteUrl})`,
                          backgroundPosition: `0px ${issue.spriteOffsetY}px`,
                          backgroundRepeat: 'no-repeat',
                        }}
                      />

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 font-mono-tabular">
                          <span className="font-sans font-semibold text-amber-800 dark:text-amber-400">
                            {issue.issueNumber}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{issue.publishedYear}</span>
                          <span aria-hidden="true">·</span>
                          <span>{issue.toc.length} Articles</span>
                          {isSaved && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-sans font-semibold text-emerald-700 dark:text-emerald-400">
                                Offline
                              </span>
                            </>
                          )}
                        </div>

                        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 font-serif-display leading-snug">
                          {issue.title}
                        </h2>
                        <p className="text-xs font-medium text-stone-600 dark:text-stone-400">
                          {issue.sinhalaTitle}
                        </p>
                      </div>
                    </div>

                    {/* Table of Contents (පටුන) Preview & Direct Page Jump */}
                    <div className="border-t border-stone-200/80 dark:border-stone-800 pt-2.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                          පටුන · Articles ({issue.toc.length})
                        </span>
                        {issue.toc.length > 4 && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedTocMap((prev) => ({
                                ...prev,
                                [issue.id]: !isTocExpanded,
                              }))
                            }
                            className="text-xs font-medium text-amber-800 dark:text-amber-400 hover:underline flex items-center gap-0.5"
                          >
                            <span>
                              {isTocExpanded ? 'Show Less' : `All ${issue.toc.length}`}
                            </span>
                            {isTocExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>

                      <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                        {(isTocExpanded ? issue.toc : issue.toc.slice(0, 4)).map(
                          (entry) => (
                            <button
                              key={entry.id}
                              type="button"
                              onClick={() =>
                                onOpenReader(issue, false, entry.pdfPageNo)
                              }
                              className="w-full text-left py-1 px-2 rounded-lg text-xs text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-stone-800 flex items-start justify-between gap-2 transition-colors"
                            >
                              <span className="line-clamp-1">{entry.title}</span>
                              <span className="font-mono-tabular text-[11px] text-stone-400 shrink-0">
                                {entry.isCoverPage ? 'කවරය' : `p.${entry.printedPageNo}`}
                              </span>
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {progressPct > 0 && (
                      <div className="pt-1 space-y-1">
                        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-mono-tabular">
                          <span>
                            Page {progressEntry?.pageNumber || 1} of{' '}
                            {progressEntry?.totalPages || 44}
                          </span>
                          <span>{progressPct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-700 dark:bg-amber-500 rounded-full"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-5 pt-0 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenReader(issue, false)}
                      className="flex-1 min-h-[42px] px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 text-white dark:text-stone-950 text-xs font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Read Full Issue</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenReader(issue, true)}
                      aria-label={`Read ${issue.title} with companion sermon audio`}
                      className="min-h-[42px] px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                    >
                      <Headphones className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                      <span>Read & Listen</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleOfflineMagazine(issue)}
                      aria-label={
                        isSaved
                          ? `Remove ${issue.title} from offline local storage`
                          : `Save ${issue.title} PDF to offline storage`
                      }
                      className={`min-h-[42px] px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1 border transition-colors whitespace-nowrap shrink-0 ${
                        isSaved
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 border-stone-200 dark:border-stone-700'
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
                      href={issue.directPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open ${issue.title} PDF directly`}
                      className="min-h-[42px] px-2.5 py-2 rounded-xl text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 flex items-center justify-center"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>

          <PaginationBar
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            startIndex={pagination.startIndex}
            endIndex={pagination.endIndex}
            pageNumbers={pagination.pageNumbers}
            itemLabel="magazines"
            onSelectPage={setCurrentPage}
          />
        </>
      )}
    </div>
  );
};
