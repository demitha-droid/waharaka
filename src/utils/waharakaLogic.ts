export interface SermonItem {
  id: string;
  title: string;
  sinhalaTitle: string;
  question: string;
  category: string;
  durationFormatted: string;
  durationSeconds: number;
  sizeMb: number;
  sourceUrl: string;
  audioPath: string;
  audioStreamUrl: string;
  directGcsAudioUrl: string;
  cdId: string;
  trackNumber?: number;
}

export interface HomepageTag {
  id: string;
  slug: string;
  name: string;
  count: number;
  rankClass: string;
}

export interface CDCollection {
  id: string;
  code: string;
  title: string;
  sinhalaTitle: string;
  series: string;
  group: 'special' | 'numbered';
  coverImage: string;
  sourceUrl: string;
  zipUrl: string;
  zipSizeMb: number;
  tracks: SermonItem[];
  tracksLoaded: boolean;
}

export interface TocEntry {
  id: string;
  index: number;
  title: string;
  printedPageNo: number;
  pdfPageNo: number;
  isCoverPage?: boolean;
}

export interface MagazineIssue {
  id: string;
  volumeNumber: number;
  issueNumber: string;
  title: string;
  sinhalaTitle: string;
  publishedYear: number;
  publishedMonthName: string;
  publishedMonthLabel: string;
  sizeMb: number;
  spriteUrl: string;
  spriteOffsetY: number;
  sourceUrl: string;
  pdfProxyUrl: string;
  directPdfUrl: string;
  toc: TocEntry[];
}

export interface DhammaBook {
  id: string;
  urlName: string;
  title: string;
  sinhalaTitle: string;
  author: string;
  compiler: string;
  pageOffset: number;
  sizeMb: number;
  spriteIndex: number;
  spriteUrl: string;
  spriteOffsetY: number;
  sourceUrl: string;
  pdfProxyUrl: string;
  directPdfUrl: string;
  companionCdId?: string;
  toc: TocEntry[];
}

export interface PushUpdateNotification {
  id: string;
  title: string;
  body: string;
  category: 'sermon' | 'cd' | 'magazine' | 'book';
  publishedAt: string;
  targetId: string;
  read: boolean;
}

export interface OfflineSermonPacket {
  sermonId: string;
  title: string;
  sinhalaTitle: string;
  question: string;
  category: string;
  cdId: string;
  durationFormatted: string;
  durationSeconds: number;
  sizeMb: number;
  downloadedAt: string;
  sourceUrl: string;
  audioPath: string;
  audioStreamUrl: string;
  directGcsAudioUrl: string;
}

export interface OfflineReadingPacket {
  itemId: string;
  itemType: 'magazine' | 'book';
  title: string;
  sizeMb: number;
  downloadedAt: string;
  pdfProxyUrl: string;
  directPdfUrl: string;
}

export interface ReadingProgressMap {
  [itemId: string]: {
    pageNumber: number;
    totalPages: number;
    updatedAt: string;
    bookmarked: boolean;
  };
}

export function parseDurationToSeconds(durationStr: string): number {
  if (!durationStr) return 0;
  const parts = durationStr
    .trim()
    .split(':')
    .map((p) => parseInt(p, 10) || 0);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return parts[0] || 0;
}

export function formatDuration(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, '0');
  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

export function buildAudioUrls(audioPath: string): {
  audioStreamUrl: string;
  directGcsAudioUrl: string;
} {
  const encodedSegments = audioPath
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/');
  return {
    audioStreamUrl: `/api/waharaka/audio?path=${encodeURIComponent(audioPath)}`,
    directGcsAudioUrl: `https://storage.googleapis.com/www.waharaka.com${encodedSegments}`,
  };
}

export function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function matchesSearchQuery(fields: string[], query: string): boolean {
  const q = normalizeQuery(query);
  if (!q) return true;
  const tokens = q.split(/\s+/).filter(Boolean);
  const combined = fields.join(' ').toLowerCase();
  return tokens.every((token) => combined.includes(token));
}

export function filterSermons(
  sermons: SermonItem[],
  options: {
    searchQuery: string;
    category: string;
    onlyOffline: boolean;
    offlineMap: Record<string, OfflineSermonPacket>;
  }
): SermonItem[] {
  const { searchQuery, category, onlyOffline, offlineMap } = options;
  return sermons.filter((sermon) => {
    if (onlyOffline && !offlineMap[sermon.id]) {
      return false;
    }
    if (category !== 'All' && sermon.category !== category && sermon.cdId !== category) {
      return false;
    }
    return matchesSearchQuery(
      [
        sermon.id,
        sermon.title,
        sermon.sinhalaTitle,
        sermon.question,
        sermon.category,
        sermon.cdId,
      ],
      searchQuery
    );
  });
}

