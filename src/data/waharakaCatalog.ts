import rawSnapshot from './waharakaAuthenticData.json';
import rawHomepageTags from './waharakaHomepageTags.json';
import {
  parseDurationToSeconds,
  buildAudioUrls,
  type SermonItem,
  type HomepageTag,
  type CDCollection,
  type MagazineIssue,
  type DhammaBook,
  type PushUpdateNotification,
  type TocEntry,
} from '../utils/waharakaLogic';

export const HERO_MONASTERY_IMG =
  '/src/assets/images/waharaka_hero_monastery_1794978206422.jpg';

export const WAHARAKA_HOMEPAGE_TAGS: HomepageTag[] =
  (rawHomepageTags as HomepageTag[]) || [];

const SINHALA_MONTHS: Record<number, string> = {
  1: 'ජනවාරි (දුරුතු)',
  2: 'පෙබරවාරි (නවම්)',
  3: 'මාර්තු (මැදින්)',
  4: 'අප්‍රේල් (බක්)',
  5: 'මැයි (වෙසක්)',
  6: 'ජූනි (පොසොන්)',
  7: 'ජූලි (ඇසළ)',
  8: 'අගෝස්තු (නිකිණි)',
  9: 'සැප්තැම්බර් (බිනර)',
  10: 'ඔක්තෝබර් (වප්)',
  11: 'නොවැම්බර් (ඉල්)',
  12: 'දෙසැම්බර් (උඳුවප්)',
};

export function mapRawTrackToSermonItem(
  raw: {
    id: string;
    name: string;
    question?: string;
    url: string;
    cd: string;
    size: number | string;
    duration: string;
    category?: string | null;
  },
  cdTitle?: string,
  trackIndex?: number
): SermonItem {
  const bytes = Number(raw.size) || 0;
  const sizeMb = Math.max(0.5, Math.round((bytes / (1024 * 1024)) * 10) / 10);
  const durationFormatted = (raw.duration || '00:00').trim();
  const durationSeconds = parseDurationToSeconds(durationFormatted);
  const { audioStreamUrl, directGcsAudioUrl } = buildAudioUrls(raw.url);

  return {
    id: raw.id,
    title: raw.name.trim(),
    sinhalaTitle: cdTitle ? `${cdTitle} · ${raw.id}` : raw.id,
    question: (raw.question || '').trim(),
    category: raw.category || cdTitle || raw.cd,
    durationFormatted,
    durationSeconds,
    sizeMb,
    sourceUrl: `https://www.waharaka.com/listen/${encodeURIComponent(raw.id)}`,
    audioPath: raw.url,
    audioStreamUrl,
    directGcsAudioUrl,
    cdId: raw.cd,
    trackNumber: trackIndex !== undefined ? trackIndex + 1 : undefined,
  };
}

const preloadedMap: Record<string, any> = (rawSnapshot as any).preloadedCds || {};

