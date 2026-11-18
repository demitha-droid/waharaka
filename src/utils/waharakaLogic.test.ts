import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatDuration,
  parseDurationToSeconds,
  buildAudioUrls,
  filterSermons,
  toggleOfflineSermonRecord,
  batchSaveCDToOffline,
  toggleOfflineReadingRecord,
  calculateOfflineStorageStats,
  getReadingProgressPercent,
  paginateItems,
  type SermonItem,
  type CDCollection,
} from './waharakaLogic';

const sampleUrls = buildAudioUrls('/cds/Thilakuna-Denagamu/01-Anichcha_Vigrahaya-1.mp3');

const sampleSermon: SermonItem = {
  id: 'Thilakuna-Denagamu-01',
  title: 'තථාගත දේශනාවට අනුවම අනිච්ච විග්‍රහය (1-3)',
  sinhalaTitle: 'තථාගත දේශනාවට අනුවම අනිච්ච විග්‍රහය (1-3)',
  question: 'මුලික දේශනා: තථාගත දේශනාවට අනුවම අනිච්ච තෝරා ගනිමු',
  category: 'තිලකුණ දැනගමු',
  durationFormatted: '33:01',
  durationSeconds: parseDurationToSeconds('33:01'),
  sizeMb: 30.4,
  sourceUrl: 'https://www.waharaka.com/listen/Thilakuna-Denagamu-01',
  audioPath: '/cds/Thilakuna-Denagamu/01-Anichcha_Vigrahaya-1.mp3',
  audioStreamUrl: sampleUrls.audioStreamUrl,
  directGcsAudioUrl: sampleUrls.directGcsAudioUrl,
  cdId: 'Thilakuna-Denagamu',
  trackNumber: 1,
};

const sampleSermon2: SermonItem = {
  ...sampleSermon,
  id: 'CD002-01',
  title: 'මුලාව නිසා සසර හැදෙන හැටි ඉතා සරළව - 1',
  sinhalaTitle: 'මුලාව නිසා සසර හැදෙන හැටි ඉතා සරළව - 1',
  question: 'රාග, ද්වේෂ, මෝහ නිවන වසන අයුරු විස්තර කරන්න.',
  category: 'නිවන් වඩන සිරි සදහම්',
  cdId: 'CD002',
  durationFormatted: '46:53',
  durationSeconds: parseDurationToSeconds('46:53'),
  sizeMb: 26.8,
};

test('formatDuration and parseDurationToSeconds convert accurately', () => {
  assert.equal(parseDurationToSeconds('33:01'), 1981);
  assert.equal(parseDurationToSeconds('1:02:05'), 3725);
  assert.equal(formatDuration(3725), '1:02:05');
});

test('buildAudioUrls builds valid proxy and direct GCS URLs', () => {
  const urls = buildAudioUrls('/cds/CD001/A1-edit.mp3');
  assert.ok(urls.audioStreamUrl.includes('/api/waharaka/audio?path='));
  assert.equal(
    urls.directGcsAudioUrl,
    'https://storage.googleapis.com/www.waharaka.com/cds/CD001/A1-edit.mp3'
  );
});

test('toggleOfflineSermonRecord adds and removes offline packets deterministically', () => {
  const initial: Record<string, any> = {};
  const added = toggleOfflineSermonRecord(initial, sampleSermon, '2026-11-17T00:00:00Z');
  assert.equal(added.action, 'saved');
  assert.ok(added.nextMap['Thilakuna-Denagamu-01']);
  assert.equal(added.nextMap['Thilakuna-Denagamu-01'].sizeMb, 30.4);

  const removed = toggleOfflineSermonRecord(added.nextMap, sampleSermon);
  assert.equal(removed.action, 'removed');
  assert.equal(removed.nextMap['Thilakuna-Denagamu-01'], undefined);
});

test('filterSermons filters by Sinhala query, category, and offline state', () => {
  const { nextMap } = toggleOfflineSermonRecord({}, sampleSermon);
  const all = [sampleSermon, sampleSermon2];

  const byQuery = filterSermons(all, {
    searchQuery: 'අනිච්ච විග්‍රහය',
    category: 'All',
    onlyOffline: false,
    offlineMap: nextMap,
  });
  assert.equal(byQuery.length, 1);
  assert.equal(byQuery[0].id, 'Thilakuna-Denagamu-01');

  const byOffline = filterSermons(all, {
    searchQuery: '',
    category: 'All',
    onlyOffline: true,
    offlineMap: nextMap,
  });
  assert.equal(byOffline.length, 1);
  assert.equal(byOffline[0].id, 'Thilakuna-Denagamu-01');
});

test('batchSaveCDToOffline saves all tracks of a CD collection and calculates storage', () => {
  const cd: CDCollection = {
    id: 'Thilakuna-Denagamu',
    code: 'Thilakuna-Denagamu',
    title: 'තිලකුණ දැනගමු',
    sinhalaTitle: 'තිලකුණ දැනගමු',
    series: 'සුවිශේෂී එකතූන්',
    group: 'special',
    coverImage: 'https://www.waharaka.com/img/cd-thumb-thilakuna-denagamu.png?v=1.0',
    sourceUrl: 'https://www.waharaka.com/cd/Thilakuna-Denagamu',
    zipUrl: 'https://storage.googleapis.com/www.waharaka.com/downloads/cds/Thilakuna-Denagamu.zip',
    zipSizeMb: 210,
    tracks: [sampleSermon, sampleSermon2],
    tracksLoaded: true,
  };

  const sermonMap = batchSaveCDToOffline({}, cd);
  const readingToggle = toggleOfflineReadingRecord({}, {
    id: 'sengavunu-bodu-maga-kalaeli-dakee',
    itemType: 'book',
    title: 'සැඟවුණු බොදු මග කලඑළි දකී',
    sizeMb: 1.3,
    pdfProxyUrl: '/api/waharaka/pdf/book/sengavunu-bodu-maga-kalaeli-dakee',
    directPdfUrl: 'https://www.waharaka.com/data/books/editions/sengavunu-bodu-maga-kalaeli-dakee.pdf',
  });

  const stats = calculateOfflineStorageStats(sermonMap, readingToggle.nextMap);
  assert.equal(stats.sermonCount, 2);
  assert.equal(stats.readingCount, 1);
  assert.equal(stats.totalSizeMb, 58.5);
});

test('getReadingProgressPercent returns accurate page percentage', () => {
  assert.equal(getReadingProgressPercent(100, 400), 25);
  assert.equal(getReadingProgressPercent(400, 400), 100);
});

test('paginateItems slices 15 posts per page and generates numbered pages 1, 2, 3...', () => {
  const dummyPosts = Array.from({ length: 40 }, (_, i) => `Post-${i + 1}`);
  const page1 = paginateItems(dummyPosts, 1, 15);
  assert.equal(page1.items.length, 15);
  assert.equal(page1.items[0], 'Post-1');
  assert.equal(page1.items[14], 'Post-15');
  assert.equal(page1.totalPages, 3);
  assert.deepEqual(page1.pageNumbers, [1, 2, 3]);

  const page2 = paginateItems(dummyPosts, 2, 15);
  assert.equal(page2.items.length, 15);
  assert.equal(page2.items[0], 'Post-16');
  assert.equal(page2.items[14], 'Post-30');
  assert.equal(page2.startIndex, 15);

  const page3 = paginateItems(dummyPosts, 3, 15);
  assert.equal(page3.items.length, 10);
  assert.equal(page3.items[0], 'Post-31');
  assert.equal(page3.items[9], 'Post-40');
});
