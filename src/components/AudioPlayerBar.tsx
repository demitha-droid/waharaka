import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Download,
  Check,
  Radio,
  Disc,
  BookOpen,
  Library,
} from 'lucide-react';
import { formatDuration, type SermonItem } from '../utils/waharakaLogic';
import type { ActiveTab } from './TopBar';

interface AudioPlayerBarProps {
  currentSermon: SermonItem | null;
  isPlaying: boolean;
  currentTimeSec: number;
  playbackRate: number;
  isSavedOffline: boolean;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  onSkip: (deltaSeconds: number) => void;
  onCyclePlaybackRate: () => void;
  onToggleOffline: (sermon: SermonItem) => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  currentSermon,
  isPlaying,
  currentTimeSec,
  playbackRate,
  isSavedOffline,
  activeTab,
  onSelectTab,
  onTogglePlay,
  onSeek,
  onSkip,
  onCyclePlaybackRate,
  onToggleOffline,
}) => {
  const mobileTabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'sermons', label: 'Sermons', icon: <Radio className="w-5 h-5" /> },
    { id: 'cds', label: 'CDs', icon: <Disc className="w-5 h-5" /> },
    { id: 'magazines', label: 'Magazines', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'books', label: 'Books', icon: <Library className="w-5 h-5" /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800">
      {/* Active Sermon Player Strip */}
      {currentSermon && (
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-1.5 sm:py-2 border-b border-stone-200/70 dark:border-stone-800/70">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400">
                <span className="font-semibold text-amber-800 dark:text-amber-400 whitespace-nowrap shrink-0">
                  {isSavedOffline ? 'Offline' : 'Stream'}
                </span>
                <span aria-hidden="true">·</span>
                <span className="truncate">{currentSermon.sinhalaTitle}</span>
                <span className="md:hidden font-mono-tabular ml-auto shrink-0">
                  {formatDuration(currentTimeSec)} / {formatDuration(currentSermon.durationSeconds)}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 truncate font-serif-display">
                {currentSermon.title}
              </p>
            </div>

            {/* Playback & Scrubber Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => onSkip(-15)}
                aria-label="Rewind 15 seconds"
                className="min-h-[38px] min-w-[38px] rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onTogglePlay}
                aria-label={isPlaying ? 'Pause current sermon' : 'Play current sermon'}
                className="min-h-[40px] min-w-[40px] rounded-xl bg-amber-800 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-stone-950 flex items-center justify-center transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current" />
                )}
              </button>

              <button
                type="button"
                onClick={() => onSkip(15)}
                aria-label="Forward 15 seconds"
                className="min-h-[38px] min-w-[38px] rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              <div className="hidden md:flex items-center gap-2 w-48 lg:w-64">
                <span className="text-xs font-mono-tabular text-stone-500 dark:text-stone-400">
                  {formatDuration(currentTimeSec)}
                </span>
                <input
                  type="range"
                  aria-label="Seek sermon position"
                  min={0}
                  max={currentSermon.durationSeconds || 1}
                  value={Math.min(currentTimeSec, currentSermon.durationSeconds || 1)}
                  onChange={(e) => onSeek(Number(e.target.value))}
                  className="w-full accent-amber-700 dark:accent-amber-500 cursor-pointer"
                />
                <span className="text-xs font-mono-tabular text-stone-500 dark:text-stone-400">
                  {formatDuration(currentSermon.durationSeconds)}
                </span>
              </div>

              <button
                type="button"
                onClick={onCyclePlaybackRate}
                aria-label={`Playback speed ${playbackRate}x`}
                className="min-h-[36px] px-2 rounded-lg text-[11px] sm:text-xs font-mono-tabular font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700"
              >
                {playbackRate}x
              </button>

              <button
                type="button"
                onClick={() => onToggleOffline(currentSermon)}
                aria-label={
                  isSavedOffline
                    ? 'Saved in local storage'
                    : 'Save current sermon to local storage'
                }
                className={`min-h-[36px] px-2.5 rounded-lg text-xs font-medium flex items-center gap-1 border ${
                  isSavedOffline
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 border-stone-200 dark:border-stone-700'
                }`}
              >
                {isSavedOffline ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Offline</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Save</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Scrubber Slider */}
          <div className="md:hidden pt-1">
            <input
              type="range"
              aria-label="Seek sermon position mobile"
              min={0}
              max={currentSermon.durationSeconds || 1}
              value={Math.min(currentTimeSec, currentSermon.durationSeconds || 1)}
              onChange={(e) => onSeek(Number(e.target.value))}
              className="w-full h-1.5 accent-amber-700 dark:accent-amber-500 cursor-pointer block"
            />
          </div>
        </div>
      )}

      {/* Mobile Android Bottom Navigation Bar (4 evenly distributed tabs) */}
      <nav
        aria-label="Mobile bottom navigation"
        className="md:hidden grid grid-cols-4 items-center h-14 px-1"
      >
        {mobileTabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`min-h-[44px] flex flex-col items-center justify-center rounded-xl transition-colors ${
                active
                  ? 'text-amber-800 dark:text-amber-400 font-semibold'
                  : 'text-stone-500 dark:text-stone-400'
              }`}
            >
              {tab.icon}
              <span className="text-[11px] mt-0.5 whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
