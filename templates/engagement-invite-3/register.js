/* Peacock Promise — editable engagement template (engagement-invite-3) */
(function () {
  var def = {
    id: 'engagement-invite-3',
    name: 'Peacock Promise — Teal & Gold',
    occasion: 'Engagement',
    categories: ['Engagement'],
    tag: 'Engagement · Animated envelope',
    card: 'templates/engagement-invite-3/card.jpg',
    required: ['bride', 'groom', 'date'],
    requiredLabels: { bride: 'Bride name', groom: 'Groom name', date: 'Engagement date' },
    title: function (d) { return (d.bride || '') + ' & ' + (d.groom || '') + ' · Engagement'; },
    defaults: {
      bride: 'Priya', groom: 'Karthik',
      sealText: 'Open Card', coverHint: 'Tap the seal to open',
      blessing: 'With the blessings of our elders', tagline: 'ENGAGEMENT',
      inviteLine: 'request the pleasure of your company',
      date: '2027-03-21', time: '10:30',
      dateTitle: 'Save the Date', dateSub: 'Scratch the card to reveal',
      eventsTitle: 'Celebrations', eventsSub: 'Join us for every moment',
      events: [
        { title: 'Mehendi & Haldi', date: '2027-03-20', time: '16:00', desc: 'An evening of colour, music and laughter at the bride’s home.', image: './images/mehandi.jpeg' },
        { title: 'Engagement Ceremony', date: '2027-03-21', time: '10:30', desc: 'Exchange of rings and blessings from our families.', image: './images/engagement.jpeg' },
        { title: 'Lunch Reception', date: '2027-03-21', time: '13:00', desc: 'A traditional feast served on banana leaf.', image: './images/launch.jpeg' }
      ],
      coupleTitle: 'The Bride & Groom', bridePhoto: './images/bride.jpeg', groomPhoto: './images/groom.jpeg', coupleCaption: 'Two hearts, one flight',
      journeyTitle: 'Our Journey', journeySub: 'Tap a memory to see it closer',
      gallery: [
        { src: './images/journey-1.jpeg', alt: 'Where it began' },
        { src: './images/journey-2.jpeg', alt: 'The proposal' },
        { src: './images/journey-3.jpeg', alt: 'Our first trip' },
        { src: './images/couple.jpeg', alt: 'Family blessings' }
      ],
      giftOn: true, giftTitle: 'Gift Blessings', giftSub: 'Your presence is our greatest gift', giftCardTitle: 'Gift Card',
      giftText: 'If you wish to bless us from afar, you may send a gift via UPI.', upi: 'priya.karthik@upi',
      rsvpOn: true, rsvpTitle: 'RSVP', rsvpBy: '2027-03-10', whatsapp: '',
      venueTitle: 'Venue', venueName: 'Sri Kalyana Mandapam', venueAddress: 'T. Nagar, Chennai', mapQuery: '', mapLink: '',
      closing: 'With love', music: ''
    },
    schema: [
      { title: 'Couple & Envelope', target: '#hero', help: 'Names and the opening envelope text.', fields: [
        { type: 'text', path: 'bride', label: 'Bride name', max: 30 },
        { type: 'text', path: 'groom', label: 'Groom name', max: 30 },
        { type: 'text', path: 'blessing', label: 'Blessing line', max: 80 },
        { type: 'text', path: 'tagline', label: 'Event tag', max: 24 },
        { type: 'text', path: 'inviteLine', label: 'Invitation line', max: 80 },
        { type: 'text', path: 'sealText', label: 'Seal button text', max: 16 },
        { type: 'text', path: 'coverHint', label: 'Envelope hint', max: 50 }
      ] },
      { title: 'Date & Countdown', target: '#date', fields: [
        { type: 'date', path: 'date', label: 'Engagement date' },
        { type: 'time', path: 'time', label: 'Engagement time' },
        { type: 'text', path: 'dateTitle', label: 'Heading', max: 40 },
        { type: 'text', path: 'dateSub', label: 'Scratch-card hint', max: 60 }
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
      { title: 'Bride & Groom photos', target: '#couple', fields: [
        { type: 'text', path: 'coupleTitle', label: 'Heading', max: 40 },
        { type: 'image', path: 'bridePhoto', label: 'Bride photo' },
        { type: 'image', path: 'groomPhoto', label: 'Groom photo' },
        { type: 'text', path: 'coupleCaption', label: 'Caption', max: 60 }
      ] },
      { title: 'Our Journey photos', target: '#journey', fields: [
        { type: 'text', path: 'journeyTitle', label: 'Heading', max: 40 },
        { type: 'text', path: 'journeySub', label: 'Sub heading', max: 60 },
        { type: 'gallery', path: 'gallery', label: 'Photos', max: 12, hint: 'The caption shows when a guest taps a photo.' }
      ] },
      { title: 'Gift & Blessings', target: '#gift', fields: [
        { type: 'toggle', path: 'giftOn', label: 'Show gift section' },
        { type: 'text', path: 'giftTitle', label: 'Heading', max: 40 },
        { type: 'text', path: 'giftSub', label: 'Sub heading', max: 80 },
        { type: 'text', path: 'giftCardTitle', label: 'Card title', max: 40 },
        { type: 'textarea', path: 'giftText', label: 'Message', max: 160 },
        { type: 'text', path: 'upi', label: 'UPI ID', max: 60 }
      ] },
      { title: 'RSVP', target: '#rsvp', fields: [
        { type: 'toggle', path: 'rsvpOn', label: 'Show RSVP section' },
        { type: 'text', path: 'rsvpTitle', label: 'Heading', max: 30 },
        { type: 'date', path: 'rsvpBy', label: 'Reply by date' },
        { type: 'text', path: 'whatsapp', label: 'WhatsApp number (optional backup)', placeholder: '919999999999', max: 15, hint: 'Country code + number, digits only. Used only if online RSVP cannot be saved.' }
      ] },
      { title: 'Venue & Map', target: '#venue', fields: [
        { type: 'text', path: 'venueTitle', label: 'Heading', max: 30 },
        { type: 'text', path: 'venueName', label: 'Venue name', max: 80 },
        { type: 'text', path: 'venueAddress', label: 'Address', max: 140 },
        { type: 'text', path: 'mapQuery', label: 'Map search text (optional)', max: 160, hint: 'Leave empty to use venue name + address.' },
        { type: 'text', path: 'mapLink', label: 'Google Maps link (optional)', max: 400 }
      ] },
      { title: 'Closing & Music', target: 'footer', fields: [
        { type: 'text', path: 'closing', label: 'Closing words', max: 40 },
        { type: 'audio', path: 'music', label: 'Background music' }
      ] }
    ]
  };
  if (window.InvitationPlatform) window.InvitationPlatform.register(def); else window.INV_DEF = def;
})();
