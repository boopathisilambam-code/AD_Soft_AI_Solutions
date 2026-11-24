/* =========================================================
   ROYAL IVORY — template definition
   • defaults : demo content shown in the popup (user edits these)
   • schema   : drives the auto-generated edit form
   To build another template, copy this folder, change id/defaults/schema
   and add the folder name to INV_CONFIG.templates in js/inv-config.js
   ========================================================= */
InvitationPlatform.register({
  id: 'royal-ivory',
  name: 'Royal Ivory — Envelope Wedding',
  tag: 'Wedding · Animated envelope',
  occasion: 'Wedding',

  required: ['groom', 'bride', 'weddingDate'],
  requiredLabels: { groom: "Groom's name", bride: "Bride's name", weddingDate: 'Wedding date' },
  title: (d) => `${d.groom} & ${d.bride}`,

  defaults: {
    groom: 'Aarav',
    bride: 'Ananya',
    weddingDate: '2026-12-12',
    weddingTime: '10:30',
    utcOffset: '+05:30',
    tagline: 'Two Hearts, One Beautiful Journey',
    familiesLine: 'Together with our families',
    invitationMessage: 'we invite you to celebrate the beginning of our forever.',

    heroImage: 'templates/royal-ivory/assets/hero.jpg',
    closingImage: 'templates/royal-ivory/assets/hero.jpg',
    gallery: [2, 1, 3, 1, 2, 3, 1, 2].map((n) => ({ src: `templates/royal-ivory/assets/gallery-${n}.avif`, alt: '' })),

    ceremony: { title: 'Wedding Ceremony', date: '', time: '10:30 AM', venue: 'Taj Coromandel', address: '37, Mahatma Gandhi Road, Nungambakkam, Chennai 600034', mapQuery: '' },
    reception: { title: 'Wedding Reception', date: '', time: '06:30 PM', venue: 'ITC Grand Chola', address: '63, Mount Road, Guindy, Chennai 600032', mapQuery: '' },
    map: { query: 'Taj Coromandel, 37 Mahatma Gandhi Road, Nungambakkam, Chennai', coordinates: '', url: '', title: 'Taj Coromandel', address: '37, Mahatma Gandhi Road, Nungambakkam, Chennai 600034' },

    timeline: [
      { time: '10:00 AM', title: 'Guest Arrival', desc: 'Welcome drinks and warm greetings as guests are seated.', icon: 'arrival' },
      { time: '10:30 AM', title: 'Wedding Ceremony', desc: 'The vows and the beginning of our forever.', icon: 'ceremony' },
      { time: '12:00 PM', title: 'Photography', desc: 'Family portraits and candid moments with loved ones.', icon: 'photo' },
      { time: '01:00 PM', title: 'Wedding Lunch', desc: 'A festive feast shared with everyone we adore.', icon: 'lunch' },
      { time: '06:30 PM', title: 'Reception', desc: 'An elegant evening of toasts and celebration.', icon: 'reception' },
      { time: '08:00 PM', title: 'Celebration', desc: 'Music, dancing and memories under the stars.', icon: 'celebration' },
    ],

    rsvp: { enabled: true, deadline: '30 November 2026', maxGuests: 6 },
    music: { url: '' },
    thanks: { title: 'Thank You For Being Part of Our Story', message: 'Your presence is the greatest gift. We cannot wait to celebrate with you.' },

    sections: { countdown: true, timeline: true, gallery: true, map: true },
    theme: { primary: '#76795a', accent: '#b08d57' },
    labels: {
      heroEyebrow: 'The Wedding Of', countdownTitle: 'Counting Down To Forever', detailsTitle: 'Wedding Details',
      timelineTitle: 'Order Of The Day', galleryTitle: 'Moments Together', mapSectionTitle: 'The Venue',
      rsvpTitle: 'RSVP', closingEyebrow: 'With Love & Gratitude',
    },
  },

  schema: [
    { title: '👰🤵 Couple & date', target: '#top', fields: [
      { path: 'groom', label: "Groom's name", type: 'text', max: 40 },
      { path: 'bride', label: "Bride's name", type: 'text', max: 40 },
      { path: 'weddingDate', label: 'Wedding date', type: 'date' },
      { path: 'weddingTime', label: 'Muhurtham / start time (for countdown)', type: 'time' },
      { path: 'utcOffset', label: 'Time zone', type: 'select', options: [
        ['+05:30', 'India (IST, +05:30)'], ['+04:00', 'UAE / Oman (+04:00)'], ['+03:00', 'Saudi / Qatar / Kuwait (+03:00)'],
        ['+00:00', 'UK (GMT)'], ['+01:00', 'Central Europe (+01:00)'], ['-05:00', 'US East (-05:00)'], ['-06:00', 'US Central (-06:00)'],
        ['-08:00', 'US West (-08:00)'], ['+08:00', 'Singapore / Malaysia (+08:00)'], ['+10:00', 'Australia East (+10:00)'],
      ] },
      { path: 'tagline', label: 'Tagline (on the cover)', type: 'text', max: 80 },
    ] },
    { title: '💌 Invitation message', target: '#message', fields: [
      { path: 'familiesLine', label: 'Opening line', type: 'text', max: 80 },
      { path: 'invitationMessage', label: 'Message', type: 'textarea', rows: 3, max: 200 },
    ] },
    { title: '📸 Photos', target: '#gallery-section', help: 'Photos are uploaded to Cloudinary and optimised automatically.', fields: [
      { path: 'heroImage', label: 'Cover photo', type: 'image' },
      { path: 'gallery', label: 'Gallery', type: 'gallery', max: 12 },
      { path: 'closingImage', label: 'Closing photo', type: 'image' },
    ] },
    { title: '💒 Ceremony', target: '#details', fields: [
      { path: 'ceremony.title', label: 'Heading', type: 'text', max: 40 },
      { path: 'ceremony.date', label: 'Date (leave empty = wedding date)', type: 'date' },
      { path: 'ceremony.time', label: 'Time', type: 'text', max: 30, placeholder: '10:30 AM' },
      { path: 'ceremony.venue', label: 'Venue name', type: 'text', max: 80 },
      { path: 'ceremony.address', label: 'Full address', type: 'textarea', rows: 2, max: 200 },
      { path: 'ceremony.mapQuery', label: 'Maps link target (optional)', type: 'text', max: 200, hint: 'Exact place name or "lat,lng" for the Directions button.' },
    ] },
    { title: '🥂 Reception', target: '#details', fields: [
      { path: 'reception.title', label: 'Heading', type: 'text', max: 40 },
      { path: 'reception.date', label: 'Date (leave empty = wedding date)', type: 'date' },
      { path: 'reception.time', label: 'Time', type: 'text', max: 30, placeholder: '06:30 PM' },
      { path: 'reception.venue', label: 'Venue name', type: 'text', max: 80 },
      { path: 'reception.address', label: 'Full address', type: 'textarea', rows: 2, max: 200 },
      { path: 'reception.mapQuery', label: 'Maps link target (optional)', type: 'text', max: 200 },
    ] },
    { title: '🕰️ Day timeline', target: '#timeline-section', fields: [
      { path: 'sections.timeline', label: 'Show this section', type: 'toggle' },
      { path: 'timeline', label: 'Events', type: 'list', itemName: 'event', itemTitle: 'title', max: 14,
        itemDefaults: { time: '', title: 'New event', desc: '', icon: 'celebration' },
        fields: [
          { key: 'time', label: 'Time', type: 'text' },
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'desc', label: 'Description', type: 'textarea' },
          { key: 'icon', label: 'Icon', type: 'select', options: [['arrival', 'Arrival'], ['ceremony', 'Rings'], ['photo', 'Camera'], ['lunch', 'Food'], ['reception', 'Toast'], ['celebration', 'Sparkle']] },
        ] },
    ] },
    { title: '📍 Map location', target: '#location', fields: [
      { path: 'sections.map', label: 'Show this section', type: 'toggle' },
      { path: 'map.title', label: 'Venue name', type: 'text', max: 80 },
      { path: 'map.address', label: 'Address', type: 'textarea', rows: 2, max: 200 },
      { path: 'map.query', label: 'Search on map', type: 'text', max: 200, hint: 'Venue name + city works best.' },
      { path: 'map.coordinates', label: 'Or coordinates (optional)', type: 'text', placeholder: '13.0604,80.2496' },
      { path: 'map.url', label: '"Open in Google Maps" link (optional)', type: 'url' },
    ] },
    { title: '✉️ RSVP', target: '#rsvp', fields: [
      { path: 'rsvp.enabled', label: 'Collect RSVPs', type: 'toggle' },
      { path: 'rsvp.deadline', label: 'Reply by', type: 'text', max: 40, placeholder: '30 November 2026' },
      { path: 'rsvp.maxGuests', label: 'Max guests per reply', type: 'number', min: 1, maxValue: 20 },
    ] },
    { title: '🎵 Music', fields: [
      { path: 'music.url', label: 'Background music', type: 'audio', hint: 'Use music you have the rights to. Max ~12 MB.' },
    ] },
    { title: '🙏 Closing', target: '#closing', fields: [
      { path: 'thanks.title', label: 'Heading', type: 'text', max: 80 },
      { path: 'thanks.message', label: 'Closing message', type: 'textarea', rows: 3, max: 200 },
    ] },
    { title: '🎨 Style & section titles', fields: [
      { path: 'theme.primary', label: 'Main colour', type: 'color' },
      { path: 'theme.accent', label: 'Accent (gold) colour', type: 'color' },
      { path: 'sections.countdown', label: 'Show countdown', type: 'toggle' },
      { path: 'sections.gallery', label: 'Show gallery', type: 'toggle' },
      { path: 'labels.heroEyebrow', label: 'Cover small title', type: 'text', max: 40 },
      { path: 'labels.countdownTitle', label: 'Countdown title', type: 'text', max: 60 },
      { path: 'labels.detailsTitle', label: 'Details title', type: 'text', max: 60 },
      { path: 'labels.timelineTitle', label: 'Timeline title', type: 'text', max: 60 },
      { path: 'labels.galleryTitle', label: 'Gallery title', type: 'text', max: 60 },
      { path: 'labels.mapSectionTitle', label: 'Map title', type: 'text', max: 60 },
      { path: 'labels.rsvpTitle', label: 'RSVP title', type: 'text', max: 60 },
      { path: 'labels.closingEyebrow', label: 'Closing small title', type: 'text', max: 40 },
    ] },
  ],
});
