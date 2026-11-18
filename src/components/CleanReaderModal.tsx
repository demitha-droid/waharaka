import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  Bookmark,
  Download,
  Check,
  ChevronLeft,
  ChevronRight,
  Volume2,
  ZoomIn,
  ZoomOut,
  List,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { TocEntry, SermonItem } from '../utils/waharakaLogic';
import {
  getPdfBufferFromVault,
  savePdfBufferToVault,
} from '../utils/offlineVault';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export interface ReaderDocument {
  id: string;
  itemType: 'magazine' | 'book';
  title: string;
  sinhalaTitle: string;
  subtitle: string;
  sizeMb: number;
  pdfProxyUrl: string;
  directPdfUrl: string;
  toc: TocEntry[];
  companionSermon?: SermonItem | null;
}

interface CleanReaderModalProps {
  document: ReaderDocument | null;
  initialPageNumber: number;
  autoStartAudio: boolean;
  isBookmarked: boolean;
  isSavedOffline: boolean;
  isAppDarkMode: boolean;
  onClose: () => void;
  onUpdateProgress: (
    docId: string,
    pageNumber: number,
    totalPages: number,
    bookmarked: boolean
  ) => void;
  onToggleSaveOffline: () => void;
  onPlayCompanionSermon?: (sermon: SermonItem) => void;
  isGlobalAudioPlaying?: boolean;
  currentGlobalSermonId?: string | null;
}

type ReaderSurface = 'day' | 'sepia' | 'night';

