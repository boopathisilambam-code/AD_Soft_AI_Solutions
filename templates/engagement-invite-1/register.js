/* Sage Butterfly — editable engagement template (engagement-invite-1) */
(function () {
  var def = {
    id: 'engagement-invite-1',
    name: 'Sage Butterfly — Green & Gold',
    occasion: 'Engagement',
    categories: ['Engagement'],
    tag: 'Engagement · Animated envelope',
    card: 'templates/engagement-invite-1/card.jpg',
    required: ['bride', 'groom', 'date'],
    requiredLabels: { bride: 'Bride name', groom: 'Groom name', date: 'Engagement date' },
    title: function (d) { return (d.bride || '') + ' & ' + (d.groom || '') + ' · Engagement'; },
    defaults: {
      bride: 'Ayesha', groom: 'Imran', coverHint: 'Tap the seal to open',
      blessing: 'With the blessings of Allah, we invite you to the engagement of',
      date: '2027-03-13', time: '18:00',
      dateTitle: 'Save the date', dateSub: 'Scratch the gold to reveal', countdownText: 'days to go, in shaa Allah', countdownDone: 'Alhamdulillah, the day is here',
      eventsTitle: 'The celebration', eventsSub: 'Two evenings to share our joy',
      events: [
        { title: 'Engagement ceremony', date: '2027-03-13', time: '18:00', desc: 'Dua, exchange of rings and family blessings.', image: './assets/floral.jpg' },
        { title: 'Dinner reception', date: '2027-03-13', time: '20:00', desc: 'Join us for a warm dinner with loved ones.', image: './assets/floral.jpg' }
      ],
      pairTitle: 'The bride & groom', pairSub: 'Two families, one beautiful beginning',
      brideFamily: 'Daughter of Mr. & Mrs. Farooq', groomFamily: 'Son of Mr. & Mrs. Rahman', bridePhoto: '', groomPhoto: '',
      letterOn: true, letterTitle: 'A little love letter', letterSub: 'A note from our hearts',
      letterText: 'Dear family & friends, with Allah\'s mercy and your duas, two hearts have found their home in each other. Be part of our happiness and bless us as we begin this beautiful journey.',
      closing: 'With love',
      lovesOn: true, lovesTitle: 'Little things we love', lovesSub: 'Tap a card to flip',
      brideLoves: 'His calm, gentle voice\nChai at midnight\nBismillah before everything',
      groomLoves: 'Her laughter\nKindness to everyone\nHer duas for us',
      journeyTitle: 'Our journey', journeySub: 'Tap a memory to open it',
      memories: [
        { title: 'First hello', desc: 'Where our story quietly began.', image: './assets/flower.webp' },
        { title: 'Chai & conversations', desc: 'Hours that felt like minutes.', image: './assets/butterfly.webp' },
        { title: 'Families meet', desc: 'Two homes, one warm table.', image: './assets/floral.jpg' },
        { title: 'The yes', desc: 'A moment we will never forget.', image: './assets/flower.webp' },
        { title: 'Duas & blessings', desc: 'Every prayer answered with love.', image: './assets/floral.jpg' },
        { title: 'Forever begins', desc: 'Bismillah, here we go.', image: './assets/butterfly.webp' }
      ],
      giftOn: true, giftTitle: 'A gift of blessings', giftText: 'Your duas are the greatest gift. If you wish to bless us further:', upi: 'ayesha.imran@upi',
      rsvpOn: true, rsvpTitle: 'RSVP', rsvpSub: 'Let us know you are coming', whatsapp: '',
      venueTitle: 'Venue', venueName: 'Al Noor Banquet Hall', venueAddress: 'Anna Salai, Chennai, Tamil Nadu', mapQuery: '', mapLink: '',
      music: ''
    },
    schema: [
      { title: 'Couple & Envelope', target: '#hero', fields: [
        { type: 'text', path: 'bride', label: 'Bride name', max: 30 },
        { type: 'text', path: 'groom', label: 'Groom name', max: 30 },
        { type: 'textarea', path: 'blessing', label: 'Opening line', max: 140 },
        { type: 'text', path: 'coverHint', label: 'Envelope hint', max: 50 }
      ] },
      { title: 'Date & Countdown', target: '#date', fields: [
        { type: 'date', path: 'date', label: 'Engagement date' },
        { type: 'time', path: 'time', label: 'Engagement time' },
        { type: 'text', path: 'dateTitle', label: 'Heading', max: 40 },
        { type: 'text', path: 'dateSub', label: 'Scratch-card hint', max: 60 },
        { type: 'text', path: 'countdownText', label: 'Text after the day count', max: 50 },
        { type: 'text', path: 'countdownDone', label: 'Text on the day', max: 60 }
      ] },
      { title: 'Celebrations / Events', target: '#events', fields: [
        { type: 'text', path: 'eventsTitle', label: 'Heading', max: 40 },
        { type: 'text', path: 'eventsSub', label: 'Sub heading', max: 80 },
        { type: 'list', path: 'events', label: 'Events', itemTitle: 'title', itemName: 'event', max: 8,
          itemDefaults: { title: 'New event', date: '', time: '', desc: '', image: '' },
          fields: [
            { key: 'title', label: 'Event name' }, { key: 'date', label: 'Date', type: 'date' }, { key: 'time', label: 'Time', type: 'time' },
            { key: 'desc', label: 'Short description', type: 'textarea' }, { key: 'image', label: 'Event photo', type: 'image' }
          ] }
      ] },
      { title: 'Bride & Groom', target: '#pair', fields: [
        { type: 'text', path: 'pairTitle', label: 'Heading', max: 40 },
        { type: 'text', path: 'pairSub', label: 'Sub heading', max: 80 },
        { type: 'text', path: 'brideFamily', label: 'Bride’s family line', max: 70 },
        { type: 'text', path: 'groomFamily', label: 'Groom’s family line', max: 70 },
        { type: 'image', path: 'bridePhoto', label: 'Bride photo (optional)', hint: 'Leave empty to keep the butterfly monogram.' },
        { type: 'image', path: 'groomPhoto', label: 'Groom photo (optional)' }
      ] },
      { title: 'Love Letter message', target: '#letter', fields: [
        { type: 'toggle', path: 'letterOn', label: 'Show love letter' },
        { type: 'text', path: 'letterTitle', label: 'Heading', max: 40 },
        { type: 'text', path: 'letterSub', label: 'Sub heading', max: 60 },
        { type: 'textarea', path: 'letterText', label: 'Message', rows: 5, max: 400 },
        { type: 'text', path: 'closing', label: 'Sign-off', max: 30 }
      ] },
      { title: 'Little things we love', target: '#loves', fields: [
        { type: 'toggle', path: 'lovesOn', label: 'Show flip cards' },
        { type: 'text', path: 'lovesTitle', label: 'Heading', max: 40 },
        { type: 'text', path: 'lovesSub', label: 'Sub heading', max: 60 },
        { type: 'textarea', path: 'brideLoves', label: 'What the bride loves about the groom', rows: 4, hint: 'One item per line.' },
        { type: 'textarea', path: 'groomLoves', label: 'What the groom loves about the bride', rows: 4, hint: 'One item per line.' }
      ] },
      { title: 'Our Journey photos', target: '#journey', fields: [
        { type: 'text', path: 'journeyTitle', label: 'Heading', max: 40 },
        { type: 'text', path: 'journeySub', label: 'Sub heading', max: 60 },
        { type: 'list', path: 'memories', label: 'Memories', itemTitle: 'title', itemName: 'memory', max: 12,
          itemDefaults: { title: 'New memory', desc: '', image: '' },
          fields: [{ key: 'title', label: 'Title' }, { key: 'desc', label: 'Description', type: 'textarea' }, { key: 'image', label: 'Photo', type: 'image' }] }
      ] },
      { title: 'Gift & Blessings', target: '#gift', fields: [
        { type: 'toggle', path: 'giftOn', label: 'Show gift section' },
        { type: 'text', path: 'giftTitle', label: 'Heading', max: 40 },
        { type: 'textarea', path: 'giftText', label: 'Message', max: 160 },
        { type: 'text', path: 'upi', label: 'UPI ID', max: 60 }
      ] },
      { title: 'RSVP', target: '#rsvp', fields: [
        { type: 'toggle', path: 'rsvpOn', label: 'Show RSVP section' },
        { type: 'text', path: 'rsvpTitle', label: 'Heading', max: 30 },
        { type: 'text', path: 'rsvpSub', label: 'Sub heading', max: 80 },
        { type: 'text', path: 'whatsapp', label: 'WhatsApp number (optional backup)', placeholder: '919999999999', max: 15, hint: 'Country code + number, digits only. Used only if online RSVP cannot be saved.' }
      ] },
      { title: 'Venue & Map', target: '#venue', fields: [
        { type: 'text', path: 'venueTitle', label: 'Heading', max: 30 },
        { type: 'text', path: 'venueName', label: 'Venue name', max: 80 },
        { type: 'text', path: 'venueAddress', label: 'Address', max: 140 },
        { type: 'text', path: 'mapQuery', label: 'Map search text (optional)', max: 160, hint: 'Leave empty to use venue name + address.' },
        { type: 'text', path: 'mapLink', label: 'Google Maps link (optional)', max: 400 }
      ] },
      { title: 'Background Music', target: 'footer', fields: [
        { type: 'audio', path: 'music', label: 'Background music' }
      ] }
    ]
  };
  if (window.InvitationPlatform) window.InvitationPlatform.register(def); else window.INV_DEF = def;
})();