// Build all 129 authentic CD collections (24 Special Collections + 105 Numbered CDs)
export const WAHARAKA_CDS: CDCollection[] = [
  ...(rawSnapshot.specialCds || []).map((sc: any): CDCollection => {
    const pre = preloadedMap[sc.id];
    const tracks: SermonItem[] = Array.isArray(pre?.items)
      ? pre.items.map((item: any, idx: number) =>
          mapRawTrackToSermonItem(item, sc.name, idx)
        )
      : [];
    const zipBytes = Number(pre?.zip_size) || 0;
    return {
      id: sc.id,
      code: sc.id,
      title: sc.name,
      sinhalaTitle: pre?.series || 'සුවිශේෂී දේශනා එකතුව',
      series: pre?.series || 'සුවිශේෂී එකතූන්',
      group: 'special',
      coverImage: sc.thumb,
      sourceUrl: `https://www.waharaka.com/cd/${encodeURIComponent(sc.id)}`,
      zipUrl:
        pre?.zip_url ||
        `https://storage.googleapis.com/www.waharaka.com/downloads/cds/${sc.id}.zip`,
      zipSizeMb:
        zipBytes > 0
          ? Math.round((zipBytes / (1024 * 1024)) * 10) / 10
          : Math.round(tracks.reduce((a, t) => a + t.sizeMb, 0) * 10) / 10,
      tracks,
      tracksLoaded: tracks.length > 0,
    };
  }),
  ...(rawSnapshot.numberedCds || []).map((nc: any): CDCollection => {
    const pre = preloadedMap[nc.id];
    const seqNum = nc.id.replace('CD', '');
    const sinhalaSub = pre?.note || `${seqNum} වන සංයුක්ත තැටිය`;
    const tracks: SermonItem[] = Array.isArray(pre?.items)
      ? pre.items.map((item: any, idx: number) =>
          mapRawTrackToSermonItem(item, `නිවන් වඩන සිරි සදහම් (${nc.id})`, idx)
        )
      : [];
    const zipBytes = Number(pre?.zip_size) || 0;
    return {
      id: nc.id,
      code: nc.id,
      title: `${nc.name} — ${sinhalaSub}`,
      sinhalaTitle: 'නිවන් වඩන සිරි සදහම් තැටි පෙළ',
      series: 'නිවන් වඩන සිරි සදහම්',
      group: 'numbered',
      coverImage: nc.thumb,
      sourceUrl: `https://www.waharaka.com/cd/${encodeURIComponent(nc.id)}`,
      zipUrl:
        pre?.zip_url ||
        `https://storage.googleapis.com/www.waharaka.com/downloads/cds/${nc.id}.zip`,
      zipSizeMb:
        zipBytes > 0
          ? Math.round((zipBytes / (1024 * 1024)) * 10) / 10
          : Math.round(tracks.reduce((a, t) => a + t.sizeMb, 0) * 10) / 10,
      tracks,
      tracksLoaded: tracks.length > 0,
    };
  }),
];

// Flatten preloaded authentic sermons for immediate browsing on Sermons tab
export const WAHARAKA_SERMONS: SermonItem[] = WAHARAKA_CDS.filter(
  (cd) => cd.tracksLoaded
).flatMap((cd) => cd.tracks);

// Map companion CDs to books where applicable so users can play authentic Waharaka audio while reading
const BOOK_COMPANION_CD: Record<string, string> = {
  'karmasthana-thulin-niwana-karaa': 'Karmasthana-Thulin-Niwana-Karaa',
  'anisi-bhawa-deka-niwanata-cd05': 'CD001',
  'anisi-bhawa-deka-niwanata-cd06': 'Thilakuna-Denagamu',
  'anisi-bhawa-deka-niwanata-cd07': 'Samma-Samadhi-Athwal-Bhawana',
  'mulaawa-nisa-sasarata-bandena-heti': 'CD002',
};

// All 23 Official Waharaka Books with complete Table of Contents and PDF endpoints
export const WAHARAKA_BOOKS: DhammaBook[] = (rawSnapshot.books || []).map(
  (b: any, index: number): DhammaBook => {
    const start = Math.floor(index / 10) * 10;
    const end = start + 9;
    const spriteUrl = `https://www.waharaka.com/data/books/thumbnails/${start}_${end}.jpg?v=19.57`;
    const spriteOffsetY = -(index % 10) * 85;
    const pageOffset = Number(b.pageOffset) || 0;

    const titles: string[] = Array.isArray(b.a) ? b.a : [];
    const pages: number[] = Array.isArray(b.b) ? b.b : [];

    const toc: TocEntry[] = titles.map((t, idx) => {
      const printedPageNo = Number(pages[idx]) || 1;
      const pdfPageNo = Math.max(1, printedPageNo + pageOffset);
      return {
        id: `${b.urlName}-toc-${idx}`,
        index: idx + 1,
        title: t,
        printedPageNo,
        pdfPageNo,
      };
    });

    return {
      id: b.urlName,
      urlName: b.urlName,
      title: b.name,
      sinhalaTitle: b.label1 || 'පූජ්‍යපාද වහරක අභයරතනාලංකාර හිමි',
      author: b.label1 || 'පූජ්‍යපාද වහරක අභයරතනාලංකාර හිමි',
      compiler: b.label2 || 'වහරක සදහම් ප්‍රකාශන',
      pageOffset,
      sizeMb: Math.max(1.2, Math.round((toc.length * 0.08 + 1.1) * 10) / 10),
      spriteIndex: index,
      spriteUrl,
      spriteOffsetY,
      sourceUrl: `https://www.waharaka.com/book/${encodeURIComponent(b.urlName)}`,
      pdfProxyUrl: `/api/waharaka/pdf/book/${encodeURIComponent(b.urlName)}`,
      directPdfUrl: `https://www.waharaka.com/data/books/editions/${encodeURIComponent(b.urlName)}.pdf`,
      companionCdId: BOOK_COMPANION_CD[b.urlName] || 'Thilakuna-Denagamu',
      toc,
    };
  }
);

