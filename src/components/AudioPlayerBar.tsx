import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  Download,
  Check,
  ChevronDown,
  Maximize2,
  X,
  FileText,
  ExternalLink,
  Disc,
  Loader2,
} from 'lucide-react';
import { formatDuration, type SermonItem } from '../utils/waharakaLogic';
import { HERO_MONASTERY_IMG } from '../data/waharakaCatalog';

interface AudioPlayerBarProps {
  currentSermon: SermonItem | null;
  isPlaying: boolean;
  isFullScreen: boolean;
  currentTimeSec: number;
  playbackRate: number;
  isSavedOffline: boolean;
  onOpenFullScreen: () => void;
  onMinimizePlayer: () => void;
  onClosePlayer: () => void;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  onSkip: (deltaSeconds: number) => void;
  onPrevSermon?: () => void;
  onNextSermon?: () => void;
  onCyclePlaybackRate: () => void;
  onToggleOffline: (sermon: SermonItem) => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  currentSermon,
  isPlaying,
  isFullScreen,
  currentTimeSec,
  playbackRate,
  isSavedOffline,
  onOpenFullScreen,
  onMinimizePlayer,
  onClosePlayer,
  onTogglePlay,
  onSeek,
  onSkip,
  onPrevSermon,
  onNextSermon,
  onCyclePlaybackRate,
  onToggleOffline,
}) => {
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showNotesInPlayer, setShowNotesInPlayer] = useState(false);
  const [playerNotes, setPlayerNotes] = useState<{
    loading: boolean;
    notes: string[];
    tags: string[];
  }>({ loading: false, notes: [], tags: [] });

  const startXRef = useRef<number | null>(null);
  const currentDeltaXRef = useRef<number>(0);

  // Reset drag state when sermon changes
  useEffect(() => {
    setDragOffsetX(0);
    setIsDragging(false);
    currentDeltaXRef.current = 0;
    startXRef.current = null;
  }, [currentSermon?.id, isFullScreen]);

  // Fetch authentic listen notes when user opens Gatha & Notes inside Full-Screen Player
  useEffect(() => {
    if (!isFullScreen || !showNotesInPlayer || !currentSermon) return;
    let cancelled = false;
    setPlayerNotes({ loading: true, notes: [], tags: [] });

    fetch(`/api/waharaka/listen-notes/${encodeURIComponent(currentSermon.id)}`)
      .then((r) => (r.ok ? r.json() : { notes: [], tags: [] }))
      .then((data) => {
        if (!cancelled) {
          setPlayerNotes({
            loading: false,
            notes: Array.isArray(data.notes) ? data.notes : [],
            tags: Array.isArray(data.tags) ? data.tags : [],
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPlayerNotes({ loading: false, notes: [], tags: [] });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentSermon?.id, isFullScreen, showNotesInPlayer]);

  if (!currentSermon) return null;

  const progressPct =
    currentSermon.durationSeconds > 0
      ? Math.min(100, (currentTimeSec / currentSermon.durationSeconds) * 100)
      : 0;

  // Swipe Left / Right Gesture Handlers for Minimized Player
  const handleGestureStart = (clientX: number) => {
    startXRef.current = clientX;
    currentDeltaXRef.current = 0;
    setIsDragging(true);
  };

  const handleGestureMove = (clientX: number) => {
    if (startXRef.current === null) return;
    const deltaX = clientX - startXRef.current;
    currentDeltaXRef.current = deltaX;
    setDragOffsetX(deltaX);
  };

  const handleGestureEnd = () => {
    if (startXRef.current === null) return;
    const finalDelta = currentDeltaXRef.current;
    startXRef.current = null;
    setIsDragging(false);

    // Swipe threshold: 60px left or right closes the minimized player
    if (Math.abs(finalDelta) >= 60) {
      setDragOffsetX(0);
      currentDeltaXRef.current = 0;
      onClosePlayer();
      return;
    }

    setDragOffsetX(0);
    currentDeltaXRef.current = 0;
  };

  // Full-Screen Native Android Player Modal
  if (isFullScreen) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Full screen player: ${currentSermon.title}`}
        className="fixed inset-0 z-50 bg-white dark:bg-black text-zinc-950 dark:text-white flex flex-col justify-between p-4 sm:p-8 overflow-y-auto"
      >
        {/* Full-Screen Top Bar */}
        <div className="max-w-2xl w-full mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onMinimizePlayer}
            aria-label="Minimize player"
            className="min-h-[44px] min-w-[44px] rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors"
          >
            <ChevronDown className="w-5 h-5" />
          </button>

          <div className="text-center min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400">
              {isSavedOffline ? 'Offline Vault Playback' : 'Waharaka Official Stream'}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate font-mono-tabular">
              {currentSermon.sinhalaTitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClosePlayer}
            aria-label="Close player"
            className="min-h-[44px] min-w-[44px] rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Centerpiece Artwork or Official Gatha & Notes View */}
        <div className="max-w-2xl w-full mx-auto my-auto py-4 space-y-5">
          {showNotesInPlayer ? (
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-5 max-h-80 overflow-y-auto space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span className="font-bold text-amber-700 dark:text-amber-400">
                  දේශනා සටහන් · Official Gatha & Notes ({currentSermon.id})
                </span>
                <button
                  type="button"
                  onClick={() => setShowNotesInPlayer(false)}
                  className="underline font-semibold"
                >
                  Show Artwork
                </button>
              </div>
              {currentSermon.question && (
                <p className="text-sm font-medium leading-relaxed">
                  {currentSermon.question}
                </p>
              )}
              {playerNotes.loading ? (
                <div className="py-6 flex items-center justify-center gap-2 text-xs text-zinc-500">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                  <span>Loading official Gatha from waharaka.com...</span>
                </div>
              ) : playerNotes.notes.length > 0 ? (
                <div className="space-y-2 text-sm leading-relaxed">
                  {playerNotes.notes.map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500">
                  Collection: {currentSermon.category} ({currentSermon.cdId}) · {currentSermon.durationFormatted}
                </p>
              )}
            </div>
          ) : (
            <div className="relative w-56 h-56 sm:w-68 sm:h-68 mx-auto rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900">
              <img
                src={HERO_MONASTERY_IMG}
                alt={currentSermon.title}
                className="w-full h-full object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                <div className="flex items-center gap-1.5 text-xs font-mono-tabular text-amber-300">
                  <Disc className={`w-4 h-4 ${isPlaying ? 'animate-spin' : ''}`} />
                  <span>{currentSermon.id}</span>
                  <span>·</span>
                  <span>{currentSermon.sizeMb} MB</span>
                </div>
              </div>
            </div>
          )}

          {/* Sermon Title & Question */}
          <div className="text-center space-y-2 px-2">
            <h2 className="text-xl sm:text-2xl font-bold font-serif-display leading-snug">
              {currentSermon.title}
            </h2>
            {currentSermon.question && (
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 max-w-xl mx-auto leading-relaxed">
                {currentSermon.question}
              </p>
            )}
          </div>
        </div>

        {/* Full-Screen Scrubber, Transport & Bottom Utility Strip */}
        <div className="max-w-2xl w-full mx-auto space-y-5 pb-2">
          {/* Seek Bar */}
          <div className="space-y-1.5">
            <input
              type="range"
              aria-label="Full screen seek sermon position"
              min={0}
              max={currentSermon.durationSeconds || 1}
              value={Math.min(currentTimeSec, currentSermon.durationSeconds || 1)}
              onChange={(e) => onSeek(Number(e.target.value))}
              className="w-full h-2 accent-amber-600 dark:accent-amber-500 cursor-pointer block"
            />
            <div className="flex items-center justify-between text-xs font-mono-tabular text-zinc-500 dark:text-zinc-400">
              <span>{formatDuration(currentTimeSec)}</span>
              <span>{formatDuration(currentSermon.durationSeconds)}</span>
            </div>
          </div>

          {/* Primary Android Transport Buttons */}
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            {onPrevSermon && (
              <button
                type="button"
                onClick={onPrevSermon}
                aria-label="Previous sermon"
                className="min-h-[48px] min-w-[48px] rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors"
              >
                <SkipBack className="w-5 h-5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => onSkip(-15)}
              aria-label="Rewind 15 seconds"
              className="min-h-[48px] min-w-[48px] rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={onTogglePlay}
              aria-label={isPlaying ? 'Pause current sermon' : 'Play current sermon'}
              className="h-16 w-16 rounded-full bg-amber-600 hover:bg-amber-500 text-zinc-950 flex items-center justify-center shadow-lg transition-transform active:scale-95"
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 fill-current" />
              ) : (
                <Play className="w-7 h-7 fill-current ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => onSkip(15)}
              aria-label="Forward 15 seconds"
              className="min-h-[48px] min-w-[48px] rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors"
            >
              <RotateCw className="w-5 h-5" />
            </button>

            {onNextSermon && (
              <button
                type="button"
                onClick={onNextSermon}
                aria-label="Next sermon"
                className="min-h-[48px] min-w-[48px] rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Utility Row: Speed, Notes, Offline Save, Direct MP3 */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={onCyclePlaybackRate}
              className="min-h-[40px] px-3.5 rounded-full text-xs font-mono-tabular font-semibold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
            >
              Speed {playbackRate}x
            </button>

            <button
              type="button"
              onClick={() => setShowNotesInPlayer((prev) => !prev)}
              className={`min-h-[40px] px-3.5 rounded-full text-xs font-medium flex items-center gap-1.5 border ${
                showNotesInPlayer
                  ? 'bg-amber-600 text-zinc-950 border-amber-500 font-semibold'
                  : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Gatha & Notes</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleOffline(currentSermon)}
              className={`min-h-[40px] px-3.5 rounded-full text-xs font-medium flex items-center gap-1.5 border ${
                isSavedOffline
                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 font-semibold'
                  : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
              }`}
            >
              {isSavedOffline ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved Offline</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Save ({currentSermon.sizeMb} MB)</span>
                </>
              )}
            </button>

            <a
              href={currentSermon.directGcsAudioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[40px] px-3.5 rounded-full text-xs font-medium flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
            >
              <span>MP3</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Minimized Floating Pill Player (Swipe Left or Right to Close, Tap to Open Full Screen)
  return (
    <div
      role="region"
      aria-label="Minimized audio player (swipe left or right to close, tap for full screen)"
      data-testid="minimized-player"
      onTouchStart={(e) => {
        if (e.touches[0]) handleGestureStart(e.touches[0].clientX);
      }}
      onTouchMove={(e) => {
        if (e.touches[0]) handleGestureMove(e.touches[0].clientX);
      }}
      onTouchEnd={handleGestureEnd}
      onPointerDown={(e) => {
        // Ignore if user clicked directly on control buttons
        if ((e.target as HTMLElement).closest('button')) return;
        handleGestureStart(e.clientX);
      }}
      onPointerMove={(e) => {
        if (!isDragging) return;
        handleGestureMove(e.clientX);
      }}
      onPointerUp={handleGestureEnd}
      onPointerCancel={handleGestureEnd}
      style={{
        transform: `translateX(${dragOffsetX}px)`,
        opacity: Math.max(0.15, 1 - Math.abs(dragOffsetX) / 140),
        transition: isDragging ? 'none' : 'transform 0.2s ease, opacity 0.2s ease',
      }}
      className="fixed bottom-3 left-3 right-3 max-w-xl mx-auto z-40 rounded-2xl bg-zinc-900 dark:bg-zinc-950 text-white border border-zinc-800 shadow-2xl overflow-hidden select-none touch-pan-y"
    >
      {/* Top Progress Hairline */}
      <div className="w-full h-1 bg-zinc-800">
        <div
          className="h-full bg-amber-500 transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="px-3.5 py-2.5 flex items-center justify-between gap-2.5">
        {/* Tappable Info Area -> Opens Full-Screen Player */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            if (Math.abs(currentDeltaXRef.current) < 12) {
              onOpenFullScreen();
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenFullScreen();
            }
          }}
          aria-label="Open full screen player"
          className="min-w-0 flex-1 cursor-pointer text-left"
        >
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
            <span className="font-semibold text-amber-400 shrink-0">
              {isSavedOffline ? 'Offline' : 'Stream'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular shrink-0">
              {formatDuration(currentTimeSec)} / {formatDuration(currentSermon.durationSeconds)}
            </span>
            <span aria-hidden="true">·</span>
            <span className="truncate text-zinc-400">
              Swipe L/R to close
            </span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-white truncate font-serif-display">
            {currentSermon.title}
          </p>
        </div>

        {/* Mini-Player Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePlay();
            }}
            aria-label={isPlaying ? 'Pause current sermon' : 'Play current sermon'}
            className="min-h-[40px] min-w-[40px] rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenFullScreen();
            }}
            aria-label="Expand player to full screen"
            className="min-h-[38px] min-w-[38px] rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
