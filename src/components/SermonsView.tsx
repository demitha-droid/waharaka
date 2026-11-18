import React, { useState } from 'react';
import {
  Play,
  Pause,
  Download,
  Check,
  ExternalLink,
  FileText,
  ChevronDown,
  ChevronUp,
  Loader2,
  MoreHorizontal,
  X,
} from 'lucide-react';
import {
  type SermonItem,
  type HomepageTag,
  type OfflineSermonPacket,
} from '../utils/waharakaLogic';
import {
  HERO_MONASTERY_IMG,
  WAHARAKA_HOMEPAGE_TAGS,
} from '../data/waharakaCatalog';

interface SermonsViewProps {
  sermons: SermonItem[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedHomepageTag: HomepageTag | null;
  isLoadingTagSermons: boolean;
  onSelectHomepageTag: (tag: HomepageTag | null) => void;
  currentPlayingId: string | null;
  isPlaying: boolean;
  onPlaySermon: (sermon: SermonItem) => void;
  offlineSermons: Record<string, OfflineSermonPacket>;
  onToggleOfflineSermon: (sermon: SermonItem) => void;
  onDownloadAllVisible: (sermons: SermonItem[]) => void;
}

const CATEGORIES: { id: string; label: string }[] = [
  { id: 'All', label: 'All Deshanas' },
  { id: 'Arunodaya', label: 'අරුණෝදය (94)' },
  { id: 'Thilakuna-Denagamu', label: 'තිලකුණ දැනගමු (8)' },
  { id: 'Swakkhatho1', label: 'ස්වාක්ඛාතෝ-1 (22)' },
  { id: 'Karmasthana-Thulin-Niwana-Karaa', label: 'කර්මස්ථාන තුලින් නිවන කරා (58)' },
  { id: 'Samma-Samadhi-Athwal-Bhawana', label: 'සම්මා සමාධි අත්වැල් භාවනා (8)' },
  { id: 'Pirith', label: 'පිරිත් (34)' },
  { id: 'CD001', label: 'නිවන් වඩන සිරි සදහම් CD001' },
  { id: 'CD002', label: 'නිවන් වඩන සිරි සදහම් CD002' },
];

export const SermonsView: React.FC<SermonsViewProps> = ({
  sermons,
  selectedCategory,
  onSelectCategory,
  selectedHomepageTag,
  isLoadingTagSermons,
  onSelectHomepageTag,
  currentPlayingId,
  isPlaying,
  onPlaySermon,
  offlineSermons,
  onToggleOfflineSermon,
  onDownloadAllVisible,
}) => {
  const [expandedNotesId, setExpandedNotesId] = useState<string | null>(null);
  const [liveNotesMap, setLiveNotesMap] = useState<
    Record<string, { loading: boolean; notes: string[]; tags: string[] }>
  >({});
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [showAllHomepageTags, setShowAllHomepageTags] = useState(false);

  // Show top 14 homepage tags by default so mobile users see both the tag cloud and sermons above the fold, or all 180 when expanded
  const visibleTags = showAllHomepageTags
    ? WAHARAKA_HOMEPAGE_TAGS
    : WAHARAKA_HOMEPAGE_TAGS.slice(0, 14);

  const handleToggleNotes = async (sermon: SermonItem) => {
    if (expandedNotesId === sermon.id) {
      setExpandedNotesId(null);
      return;
    }
    setExpandedNotesId(sermon.id);

    if (!liveNotesMap[sermon.id]) {
      setLiveNotesMap((prev) => ({
        ...prev,
        [sermon.id]: { loading: true, notes: [], tags: [] },
      }));
      try {
        const res = await fetch(
          `/api/waharaka/listen-notes/${encodeURIComponent(sermon.id)}`
        );
        if (res.ok) {
          const data = await res.json();
          setLiveNotesMap((prev) => ({
            ...prev,
            [sermon.id]: {
              loading: false,
              notes: Array.isArray(data.notes) ? data.notes : [],
              tags: Array.isArray(data.tags) ? data.tags : [],
            },
          }));
        } else {
          setLiveNotesMap((prev) => ({
            ...prev,
            [sermon.id]: { loading: false, notes: [], tags: [] },
          }));
        }
      } catch {
        setLiveNotesMap((prev) => ({
          ...prev,
          [sermon.id]: { loading: false, notes: [], tags: [] },
        }));
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Banner Below the Search Bar: Authentic waharaka.com Homepage Tag Cloud (#home-tag-box) */}
      <section
        aria-label="දහම් කරුණු · Waharaka Homepage Dhamma Tags"
        className="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-900 shadow-sm"
      >
        {!heroImgFailed ? (
          <img
            src={HERO_MONASTERY_IMG}
            alt=""
            aria-hidden="true"
            referrerPolicy="no-referrer"
            onError={() => setHeroImgFailed(true)}
            className="absolute inset-0 w-full h-full object-cover opacity-35 pointer-events-none"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 pointer-events-none" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/70 to-black/85 pointer-events-none" />

        <div className="relative z-10 p-3.5 sm:p-6">
          <div
            id="tag-box"
            className={`flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 ${
              showAllHomepageTags
                ? 'max-h-72 sm:max-h-96 overflow-y-auto pr-1'
                : ''
            }`}
          >
            {visibleTags.map((tag) => {
              const isSelected = selectedHomepageTag?.id === tag.id;
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() =>
                    onSelectHomepageTag(isSelected ? null : tag)
                  }
                  className={`min-h-[34px] sm:min-h-[36px] px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-[13px] font-medium transition-all flex items-center gap-1 border ${
                    isSelected
                      ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold shadow-sm'
                      : 'bg-white/12 hover:bg-white/22 text-stone-100 border-white/15 backdrop-blur-xs'
                  }`}
                >
                  <span>{tag.name}</span>
                  <span
                    className={`text-[11px] font-mono-tabular ${
                      isSelected ? 'text-stone-900' : 'text-amber-300/90'
                    }`}
                  >
                    ({tag.count})
                  </span>
                </button>
              );
            })}

            {/* Authentic #tag-box-all-btn (දහම් කරුණු) toggle button */}
            <button
              type="button"
              onClick={() => setShowAllHomepageTags((prev) => !prev)}
              aria-expanded={showAllHomepageTags}
              className="min-h-[34px] sm:min-h-[36px] px-3 py-1 rounded-full text-xs font-semibold bg-amber-700/90 hover:bg-amber-600 text-white border border-amber-500/40 flex items-center gap-1.5 transition-colors"
            >
              <span>
                {showAllHomepageTags
                  ? 'අඩුවෙන් පෙන්වන්න'
                  : `දහම් කරුණු (${WAHARAKA_HOMEPAGE_TAGS.length})`}
              </span>
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Active Tag Filter Banner when a Homepage Tag is selected */}
      {selectedHomepageTag && (
        <div className="px-3.5 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 text-xs sm:text-sm">
            {isLoadingTagSermons && (
              <Loader2 className="w-4 h-4 animate-spin text-amber-700 dark:text-amber-400 shrink-0" />
            )}
            <span className="font-semibold text-amber-900 dark:text-amber-300 truncate">
              දහම් කරුණ: {selectedHomepageTag.name} ({selectedHomepageTag.count} දේශනා)
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSelectHomepageTag(null)}
            className="min-h-[34px] px-2.5 py-1 rounded-lg bg-amber-800 text-white dark:bg-amber-500 dark:text-stone-950 text-xs font-semibold flex items-center gap-1 shrink-0"
          >
            <span>සියලු දේශනා</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Interactive Collection Filter Bar (Horizontal Scroll on Mobile) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div
          role="tablist"
          aria-label="Filter sermons by Waharaka collection"
          className="flex items-center gap-1.5 p-1 bg-stone-200/70 dark:bg-zinc-950 rounded-xl overflow-x-auto max-w-full border border-stone-200 dark:border-stone-800"
        >
          {CATEGORIES.map((category) => {
            const active =
              !selectedHomepageTag && selectedCategory === category.id;
            return (
              <button
                key={category.id}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => {
                  onSelectHomepageTag(null);
                  onSelectCategory(category.id);
                }}
                className={`min-h-[36px] px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                {category.label}
              </button>
            );
          })}
        </div>

        {sermons.length > 0 && (
          <button
            type="button"
            onClick={() => onDownloadAllVisible(sermons.slice(0, 12))}
            className="min-h-[38px] px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 bg-white dark:bg-zinc-950 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 rounded-xl flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-amber-700 dark:text-amber-500" />
            <span>Save Top {Math.min(12, sermons.length)} Offline</span>
          </button>
        )}
      </div>

      {/* Sermons List */}
      {isLoadingTagSermons && sermons.length === 0 ? (
        <div className="p-10 text-center rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-zinc-950 flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-amber-700 dark:text-amber-400" />
          <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
            Loading sermons for "{selectedHomepageTag?.name}" from waharaka.com...
          </p>
        </div>
      ) : sermons.length === 0 ? (
        <div className="p-10 text-center rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-zinc-950">
          <p className="text-sm sm:text-base font-medium text-stone-800 dark:text-stone-200">
            No sermons match your current filter or search query.
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Tap any Dhamma tag above or switch to All Deshanas.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-stone-200 dark:divide-stone-800 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-zinc-950 overflow-hidden">
          {sermons.map((sermon, idx) => {
            const isCurrent = currentPlayingId === sermon.id;
            const isSavedOffline = Boolean(offlineSermons[sermon.id]);
            const isNotesOpen = expandedNotesId === sermon.id;
            const noteEntry = liveNotesMap[sermon.id];

            return (
              <article
                key={`${sermon.cdId}-${sermon.id}-${idx}`}
                className={`p-3.5 sm:p-5 transition-colors ${
                  isCurrent
                    ? 'bg-amber-50/50 dark:bg-amber-950/20'
                    : 'hover:bg-stone-50/80 dark:hover:bg-stone-800/40'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="space-y-1 flex-1 min-w-0">
                    {/* Clean unboxed inline metadata per Zero-Pill rule */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 font-mono-tabular">
                      <span>{String(idx + 1).padStart(2, '0')}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-sans font-medium text-amber-800 dark:text-amber-400">
                        {sermon.category}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{sermon.id}</span>
                      <span aria-hidden="true">·</span>
                      <span>{sermon.durationFormatted}</span>
                      <span aria-hidden="true">·</span>
                      <span>{sermon.sizeMb} MB</span>
                      {isSavedOffline && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-sans font-semibold text-emerald-700 dark:text-emerald-400">
                            Offline
                          </span>
                        </>
                      )}
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 font-serif-display leading-snug">
                      {sermon.title}
                    </h2>
                    {sermon.question && (
                      <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed max-w-3xl line-clamp-2 sm:line-clamp-none">
                        {sermon.question}
                      </p>
                    )}
                  </div>

                  {/* Mobile-Optimized Action Controls */}
                  <div className="flex items-center gap-2 pt-1 lg:pt-0 shrink-0">
                    <button
                      type="button"
                      onClick={() => onPlaySermon(sermon)}
                      aria-label={
                        isCurrent && isPlaying
                          ? `Pause ${sermon.title}`
                          : `Play ${sermon.title}`
                      }
                      className={`flex-1 sm:flex-initial min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                        isCurrent && isPlaying
                          ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950'
                          : 'bg-amber-800 hover:bg-amber-700 text-white dark:bg-amber-600 dark:hover:bg-amber-500 dark:text-stone-950'
                      }`}
                    >
                      {isCurrent && isPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-current" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{isSavedOffline ? 'Play Offline' : 'Play'}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleOfflineSermon(sermon)}
                      aria-label={
                        isSavedOffline
                          ? `Remove ${sermon.title} from offline local storage`
                          : `Download ${sermon.title} for offline listening`
                      }
                      className={`min-h-[42px] px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 border transition-colors whitespace-nowrap shrink-0 ${
                        isSavedOffline
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 border-stone-200 dark:border-stone-700 hover:bg-stone-200/70 dark:hover:bg-stone-700'
                      }`}
                    >
                      {isSavedOffline ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Saved</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>{sermon.sizeMb} MB</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleNotes(sermon)}
                      aria-expanded={isNotesOpen}
                      className="min-h-[42px] px-2.5 sm:px-3 py-2 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center gap-1 transition-colors whitespace-nowrap shrink-0"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Notes</span>
                      {isNotesOpen ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expandable Authentic Gatha / Notes from waharaka.com/listen/:id */}
                {isNotesOpen && (
                  <div className="mt-3 pt-3 border-t border-stone-200/80 dark:border-stone-800 space-y-2 text-xs sm:text-sm text-stone-700 dark:text-stone-300 bg-stone-50/70 dark:bg-stone-950/50 p-3.5 rounded-xl">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 dark:text-stone-400">
                      <span className="font-semibold text-stone-800 dark:text-stone-200">
                        දේශනා සටහන් · Official Waharaka Listen Notes ({sermon.id})
                      </span>
                      <div className="flex items-center gap-3">
                        <a
                          href={sermon.directGcsAudioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-amber-700 dark:hover:text-amber-400 flex items-center gap-1"
                        >
                          <span>Direct MP3</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <a
                          href={sermon.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-amber-700 dark:hover:text-amber-400 flex items-center gap-1"
                        >
                          <span>Waharaka.com</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {sermon.question && (
                      <p className="font-medium text-stone-900 dark:text-stone-100 leading-relaxed">
                        {sermon.question}
                      </p>
                    )}

                    {noteEntry?.loading ? (
                      <div className="py-2 flex items-center gap-2 text-xs text-stone-500">
                        <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
                        <span>Loading authentic Gatha & notes from waharaka.com...</span>
                      </div>
                    ) : noteEntry?.notes && noteEntry.notes.length > 0 ? (
                      <div className="space-y-1.5 pt-1">
                        {noteEntry.notes.map((line, lIdx) => (
                          <p key={lIdx} className="leading-relaxed text-xs sm:text-sm">
                            {line}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        Collection: {sermon.category} ({sermon.cdId}) · Duration: {sermon.durationFormatted}
                      </p>
                    )}

                    {noteEntry?.tags && noteEntry.tags.length > 0 && (
                      <p className="text-xs text-amber-800 dark:text-amber-400 pt-1">
                        Topics: {noteEntry.tags.join(' · ')}
                      </p>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
