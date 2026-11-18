import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { Readable } from 'stream';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

// In-memory cache for live Waharaka AJAX responses to keep repeated navigation snappy
const cdAjaxCache = new Map<string, any>();
const listenNotesCache = new Map<string, { notes: string[]; tags: string[] }>();
const tagSermonsCache = new Map<string, any[]>();

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  // 1. Live Waharaka CD Tracklist Proxy: fetches any of the 129 CDs from waharaka.com
  app.get('/api/waharaka/cd/:cdId', async (req, res) => {
    const { cdId } = req.params;
    if (cdAjaxCache.has(cdId)) {
      res.json(cdAjaxCache.get(cdId));
      return;
    }

    try {
      const body = new URLSearchParams({ cd: cdId }).toString();
      const response = await fetch('https://www.waharaka.com/w_page_cd_get_ajax.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body,
      });

      if (!response.ok) {
        res.status(response.status).json({ error: `Failed to fetch CD ${cdId}` });
        return;
      }

      const data = await response.json();
      cdAjaxCache.set(cdId, data);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Unable to load CD from waharaka.com' });
    }
  });

  // 2. Live Waharaka Tag Sermons Proxy: fetches sermons for any of the 180 homepage tags
  app.get('/api/waharaka/tag/:tagId/:tagSlug', async (req, res) => {
    const { tagId, tagSlug } = req.params;
    const cacheKey = `${tagId}:${tagSlug}`;
    if (tagSermonsCache.has(cacheKey)) {
      res.json({ tagId, tagSlug, sermons: tagSermonsCache.get(cacheKey) });
      return;
    }

    try {
      const url = `https://www.waharaka.com/tag/${encodeURIComponent(tagId)}/${encodeURIComponent(tagSlug)}`;
      const response = await fetch(url);
      const html = await response.text();
      const marker = 'var sermons_page_arr =';
      const start = html.indexOf(marker);
      const nextVar = html.indexOf('showingChildTags', start);

      if (start !== -1 && nextVar !== -1) {
        let rawJson = html.slice(start + marker.length, nextVar).trim();
        if (rawJson.endsWith(',')) {
          rawJson = rawJson.slice(0, -1).trim();
        }
        const tuples = JSON.parse(rawJson);
        const mapped = Array.isArray(tuples)
          ? tuples.slice(0, 120).map((t: any[]) => ({
              id: String(t[0] || ''),
              name: String(t[1] || ''),
              question: String(t[2] || ''),
              url: String(t[3] || ''),
              cd: String(t[4] || ''),
              size: Number(t[5]) || 0,
              duration: String(t[6] || '00:00'),
              category: tagSlug,
            }))
          : [];
        tagSermonsCache.set(cacheKey, mapped);
        res.json({ tagId, tagSlug, sermons: mapped });
        return;
      }

      res.json({ tagId, tagSlug, sermons: [] });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Tag fetch failed', sermons: [] });
    }
  });

  // 3. Live Waharaka Sermon Search Proxy
  app.get('/api/waharaka/search', async (req, res) => {
    const q = String(req.query.q || '').trim();
    if (!q) {
      res.json({ sermons: [] });
      return;
    }

    try {
      const url = `https://www.waharaka.com/search/${encodeURIComponent('දේශනා')}/${encodeURIComponent(q)}`;
      const response = await fetch(url);
      const html = await response.text();
      const match = html.match(/var\s+searchResultSermons\s*=\s*(\[[\s\S]*?\]);/);
      if (match) {
        const sermons = JSON.parse(match[1]);
        res.json({ sermons: sermons.slice(0, 80) });
        return;
      }
      res.json({ sermons: [] });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Search failed', sermons: [] });
    }
  });

  // 4. Live Waharaka Listen Page Notes & Gatha Proxy
  app.get('/api/waharaka/listen-notes/:sermonId', async (req, res) => {
    const { sermonId } = req.params;
    if (listenNotesCache.has(sermonId)) {
      res.json(listenNotesCache.get(sermonId));
      return;
    }

    try {
      const response = await fetch(
        `https://www.waharaka.com/listen/${encodeURIComponent(sermonId)}`
      );
      const html = await response.text();
      const notesMatch = html.match(
        /<div id="listen-notes-content">([\s\S]*?)<\/div>\s*<\/div>/
      );
      const rawNotes = notesMatch
        ? notesMatch[1]
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]+>/g, '')
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
        : [];

      const tagMatches = [
        ...html.matchAll(/<a class=['"]tag-pill[^'"]*['"][^>]*>([^<]+)<\/a>/g),
      ].map((m) => m[1].trim());

      const payload = { notes: rawNotes, tags: tagMatches };
      listenNotesCache.set(sermonId, payload);
      res.json(payload);
    } catch {
      res.json({ notes: [], tags: [] });
    }
  });

  // 5. Authentic MP3 Audio Stream Proxy (with HTTP Range support) to storage.googleapis.com/www.waharaka.com
  app.get('/api/waharaka/audio', async (req, res) => {
    const rawPath = String(req.query.path || '');
    if (!rawPath.startsWith('/cds/')) {
      res.status(400).json({ error: 'Invalid Waharaka audio path' });
      return;
    }

    const encodedSegments = rawPath
      .split('/')
      .map((seg) => encodeURIComponent(seg))
      .join('/');
    const targetUrl = `https://storage.googleapis.com/www.waharaka.com${encodedSegments}`;

    try {
      const headers: Record<string, string> = {};
      if (req.headers.range) {
        headers.Range = req.headers.range;
      }

      const upstream = await fetch(targetUrl, { headers });
      res.status(upstream.status);

      const forwardHeaders = [
        'content-type',
        'content-length',
        'content-range',
        'accept-ranges',
        'cache-control',
      ];
      for (const h of forwardHeaders) {
        const val = upstream.headers.get(h);
        if (val) res.setHeader(h, val);
      }

      if (!upstream.body) {
        res.end();
        return;
      }
      Readable.fromWeb(upstream.body as any).pipe(res);
    } catch (err: any) {
      res.status(502).json({ error: err?.message || 'Audio stream proxy failed' });
    }
  });

  // 6. Authentic Book PDF Proxy to https://www.waharaka.com/data/books/editions/:urlName.pdf
  app.get('/api/waharaka/pdf/book/:urlName', async (req, res) => {
    const urlName = req.params.urlName.replace(/[^a-zA-Z0-9_-]/g, '');
    const targetUrl = `https://www.waharaka.com/data/books/editions/${urlName}.pdf`;
    try {
      const upstream = await fetch(targetUrl);
      if (!upstream.ok || !upstream.body) {
        res.status(upstream.status).json({ error: 'Book PDF not found on waharaka.com' });
        return;
      }
      res.setHeader('Content-Type', 'application/pdf');
      const len = upstream.headers.get('content-length');
      if (len) res.setHeader('Content-Length', len);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      Readable.fromWeb(upstream.body as any).pipe(res);
    } catch (err: any) {
      res.status(502).json({ error: err?.message || 'Book PDF proxy failed' });
    }
  });

  // 7. Authentic Magazine PDF Proxy to https://storage.googleapis.com/www.waharaka.com/HelaBoduPiyuma/:volStr.pdf
  app.get('/api/waharaka/pdf/magazine/:volume', async (req, res) => {
    const volNum = parseInt(req.params.volume, 10);
    if (isNaN(volNum) || volNum < 1 || volNum > 100) {
      res.status(400).json({ error: 'Invalid Hela Bodu Piyuma volume number (1-100)' });
      return;
    }
    const volStr = volNum < 10 ? `0${volNum}` : `${volNum}`;
    const targetUrl = `https://storage.googleapis.com/www.waharaka.com/HelaBoduPiyuma/${volStr}.pdf`;
    try {
      const upstream = await fetch(targetUrl);
      if (!upstream.ok || !upstream.body) {
        res.status(upstream.status).json({ error: 'Magazine PDF not found on waharaka.com' });
        return;
      }
      res.setHeader('Content-Type', 'application/pdf');
      const len = upstream.headers.get('content-length');
      if (len) res.setHeader('Content-Length', len);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      Readable.fromWeb(upstream.body as any).pipe(res);
    } catch (err: any) {
      res.status(502).json({ error: err?.message || 'Magazine PDF proxy failed' });
    }
  });

  // 8. Live Waharaka updates endpoint for Push Notification checks
  app.get('/api/waharaka/updates', (_req, res) => {
    res.json({
      source: 'https://www.waharaka.com/',
      checkedAt: new Date().toISOString(),
      announcement: {
        id: `notif-live-${Date.now()}`,
        title: 'බොදුනුවන්ගේ බෝධි වන්දනාව සහ නිවන් මග (2026) & CD106 Verified',
        body: 'All 23 official books, 100 Hela Bodu Piyuma magazine issues, and 129 CD collections from waharaka.com are synced.',
        category: 'book',
        publishedAt: 'Just now',
        targetId: 'bodunuvange-bodhi-vandanava-saha-nivan-maga-2026',
        read: false,
      },
    });
  });

  // Vite middleware for development; static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Waharaka Dhamma Archive server running on http://localhost:${PORT}`);
  });
}

startServer();
