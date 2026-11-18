import React from 'react';
import {
  Search,
  Moon,
  Sun,
  Bell,
  HardDriveDownload,
  X,
} from 'lucide-react';
import { AriyaDhammaLogoMark } from './AriyaDhammaLogos';

export type ActiveTab = 'sermons' | 'cds' | 'magazines' | 'books';

interface TopBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  offlineStats: {
    sermonCount: number;
    readingCount: number;
    totalSizeMb: number;
  };
  onlyOfflineFilter: boolean;
  onToggleOnlyOffline: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onSelectTab,
  searchQuery,
  onSearchChange,
  isDarkMode,
  onToggleDarkMode,
  unreadNotificationsCount,
  onOpenNotifications,
  offlineStats,
  onlyOfflineFilter,
  onToggleOnlyOffline,
}) => {
  const totalOfflineCount = offlineStats.sermonCount + offlineStats.readingCount;

  return (
    <div
      data-testid="android-top-header"
      className="bg-white dark:bg-black text-zinc-950 dark:text-white pt-android-safe pb-2 px-3 sm:px-6 max-w-7xl w-full mx-auto space-y-3"
    >
      {/* Android Status-Bar Safe Header Row (Never overlaps notification icons) */}
      <div className="flex items-center justify-between gap-2">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('sermons');
          }}
          aria-label="AriyaDhamma Home"
          className="inline-flex items-center gap-2.5 min-w-0 shrink-0 group"
        >
          <AriyaDhammaLogoMark
            logoId={2}
            className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 transition-transform group-hover:scale-105"
          />
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-white font-serif-display whitespace-nowrap leading-none">
            Ariya<span className="text-amber-600 dark:text-amber-400">Dhamma</span>
          </span>
        </a>

        {/* Right Utility Controls: Offline Vault, Push Updates, AMOLED/Light Mode */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onToggleOnlyOffline}
            aria-pressed={onlyOfflineFilter}
            aria-label={`Offline saved items (${totalOfflineCount})`}
            className={`min-h-[38px] px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 border transition-colors whitespace-nowrap shrink-0 ${
              onlyOfflineFilter
                ? 'bg-amber-600 text-zinc-950 border-amber-500 font-semibold'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800'
            }`}
          >
            <HardDriveDownload className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Offline</span>
            <span className="font-mono-tabular font-semibold">({totalOfflineCount})</span>
          </button>

          <button
            type="button"
            onClick={onOpenNotifications}
            aria-label={`Push notifications (${unreadNotificationsCount} unread)`}
            className="relative min-h-[38px] px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 transition-colors whitespace-nowrap shrink-0"
          >
            <Bell className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Updates</span>
            {unreadNotificationsCount > 0 && (
              <span className="font-mono-tabular font-semibold text-amber-700 dark:text-amber-400">
                ({unreadNotificationsCount})
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onToggleDarkMode}
            aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to AMOLED Mode'}
            className="min-h-[38px] px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 transition-colors whitespace-nowrap shrink-0"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-zinc-700 shrink-0" />
                <span>AMOLED</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Native Android Material 3 Rounded Search Pill */}
      <div className="relative w-full">
        <label htmlFor="global-dhamma-search" className="sr-only">
          සොයන්න · Search sermons, CDs, magazines, and books
        </label>
        <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          id="global-dhamma-search"
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="සොයන්න · Search sermons, CDs, magazines, books..."
          className="w-full pl-11 pr-10 py-2.5 text-xs sm:text-sm bg-zinc-100 dark:bg-zinc-900/90 text-zinc-950 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 rounded-full border border-zinc-200/80 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />
        {searchQuery && (
          <button
            type="button"
            aria-label="Clear search query"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
