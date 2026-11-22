/* =========================================================
   /api/invitation  —  server-rendered Open Graph tags
   ---------------------------------------------------------
   vercel.json rewrites  /invitation.html?id=<slug>  ->  this function.
   The function:
     1. reads the invitation document from Firestore (REST, no SDK / no JS needed by crawlers)
     2. builds a unique title, description and image for that invitation
     3. injects the <meta property="og:*"> / twitter tags into the *initial HTML* of the viewer page
   so WhatsApp, Facebook, Telegram, LinkedIn, X ... can read them without running JavaScript.
   Real visitors get the exact same page (invitation-viewer.html) and it works as before.
   ========================================================= */
'use strict';
const fs = require('fs');
const path = require('path');

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'ad-soft-technologies';
const API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyC94YPBZNKKPIt22ociotCQbYnc2ZR6Lmw'; // public web key (same one inv-config.js ships to browsers)
const COLLECTION = process.env.INV_COLLECTION || 'premiumInvitations';
const SITE_NAME = 'AD Soft Technologies';
const VIEWER_FILE = 'invitation-viewer.html';
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/* ---------- tiny helpers ---------- */
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const oneLine = (s) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
const clip = (s, n) => { s = oneLine(s); if (s.length <= n) return s; const cut = s.slice(0, n - 1); return cut.replace(/\s+\S*$/, '') + '…'; };
const get = (o, p) => p.split('.').reduce((x, k) => (x == null ? undefined : x[k]), o);
const first = (o, paths) => { for (const p of paths) { const v = get(o, p); if (typeof v === 'string' && oneLine(v)) return oneLine(v); } return ''; };

function fmtDate(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(v || ''));
  if (!m) return oneLine(v);
  return `${parseInt(m[3], 10)} ${MONTHS[parseInt(m[2], 10) - 1] || ''} ${m[1]}`;
}
function fmtTime(v) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(v || ''));
  if (!m) return oneLine(v);
  let h = parseInt(m[1], 10); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
  return `${h}:${m[2]} ${ap}`;
}

/* ---------- Firestore REST -> plain JS ---------- */
function decode(v) {
  if (v == null) return null;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('timestampValue' in v) return v.timestampValue;
  if ('nullValue' in v) return null;
  if ('mapValue' in v) { const o = {}; for (const [k, x] of Object.entries(v.mapValue.fields || {})) o[k] = decode(x); return o; }
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(decode);
  return null;
}
async function fetchInvitation(id) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${COLLECTION}/${encodeURIComponent(id)}?key=${API_KEY}`;
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 4500);
  try {
    const r = await fetch(url, { signal: ctl.signal });
    if (r.status === 404) return null;
    if (!r.ok) throw new Error('Firestore HTTP ' + r.status);
    const j = await r.json();
    const out = {}; for (const [k, x] of Object.entries(j.fields || {})) out[k] = decode(x);
    return out;
  } finally { clearTimeout(t); }
}

/* ---------- image selection ---------- */
const IMAGE_KEYS = ['heroImage', 'coverImage', 'couplePhoto', 'couple.photo', 'photo', 'celebrantImage', 'storyImage', 'closingImage', 'venueImage', 'image'];
function firstImage(data) {
  for (const k of IMAGE_KEYS) { const v = get(data, k); if (typeof v === 'string' && v.trim()) return v.trim(); }
  for (const k of ['gallery', 'journeyPhotos', 'programPhotos']) {
    const a = data[k]; if (Array.isArray(a)) { const g = a.find((x) => x && typeof x.src === 'string' && x.src.trim()); if (g) return g.src.trim(); }
  }
  return '';
}
/* Turn any uploaded photo into a 1200x630 JPEG (what WhatsApp/Facebook want, < 300 KB). */
function ogImageFrom(src, origin, templateId) {
  const fallback = `${origin}/templates/${encodeURIComponent(templateId || 'royal-ivory')}/og.jpg`;
  if (!/^https:\/\//i.test(src || '')) return { url: fallback, own: false };          // relative/demo/data: images -> template thumbnail
  if (/res\.cloudinary\.com\/.+\/image\/upload\//.test(src)) {
    const url = src.replace(/\/image\/upload\/(?:[^/]*,[^/]*\/)?/, '/image/upload/c_fill,g_auto,w_1200,h_630,f_jpg,q_auto:good/').replace(/\.(png|webp|avif|gif|jpeg)(\?.*)?$/i, '.jpg');
    return { url, own: true };
  }
  if (/images\.unsplash\.com\//.test(src)) {
    const u = new URL(src); u.searchParams.set('w', '1200'); u.searchParams.set('h', '630'); u.searchParams.set('fit', 'crop'); u.searchParams.set('fm', 'jpg'); u.searchParams.set('q', '80');
    return { url: u.href, own: true };
  }
  if (/\.(jpe?g|png)(\?|$)/i.test(src)) return { url: src, own: true };
  return { url: fallback, own: false };
}

/* ---------- build the meta for one invitation ---------- */
function buildMeta(doc, id, origin) {
  const data = (doc && doc.data) || {};
  const templateId = (doc && doc.templateId) || '';
  const groom = first(data, ['groom', 'groomName']); const bride = first(data, ['bride', 'brideName']);
  const celebrant = first(data, ['celebrant', 'babyName', 'name']);
  const isWedding = !!(groom && bride) || /wedding|engage/i.test(templateId);
  const date = fmtDate(first(data, ['weddingDate', 'eventDate', 'date', 'ceremony.date']));
  const time = fmtTime(first(data, ['weddingTime', 'eventTime', 'time']));
  const venue = clip(first(data, ['venue', 'venueName', 'ceremony.venue', 'map.title', 'venueAddress']), 70);
  const message = first(data, ['invitationMessage', 'message', 'blessingMessage', 'tagline', 'dateMessage', 'programMessage']);
  let names; let title; let lead;
  if (groom && bride) {
    names = `${groom} & ${bride}`;
    title = `${names} | Wedding Invitation`;
    lead = `You are warmly invited to the wedding of ${names}`;
  } else if (celebrant) {
    const age = first(data, ['age']);
    names = celebrant;
    title = `${celebrant}'s Birthday Invitation`;
    lead = `Join us to celebrate ${celebrant}${age ? ` turning ${age}` : ''}`;
  } else {
    names = clip((doc && doc.title) || 'You are invited', 60);
    title = `${names} | Digital Invitation`;
    lead = `You are invited to ${names}`;
  }
  const when = [date, time && `at ${time}`].filter(Boolean).join(' ');
  const where = venue ? `, ${venue}` : '';
  let description = `${lead}${when ? ` on ${when}` : ''}${where}.`;
  if (message) description = clip(`${description} ${message}`, 200);
  const img = ogImageFrom(firstImage(data), origin, templateId);
  return {
    title: clip(title, 70), description, names, url: `${origin}/invitation.html?id=${encodeURIComponent(id)}`,
    image: img.url, imageAlt: `${names} – digital invitation`, ownImage: img.own,
  };
}
const genericMeta = (origin) => ({
  title: `Digital Invitation | ${SITE_NAME}`,
  description: 'View a personalized digital invitation – animated designs with RSVP, venue maps and music. Powered by AD Soft Technologies.',
  names: SITE_NAME, url: `${origin}/invitation.html`, image: `${origin}/templates/royal-ivory/og.jpg`, imageAlt: 'Digital invitation', ownImage: false,
});

