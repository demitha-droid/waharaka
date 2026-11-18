import React from 'react';
import {
  Search,
  Moon,
  Sun,
  Bell,
  HardDriveDownload,
  X,
} from 'lucide-react';

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
  activeTab,
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
  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'sermons', label: 'Sermons' },
    { id: 'cds', label: 'CDs' },
    { id: 'magazines', label: 'Magazines' },
    { id: 'books', label: 'Books' },
  ];

  const totalOfflineCount = offlineStats.sermonCount + offlineStats.readingCount;

  return (
    <div className="sticky top-0 z-30 bg-stone-50/95 dark:bg-stone-950/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-6 px-3 sm:px-6 h-13 sm:h-14">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('sermons');
          }}
          className="text-base sm:text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-serif-display whitespace-nowrap shrink-0"
        >
          Waharaka Dhamma Archive
        </a>

        <nav
          aria-label="Primary sections"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600 dark:text-stone-400"
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activeTab === item.id
                  ? 'border-amber-700 dark:border-amber-500 text-stone-900 dark:text-stone-100 font-semibold'
                  : 'border-transparent hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Zone: Offline Filter, Push Updates & Night/Day Mode */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleOnlyOffline}
            aria-pressed={onlyOfflineFilter}
            aria-label={`Offline saved items (${totalOfflineCount})`}
            className={`min-h-[38px] px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition-colors whitespace-nowrap shrink-0 ${
              onlyOfflineFilter
                ? 'bg-amber-800 text-white border-amber-800 dark:bg-amber-500 dark:text-stone-950 dark:border-amber-500'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-200/70 dark:hover:bg-stone-700'
            }`}
          >
            <HardDriveDownload className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Offline Saved</span>
            <span className="font-mono-tabular font-semibold">({totalOfflineCount})</span>
            <span className="hidden lg:inline font-mono-tabular opacity-80">
              · {offlineStats.totalSizeMb} MB
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenNotifications}
            aria-label={`Push notifications (${unreadNotificationsCount} unread)`}
            className="relative min-h-[38px] px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-200/70 dark:hover:bg-stone-700 transition-colors whitespace-nowrap shrink-0"
          >
            <Bell className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Updates</span>
            {unreadNotificationsCount > 0 && (
              <span className="font-mono-tabular font-semibold text-amber-800 dark:text-amber-400">
                ({unreadNotificationsCount})
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onToggleDarkMode}
            aria-label={isDarkMode ? 'Switch to Day Mode' : 'Switch to Night Mode'}
            className="min-h-[38px] px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-200/70 dark:hover:bg-stone-700 transition-colors whitespace-nowrap shrink-0"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden sm:inline">Day Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-stone-700 dark:text-stone-300 shrink-0" />
                <span className="hidden sm:inline">Night Mode</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Dedicated Full-Width Search Bar Row */}
      <div className="border-t border-stone-200/70 dark:border-stone-800/70 bg-white/90 dark:bg-stone-900/90">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2">
          <div className="relative w-full">
            <label htmlFor="global-dhamma-search" className="sr-only">
              සොයන්න · Search sermons, CDs, magazines, and books
            </label>
            <Search className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="global-dhamma-search"
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="සොයන්න · Search sermons, CDs, magazines, books, or Dhamma topics..."
              className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-stone-100 dark:bg-stone-800/90 text-stone-900 dark:text-stone-100 placeholder:text-stone-500 dark:placeholder:text-stone-400 rounded-xl border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-600/40"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear search query"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