export function filterCDCollections(
  cds: CDCollection[],
  searchQuery: string,
  groupFilter: 'all' | 'special' | 'numbered' = 'all'
): CDCollection[] {
  return cds.filter((cd) => {
    if (groupFilter !== 'all' && cd.group !== groupFilter) {
      return false;
    }
    if (!normalizeQuery(searchQuery)) return true;
    const trackFields = cd.tracks.flatMap((t) => [t.title, t.question, t.id]);
    return matchesSearchQuery(
      [cd.id, cd.code, cd.title, cd.sinhalaTitle, cd.series, ...trackFields],
      searchQuery
    );
  });
}

export function filterMagazines(
  magazines: MagazineIssue[],
  searchQuery: string,
  onlyOffline = false,
  offlineReadings: Record<string, OfflineReadingPacket> = {},
  yearFilter: number | 'All' = 'All'
): MagazineIssue[] {
  return magazines.filter((mag) => {
    if (onlyOffline && !offlineReadings[mag.id]) {
      return false;
    }
    if (yearFilter !== 'All' && mag.publishedYear !== yearFilter) {
      return false;
    }
    const articleFields = mag.toc.map((t) => t.title);
    return matchesSearchQuery(
      [
        mag.title,
        mag.sinhalaTitle,
        mag.issueNumber,
        mag.publishedMonthLabel,
        String(mag.volumeNumber),
        ...articleFields,
      ],
      searchQuery
    );
  });
}

export function filterBooks(
  books: DhammaBook[],
  searchQuery: string,
  onlyOffline = false,
  offlineReadings: Record<string, OfflineReadingPacket> = {}
): DhammaBook[] {
  return books.filter((book) => {
    if (onlyOffline && !offlineReadings[book.id]) {
      return false;
    }
    const chapterFields = book.toc.map((c) => c.title);
    return matchesSearchQuery(
      [book.title, book.sinhalaTitle, book.urlName, book.author, book.compiler, ...chapterFields],
      searchQuery
    );
  });
}

export function toggleOfflineSermonRecord(
  currentMap: Record<string, OfflineSermonPacket>,
  sermon: SermonItem,
  nowIso = new Date().toISOString()
): { nextMap: Record<string, OfflineSermonPacket>; action: 'saved' | 'removed' } {
  const nextMap = { ...currentMap };
  if (nextMap[sermon.id]) {
    delete nextMap[sermon.id];
    return { nextMap, action: 'removed' };
  }

  nextMap[sermon.id] = {
    sermonId: sermon.id,
    title: sermon.title,
    sinhalaTitle: sermon.sinhalaTitle,
    question: sermon.question,
    category: sermon.category,
    cdId: sermon.cdId,
    durationFormatted: sermon.durationFormatted,
    durationSeconds: sermon.durationSeconds,
    sizeMb: sermon.sizeMb,
    downloadedAt: nowIso,
    sourceUrl: sermon.sourceUrl,
    audioPath: sermon.audioPath,
    audioStreamUrl: sermon.audioStreamUrl,
    directGcsAudioUrl: sermon.directGcsAudioUrl,
  };
  return { nextMap, action: 'saved' };
}

export function batchSaveCDToOffline(
  currentMap: Record<string, OfflineSermonPacket>,
  cd: CDCollection,
  nowIso = new Date().toISOString()
): Record<string, OfflineSermonPacket> {
  const nextMap = { ...currentMap };
  for (const track of cd.tracks) {
    if (!nextMap[track.id]) {
      nextMap[track.id] = {
        sermonId: track.id,
        title: track.title,
        sinhalaTitle: track.sinhalaTitle,
        question: track.question,
        category: track.category,
        cdId: track.cdId,
        durationFormatted: track.durationFormatted,
        durationSeconds: track.durationSeconds,
        sizeMb: track.sizeMb,
        downloadedAt: nowIso,
        sourceUrl: track.sourceUrl,
        audioPath: track.audioPath,
        audioStreamUrl: track.audioStreamUrl,
        directGcsAudioUrl: track.directGcsAudioUrl,
      };
    }
  }
  return nextMap;
}

