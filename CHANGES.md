# AD Soft – invitation fixes

## 1. WhatsApp / Facebook link preview (Open Graph)
- `invitation.html` is now served by `api/invitation.js` (rewrite in `vercel.json`).
  It reads the invitation from Firestore on the server and injects, into the first HTML response:
  `og:title` (couple names), `og:description` (date, time, venue + their message), `og:image` (their uploaded photo, cropped to 1200x630 JPG; otherwise the template thumbnail `templates/<id>/og.jpg`), `og:url`, `twitter:*`.
- The original page moved to `invitation-viewer.html` (do not rename it back – a static `invitation.html` would bypass the function).
- Share links stay the same: `https://<your-domain>/invitation.html?id=<slug>`.

### After deploying
1. Open `https://<domain>/invitation.html?id=arun-pavithra-4cd2` -> View Source: the `og:` tags must be there.
2. https://developers.facebook.com/tools/debug/ -> paste the link -> **Scrape Again** (also clears WhatsApp's old cache).
3. Firestore rules must allow public `get` on `premiumInvitations/{id}` (the viewer already needs this).

## 2. Birthday templates
- `chocolate-birthday-invitation` is now fully editable (11 steps: names, dates, opening card, schedule with photos, venue/phone/map, dress code, journey photos, greeting card, gallery, game, RSVP).
- Editor: list items can have photos; template-relative images (e.g. aadhi `boat.jpg`) now show in the editor; long text can't break the layout.

## 3. Create-invitation page speed
- Gallery shows a light thumbnail first; only 2 live previews run at a time, only for visible cards, one load at a time.
- Previews stop when the editor is open or the tab is hidden; no more 8 MB video preload in cards.
