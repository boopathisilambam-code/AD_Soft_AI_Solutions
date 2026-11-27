/* Pink Blossom Seemantham — editable baby shower template (babyshower-invitation) */
(function () {
  var def = {
    id: 'babyshower-invitation',
    name: 'Vinayagar Blessing — Seemantham',
    occasion: 'Baby Shower',
    categories: ['Baby Shower', 'Seemantham'],
    tag: 'Baby Shower · Scratch card & Boy-or-Girl game',
    card: 'templates/babyshower-invitation/card.jpg',
    required: ['momName', 'dadName', 'date'],
    requiredLabels: { momName: 'Mom-to-be name', dadName: 'Dad-to-be name', date: 'Function date' },
    title: function (d) { return (d.momName || '') + ' & ' + (d.dadName || '') + ' · Baby Shower'; },
    defaults: {
      coverHint: 'Tap Vinayagar to begin',
      eventTag: 'Seemantham · Baby Shower', momName: 'Priya', dadName: 'Arjun', heroLine: 'are expecting a little blessing',
      date: '2027-02-14', time: '10:30', city: 'Chennai',
      dateTitle: 'Save the Date', dateSub: 'Scratch the card to reveal the date & time', scratchHint: 'Scratch to reveal date & time ✦',
      momOn: true, momTitle: 'Mom-to-be', momText: 'Our Priya is glowing, and our hearts are full.\nCome shower her and the little one with love', momPhoto: './assets/mom.webp',
      eventsTitle: 'The Functions',
      events: [
        { title: 'Ganesha Pooja', time: '09:00', desc: 'Blessings to begin well', image: './assets/gan.webp' },
        { title: 'Valaikappu', time: '10:30', desc: 'Bangle ceremony with sweets', image: './assets/basket.webp' },
        { title: 'Blessings & Feast', time: '12:30', desc: 'Aarti, wishes and a grand lunch', image: './assets/fam.webp' }
      ],
      blessOn: true, blessTitle: 'Bless our little one', blessText: 'Your love is the first gift they will feel.',
      cradleOn: true, cradleTitle: 'The Little Thottil', cradleSub: 'Tap the cradle to give it a push', cradleBase: './assets/cradle-base.webp', cradleSwing: './assets/cradle-swing.webp',
      journeyTitle: 'Our Journey', journeySub: 'Tap a memory to see it closer',
      gallery: [
        { title: 'Mom-to-be glow', image: './assets/mom.webp' },
        { title: 'Blessings pour in', image: './assets/fam.webp' },
        { title: 'Bangles ready', image: './assets/basket.webp' },
        { title: 'Thottil is waiting', image: './assets/cradle-full.webp' },
        { title: 'Vinayagar’s grace', image: './assets/gan.webp' },
        { title: 'Queen of the day', image: './assets/throne.jpg' }
      ],
      gameOn: true, gameTitle: 'Boy or Girl?', gameSub: 'Take your guess. The real answer stays a secret till the function!',
      boyLabel: 'Team Boy', boyTag: 'Kutti Raja', girlLabel: 'Team Girl', girlTag: 'Kutti Rani', gameIdle: 'Pick a team, no pressure…', askText: 'Ask the baby',
      boyReplies: 'Boy it is! Appa already booked the cricket bat.\nTeam Boy! Baby is practising cartwheels inside.\nBoy?! Get ready for 3 AM dosa demands.',
      girlReplies: 'Girl! Appa is already saving for silk sarees.\nTeam Girl! Baby is already choosing earrings.\nGirl?! Prepare for a lifetime of selfies.',
      babyReplies: 'Baby says: “Wait for the function da!”\nBaby kicks twice. Means “no spoilers”.\nBaby says: “Amma knows, Appa doesn’t.”\nBaby hiccups: “Ask me after biriyani.”\nBaby says: “I’m busy growing, come back later.”',
      rsvpOn: true, rsvpTitle: 'RSVP', rsvpSub: 'Kindly let us know you’re coming', rsvpThanks: 'Thank you! See you at the function.', whatsapp: '',
      venueTitle: 'Venue', venueName: 'Sri Rajam Mahal', venueAddress: 'Anna Salai, Chennai', venueNote: '9:00 AM onwards', mapQuery: '', mapLink: '',
      heroBg: './assets/bg.jpg', coverArt: './assets/gan.webp', blessArt: './assets/fam.webp',
      music: ''
    },
    schema: [
      { title: 'Cover (opening screen)', target: '#hero', help: 'The Vinayagar the guest taps to open the doors.', fields: [
        { type: 'text', path: 'coverHint', label: 'Cover hint', max: 50 }
      ] },
      { title: 'Names & Headline', target: '#hero', fields: [
        { type: 'text', path: 'eventTag', label: 'Top line', max: 40 },
        { type: 'text', path: 'momName', label: 'Mom-to-be name', max: 24 },
        { type: 'text', path: 'dadName', label: 'Dad-to-be name', max: 24 },
        { type: 'text', path: 'heroLine', label: 'Line below names', max: 60 }
      ] },
      { title: 'Date & Countdown', target: '#date', fields: [
        { type: 'date', path: 'date', label: 'Function date' },
        { type: 'time', path: 'time', label: 'Function time' },
        { type: 'text', path: 'city', label: 'City (shown under the date)', max: 30 },
        { type: 'text', path: 'dateTitle', label: 'Heading', max: 40 },
        { type: 'text', path: 'dateSub', label: 'Sub heading', max: 80 },
        { type: 'text', path: 'scratchHint', label: 'Text on the scratch card', max: 40 }
      ] },
      { title: 'Mom-to-be', target: '#mom', fields: [
        { type: 'toggle', path: 'momOn', label: 'Show this section' },
        { type: 'text', path: 'momTitle', label: 'Heading', max: 40 },
        { type: 'textarea', path: 'momText', label: 'Message', rows: 4, max: 240 },
        { type: 'image', path: 'momPhoto', label: 'Mom-to-be photo', hint: 'Replace the illustration with a real photo (portrait works best).' }
      ] },
      { title: 'The Functions / Events', target: '#events', fields: [
        { type: 'text', path: 'eventsTitle', label: 'Heading', max: 40 },
        { type: 'list', path: 'events', label: 'Functions', itemTitle: 'title', itemName: 'function', max: 8,
          itemDefaults: { title: 'New function', time: '', desc: '', image: '' },
          fields: [
            { key: 'title', label: 'Function name' }, { key: 'time', label: 'Time', type: 'time' },
            { key: 'desc', label: 'Short description', type: 'textarea' }, { key: 'image', label: 'Picture', type: 'image' }
          ] }
      ] },
      { title: 'Blessing message', target: '#bless', fields: [
        { type: 'toggle', path: 'blessOn', label: 'Show this section' },
        { type: 'text', path: 'blessTitle', label: 'Heading', max: 40 },
        { type: 'textarea', path: 'blessText', label: 'Message', max: 160 }
      ] },
      { title: 'Swinging Cradle', target: '#cradle', fields: [
        { type: 'toggle', path: 'cradleOn', label: 'Show this section' },
        { type: 'text', path: 'cradleTitle', label: 'Heading', max: 40 },
        { type: 'text', path: 'cradleSub', label: 'Sub heading', max: 60 },
        { type: 'image', path: 'cradleBase', label: 'Cradle (frame) picture' },
        { type: 'image', path: 'cradleSwing', label: 'Swinging part picture', hint: 'This part swings. Transparent PNG/WebP, same shape as the original.' }
      ] },
      { title: 'Our Journey photos', target: '#journey', fields: [
        { type: 'text', path: 'journeyTitle', label: 'Heading', max: 40 },
        { type: 'text', path: 'journeySub', label: 'Sub heading', max: 60 },
        { type: 'list', path: 'gallery', label: 'Photos', itemTitle: 'title', itemName: 'photo', max: 12,
          itemDefaults: { title: 'New photo', image: '' },
          fields: [{ key: 'title', label: 'Caption' }, { key: 'image', label: 'Photo', type: 'image' }] }
      ] },
      { title: 'Boy or Girl game', target: '#game', fields: [
        { type: 'toggle', path: 'gameOn', label: 'Show this game' },
        { type: 'text', path: 'gameTitle', label: 'Heading', max: 40 },
        { type: 'textarea', path: 'gameSub', label: 'Sub heading', max: 120 },
        { type: 'text', path: 'boyLabel', label: 'Boy button', max: 20 }, { type: 'text', path: 'boyTag', label: 'Boy button small text', max: 24 },
        { type: 'text', path: 'girlLabel', label: 'Girl button', max: 20 }, { type: 'text', path: 'girlTag', label: 'Girl button small text', max: 24 },
        { type: 'text', path: 'gameIdle', label: 'Text before a team is picked', max: 60 },
        { type: 'text', path: 'askText', label: '“Ask the baby” button', max: 24 },
        { type: 'textarea', path: 'boyReplies', label: 'Replies for Team Boy', rows: 4, hint: 'One reply per line.' },
        { type: 'textarea', path: 'girlReplies', label: 'Replies for Team Girl', rows: 4, hint: 'One reply per line.' },
        { type: 'textarea', path: 'babyReplies', label: 'Replies from the baby', rows: 5, hint: 'One reply per line.' }
      ] },
      { title: 'RSVP', target: '#rsvp', fields: [
        { type: 'toggle', path: 'rsvpOn', label: 'Show RSVP section' },
        { type: 'text', path: 'rsvpTitle', label: 'Heading', max: 30 },
        { type: 'text', path: 'rsvpSub', label: 'Sub heading', max: 80 },
        { type: 'text', path: 'rsvpThanks', label: 'Thank-you message', max: 100 },
        { type: 'text', path: 'whatsapp', label: 'WhatsApp number (optional backup)', placeholder: '919999999999', max: 15, hint: 'Country code + number, digits only. Used only if online RSVP cannot be saved.' }
      ] },
      { title: 'Venue & Map', target: '#venue', fields: [
        { type: 'text', path: 'venueTitle', label: 'Heading', max: 30 },
        { type: 'text', path: 'venueName', label: 'Venue name', max: 80 },
        { type: 'text', path: 'venueAddress', label: 'Address', max: 140 },
        { type: 'text', path: 'venueNote', label: 'Extra note (e.g. timing)', max: 60 },
        { type: 'text', path: 'mapQuery', label: 'Map search text (optional)', max: 160, hint: 'Leave empty to use venue name + address.' },
        { type: 'text', path: 'mapLink', label: 'Google Maps link (optional)', max: 400 }
      ] },
      { title: 'Design images (advanced)', target: '#hero', help: 'Background art used across the invitation. Leave as is unless you have matching artwork.', fields: [
        { type: 'image', path: 'heroBg', label: 'Main front-page artwork', hint: 'Names are placed over this picture.' },
        { type: 'image', path: 'coverArt', label: 'Cover figure (Vinayagar)' },
        { type: 'image', path: 'blessArt', label: 'Blessing section picture' }
      ] },
      { title: 'Background Music', target: 'footer', fields: [
        { type: 'audio', path: 'music', label: 'Background music' }
      ] }
    ]
  };
  if (window.InvitationPlatform) window.InvitationPlatform.register(def); else window.INV_DEF = def;
})();