/* ---------- HTML injection ---------- */
function metaBlock(m) {
  const t = (n, v) => `<meta name="${n}" content="${esc(v)}">`;
  const p = (n, v) => `<meta property="${n}" content="${esc(v)}">`;
  return [
    `<title>${esc(m.title)}</title>`, t('description', m.description), `<link rel="canonical" href="${esc(m.url)}">`,
    p('og:type', 'website'), p('og:site_name', SITE_NAME), p('og:locale', 'en_IN'), p('og:title', m.title), p('og:description', m.description), p('og:url', m.url),
    p('og:image', m.image), p('og:image:secure_url', m.image), p('og:image:type', 'image/jpeg'), p('og:image:width', '1200'), p('og:image:height', '630'), p('og:image:alt', m.imageAlt),
    t('twitter:card', 'summary_large_image'), t('twitter:title', m.title), t('twitter:description', m.description), t('twitter:image', m.image), t('twitter:image:alt', m.imageAlt),
  ].join('\n  ');
}
function inject(html, m) {
  html = html
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+name=["']description["'][^>]*>/i, '')
    .replace(/<link\s+rel=["']canonical["'][^>]*>/i, '');
  return html.replace(/<head([^>]*)>/i, (all) => `${all}\n  ${metaBlock(m)}`);
}
async function readViewer(origin) {
  for (const base of [process.cwd(), path.join(__dirname, '..'), __dirname]) {
    try { return fs.readFileSync(path.join(base, VIEWER_FILE), 'utf8'); } catch (e) { /* try next */ }
  }
  const r = await fetch(`${origin}/${VIEWER_FILE}`); // last resort: the static copy served by Vercel
  if (!r.ok) throw new Error('viewer page not found');
  return r.text();
}

/* ---------- handler ---------- */
module.exports = async function handler(req, res) {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'ad-soft-ai-solution.vercel.app';
  const origin = `https://${String(host).split(',')[0].trim()}`;
  let id = '';
  try { id = (req.query && req.query.id) || new URL(req.url, origin).searchParams.get('id') || ''; } catch (e) { /* ignore */ }
  id = Array.isArray(id) ? id[0] : id;
  const valid = /^[A-Za-z0-9_-]{1,64}$/.test(id);

  let meta = genericMeta(origin); let status = 200; let cache = 'public, max-age=0, s-maxage=60, stale-while-revalidate=300';
  if (valid) {
    try {
      const doc = await fetchInvitation(id);
      if (doc && doc.status !== 'unpublished') { meta = buildMeta(doc, id, origin); cache = 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600'; }
    } catch (e) { console.error('[og] firestore lookup failed:', e.message); cache = 'no-store'; }
  }
  try {
    const html = inject(await readViewer(origin), meta);
    res.statusCode = status;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', cache);
    res.setHeader('Vary', 'Accept-Encoding');
    res.end(html);
  } catch (e) {
    console.error('[og] render failed:', e);
    res.statusCode = 500; res.setHeader('Content-Type', 'text/plain'); res.end('Invitation page unavailable');
  }
};
module.exports._test = { buildMeta, inject, decode, ogImageFrom };