// All 100 Official Hela Bodu Piyuma Magazine Issues (Vol 1 to Vol 100)
export const WAHARAKA_MAGAZINES: MagazineIssue[] = (rawSnapshot.magazines || [])
  .map((m: any, index: number): MagazineIssue => {
    const volNum = Number(m.v) || index + 1;
    const volStr = volNum < 10 ? `0${volNum}` : `${volNum}`;
    const year = Number(m.y) || 2012;
    const monthNum = Number(m.m) || 1;
    const monthName = SINHALA_MONTHS[monthNum] || `මස ${monthNum}`;

    const start = Math.floor(index / 10) * 10;
    const end = start + 9;
    const spriteUrl = `https://www.waharaka.com/data/hela_bodu_piyuma/thumbnails/${start}_${end}.jpg?v=19.57`;
    const spriteOffsetY = -(index % 10) * 85;

    const titles: string[] = Array.isArray(m.a) ? m.a : [];
    const pages: number[] = Array.isArray(m.b) ? m.b : [];
    const coverMap: Record<string, number> = m.c || {};

    const toc: TocEntry[] = titles.map((t, idx) => {
      const printedPageNo = Number(pages[idx]) || 0;
      const isCover = coverMap[String(printedPageNo)] === 1 || printedPageNo === 0;
      // In Hela Bodu Piyuma PDFs, cover is PDF page 1, and printed page N is PDF page N + 2
      const pdfPageNo = isCover ? 1 : Math.max(1, printedPageNo + 2);
      return {
        id: `hbp-${volNum}-toc-${idx}`,
        index: idx + 1,
        title: t,
        printedPageNo,
        pdfPageNo,
        isCoverPage: isCover,
      };
    });

    return {
      id: `hbp-${volNum}`,
      volumeNumber: volNum,
      issueNumber: `කලාපය ${volStr}`,
      title: `හෙළ බොදු පියුම — ${volStr} වෙනි කලාපය`,
      sinhalaTitle: `${year} ${monthName}`,
      publishedYear: year,
      publishedMonthName: monthName,
      publishedMonthLabel: `${year} ${monthName}`,
      sizeMb: 4.3,
      spriteUrl,
      spriteOffsetY,
      sourceUrl: `https://www.waharaka.com/magazine/${volNum}`,
      pdfProxyUrl: `/api/waharaka/pdf/magazine/${volNum}`,
      directPdfUrl: `https://storage.googleapis.com/www.waharaka.com/HelaBoduPiyuma/${volStr}.pdf`,
      toc,
    };
  })
  .reverse(); // Show newest issues (100 down to 1) first by default

export const INITIAL_PUSH_UPDATES: PushUpdateNotification[] = [
  {
    id: 'notif-01',
    title: 'බොදුනුවන්ගේ බෝධි වන්දනාව සහ නිවන් මග (2026)',
    body: 'Latest 2026 edition with 55 chapters is available for multi-page reading and offline caching.',
    category: 'book',
    publishedAt: 'New Release',
    targetId: 'bodunuvange-bodhi-vandanava-saha-nivan-maga-2026',
    read: false,
  },
  {
    id: 'notif-02',
    title: 'හෙළ බොදු පියුම — කලාප 01 සිට 100 දක්වා සම්පූර්ණ එකතුව',
    body: 'All 100 volumes of Hela Bodu Piyuma magazine with full PDF pages and table of contents are ready.',
    category: 'magazine',
    publishedAt: 'Archive Complete',
    targetId: 'hbp-100',
    read: false,
  },
  {
    id: 'notif-03',
    title: 'අරුණෝදය (දේශනා 94) සහ සංයුක්ත තැටි 129',
    body: 'Stream or download authentic MP3 discourses directly from the official Waharaka audio archive.',
    category: 'cd',
    publishedAt: 'Verified Audio',
    targetId: 'Arunodaya',
    read: true,
  },
];