export function toggleOfflineReadingRecord(
  currentMap: Record<string, OfflineReadingPacket>,
  item: {
    id: string;
    itemType: 'magazine' | 'book';
    title: string;
    sizeMb: number;
    pdfProxyUrl: string;
    directPdfUrl: string;
  },
  nowIso = new Date().toISOString()
): { nextMap: Record<string, OfflineReadingPacket>; action: 'saved' | 'removed' } {
  const nextMap = { ...currentMap };
  if (nextMap[item.id]) {
    delete nextMap[item.id];
    return { nextMap, action: 'removed' };
  }

  nextMap[item.id] = {
    itemId: item.id,
    itemType: item.itemType,
    title: item.title,
    sizeMb: item.sizeMb,
    downloadedAt: nowIso,
    pdfProxyUrl: item.pdfProxyUrl,
    directPdfUrl: item.directPdfUrl,
  };
  return { nextMap, action: 'saved' };
}

export function calculateOfflineStorageStats(
  offlineSermons: Record<string, OfflineSermonPacket>,
  offlineReadings: Record<string, OfflineReadingPacket>
): {
  sermonCount: number;
  readingCount: number;
  totalSizeMb: number;
} {
  const sermonList = Object.values(offlineSermons);
  const readingList = Object.values(offlineReadings);
  const sermonMb = sermonList.reduce((acc, item) => acc + item.sizeMb, 0);
  const readingMb = readingList.reduce((acc, item) => acc + item.sizeMb, 0);
  const totalSizeMb = Math.round((sermonMb + readingMb) * 10) / 10;

  return {
    sermonCount: sermonList.length,
    readingCount: readingList.length,
    totalSizeMb,
  };
}

export function getReadingProgressPercent(
  pageNumber: number,
  totalPages: number
): number {
  if (totalPages <= 0) return 0;
  const clamped = Math.min(Math.max(1, pageNumber), totalPages);
  return Math.round((clamped / totalPages) * 100);
}

export interface PaginationResult<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  pageNumbers: (number | 'ellipsis')[];
}

export function paginateItems<T>(
  allItems: T[],
  page: number,
  pageSize = 15
): PaginationResult<T> {
  const safePageSize = Math.max(1, Math.floor(pageSize));
  const totalItems = allItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));
  const currentPage = Math.min(Math.max(1, Math.floor(page) || 1), totalPages);
  const startIndex = (currentPage - 1) * safePageSize;
  const endIndex = Math.min(startIndex + safePageSize, totalItems);
  const items = allItems.slice(startIndex, endIndex);

  const pageNumbers: (number | 'ellipsis')[] = [];
  if (totalPages <= 9) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    const pagesSet = new Set<number>([
      1,
      2,
      3,
      totalPages,
      currentPage - 1,
      currentPage,
      currentPage + 1,
    ]);
    const sorted = Array.from(pagesSet)
      .filter((p) => p >= 1 && p <= totalPages)
      .sort((a, b) => a - b);

    for (let i = 0; i < sorted.length; i++) {
      const p = sorted[i];
      if (i > 0 && p - sorted[i - 1] > 1) {
        pageNumbers.push('ellipsis');
      }
      pageNumbers.push(p);
    }
  }

  return {
    items,
    currentPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    pageNumbers,
  };
}

export interface AriyaDhammaLogoOption {
  id: number;
  code: string;
  title: string;
  sinhalaTitle: string;
  symbolName: string;
  tagline: string;
  description: string;
  accentStyle: string;
}

