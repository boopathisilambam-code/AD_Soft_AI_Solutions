# AD Soft – invitation fixes

## 1. WhatsApp / Facebook link preview (Open Graph) — Hostinger (PHP)
- `.htaccess` sends `invitation.html?id=...` to `invitation.php`. It reads the invitation from Firestore on the server and puts
  `og:title` (couple names), `og:description` (date, time, venue + message), `og:image` (uploaded photo cropped to 1200x630 JPG, else `templates/<id>/og.jpg`), `og:url`, `twitter:*`
  into the first HTML response. No JavaScript needed by crawlers. No Vercel / Node needed.
- The original page is now `invitation-viewer.html` (keep this name; a static `invitation.html` would bypass the rewrite).

### Upload to Hostinger
1. hPanel > File Manager > `public_html`: upload everything (keep `invitation.php`, `.htaccess`, `invitation-viewer.html`, `templates/`, `js/`, `css/`).
   If you already have a `.htaccess`, copy only the lines between `# BEGIN invitation-og` and `# END invitation-og` into it (below `RewriteEngine On`).
2. Open `https://www.adsofttechnologies.com/invitation.html?id=<slug>` -> View Source: `og:` tags must be there.
3. https://developers.facebook.com/tools/debug/ -> paste link -> **Scrape Again**.
4. Firestore rules must allow public `get` on `premiumInvitations/{id}` (the viewer already needs this).
5. If hPanel > Websites > Advanced has Cloudflare/"Force HTTPS", keep it on; the script always outputs https URLs.

## 2. Birthday templates
- `chocolate-birthday-invitation` is now fully editable (11 steps: names, dates, opening card, schedule with photos, venue/phone/map, dress code, journey photos, greeting card, gallery, game, RSVP).
- Editor: list items can have photos; template-relative images (e.g. aadhi `boat.jpg`) now show in the editor; long text can't break the layout.

## 3. Create-invitation page speed
- Gallery shows a light thumbnail first; only 2 live previews run at a time, only for visible cards, one load at a time.
- Previews stop when the editor is open or the tab is hidden; no more 8 MB video preload in cards.

## 4. Update 2
- Gallery cards: no half-loaded "draft" any more – a loading slider shows until the preview (fonts included) is ready.
- Chocolate: real intro video plays in the editor preview; thumbnails use the final video frame (no 8 MB download).
- Blush by the Sea + European Garden weddings: groom/bride/venue/story photos, events, schedule, journey, gallery, parents, address are editable.
- Every template: background-music upload field + AD Soft footer with Instagram & Facebook (shared `templates/_shared/extras.js`).

## 5. Previews load once
- Each live preview is loaded one time, one after another, and then stays. No rotating / re-loading when scrolling, and nothing is cancelled once it has started loading.

## 6. Update 3 – instant invitations, correct share titles, modern gallery
- **No loading anywhere.** Gallery cards and the hero use ready-made portrait images (`templates/<id>/card.jpg`) – no iframes, no
  "Loading preview…" slider. Firebase SDK is no longer loaded in `<head>`; it loads quietly after the page is idle (editor / publish).
- **Viewer opens instantly.** `invitation.php` puts the invitation data (and the template URL) inside the first HTML response; the
  template iframe starts downloading immediately and the spinner is gone. A background check picks up edits made within the last 2 minutes.
  If the page is opened without PHP, it falls back to the old Firestore read.
- **Share title by occasion.** Wedding -> `Groom & Bride | Wedding Invitation`, Birthday -> `Name's Birthday Invitation`,
  Engagement / Baby shower / Housewarming likewise. The occasion is read from `templates/<id>/register.js`. The static fallback title is now
  neutral ("Digital Invitation | AD Soft Technologies"). `invitation-viewer.html` is also routed through PHP.
  After uploading, re-scrape old links in https://developers.facebook.com/tools/debug/ (WhatsApp/Facebook cache titles for days).
- **New hero banner + invitation cards** (create-invitation.html, css/inv-platform.css). Editor / preview / editable sections are untouched.
- New template thumbnail? Add `templates/<id>/card.jpg` (390x540 screenshot, portrait). Without it the card shows no image.

## 7. Update 4
- "Your invitations" strip now has a clear gap above/below; invitation cards are equal height.
- "Why go digital": the 4 stat tiles are now an equal-size 2x2 grid ("Unlimited" no longer wraps).
- New section "When to Send & How to Word Your Invitation" (id `digital-etiquette`) below "Why go digital"
  (sources: Minted, The Knot, Joy, Sayi.do – linked at the bottom of the section).
- `?v=20261123` added to inv-platform.css/js links so browsers pick up the new files (bump it on every release).

### How to add a new invitation design
1. Copy a folder in `templates/` (e.g. `aadhi-birthday`) -> `templates/<new-id>/` and edit its `index.html` + assets.
2. Edit `templates/<new-id>/register.js`: `id`, `name`, `occasion` ('Wedding' / 'Birthday' / ...), `categories`, `tag`, `defaults`, editor fields.
   (`occasion` decides the share title: Wedding / Birthday / Engagement / Baby shower / Housewarming.)
3. Add a 390x540 portrait screenshot `templates/<new-id>/card.jpg` (gallery card) and `og.jpg` (1200x630, WhatsApp preview).
4. Add `'<new-id>'` to the `templates: [...]` list in `js/inv-config.js`.
5. New filter chip (e.g. "Housewarming")? Put the same word in `categories` of the template – chips are built automatically.

## 8. Update 5 – desktop fit + editor preview auto-open
- `css/desktop-fit.css` (new, loaded after site-standard.css): content width 1380 / 1500 / 1640px on 1600 / 1800 / 2200px+ screens; header + footer edges line up with the content; no effect below 1600px.
- Editor: pressing Next / Back / a step icon now opens the card in the live preview by itself (like a guest tapping the seal) and scrolls to that section.
  `inv:open` message added to `templates/royal-ivory/template.js` and `templates/olivas/js/template.js`; `js/inv-platform.js` (`goToTarget`) also taps the visible opener (#open, #seal, #openBtn, #skip, [data-open]) for templates that do not know `inv:open`.
  The first screen of the editor still shows the closed envelope; the toolbar "skip intro" toggle works as before.

## 8. Update 5 – editor preview auto-opens the card
- Editor "Next" now opens the invitation by itself (envelope / gift card / seal) and only scrolls to the section once the card is really open – no guest tap needed.
- `inv:open` message now handled by chocolate-birthday, aadhi-birthday, wedding-European, wedding-invitation and violet-butterfly (olivas / royal-ivory already had it).
- Platform waits (up to ~15 s) while the template is still locked, then scrolls; old templates without `inv:open` get their opener tapped once.
- New templates: handle `inv:open` in the template, or the platform falls back to tapping `#open / #seal / #openBtn / #skip / [data-open]`.
- Aadhi birthday: added `inv:scrollTo` handler + section ids (#sec-hero/program/venue/journey/gallery); editor steps now scroll to their own section.

## 9. Update 6 – invitation link only by e-mail
- Publish sheet no longer shows the link (or a link-name box). After publish: **Copy invitation link** -> popup "enter your Gmail" ->
  e-mail saved to Firestore `invitationLeads` -> `send-invitation.php` e-mails the link. Setup steps: `EMAIL-LINK-SETUP.md`.
- WhatsApp / Open invitation buttons removed from the done screen (they exposed the link); "Edit again" button instead of the edit link.
