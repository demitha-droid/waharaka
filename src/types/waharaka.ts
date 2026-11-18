export type TabId = 'sermons' | 'cds' | 'magazines' | 'books';

export type SermonCategory =
  | 'All'
  | 'Nirukthi'
  | 'Patichcha Samuppada'
  | 'Meditation'
  | 'Poya Special'
  | 'Saved Offline';

export interface SermonItem {
  id: string;
  title: string;
  sinhalaTitle: string;
  paliKeyphrase: string;
  category: Exclude<SermonCategory, 'All' | 'Saved Offline'>;
  recordedDate: string;
  location: string;
  durationSeconds: number;
  fileSizeMb: number;
  waharakaUrl: string;
  cdId?: string;
  trackNumber?: number;
  summary: string;
  transcriptSegments: {
    timestampSeconds: number;
    heading: string;
    paliStanza?: string;
    content: string;
  }[];
  audioProfile: {
    baseFreqHz: number;
    harmonicIntervals: number[];
    cadenceBpm: number;
  };
}

export interface CDCollection {
  id: string;
  code: string;
  title: string;
  sinhalaTitle: string;
  releaseYear: string;
  discCount: number;
  totalDurationLabel: string;
  coverImage: string;
  waharakaCollectionUrl: string;
  description: string;
  sermonIds: string[];
}

export interface ReadingChapter {
  id: string;
  chapterNumber: number;
  title: string;
  paliEpigraph?: string;
  estimatedReadMinutes: number;
  audioDurationSeconds: number;
  paragraphs: string[];
}

export interface MagazineIssue {
  id: string;
  issueNumber: string;
  title: string;
  sinhalaTitle: string;
  publishedMonth: string;
  coverImage: string;
  waharakaUrl: string;
  summary: string;
  fileSizeMb: number;
  chapters: ReadingChapter[];
}

export interface DhammaBook {
  id: string;
  title: string;
  sinhalaTitle: string;
  subtitle: string;
  publishedYear: string;
  pageCount: number;
  coverImage: string;
  waharakaUrl: string;
  fileSizeMb: number;
  summary: string;
  chapters: ReadingChapter[];
}

export interface OfflineDownloadedSermon {
  sermonId: string;
  downloadedAtIso: string;
  title: string;
  sinhalaTitle: string;
  category: string;
  durationSeconds: number;
  fileSizeMb: number;
  waharakaUrl: string;
  transcriptSegments: SermonItem['transcriptSegments'];
  audioProfile: SermonItem['audioProfile'];
  offlineAudioPacket: string;
}

export interface OfflineSavedReading {
  itemId: string;
  itemType: 'book' | 'magazine';
  savedAtIso: string;
  title: string;
  fileSizeMb: number;
  chapters: ReadingChapter[];
  lastReadChapterId: string;
  bookmarkedChapterIds: string[];
}

export interface PushNotificationItem {
  id: string;
  title: string;
  body: string;
  category: 'sermon' | 'cd' | 'magazine' | 'book';
  publishedAt: string;
  targetTab: TabId;
  targetItemId: string;
  read: boolean;
}

export interface NotificationPreferences {
  enabled: boolean;
  newSermons: boolean;
  cdReleases: boolean;
  magazineIssues: boolean;
  newBooks: boolean;
}

export interface ReaderSettings {
  fontSizePx: number;
  lineHeight: 'normal' | 'relaxed' | 'loose';
  surfaceTheme: 'paper' | 'sepia' | 'night';
}
