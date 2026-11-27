/* Vivaha — editable Brahmin / traditional wedding template (brahmin-wedding) */
(function () {
  var def = {
    id: 'brahmin-wedding',
    name: 'Vivaha — Temple Doors (Traditional)',
    occasion: 'Wedding',
    categories: ['Wedding', 'Traditional'],
    tag: 'Wedding · Temple-door opening',
    card: 'templates/brahmin-wedding/card.jpg',
    required: ['bride', 'groom', 'date'],
    requiredLabels: { bride: 'Bride name', groom: 'Groom name', date: 'Wedding date' },
    title: function (d) { return (d.bride || '') + ' & ' + (d.groom || '') + ' · Wedding'; },
    defaults: {
      tapText: 'Tap to open the doors',
      shloka: '॥ श्री गणेशाय नमः ॥', tamilTitle: 'திருமண அழைப்பிதழ்',
      intro: 'With the blessings of the Almighty and our elders, we invite you to the wedding of',
      bride: 'Meenakshi', groom: 'Karthik',
      date: '2027-03-14', time: '07:30', muhurthamLabel: 'Muhurtham', city: 'Chennai',
      dateTitle: 'Save the date', dateSub: 'Scratch the gold to reveal', scratchHint: 'Scratch here ✦',
      countdownText: 'days to go', countdownDone: 'The auspicious day is here',
      eventsTitle: 'The celebrations', eventsSub: 'Three auspicious occasions',
      events: [
        { title: 'Nischayathartham', date: '2027-03-13', time: '18:00', desc: 'Exchange of vows and blessings of the elders.', image: './assets/kalasam.webp' },
        { title: 'Muhurtham', date: '2027-03-14', time: '07:30', desc: 'The sacred wedding ceremony before the holy fire.', image: './assets/hands.webp' },
        { title: 'Reception', date: '2027-03-14', time: '19:00', desc: 'An evening of music, blessings and a festive dinner.', image: './assets/elephant.webp' }
      ],
      pairTitle: 'The bride & groom', pairSub: 'Two families, one auspicious beginning',
      brideFamily: 'Daughter of Mr. & Mrs. Venkataraman', groomFamily: 'Son of Mr. & Mrs. Subramanian', bridePhoto: '', groomPhoto: '',
      noteOn: true, noteTitle: 'With blessings', noteSub: 'A note from our families', noteIcon: '🪔',
      noteText: 'With the grace of the Almighty and the blessings of our elders, we joyfully invite you and your family to bless the couple on their wedding day.',
      noteSmall: 'Your presence is our greatest blessing',
      journeyTitle: 'Our journey', journeySub: 'Tap a memory to open it',
      memories: [
        { title: 'Blessings begin', desc: 'Elders bless the new journey.', image: './assets/elephant.webp' },
        { title: 'Mangala vadhyam', desc: 'Music that announces joy.', image: './assets/drums.webp' },
        { title: 'The holy fire', desc: 'Vows taken with Agni as witness.', image: './assets/fire.webp' },
        { title: 'Poorna kumbham', desc: 'Prosperity and auspicious beginnings.', image: './assets/kalasam.webp' },
        { title: 'Hand in hand', desc: 'Together, for all of life.', image: './assets/hands.webp' },
        { title: 'Temple blessings', desc: 'Walking into a new chapter.', image: './assets/gopuram.webp' }
      ],
      giftOn: true, giftTitle: 'A gift of blessings', giftText: 'Your blessings are the greatest gift. If you wish to bless us further:', upi: 'meenakshi.karthik@upi',
      rsvpOn: true, rsvpTitle: 'RSVP', rsvpSub: 'Let us know you are coming', rsvpThanks: 'Thank you! Your reply has been sent.', whatsapp: '',
      venueTitle: 'Venue', venueName: 'Sri Kalyana Mandapam', venueAddress: 'T. Nagar, Chennai, Tamil Nadu', mapQuery: '', mapLink: '',
      music: ''
    },
    schema: [
      { title: 'Opening doors & Greeting', target: '#hero', fields: [
        { type: 'text', path: 'tapText', label: 'Hint on the temple doors', max: 40 },
        { type: 'text', path: 'shloka', label: 'Sanskrit invocation', max: 50 },
        { type: 'text', path: 'tamilTitle', label: 'Tamil title', max: 50 },
        { type: 'textarea', path: 'intro', label: 'Invitation line', max: 160 }
      ] },
      { title: 'Bride, Groom & Date', target: '#hero', fields: [
        { type: 'text', path: 'bride', label: 'Bride name', max: 24 },
        { type: 'text', path: 'groom', label: 'Groom name', max: 24 },
        { type: 'date', path: 'date', label: 'Wedding date' },
        { type: 'time', path: 'time', label: 'Muhurtham time' },
        { type: 'text', path: 'muhurthamLabel', label: 'Time label', max: 24, hint: 'Shown before the time, e.g. Muhurtham.' },
        { type: 'text', path: 'city', label: 'City', max: 30 }
      ] },
      { title: 'Save the date & Countdown', target: '#date', fields: [
        { type: 'text', path: 'dateTitle', label: 'Heading', max: 40 },
        { type: 'text', path: 'dateSub', label: 'Sub heading', max: 60 },
        { type: 'text', path: 'scratchHint', label: 'Text on the scratch card', max: 30 },
        { type: 'text', path: 'countdownText', label: 'Text after the day count', max: 40 },
        { type: 'text', path: 'countdownDone', label: 'Text on the day', max: 60 }
      ] },
      { title: 'Celebrations / Events', target: '#events', fields: [
        { type: 'text', path: 'eventsTitle', label: 'Heading', max: 40 },
        { type: 'text', path: 'eventsSub', label: 'Sub heading', max: 80 },
        { type: 'list', path: 'events', label: 'Events', itemTitle: 'title', itemName: 'event', max: 8,
          itemDefaults: { title: 'New event', date: '', time: '', desc: '', image: '' },
          fields: [
            { key: 'title', label: 'Event name' }, { key: 'date', label: 'Date', type: 'date' }, { key: 'time', label: 'Time', type: 'time' },
            { key: 'desc', label: 'Short description', type: 'textarea' }, { key: 'image', label: 'Picture', type: 'image' }
          ] }
      ] },
      { title: 'Bride & Groom families', target: '#couple', fields: [
        { type: 'text', path: 'pairTitle', label: 'Heading', max: 40 },
        { type: 'text', path: 'pairSub', label: 'Sub heading', max: 80 },
        { type: 'text', path: 'brideFamily', label: 'Bride’s family line', max: 70 },
        { type: 'text', path: 'groomFamily', label: 'Groom’s family line', max: 70 },
        { type: 'image', path: 'bridePhoto', label: 'Bride photo (optional)', hint: 'Leave empty to keep the kalasam illustration.' },
        { type: 'image', path: 'groomPhoto', label: 'Groom photo (optional)', hint: 'Leave empty to keep the elephant illustration.' }
      ] },
      { title: 'Blessings note', target: '#blessings', fields: [
        { type: 'toggle', path: 'noteOn', label: 'Show this section' },
        { type: 'text', path: 'noteTitle', label: 'Heading', max: 40 },
        { type: 'text', path: 'noteSub', label: 'Sub heading', max: 60 },
        { type: 'text', path: 'noteIcon', label: 'Icon (emoji)', max: 4 },
        { type: 'textarea', path: 'noteText', label: 'Message', rows: 5, max: 360 },
        { type: 'text', path: 'noteSmall', label: 'Small line below', max: 60 }
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
      { title: 'Background Music', target: 'footer', fields: [
        { type: 'audio', path: 'music', label: 'Background music' }
      ] }
    ]
  };
  if (window.InvitationPlatform) window.InvitationPlatform.register(def); else window.INV_DEF = def;
})();
