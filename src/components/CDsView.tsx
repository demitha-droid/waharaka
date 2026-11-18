import React, { useState } from 'react';
import {
  Disc,
  Play,
  Pause,
  Download,
  Check,
  ExternalLink,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type {
  CDCollection,
  SermonItem,
  OfflineSermonPacket,
} from '../utils/waharakaLogic';

interface CDsViewProps {
  cds: CDCollection[];
  currentPlayingId: string | null;
  isPlaying: boolean;
  loadingCdIds: Record<string, boolean>;
  onPlaySermon: (sermon: SermonItem) => void;
  offlineSermons: Record<string, OfflineSermonPacket>;
  onToggleOfflineSermon: (sermon: SermonItem) => void;
  onBatchDownloadCD: (cd: CDCollection) => void;
  onLoadCdTracks: (cdId: string) => Promise<CDCollection | null>;
}

export const CDsView: React.FC<CDsViewProps> = ({
  cds,
  currentPlayingId,
  isPlaying,
  loadingCdIds,
  onPlaySermon,
  offlineSermons,
  onToggleOfflineSermon,
  onBatchDownloadCD,
  onLoadCdTracks,
}) => {
  const [groupFilter, setGroupFilter] = useState<'all' | 'special' | 'numbered'>('all');
  const [expandedCdIds, setExpandedCdIds] = useState<Record<string, boolean>>({
    Arunodaya: true,
    'Thilakuna-Denagamu': true,
    CD001: true,
    CD002: true,
  });
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const visibleCds = cds.filter(
    (c) => groupFilter === 'all' || c.group === groupFilter
  );

  const specialCount = cds.filter((c) => c.group === 'special').length;
  const numberedCount = cds.filter((c) => c.group === 'numbered').length;

  const handleToggleExpand = async (cd: CDCollection) => {
    const nextOpen = !expandedCdIds[cd.id];
    setExpandedCdIds((prev) => ({ ...prev, [cd.id]: nextOpen }));
    if (nextOpen && !cd.tracksLoaded) {
      await onLoadCdTracks(cd.id);
    }
  };

  const handlePlayCd = async (cd: CDCollection) => {
    if (cd.tracksLoaded && cd.tracks[0]) {
      onPlaySermon(cd.tracks[0]);
      setExpandedCdIds((prev) => ({ ...prev, [cd.id]: true }));
      return;
    }
    setExpandedCdIds((prev) => ({ ...prev, [cd.id]: true }));
    const loaded = await onLoadCdTracks(cd.id);
    if (loaded?.tracks?.[0]) {
      onPlaySermon(loaded.tracks[0]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
        <div>
          <p className="text-xs font-medium text-amber-800 dark:text-amber-400">
            සංයුක්ත තැටි එකතුව · Official Waharaka Audio CDs ({cds.length} Total Collections)
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 font-serif-display">
            All {cds.length} Authentic Waharaka CD Collections
          </h1>
        </div>

        {/* Segmented Filter for Special Collections (24) vs Numbered CDs (105) */}
        <div
          role="tablist"
          aria-label="Filter CD collections"
          className="flex items-center gap-1 p-1 bg-stone-200/70 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-x-auto max-w-full shrink-0"
        >
          <button
            type="button"
            role="tab"
            aria-selected={groupFilter === 'all'}
            onClick={() => setGroupFilter('all')}
            className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              groupFilter === 'all'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold shadow-xs'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            සියලු තැටි ({cds.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={groupFilter === 'special'}
            onClick={() => setGroupFilter('special')}
            className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              groupFilter === 'special'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold shadow-xs'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            සුවිශේෂී එකතූන් ({specialCount})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={groupFilter === 'numbered'}
            onClick={() => setGroupFilter('numbered')}
            className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              groupFilter === 'numbered'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold shadow-xs'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            තැටි පෙළ CD001–CD106 ({numberedCount})
          </button>
        </div>
      </div>

      {visibleCds.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
          <p className="text-base font-medium text-stone-800 dark:text-stone-200">
            No CD collections match your search query.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {visibleCds.map((cd) => {
            const isExpanded = Boolean(expandedCdIds[cd.id]);
            const isLoading = Boolean(loadingCdIds[cd.id]);
            const allTracksSaved =
              cd.tracksLoaded &&
              cd.tracks.length > 0 &&
              cd.tracks.every((t) => Boolean(offlineSermons[t.id]));

            return (
              <section
                key={cd.id}
                className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden flex flex-col justify-between"
              >
                <div className="p-5 space-y-4">
                  <div className="flex gap-4 items-center">
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center">
                      {!failedImages[cd.id] ? (
                        <img
                          src={cd.coverImage}
                          alt={cd.title}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          onError={() =>
                            setFailedImages((prev) => ({ ...prev, [cd.id]: true }))
                          }
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Disc className="w-8 h-8 text-amber-400" />
                      )}
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400 font-mono-tabular">
                        <span className="font-semibold text-amber-800 dark:text-amber-400">
                          {cd.code}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-sans">{cd.series}</span>
                        {cd.tracksLoaded && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{cd.tracks.length} Deshanas</span>
                          </>
                        )}
                        {cd.zipSizeMb > 0 && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{cd.zipSizeMb} MB</span>
                          </>
                        )}
                      </div>

                      <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 font-serif-display truncate">
                        {cd.title}
                      </h2>
                      <p className="text-xs text-stone-600 dark:text-stone-400 truncate">
                        {cd.sinhalaTitle}
                      </p>
                    </div>
                  </div>

                  {/* CD Action Controls */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handlePlayCd(cd)}
                      className="min-h-[42px] px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 text-white dark:text-stone-950 text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Loading CD...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Play CD</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleExpand(cd)}
                      aria-expanded={isExpanded}
                      className="min-h-[42px] px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>
                        {cd.tracksLoaded
                          ? `Tracklist (${cd.tracks.length})`
                          : 'View Tracklist'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        if (!cd.tracksLoaded) {
                          const loaded = await onLoadCdTracks(cd.id);
                          if (loaded) onBatchDownloadCD(loaded);
                        } else {
                          onBatchDownloadCD(cd);
                        }
                      }}
                      className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition-colors whitespace-nowrap shrink-0 ${
                        allTracksSaved
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      {allTracksSaved ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Saved Offline</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Save Offline</span>
                        </>
                      )}
                    </button>

                    <a
                      href={cd.zipUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[42px] px-3 py-2 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 flex items-center gap-1 whitespace-nowrap shrink-0"
                    >
                      <span>ZIP</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Expandable Authentic Tracklist */}
                  {isExpanded && (
                    <div className="border-t border-stone-200 dark:border-stone-800 pt-3 mt-2">
                      {isLoading ? (
                        <div className="py-6 flex items-center justify-center gap-2 text-xs text-stone-500">
                          <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
                          <span>Fetching tracks from waharaka.com...</span>
                        </div>
                      ) : cd.tracks.length === 0 ? (
                        <p className="text-xs text-stone-500 py-3">
                          Click Play CD to load tracks from waharaka.com.
                        </p>
                      ) : (
                        <div className="divide-y divide-stone-200/70 dark:divide-stone-800 max-h-80 overflow-y-auto pr-1">
                          {cd.tracks.map((track, tIdx) => {
                            const isCurrent = currentPlayingId === track.id;
                            const isSaved = Boolean(offlineSermons[track.id]);
                            return (
                              <div
                                key={track.id}
                                className="py-2.5 flex items-center justify-between gap-3"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-medium text-stone-900 dark:text-stone-100 leading-snug">
                                    <span className="font-mono-tabular text-stone-400 mr-1.5">
                                      {String(tIdx + 1).padStart(2, '0')}.
                                    </span>
                                    {track.title}
                                  </p>
                                  {track.question && (
                                    <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                                      {track.question}
                                    </p>
                                  )}
                                  <p className="text-[11px] text-stone-500 dark:text-stone-400 font-mono-tabular mt-0.5">
                                    {track.id} · {track.durationFormatted} · {track.sizeMb} MB
                                  </p>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => onPlaySermon(track)}
                                    aria-label={
                                      isCurrent && isPlaying
                                        ? `Pause ${track.title}`
                                        : `Play ${track.title}`
                                    }
                                    className={`min-h-[38px] min-w-[38px] px-2.5 rounded-lg flex items-center justify-center transition-colors ${
                                      isCurrent && isPlaying
                                        ? 'bg-amber-800 text-white dark:bg-amber-500 dark:text-stone-950'
                                        : 'bg-stone-100 dark:bg-stone-800 hover:bg-amber-800 hover:text-white dark:hover:bg-amber-500 dark:hover:text-stone-950 text-stone-700 dark:text-stone-200'
                                    }`}
                                  >
                                    {isCurrent && isPlaying ? (
                                      <Pause className="w-3.5 h-3.5 fill-current" />
                                    ) : (
                                      <Play className="w-3.5 h-3.5 fill-current" />
                                    )}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => onToggleOfflineSermon(track)}
                                    aria-label={
                                      isSaved
                                        ? `Remove ${track.title} from offline storage`
                                        : `Download ${track.title} offline`
                                    }
                                    className={`min-h-[38px] min-w-[38px] px-2.5 rounded-lg border flex items-center justify-center transition-colors ${
                                      isSaved
                                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                                        : 'bg-stone-50 dark:bg-stone-900 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700'
                                    }`}
                                  >
                                    {isSaved ? (
                                      <Check className="w-3.5 h-3.5" />
                                    ) : (
                                      <Download className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};
