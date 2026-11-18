import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  WAHARAKA_SERMONS,
  WAHARAKA_CDS,
  WAHARAKA_MAGAZINES,
  WAHARAKA_BOOKS,
  INITIAL_PUSH_UPDATES,
  mapRawTrackToSermonItem,
} from './data/waharakaCatalog';
import {
  filterSermons,
  filterCDCollections,
  filterMagazines,
  filterBooks,
  toggleOfflineSermonRecord,
  batchSaveCDToOffline,
  toggleOfflineReadingRecord,
  calculateOfflineStorageStats,
  type SermonItem,
  type HomepageTag,
  type CDCollection,
  type MagazineIssue,
  type DhammaBook,
  type OfflineSermonPacket,
  type OfflineReadingPacket,
  type ReadingProgressMap,
  type PushUpdateNotification,
} from './utils/waharakaLogic';
import {
  getAudioBlobFromVault,
  saveAudioBlobToVault,
  removeAudioBlobFromVault,
  savePdfBufferToVault,
  removePdfBufferFromVault,
} from './utils/offlineVault';
import { TopBar, type ActiveTab } from './components/TopBar';
import { SermonsView } from './components/SermonsView';
import { CDsView } from './components/CDsView';
import { MagazinesView } from './components/MagazinesView';
import { BooksView } from './components/BooksView';
import { CleanReaderModal, type ReaderDocument } from './components/CleanReaderModal';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import {
  NotificationCenterModal,
  type NotificationSubscriptions,
} from './components/NotificationCenterModal';

const LS_KEYS = {
  DARK_MODE: 'waharaka_dark_mode_v2',
  OFFLINE_SERMONS: 'waharaka_offline_sermons_v2',
  OFFLINE_READINGS: 'waharaka_offline_readings_v2',
  READING_PROGRESS: 'waharaka_reading_progress_v2',
  PUSH_SUBSCRIPTIONS: 'waharaka_push_subscriptions_v2',
  PUSH_ENABLED: 'waharaka_push_enabled_v2',
  NOTIFICATIONS: 'waharaka_notifications_v2',
};

function readLocalStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('sermons');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [onlyOfflineFilter, setOnlyOfflineFilter] = useState(false);

  // Authentic waharaka.com Homepage Tag selection state
  const [selectedHomepageTag, setSelectedHomepageTag] = useState<HomepageTag | null>(null);
  const [tagSermons, setTagSermons] = useState<SermonItem[]>([]);
  const [isLoadingTagSermons, setIsLoadingTagSermons] = useState(false);

  // Dynamic CD catalog state (starts with all 129 authentic CDs; dynamically loads tracklists on demand)
  const [cdsCatalog, setCdsCatalog] = useState<CDCollection[]>(WAHARAKA_CDS);
  const [loadingCdIds, setLoadingCdIds] = useState<Record<string, boolean>>({});
  const [liveSearchSermons, setLiveSearchSermons] = useState<SermonItem[]>([]);

  // Dark / Night mode persisted in localStorage and synced with <html class="dark">
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() =>
    readLocalStorage(LS_KEYS.DARK_MODE, false)
  );

  // Offline Sermons auto-saved to localStorage
  const [offlineSermons, setOfflineSermons] = useState<
    Record<string, OfflineSermonPacket>
  >(() => readLocalStorage(LS_KEYS.OFFLINE_SERMONS, {}));

  // Offline Books & Magazines auto-saved to localStorage
  const [offlineReadings, setOfflineReadings] = useState<
    Record<string, OfflineReadingPacket>
  >(() => readLocalStorage(LS_KEYS.OFFLINE_READINGS, {}));

  // Reading progress & bookmarks persisted in localStorage
  const [readingProgress, setReadingProgress] = useState<ReadingProgressMap>(() =>
    readLocalStorage(LS_KEYS.READING_PROGRESS, {})
  );

  // Push Notification state persisted in localStorage
  const [pushEnabled, setPushEnabled] = useState<boolean>(() =>
    readLocalStorage(LS_KEYS.PUSH_ENABLED, true)
  );
  const [subscriptions, setSubscriptions] = useState<NotificationSubscriptions>(() =>
    readLocalStorage(LS_KEYS.PUSH_SUBSCRIPTIONS, {
      sermons: true,
      cds: true,
      magazines: true,
      books: true,
    })
  );
  const [notifications, setNotifications] = useState<PushUpdateNotification[]>(() =>
    readLocalStorage(LS_KEYS.NOTIFICATIONS, INITIAL_PUSH_UPDATES)
  );

  // Active Toast Banner for offline auto-save and push notifications
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  // Real HTML5 Audio playback state
  const [currentSermon, setCurrentSermon] = useState<SermonItem | null>(
    WAHARAKA_SERMONS[0] || null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeObjectUrlRef = useRef<string | null>(null);

  // Modals
  const [activeReaderDoc, setActiveReaderDoc] = useState<ReaderDocument | null>(null);
  const [readerInitialPage, setReaderInitialPage] = useState<number>(1);
  const [readerAutoAudio, setReaderAutoAudio] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Sync dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      window.localStorage.setItem(LS_KEYS.DARK_MODE, JSON.stringify(isDarkMode));
    } catch {
      // Ignore storage quota errors
    }
  }, [isDarkMode]);

  // Auto-save offlineSermons to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(
        LS_KEYS.OFFLINE_SERMONS,
        JSON.stringify(offlineSermons)
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [offlineSermons]);

  // Auto-save offlineReadings to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(
        LS_KEYS.OFFLINE_READINGS,
        JSON.stringify(offlineReadings)
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [offlineReadings]);

  // Auto-save readingProgress to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(
        LS_KEYS.READING_PROGRESS,
        JSON.stringify(readingProgress)
      );
    } catch {
      // Ignore
    }
  }, [readingProgress]);

  // Auto-save push preferences & notifications to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(LS_KEYS.PUSH_ENABLED, JSON.stringify(pushEnabled));
      window.localStorage.setItem(
        LS_KEYS.PUSH_SUBSCRIPTIONS,
        JSON.stringify(subscriptions)
      );
      window.localStorage.setItem(
        LS_KEYS.NOTIFICATIONS,
        JSON.stringify(notifications)
      );
    } catch {
      // Ignore
    }
  }, [pushEnabled, subscriptions, notifications]);

  const showBanner = (msg: string) => {
    setStatusBanner(msg);
    window.setTimeout(() => {
      setStatusBanner((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  // Fetch authentic sermons for a selected homepage tag from /api/waharaka/tag/:tagId/:tagSlug
  useEffect(() => {
    if (!selectedHomepageTag) {
      setTagSermons([]);
      setIsLoadingTagSermons(false);
      return;
    }

    let cancelled = false;
    setIsLoadingTagSermons(true);

    async function loadTagSermons() {
      try {
        const res = await fetch(
          `/api/waharaka/tag/${encodeURIComponent(selectedHomepageTag!.id)}/${encodeURIComponent(
            selectedHomepageTag!.slug
          )}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled && Array.isArray(data.sermons)) {
          const mapped: SermonItem[] = data.sermons.map((raw: any, idx: number) =>
            mapRawTrackToSermonItem(raw, selectedHomepageTag!.name, idx)
          );
          setTagSermons(mapped);
        }
      } catch {
        if (!cancelled) {
          setTagSermons([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingTagSermons(false);
        }
      }
    }

    loadTagSermons();

    return () => {
      cancelled = true;
    };
  }, [selectedHomepageTag?.id]);

  // Live search against waharaka.com when user types a query
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setLiveSearchSermons([]);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/waharaka/search?q=${encodeURIComponent(q)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && Array.isArray(data.sermons)) {
          const mapped: SermonItem[] = data.sermons.map((raw: any, idx: number) =>
            mapRawTrackToSermonItem(raw, raw.category || raw.cd, idx)
          );
          setLiveSearchSermons(mapped);
        }
      } catch {
        // Ignore network errors during search
      }
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [searchQuery]);

  // Dynamically load any of the 129 CDs' tracklists from /api/waharaka/cd/:cdId
  const handleLoadCdTracks = async (cdId: string): Promise<CDCollection | null> => {
    const existing = cdsCatalog.find((c) => c.id === cdId);
    if (existing?.tracksLoaded && existing.tracks.length > 0) {
      return existing;
    }

    setLoadingCdIds((prev) => ({ ...prev, [cdId]: true }));
    try {
      const res = await fetch(`/api/waharaka/cd/${encodeURIComponent(cdId)}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      const rawItems = Array.isArray(data.items) ? data.items : [];
      let updatedCd: CDCollection | null = null;

      setCdsCatalog((prev) =>
        prev.map((cd) => {
          if (cd.id !== cdId) return cd;
          const mappedTracks: SermonItem[] = rawItems.map((item: any, idx: number) =>
            mapRawTrackToSermonItem(item, data.name || cd.title, idx)
          );
          const zipBytes = Number(data.zip_size) || 0;
          updatedCd = {
            ...cd,
            sinhalaTitle: data.note || data.series || cd.sinhalaTitle,
            zipUrl: data.zip_url || cd.zipUrl,
            zipSizeMb:
              zipBytes > 0
                ? Math.round((zipBytes / (1024 * 1024)) * 10) / 10
                : Math.round(mappedTracks.reduce((a, t) => a + t.sizeMb, 0) * 10) / 10,
            tracks: mappedTracks,
            tracksLoaded: true,
          };
          return updatedCd;
        })
      );

      return updatedCd;
    } catch {
      showBanner(`Unable to fetch tracklist for ${cdId} right now.`);
      return null;
    } finally {
      setLoadingCdIds((prev) => ({ ...prev, [cdId]: false }));
    }
  };

  // Real HTMLAudioElement setup & playback of authentic Waharaka MP3 streams or cached offline Blobs
  useEffect(() => {
    const sermon = currentSermon;
    if (!sermon) return;

    let cancelled = false;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (activeObjectUrlRef.current) {
      URL.revokeObjectURL(activeObjectUrlRef.current);
      activeObjectUrlRef.current = null;
    }

    async function setupAudio() {
      let srcUrl = sermon!.audioStreamUrl;
      try {
        const cachedBlob = await getAudioBlobFromVault(sermon!.id);
        if (cachedBlob && cachedBlob.size > 0) {
          const blobUrl = URL.createObjectURL(cachedBlob);
          activeObjectUrlRef.current = blobUrl;
          srcUrl = blobUrl;
        }
      } catch {
        // Fallback to stream URL
      }

      if (cancelled) return;

      const audio = new Audio(srcUrl);
      audio.preload = 'metadata';
      audio.playbackRate = playbackRate;

      audio.addEventListener('timeupdate', () => {
        setCurrentTimeSec(Math.floor(audio.currentTime));
      });

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTimeSec(0);
      });

      // Fallback directly to Google Cloud Storage URL if proxy stream fails
      audio.addEventListener(
        'error',
        () => {
          if (audio.src !== sermon!.directGcsAudioUrl) {
            audio.src = sermon!.directGcsAudioUrl;
            if (isPlaying) {
              audio.play().catch(() => {});
            }
          }
        },
        { once: true }
      );

      audioRef.current = audio;

      if (isPlaying) {
        audio.play().catch(() => {
          setIsPlaying(false);
        });
      }
    }

    setupAudio();

    return () => {
      cancelled = true;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (activeObjectUrlRef.current) {
        URL.revokeObjectURL(activeObjectUrlRef.current);
        activeObjectUrlRef.current = null;
      }
    };
  }, [currentSermon?.id]);

  const handlePlaySermon = (sermon: SermonItem) => {
    if (currentSermon?.id === sermon.id) {
      const nextPlaying = !isPlaying;
      setIsPlaying(nextPlaying);
      if (audioRef.current) {
        if (nextPlaying) {
          audioRef.current.play().catch(() => {});
        } else {
          audioRef.current.pause();
        }
      }
      return;
    }

    setCurrentSermon(sermon);
    setCurrentTimeSec(0);
    setIsPlaying(true);
  };

  const handleTogglePlayCurrent = () => {
    if (!currentSermon) return;
    handlePlaySermon(currentSermon);
  };

  const handleSeek = (seconds: number) => {
    setCurrentTimeSec(seconds);
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
    }
  };

  const handleSkip = (delta: number) => {
    if (!currentSermon) return;
    const nextSec = Math.max(
      0,
      Math.min(currentSermon.durationSeconds, currentTimeSec + delta)
    );
    setCurrentTimeSec(nextSec);
    if (audioRef.current) {
      audioRef.current.currentTime = nextSec;
    }
  };

  const handleCyclePlaybackRate = () => {
    const rates = [0.75, 1, 1.25, 1.5];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const handleToggleOfflineSermon = async (sermon: SermonItem) => {
    const { nextMap, action } = toggleOfflineSermonRecord(offlineSermons, sermon);
    setOfflineSermons(nextMap);

    if (action === 'saved') {
      showBanner(
        `Saved "${sermon.title}" (${sermon.sizeMb} MB) metadata to local storage & caching MP3 audio...`
      );
      try {
        const res = await fetch(sermon.audioStreamUrl);
        if (res.ok) {
          const blob = await res.blob();
          await saveAudioBlobToVault(sermon.id, blob);
          showBanner(
            `Offline Ready: "${sermon.title}" (${sermon.sizeMb} MB) saved to local storage.`
          );
        }
      } catch {
        // Metadata remains saved in localStorage
      }
    } else {
      await removeAudioBlobFromVault(sermon.id);
      showBanner(`Removed "${sermon.title}" from offline local storage.`);
    }
  };

  const handleDownloadAllVisibleSermons = (visibleSermons: SermonItem[]) => {
    const nextMap = { ...offlineSermons };
    const nowIso = new Date().toISOString();
    let addedCount = 0;
    for (const s of visibleSermons) {
      if (!nextMap[s.id]) {
        nextMap[s.id] = {
          sermonId: s.id,
          title: s.title,
          sinhalaTitle: s.sinhalaTitle,
          question: s.question,
          category: s.category,
          cdId: s.cdId,
          durationFormatted: s.durationFormatted,
          durationSeconds: s.durationSeconds,
          sizeMb: s.sizeMb,
          downloadedAt: nowIso,
          sourceUrl: s.sourceUrl,
          audioPath: s.audioPath,
          audioStreamUrl: s.audioStreamUrl,
          directGcsAudioUrl: s.directGcsAudioUrl,
        };
        addedCount++;
      }
    }
    setOfflineSermons(nextMap);
    showBanner(
      addedCount > 0
        ? `Auto-saved ${addedCount} sermons to device local storage.`
        : 'Selected sermons are already saved in local storage.'
    );
  };

  const handleBatchDownloadCD = (cd: CDCollection) => {
    const nextMap = batchSaveCDToOffline(offlineSermons, cd);
    setOfflineSermons(nextMap);
    showBanner(
      `Full CD "${cd.title}" (${cd.tracks.length} Deshanas) saved to local storage for offline playback.`
    );
  };

  const handleToggleOfflineMagazine = async (issue: MagazineIssue) => {
    const { nextMap, action } = toggleOfflineReadingRecord(offlineReadings, {
      id: issue.id,
      itemType: 'magazine',
      title: issue.title,
      sizeMb: issue.sizeMb,
      pdfProxyUrl: issue.pdfProxyUrl,
      directPdfUrl: issue.directPdfUrl,
    });
    setOfflineReadings(nextMap);
    if (action === 'saved') {
      showBanner(`Saving "${issue.title}" PDF to local storage for offline reading...`);
      try {
        const res = await fetch(issue.pdfProxyUrl);
        if (res.ok) {
          const buf = await res.arrayBuffer();
          await savePdfBufferToVault(issue.id, buf);
          showBanner(`Saved "${issue.title}" (Full PDF) for offline reading.`);
        }
      } catch {
        // Metadata remains saved in localStorage
      }
    } else {
      await removePdfBufferFromVault(issue.id);
      showBanner(`Removed "${issue.title}" from offline storage.`);
    }
  };

  const handleToggleOfflineBook = async (book: DhammaBook) => {
    const { nextMap, action } = toggleOfflineReadingRecord(offlineReadings, {
      id: book.id,
      itemType: 'book',
      title: book.title,
      sizeMb: book.sizeMb,
      pdfProxyUrl: book.pdfProxyUrl,
      directPdfUrl: book.directPdfUrl,
    });
    setOfflineReadings(nextMap);
    if (action === 'saved') {
      showBanner(`Saving "${book.title}" PDF to local storage for offline reading...`);
      try {
        const res = await fetch(book.pdfProxyUrl);
        if (res.ok) {
          const buf = await res.arrayBuffer();
          await savePdfBufferToVault(book.id, buf);
          showBanner(`Saved book "${book.title}" (Full PDF) for offline reading.`);
        }
      } catch {
        // Metadata remains saved in localStorage
      }
    } else {
      await removePdfBufferFromVault(book.id);
      showBanner(`Removed "${book.title}" from offline storage.`);
    }
  };

  const handleOpenMagazineReader = (
    issue: MagazineIssue,
    startAudio = false,
    initialPage?: number
  ) => {
    const savedPage = readingProgress[issue.id]?.pageNumber || 1;
    setReaderInitialPage(initialPage || savedPage);
    setReaderAutoAudio(startAudio);
    setActiveReaderDoc({
      id: issue.id,
      itemType: 'magazine',
      title: issue.title,
      sinhalaTitle: issue.sinhalaTitle,
      subtitle: `${issue.issueNumber} · ${issue.publishedMonthLabel}`,
      sizeMb: issue.sizeMb,
      pdfProxyUrl: issue.pdfProxyUrl,
      directPdfUrl: issue.directPdfUrl,
      toc: issue.toc,
      companionSermon: WAHARAKA_SERMONS[issue.volumeNumber % WAHARAKA_SERMONS.length],
    });
  };

  const handleOpenBookReader = (
    book: DhammaBook,
    startAudio = false,
    initialPage?: number
  ) => {
    const savedPage =
      readingProgress[book.id]?.pageNumber || book.toc[0]?.pdfPageNo || 1;
    setReaderInitialPage(initialPage || savedPage);
    setReaderAutoAudio(startAudio);

    const companionCd = cdsCatalog.find((c) => c.id === book.companionCdId);
    const companionSermon =
      companionCd?.tracks?.[0] || WAHARAKA_SERMONS[0] || null;

    setActiveReaderDoc({
      id: book.id,
      itemType: 'book',
      title: book.title,
      sinhalaTitle: book.sinhalaTitle,
      subtitle: `${book.author} · ${book.toc.length} Chapters`,
      sizeMb: book.sizeMb,
      pdfProxyUrl: book.pdfProxyUrl,
      directPdfUrl: book.directPdfUrl,
      toc: book.toc,
      companionSermon,
    });
  };

  const handleUpdateReadingProgress = (
    docId: string,
    pageNumber: number,
    totalPages: number,
    bookmarked: boolean
  ) => {
    setReadingProgress((prev) => ({
      ...prev,
      [docId]: {
        pageNumber,
        totalPages,
        bookmarked,
        updatedAt: new Date().toISOString(),
      },
    }));
  };

  const handleCheckLiveUpdates = async () => {
    try {
      const res = await fetch('/api/waharaka/updates');
      const data = await res.json();
      if (data?.announcement) {
        const newNotif: PushUpdateNotification = data.announcement;
        setNotifications((prev) => [newNotif, ...prev]);
        showBanner(`Push Update: ${newNotif.title}`);
        if (
          pushEnabled &&
          'Notification' in window &&
          window.Notification.permission === 'granted'
        ) {
          new window.Notification(newNotif.title, { body: newNotif.body });
        }
      }
    } catch {
      showBanner('Checked local Waharaka archive — your library is up to date.');
    }
  };

  const handleTogglePushEnabled = () => {
    const next = !pushEnabled;
    setPushEnabled(next);
    if (next && 'Notification' in window && window.Notification.permission === 'default') {
      window.Notification.requestPermission().catch(() => {});
    }
    showBanner(
      next
        ? 'Push notifications enabled for new Waharaka sermons, CDs, magazines, and books.'
        : 'Push notifications paused.'
    );
  };

  const handleSelectNotificationTarget = (notif: PushUpdateNotification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    setIsNotificationsOpen(false);
    if (notif.category === 'sermon') {
      setActiveTab('sermons');
      const target = WAHARAKA_SERMONS.find((s) => s.id === notif.targetId);
      if (target) handlePlaySermon(target);
    } else if (notif.category === 'cd') {
      setActiveTab('cds');
    } else if (notif.category === 'magazine') {
      setActiveTab('magazines');
      const issue = WAHARAKA_MAGAZINES.find((m) => m.id === notif.targetId);
      if (issue) handleOpenMagazineReader(issue, false);
    } else if (notif.category === 'book') {
      setActiveTab('books');
      const book = WAHARAKA_BOOKS.find((b) => b.id === notif.targetId);
      if (book) handleOpenBookReader(book, false);
    }
  };

  // Combine preloaded sermons from all loaded CDs + live search results from waharaka.com
  const allAvailableSermons = useMemo(() => {
    const fromCds = cdsCatalog.filter((c) => c.tracksLoaded).flatMap((c) => c.tracks);
    if (liveSearchSermons.length === 0) return fromCds;
    const seen = new Set(fromCds.map((s) => s.id));
    const extras = liveSearchSermons.filter((s) => !seen.has(s.id));
    return [...extras, ...fromCds];
  }, [cdsCatalog, liveSearchSermons]);

  // Filtered sermons (uses tagSermons when a homepage tag is active, or allAvailableSermons)
  const filteredSermons = useMemo(() => {
    if (selectedHomepageTag) {
      if (tagSermons.length > 0) {
        return filterSermons(tagSermons, {
          searchQuery,
          category: 'All',
          onlyOffline: onlyOfflineFilter,
          offlineMap: offlineSermons,
        });
      }
      // Immediate local fallback while live tag fetch is in flight
      return filterSermons(allAvailableSermons, {
        searchQuery: searchQuery || selectedHomepageTag.name,
        category: 'All',
        onlyOffline: onlyOfflineFilter,
        offlineMap: offlineSermons,
      });
    }

    return filterSermons(allAvailableSermons, {
      searchQuery,
      category: selectedCategory,
      onlyOffline: onlyOfflineFilter,
      offlineMap: offlineSermons,
    });
  }, [
    selectedHomepageTag,
    tagSermons,
    allAvailableSermons,
    searchQuery,
    selectedCategory,
    onlyOfflineFilter,
    offlineSermons,
  ]);

  const filteredCDs = useMemo(
    () => filterCDCollections(cdsCatalog, searchQuery),
    [cdsCatalog, searchQuery]
  );

  const filteredMagazines = useMemo(
    () =>
      filterMagazines(
        WAHARAKA_MAGAZINES,
        searchQuery,
        onlyOfflineFilter,
        offlineReadings
      ),
    [searchQuery, onlyOfflineFilter, offlineReadings]
  );

  const filteredBooks = useMemo(
    () =>
      filterBooks(WAHARAKA_BOOKS, searchQuery, onlyOfflineFilter, offlineReadings),
    [searchQuery, onlyOfflineFilter, offlineReadings]
  );

  const offlineStats = useMemo(
    () => calculateOfflineStorageStats(offlineSermons, offlineReadings),
    [offlineSermons, offlineReadings]
  );

  const unreadNotificationsCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  return (
    <div
      id="top"
      className="min-h-screen flex flex-col pb-36 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100"
    >
      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((d) => !d)}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        offlineStats={offlineStats}
        onlyOfflineFilter={onlyOfflineFilter}
        onToggleOnlyOffline={() => setOnlyOfflineFilter((o) => !o)}
      />

      {/* Non-intrusive Status Toast Banner for Offline Auto-Save & Push Alerts */}
      {statusBanner && (
        <div
          role="status"
          aria-live="polite"
          className="max-w-7xl mx-auto w-full px-3 sm:px-6 pt-3"
        >
          <div className="px-3.5 py-2.5 rounded-xl bg-amber-900 text-amber-50 dark:bg-amber-500 dark:text-stone-950 text-xs font-medium flex items-center justify-between gap-3 shadow-sm">
            <span>{statusBanner}</span>
            <button
              type="button"
              onClick={() => setStatusBanner(null)}
              className="underline font-semibold shrink-0"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {activeTab === 'sermons' && (
          <SermonsView
            sermons={filteredSermons}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedHomepageTag={selectedHomepageTag}
            isLoadingTagSermons={isLoadingTagSermons}
            onSelectHomepageTag={setSelectedHomepageTag}
            currentPlayingId={currentSermon?.id ?? null}
            isPlaying={isPlaying}
            onPlaySermon={handlePlaySermon}
            offlineSermons={offlineSermons}
            onToggleOfflineSermon={handleToggleOfflineSermon}
            onDownloadAllVisible={handleDownloadAllVisibleSermons}
          />
        )}

        {activeTab === 'cds' && (
          <CDsView
            cds={filteredCDs}
            currentPlayingId={currentSermon?.id ?? null}
            isPlaying={isPlaying}
            loadingCdIds={loadingCdIds}
            onPlaySermon={handlePlaySermon}
            offlineSermons={offlineSermons}
            onToggleOfflineSermon={handleToggleOfflineSermon}
            onBatchDownloadCD={handleBatchDownloadCD}
            onLoadCdTracks={handleLoadCdTracks}
          />
        )}

        {activeTab === 'magazines' && (
          <MagazinesView
            magazines={filteredMagazines}
            offlineReadings={offlineReadings}
            readingProgress={readingProgress}
            onOpenReader={handleOpenMagazineReader}
            onToggleOfflineMagazine={handleToggleOfflineMagazine}
          />
        )}

        {activeTab === 'books' && (
          <BooksView
            books={filteredBooks}
            offlineReadings={offlineReadings}
            readingProgress={readingProgress}
            onOpenReader={handleOpenBookReader}
            onToggleOfflineBook={handleToggleOfflineBook}
          />
        )}
      </main>

      {/* Clean Footer */}
      <footer className="max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 border-t border-stone-200 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-center sm:text-left">
          Waharaka Dhamma Archive · 129 CDs, 23 Books & 100 Hela Bodu Piyuma Volumes (Sabbadanam Dhammadanam Jinati)
        </p>
        <div className="flex items-center gap-3">
          <a
            href="https://www.waharaka.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-stone-900 dark:hover:text-stone-200 underline"
          >
            Official Waharaka.com Portal
          </a>
          <span>·</span>
          <span className="font-mono-tabular">
            Local Storage Vault: {offlineStats.totalSizeMb} MB Cached
          </span>
        </div>
      </footer>

      {/* Persistent Audio Player & Android Mobile Bottom Navigation */}
      <AudioPlayerBar
        currentSermon={currentSermon}
        isPlaying={isPlaying}
        currentTimeSec={currentTimeSec}
        playbackRate={playbackRate}
        isSavedOffline={Boolean(currentSermon && offlineSermons[currentSermon.id])}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onTogglePlay={handleTogglePlayCurrent}
        onSeek={handleSeek}
        onSkip={handleSkip}
        onCyclePlaybackRate={handleCyclePlaybackRate}
        onToggleOffline={handleToggleOfflineSermon}
      />

      {/* Multi-Page PDF Clean Reader Modal for Books & Magazines */}
      <CleanReaderModal
        document={activeReaderDoc}
        initialPageNumber={readerInitialPage}
        autoStartAudio={readerAutoAudio}
        isBookmarked={
          activeReaderDoc
            ? Boolean(readingProgress[activeReaderDoc.id]?.bookmarked)
            : false
        }
        isSavedOffline={
          activeReaderDoc ? Boolean(offlineReadings[activeReaderDoc.id]) : false
        }
        isAppDarkMode={isDarkMode}
        onClose={() => setActiveReaderDoc(null)}
        onUpdateProgress={handleUpdateReadingProgress}
        onPlayCompanionSermon={handlePlaySermon}
        isGlobalAudioPlaying={isPlaying}
        currentGlobalSermonId={currentSermon?.id ?? null}
        onToggleSaveOffline={() => {
          if (!activeReaderDoc) return;
          const { nextMap, action } = toggleOfflineReadingRecord(offlineReadings, {
            id: activeReaderDoc.id,
            itemType: activeReaderDoc.itemType,
            title: activeReaderDoc.title,
            sizeMb: activeReaderDoc.sizeMb,
            pdfProxyUrl: activeReaderDoc.pdfProxyUrl,
            directPdfUrl: activeReaderDoc.directPdfUrl,
          });
          setOfflineReadings(nextMap);
          showBanner(
            action === 'saved'
              ? `Saved "${activeReaderDoc.title}" to local storage.`
              : `Removed "${activeReaderDoc.title}" from local storage.`
          );
        }}
      />

      {/* Push Notifications & Archive Sync Modal */}
      <NotificationCenterModal
        isOpen={isNotificationsOpen}
        notifications={notifications}
        subscriptions={subscriptions}
        pushEnabled={pushEnabled}
        onClose={() => setIsNotificationsOpen(false)}
        onTogglePushEnabled={handleTogglePushEnabled}
        onToggleSubscription={(key) =>
          setSubscriptions((prev) => ({ ...prev, [key]: !prev[key] }))
        }
        onMarkAllRead={() =>
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        }
        onCheckLiveUpdates={handleCheckLiveUpdates}
        onSelectNotificationTarget={handleSelectNotificationTarget}
      />
    </div>
  );
}
