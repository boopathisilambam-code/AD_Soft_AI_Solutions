/* Classic Maroon Wedding — editable wedding template (wedding-invitation-02) */
(function () {
  var def = {
    id: 'wedding-invitation-02',
    name: 'Classic Maroon — Wedding',
    occasion: 'Wedding',
    categories: ['Wedding'],
    tag: 'Wedding · Envelope seal & scratch card',
    card: 'templates/wedding-invitation-02/card.jpg',
    required: ['bride', 'groom', 'date'],
    requiredLabels: { bride: 'Bride name', groom: 'Groom name', date: 'Wedding date' },
    title: function (d) { return (d.bride || '') + ' & ' + (d.groom || '') + ' · Wedding'; },
    defaults: {
      coverHint: 'Tap the seal to open',
      intro: 'Together with our families\nwe invite you to the wedding of', bride: 'Priya', groom: 'Arjun',
      date: '2027-02-14', time: '08:30', city: 'Chennai',
      dateTitle: 'Save the Date', dateSub: 'Scratch the card to reveal our big day', scratchHint: 'Scratch here ✦',
      coupleTitle: 'The Bride & Groom',
      brideFamily: 'Daughter of\nMr. & Mrs. Kumar', groomFamily: 'Son of\nMr. & Mrs. Raman',
      bridePhoto: './assets/bride.png', groomPhoto: './assets/groom.png',
      eventsTitle: 'Wedding Events',
      events: [
        { title: 'Mehendi', date: '2027-02-12', time: '16:00', desc: 'Bride’s residence, Chennai', image: './assets/mahendi.png' },
        { title: 'Muhurtham', date: '2027-02-14', time: '08:30', desc: 'Sri Rajam Mahal, Chennai', image: './assets/mugartham.jpeg' },
        { title: 'Reception', date: '2027-02-13', time: '19:00', desc: 'Sri Rajam Mahal, Chennai', image: './assets/reception.jpeg' }
      ],
      blessOn: true, blessTitle: 'Two hearts', blessText: 'One beautiful beginning. Your blessings will make our day complete.', blessBg: './assets/couple.png',
      journeyTitle: 'Our Journey', journeySub: 'Tap a memory to see it closer',
      gallery: [
        { title: 'First hello', image: './assets/journey-1.jpeg' },
        { title: 'The proposal', image: './assets/journey-2.jpeg' },
        { title: 'Family says yes', image: './assets/journey-3.jpeg' },
        { title: 'Ring day', image: './assets/mugartham.jpeg' },
        { title: 'Pre-wedding', image: './assets/journey-4.jpeg' },
        { title: 'Forever begins', image: './assets/reception.jpeg' }
      ],
      giftOn: true, giftTitle: 'Gift Blessings', giftText: 'Your presence is our greatest gift. If you wish to bless us further:', upi: 'priya.arjun@upi',
      rsvpOn: true, rsvpTitle: 'RSVP', rsvpSub: 'Kindly let us know you’re coming', rsvpThanks: 'Thank you! Your RSVP is noted.', whatsapp: '',
      venueTitle: 'Venue', venueName: 'Sri Rajam Mahal', venueAddress: 'Anna Salai, Chennai', mapQuery: '', mapLink: '',
      heroBg: './assets/bg.jpg', envelopeArt: './assets/envelope.jpg', flowerTL: './assets/flower-tl.png', flowerTR: './assets/flower-tr.png', flowerBL: './assets/flower-bl.png',
      music: ''
    },
    schema: [
      { title: 'Envelope & Cover', target: '#hero', fields: [
        { type: 'text', path: 'coverHint', label: 'Envelope hint', max: 50 }
      ] },
      { title: 'Couple & Headline', target: '#hero', fields: [
        { type: 'text', path: 'bride', label: 'Bride name', max: 24 },
        { type: 'text', path: 'groom', label: 'Groom name', max: 24 },
        { type: 'textarea', path: 'intro', label: 'Invitation line', rows: 3, max: 120, hint: 'Use a new line to break the text.' }
      ] },
      { title: 'Date & Countdown', target: '#date', fields: [
        { type: 'date', path: 'date', label: 'Wedding date' },
        { type: 'time', path: 'time', label: 'Muhurtham time' },
        { type: 'text', path: 'city', label: 'City (shown under the date)', max: 30 },
        { type: 'text', path: 'dateTitle', label: 'Heading', max: 40 },
        { type: 'text', path: 'dateSub', label: 'Sub heading', max: 80 },
        { type: 'text', path: 'scratchHint', label: 'Text on the scratch card', max: 30 }
      ] },
      { title: 'Bride & Groom', target: '#couple', fields: [
        { type: 'text', path: 'coupleTitle', label: 'Heading', max: 40 },
        { type: 'textarea', path: 'brideFamily', label: 'Bride’s family lines', rows: 2, hint: 'Use a new line to break the text.' },
        { type: 'textarea', path: 'groomFamily', label: 'Groom’s family lines', rows: 2, hint: 'Use a new line to break the text.' },
        { type: 'image', path: 'bridePhoto', label: 'Bride photo' },
        { type: 'image', path: 'groomPhoto', label: 'Groom photo' }
      ] },
      { title: 'Wedding Events', target: '#events', fields: [
        { type: 'text', path: 'eventsTitle', label: 'Heading', max: 40 },
        { type: 'list', path: 'events', label: 'Events', itemTitle: 'title', itemName: 'event', max: 8,
          itemDefaults: { title: 'New event', date: '', time: '', desc: '', image: '' },
          fields: [
            { key: 'title', label: 'Event name' }, { key: 'date', label: 'Date', type: 'date' }, { key: 'time', label: 'Time', type: 'time' },
            { key: 'desc', label: 'Place / description', type: 'textarea' }, { key: 'image', label: 'Picture', type: 'image' }
          ] }
      ] },
      { title: 'Blessing message', target: '#bless', fields: [
        { type: 'toggle', path: 'blessOn', label: 'Show this section' },
        { type: 'text', path: 'blessTitle', label: 'Heading', max: 40 },
        { type: 'textarea', path: 'blessText', label: 'Message', max: 160 },
        { type: 'image', path: 'blessBg', label: 'Background picture (couple)' }
      ] },
      { title: 'Our Journey photos', target: '#journey', fields: [
        { type: 'text', path: 'journeyTitle', label: 'Heading', max: 40 },
        { type: 'text', path: 'journeySub', label: 'Sub heading', max: 60 },
        { type: 'list', path: 'gallery', label: 'Photos', itemTitle: 'title', itemName: 'photo', max: 12,
          itemDefaults: { title: 'New photo', image: '' },
          fields: [{ key: 'title', label: 'Caption' }, { key: 'image', label: 'Photo', type: 'image' }] }
      ] },
      { title: 'Gift Blessings', target: '#gift', fields: [
        { type: 'toggle', path: 'giftOn', label: 'Show gift section' },
        { type: 'text', path: 'giftTitle', label: 'Heading', max: 40 },
        { type: 'textarea', path: 'giftText', label: 'Message', max: 160 },
        { type: 'text', path: 'upi', label: 'UPI ID', max: 60 }
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
        { type: 'text', path: 'mapQuery', label: 'Map search text (optional)', max: 160, hint: 'Leave empty to use venue name + address.' },
        { type: 'text', path: 'mapLink', label: 'Google Maps link (optional)', max: 400 }
      ] },
      { title: 'Design images (advanced)', target: '#hero', help: 'Artwork used across the invitation. Leave as is unless you have matching artwork.', fields: [
        { type: 'image', path: 'heroBg', label: 'Main front-page artwork', hint: 'Names are placed over this picture.' },
        { type: 'image', path: 'envelopeArt', label: 'Envelope artwork' },
        { type: 'image', path: 'flowerTL', label: 'Flowers – top left' },
        { type: 'image', path: 'flowerTR', label: 'Flowers – top right' },
        { type: 'image', path: 'flowerBL', label: 'Flowers – bottom' }
      ] },
      { title: 'Background Music', target: 'footer', fields: [
        { type: 'audio', path: 'music', label: 'Background music' }
      ] }
    ]
  };
  if (window.InvitationPlatform) window.InvitationPlatform.register(def); else window.INV_DEF = def;
})();