export const ARIYA_DHAMMA_LOGOS: AriyaDhammaLogoOption[] = [
  {
    id: 1,
    code: 'dhammacakka',
    title: 'AriyaDhamma · Dhammacakka',
    sinhalaTitle: 'අරිය ධම්ම · ධම්මචක්කය',
    symbolName: 'Eight-Spoke Dhamma Wheel',
    tagline: 'අරිය අෂ්ඨාංගික මග · Noble Eightfold Path',
    description:
      'Eight sacred spokes radiating from the hub of Nibbana, encircled by Sila, Samadhi, and Panna.',
    accentStyle: 'from-amber-500 to-yellow-600',
  },
  {
    id: 2,
    code: 'paduma-lotus',
    title: 'AriyaDhamma · Sacred Paduma',
    sinhalaTitle: 'අරිය ධම්ම · පදුම පද්මය',
    symbolName: 'Blooming Lotus & Dhamma Sun',
    tagline: 'ලෝකයෙන් නොඇලී පිපෙන පද්මය · Unstained Awakening',
    description:
      'An eight-petalled lotus rising pure above the waters of Samsara with a radiant sun of wisdom.',
    accentStyle: 'from-amber-400 to-orange-600',
  },
  {
    id: 3,
    code: 'bodhi-leaf',
    title: 'AriyaDhamma · Siri Maha Bodhi',
    sinhalaTitle: 'අරිය ධම්ම · ජය ශ්‍රී මහා බෝධි පත්‍රය',
    symbolName: 'Sacred Bo Leaf & Wheel',
    tagline: 'සම්මා සම්බෝධි ඥානය · Supreme Enlightenment',
    description:
      'Sacred heart-shaped Bodhi leaf with its classic elongated drip-tip cradling a golden Dhamma wheel.',
    accentStyle: 'from-emerald-500 to-amber-500',
  },
  {
    id: 4,
    code: 'triratna-tilakkhana',
    title: 'AriyaDhamma · Tilakkhana Gem',
    sinhalaTitle: 'අරිය ධම්ම · තිසරණ හා තිලකුණ',
    symbolName: 'Triple Gem & Three Characteristics',
    tagline: 'අනිච්ච · දුක්ඛ · අනත්ත · Triratna Crest',
    description:
      'Three luminous jewels atop a lotus base signifying Buddha, Dhamma, Sangha and Anicca, Dukkha, Anatta.',
    accentStyle: 'from-amber-500 to-red-500',
  },
  {
    id: 5,
    code: 'hela-stupa',
    title: 'AriyaDhamma · Hela Dagoba',
    sinhalaTitle: 'අරිය ධම්ම · සෑ රදුන්',
    symbolName: 'Sacred Stupa & Spire Halo',
    tagline: 'ධාතු නිධාන මහා සෑය · Reliquary of Peace',
    description:
      'Traditional Sri Lankan Bubbulakara Stupa dome with Hatharas Kotuwa and Koth Kerella radiating serenity.',
    accentStyle: 'from-yellow-400 to-amber-600',
  },
  {
    id: 6,
    code: 'chatra-parasol',
    title: 'AriyaDhamma · Sovereign Chatra',
    sinhalaTitle: 'අරිය ධම්ම · සදහම් ඡත්‍රය',
    symbolName: 'Three-Tiered Royal Parasol',
    tagline: 'තුන් ලොවටම සෙවණ දෙන දහම · Canopy of Refuge',
    description:
      'Auspicious royal parasol (Chatra) symbolizing the supreme spiritual protection of the Noble Dhamma.',
    accentStyle: 'from-amber-500 to-amber-700',
  },
  {
    id: 7,
    code: 'panna-pahana',
    title: 'AriyaDhamma · Aloka Pahana',
    sinhalaTitle: 'අරිය ධම්ම · ප්‍රඥා ආලෝක පහන',
    symbolName: 'Traditional Lamp of Wisdom',
    tagline: 'අවිද්‍යා අඳුර දුරු කරන ප්‍රඥා ආලෝකය · Light of Prajna',
    description:
      'Classic Sinhala brass Pahana oil lamp with a serene flame dispelling the darkness of ignorance.',
    accentStyle: 'from-orange-400 to-amber-600',
  },
  {
    id: 8,
    code: 'dhamma-sankha',
    title: 'AriyaDhamma · Dakshinavarta Sankha',
    sinhalaTitle: 'අරිය ධම්ම · දහම් සංඛ නාදය',
    symbolName: 'Sacred Right-Turning Conch',
    tagline: 'සීහනාද ධම්ම ඝෝෂාව · Fearless Call of Truth',
    description:
      'Auspicious clockwise-spiraling conch shell proclaiming the authentic Tathagata Deshana across the world.',
    accentStyle: 'from-amber-300 to-amber-600',
  },
  {
    id: 9,
    code: 'sandakada-pahana',
    title: 'AriyaDhamma · Sandakada Pahana',
    sinhalaTitle: 'අරිය ධම්ම · සඳකඩ පහණ',
    symbolName: 'Moonstone Threshold of Nibbana',
    tagline: 'සසර ගිනි නිවාලන නිවන් දොරටුව · Gateway to Liberation',
    description:
      'Concentric moonstone arcs of flames, sacred Hansa swan symbolism, and central lotus petals.',
    accentStyle: 'from-amber-500 to-stone-500',
  },
  {
    id: 10,
    code: 'ariya-magga-knot',
    title: 'AriyaDhamma · Ariya Magga Mandala',
    sinhalaTitle: 'අරිය ධම්ම · පටිච්චසමුප්පාද චක්‍රය',
    symbolName: 'Auspicious Knot & Bodhi Halo',
    tagline: 'හේතු ඵල දහම සහ නිවීම · Cessation of Suffering',
    description:
      'Interwoven Buddhist emblem inside a lotus-wheel mandala representing Dependent Origination and release.',
    accentStyle: 'from-amber-400 to-yellow-500',
  },
];

export function getAriyaDhammaLogoById(id: number): AriyaDhammaLogoOption {
  return ARIYA_DHAMMA_LOGOS.find((logo) => logo.id === id) || ARIYA_DHAMMA_LOGOS[0];
}