export const CleanReaderModal: React.FC<CleanReaderModalProps> = ({
  document: doc,
  initialPageNumber,
  autoStartAudio,
  isBookmarked,
  isSavedOffline,
  isAppDarkMode,
  onClose,
  onUpdateProgress,
  onToggleSaveOffline,
  onPlayCompanionSermon,
  isGlobalAudioPlaying,
  currentGlobalSermonId,
}) => {
  const [pageNumber, setPageNumber] = useState<number>(Math.max(1, initialPageNumber || 1));
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pageInput, setPageInput] = useState<string>(String(Math.max(1, initialPageNumber || 1)));
  const [zoomScale, setZoomScale] = useState<number>(() =>
    typeof window !== 'undefined' && window.innerWidth < 640 ? 0.68 : 1.35
  );
  const [surface, setSurface] = useState<ReaderSurface>(isAppDarkMode ? 'night' : 'sepia');
  const [showTocSidebar, setShowTocSidebar] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(false);
  const [isRenderingPage, setIsRenderingPage] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const pdfDocRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<any>(null);

  useEffect(() => {
    setSurface(isAppDarkMode ? 'night' : 'sepia');
  }, [isAppDarkMode]);

  useEffect(() => {
    if (!doc) return;
    const startPage = Math.max(1, initialPageNumber || doc.toc[0]?.pdfPageNo || 1);
    setPageNumber(startPage);
    setPageInput(String(startPage));
    setPdfError(null);
  }, [doc?.id, initialPageNumber]);

  // Auto-trigger companion Waharaka sermon audio if user clicked "Read & Listen"
  useEffect(() => {
    if (
      doc &&
      autoStartAudio &&
      doc.companionSermon &&
      onPlayCompanionSermon &&
      currentGlobalSermonId !== doc.companionSermon.id
    ) {
      onPlayCompanionSermon(doc.companionSermon);
    }
  }, [doc?.id, autoStartAudio]);

  // Load real PDF from offline IndexedDB vault or from /api/waharaka/pdf/... proxy
  useEffect(() => {
    if (!doc) return;
    let cancelled = false;

    async function loadPdfDocument() {
      setIsLoadingPdf(true);
      setPdfError(null);
      try {
        let buffer = await getPdfBufferFromVault(doc!.id);
        if (!buffer) {
          const response = await fetch(doc!.pdfProxyUrl);
          if (!response.ok) {
            throw new Error(`Failed to load PDF (${response.status})`);
          }
          buffer = await response.arrayBuffer();
          if (isSavedOffline) {
            await savePdfBufferToVault(doc!.id, buffer.slice(0));
          }
        }
        if (cancelled) return;

        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
        const pdfDoc = await loadingTask.promise;
        if (cancelled) {
          (pdfDoc as any).destroy?.();
          return;
        }
        pdfDocRef.current = pdfDoc;
        setTotalPages(pdfDoc.numPages);
        const validStart = Math.min(
          Math.max(1, initialPageNumber || doc!.toc[0]?.pdfPageNo || 1),
          pdfDoc.numPages
        );
        setPageNumber(validStart);
        setPageInput(String(validStart));
      } catch (err: any) {
        if (!cancelled) {
          setPdfError(
            err?.message || 'Unable to load the PDF document from waharaka.com.'
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingPdf(false);
        }
      }
    }

    loadPdfDocument();

    return () => {
      cancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // Ignore
        }
      }
      if (pdfDocRef.current) {
        try {
          pdfDocRef.current.destroy();
        } catch {
          // Ignore
        }
        pdfDocRef.current = null;
      }
    };
  }, [doc?.id]);

  // Render active page onto high-DPI canvas whenever pageNumber or zoomScale changes
  useEffect(() => {
    const pdfDoc = pdfDocRef.current;
    const canvas = canvasRef.current;
    if (!pdfDoc || !canvas || totalPages === 0) return;

    let cancelled = false;

    async function renderCurrentPage() {
      setIsRenderingPage(true);
      try {
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {
            // Ignore
          }
        }
        const safePage = Math.min(Math.max(1, pageNumber), pdfDoc.numPages);
        const page = await pdfDoc.getPage(safePage);
        if (cancelled) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const viewport = page.getViewport({ scale: zoomScale });
        const context = canvas!.getContext('2d');
        if (!context) return;

        canvas!.width = Math.floor(viewport.width * dpr);
        canvas!.height = Math.floor(viewport.height * dpr);
        canvas!.style.width = `${Math.floor(viewport.width)}px`;
        canvas!.style.height = `${Math.floor(viewport.height)}px`;

        const transform = dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined;
        const renderContext = {
          canvasContext: context,
          transform,
          viewport,
        };

        const task = page.render(renderContext);
        renderTaskRef.current = task;
        await task.promise;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException' && !cancelled) {
          // Ignore transient cancel errors
        }
      } finally {
        if (!cancelled) {
          setIsRenderingPage(false);
        }
      }
    }

    renderCurrentPage();

    return () => {
      cancelled = true;
    };
  }, [pageNumber, zoomScale, totalPages, isLoadingPdf]);

  if (!doc) return null;

  const goToPage = (targetPage: number) => {
    const maxP = totalPages || 999;
    const clamped = Math.min(Math.max(1, targetPage), maxP);
    setPageNumber(clamped);
    setPageInput(String(clamped));
    onUpdateProgress(doc.id, clamped, totalPages || maxP, isBookmarked);
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(pageInput, 10);
    if (!isNaN(parsed)) {
      goToPage(parsed);
    }
  };

  const surfaceStyles: Record<ReaderSurface, string> = {
    day: 'bg-stone-100 text-stone-900',
    sepia: 'bg-[#f4ecd8] text-[#2c221e]',
    night: 'bg-stone-950 text-stone-100',
  };

  // Visual filter applied to rendered PDF page canvas for comfortable Day, Sepia, or Night reading
  const canvasFilterStyle: Record<ReaderSurface, React.CSSProperties> = {
    day: { filter: 'none' },
    sepia: { filter: 'sepia(0.32) contrast(1.04) brightness(0.98)' },
    night: { filter: 'invert(0.92) hue-rotate(180deg) contrast(1.08)' },
  };

  // Determine current active TOC chapter based on pageNumber
  let activeTocId = doc.toc[0]?.id;
  for (const entry of doc.toc) {
    if (entry.pdfPageNo <= pageNumber) {
      activeTocId = entry.id;
    } else {
      break;
    }
  }

  const isCompanionPlaying =
    Boolean(doc.companionSermon) &&
    currentGlobalSermonId === doc.companionSermon?.id &&
    Boolean(isGlobalAudioPlaying);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Reading ${doc.title}`}
      className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-xs"
    >
      <div
        className={`flex-1 flex flex-col w-full max-w-7xl mx-auto my-0 sm:my-3 sm:rounded-2xl overflow-hidden border border-stone-300 dark:border-stone-800 shadow-2xl ${surfaceStyles[surface]}`}
      >
        {/* Clean Reader Top Bar */}
        <div className="px-4 sm:px-6 pt-android-safe pb-3 border-b border-stone-300/60 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 bg-black/5 dark:bg-white/5">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setShowTocSidebar((s) => !s)}
              aria-expanded={showTocSidebar}
              aria-label="Toggle Table of Contents (පටුන)"
              className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors shrink-0 ${
                showTocSidebar
                  ? 'bg-amber-800 text-white border-amber-800 dark:bg-amber-500 dark:text-stone-950 dark:border-amber-500'
                  : 'border-current/20 hover:bg-black/10 dark:hover:bg-white/10'
              }`}
            >
              <List className="w-4 h-4" />
              <span>පටුන ({doc.toc.length})</span>
            </button>

            <div className="min-w-0 flex-1">
              <p className="text-xs opacity-75 truncate font-mono-tabular">
                {doc.subtitle} ·{' '}
                {totalPages > 0
                  ? `Page ${pageNumber} of ${totalPages}`
                  : 'Loading pages...'}
              </p>
              <h2 className="text-base sm:text-lg font-bold font-serif-display truncate">
                {doc.title}
              </h2>
            </div>
          </div>

          {/* Zoom, Surface Mode, Bookmark, Save Offline & Close Controls */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 bg-black/10 dark:bg-white/10 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setZoomScale((z) => Math.max(0.75, Math.round((z - 0.2) * 100) / 100))}
                aria-label="Zoom out page"
                className="min-h-[34px] px-2 rounded-lg text-xs font-semibold hover:bg-black/10 dark:hover:bg-white/10 flex items-center"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5 text-xs font-mono-tabular">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomScale((z) => Math.min(2.2, Math.round((z + 0.2) * 100) / 100))}
                aria-label="Zoom in page"
                className="min-h-[34px] px-2 rounded-lg text-xs font-semibold hover:bg-black/10 dark:hover:bg-white/10 flex items-center"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Surface switcher: Day / Sepia / Night */}
            <div
              role="group"
              aria-label="Reader background theme"
              className="flex items-center gap-1 bg-black/10 dark:bg-white/10 p-1 rounded-xl"
            >
              {(['day', 'sepia', 'night'] as ReaderSurface[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSurface(mode)}
                  className={`min-h-[34px] px-2.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                    surface === mode
                      ? 'bg-amber-800 text-white dark:bg-amber-500 dark:text-stone-950 font-semibold'
                      : 'opacity-75 hover:opacity-100'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                onUpdateProgress(doc.id, pageNumber, totalPages || 1, !isBookmarked)
              }
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this page'}
              className={`min-h-[38px] px-3 rounded-xl text-xs font-medium flex items-center gap-1 border border-current/20 ${
                isBookmarked ? 'bg-amber-600/20 text-amber-700 dark:text-amber-300' : ''
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </span>
            </button>

            <button
              type="button"
              onClick={async () => {
                onToggleSaveOffline();
                if (!isSavedOffline && pdfDocRef.current) {
                  try {
                    const data = await pdfDocRef.current.getData();
                    await savePdfBufferToVault(doc.id, data.buffer);
                  } catch {
                    // Ignore
                  }
                }
              }}
              className="min-h-[38px] px-3 rounded-xl text-xs font-medium flex items-center gap-1 border border-current/20"
            >
              {isSavedOffline ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden sm:inline">Saved Offline</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Save Offline</span>
                </>
              )}
            </button>

            <a
              href={doc.directPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[38px] px-3 rounded-xl text-xs font-medium flex items-center gap-1 border border-current/20 hover:bg-black/5 dark:hover:bg-white/5"
            >
              <span>PDF</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close reader"
              className="min-h-[38px] min-w-[38px] rounded-xl flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Companion Authentic Waharaka Audio Strip */}
        {doc.companionSermon && onPlayCompanionSermon && (
          <div className="px-4 sm:px-6 py-2 bg-amber-900/10 dark:bg-amber-500/10 border-b border-stone-300/50 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs min-w-0">
              <Volume2 className="w-4 h-4 text-amber-800 dark:text-amber-400 shrink-0" />
              <span className="truncate font-medium">
                Companion Deshana: {doc.companionSermon.title} ({doc.companionSermon.durationFormatted})
              </span>
            </div>

            <button
              type="button"
              onClick={() => onPlayCompanionSermon(doc.companionSermon!)}
              className="min-h-[34px] px-3.5 py-1 rounded-xl bg-amber-800 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-stone-950 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
            >
              {isCompanionPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause Deshana</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Listen While Reading</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Main Split Body: Table of Contents (පටුන) Sidebar + Multi-Page Canvas Viewport */}
        <div className="flex-1 flex overflow-hidden relative">
          {showTocSidebar && (
            <aside
              aria-label="Table of Contents (පටුන)"
              className="absolute md:static inset-y-0 left-0 z-20 w-72 sm:w-80 shrink-0 border-r border-stone-300/60 dark:border-stone-800 overflow-y-auto bg-[#f4ecd8] dark:bg-stone-900 flex flex-col shadow-xl md:shadow-none"
            >
              <div className="p-3.5 border-b border-stone-300/50 dark:border-stone-800 flex items-center justify-between">
                <span className="text-xs font-bold tracking-wide">
                  පටුන · Table of Contents ({doc.toc.length} Topics)
                </span>
                <button
                  type="button"
                  onClick={() => setShowTocSidebar(false)}
                  className="md:hidden p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
                  aria-label="Close Table of Contents"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="divide-y divide-stone-300/40 dark:divide-stone-800/60">
                {doc.toc.map((entry) => {
                  const isActive = entry.id === activeTocId;
                  return (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => {
                        goToPage(entry.pdfPageNo);
                        if (typeof window !== 'undefined' && window.innerWidth < 768) {
                          setShowTocSidebar(false);
                        }
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-xs transition-colors flex items-start justify-between gap-2 ${
                        isActive
                          ? 'bg-amber-800/15 dark:bg-amber-500/20 font-semibold text-amber-900 dark:text-amber-300'
                          : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-85'
                      }`}
                    >
                      <span className="leading-snug">
                        <span className="font-mono-tabular opacity-60 mr-1.5">
                          {entry.index}.
                        </span>
                        {entry.title}
                      </span>
                      <span className="font-mono-tabular text-[11px] opacity-75 shrink-0 pt-0.5">
                        {entry.isCoverPage ? 'කවරය' : `p.${entry.printedPageNo}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>
          )}

          {/* Rendered PDF Page Canvas Container */}
          <div className="flex-1 overflow-auto flex flex-col items-center p-4 sm:p-8">
            {isLoadingPdf ? (
              <div className="my-auto flex flex-col items-center gap-3 py-16">
                <Loader2 className="w-8 h-8 animate-spin text-amber-700 dark:text-amber-400" />
                <p className="text-sm font-medium">
                  Loading authentic {doc.itemType === 'book' ? 'Book' : 'Hela Bodu Piyuma Magazine'} pages from Waharaka.com...
                </p>
              </div>
            ) : pdfError ? (
              <div className="my-auto max-w-md text-center space-y-4 p-6 rounded-2xl border border-current/20">
                <p className="text-sm font-semibold">{pdfError}</p>
                <a
                  href={doc.directPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-800 text-white text-xs font-semibold"
                >
                  <span>Open Official PDF Directly</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <div className="relative flex flex-col items-center">
                {isRenderingPage && (
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/70 text-white text-[11px] font-mono-tabular flex items-center gap-1.5 z-10">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Rendering page {pageNumber}...</span>
                  </div>
                )}
                <canvas
                  ref={canvasRef}
                  style={canvasFilterStyle[surface]}
                  className="rounded-lg shadow-xl border border-stone-300 dark:border-stone-800 max-w-full h-auto"
                />
              </div>
            )}
          </div>
        </div>

        {/* Reader Footer: All-Page Navigation (Page 1 to totalPages) */}
        <div className="px-4 sm:px-6 py-3 border-t border-stone-300/60 dark:border-stone-800 flex flex-wrap items-center justify-between gap-4 bg-black/5 dark:bg-white/5">
          <button
            type="button"
            disabled={pageNumber <= 1}
            onClick={() => goToPage(pageNumber - 1)}
            className="min-h-[40px] px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-current/20 disabled:opacity-40 hover:bg-black/5 dark:hover:bg-white/5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Page</span>
          </button>

          <form
            onSubmit={handlePageInputSubmit}
            className="flex items-center gap-2 text-xs font-mono-tabular"
          >
            <label htmlFor="reader-page-jump">Page</label>
            <input
              id="reader-page-jump"
              type="number"
              min={1}
              max={totalPages || 999}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={() => {
                const parsed = parseInt(pageInput, 10);
                if (!isNaN(parsed)) goToPage(parsed);
              }}
              className="w-16 px-2 py-1 text-center rounded-lg border border-current/30 bg-transparent font-semibold"
            />
            <span>of {totalPages || '...'}</span>

            {totalPages > 1 && (
              <input
                type="range"
                aria-label="Jump to page slider"
                min={1}
                max={totalPages}
                value={pageNumber}
                onChange={(e) => goToPage(Number(e.target.value))}
                className="hidden md:block w-36 accent-amber-700 dark:accent-amber-500 cursor-pointer ml-2"
              />
            )}
          </form>

          <button
            type="button"
            disabled={totalPages > 0 && pageNumber >= totalPages}
            onClick={() => goToPage(pageNumber + 1)}
            className="min-h-[40px] px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-current/20 disabled:opacity-40 hover:bg-black/5 dark:hover:bg-white/5"
          >
            <span>Next Page</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
