WEDDING INVITATION WEBSITE
==========================

Open index.html in any browser to view it. To put it online, upload this whole
folder to any static host (Netlify, Vercel, GitHub Pages, cPanel, etc).

Folder
  index.html     the whole website (HTML + CSS + JavaScript in one file)
  images/        hero video, poster and photos

WHAT TO EDIT
1. Names, date, venue, WhatsApp number, photos:
   Open index.html, search for "CONFIG: edit these" (inside the <script> at the
   bottom). Change groom, bride, wedding (date and time), venue, whatsapp
   (country code + number, no + sign).
   The names also appear in the page text. Use search and replace for
   "Karthik" and "Ananya".

2. Event dates and times:
   Search for class="ev" in index.html. Each event has a data-start and
   data-end on its "Add to calendar" button. Also update the visible text.

3. Photos (any size works, they are cropped to fit with object-fit: cover):
   Put your photo files in the images/ folder, then in CONFIG > images write
   the file names, for example:
     images:{cover:'images/couple.jpg', groom:'images/groom.jpg',
             bride:'images/bride.jpg', g1:'images/g1.jpg', ... b4:'images/b4.jpg'}
   cover  = photo on the envelope card
   groom / bride = the two player cards
   g1-g4 = groom timeline photos, b1-b4 = bride timeline photos
   Preview without editing code: open index.html#edit and use the
   "Add photo" buttons (not saved, for preview only).

4. Social icons and credit:
   Search for id="ig" and id="fb" in index.html and replace the href values with
   your real Instagram and Facebook page links.

5. Colors:
   Search for ":root{" near the top. All colors are variables, taken from the
   banner video.
