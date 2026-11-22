InvitationPlatform.register({
  id: 'wedding-European',
  name: 'European Garden Wedding',
  tag: 'Wedding · Garden celebration',
  occasion: 'Wedding',
  categories: ['Wedding', 'Engagement', 'Save the date', 'Reception'],
  required: ['groom', 'bride', 'weddingDate', 'venue'],
  requiredLabels: { groom: "Groom's name", bride: "Bride's name", weddingDate: 'Wedding date', venue: 'Venue' },
  title: (data) => `${data.groom} & ${data.bride}`,
  entry: 'templates/wedding-European/index.html',
  thumb: 'templates/wedding-European/og.jpg',
  defaults: {
    groom: 'Karthik',
    bride: 'Ananya',
    weddingDate: '2027-02-14',
    weddingTime: '07:30',
    venue: 'The Rose Pavilion, Chennai',
    invitationMessage: 'We invite you to celebrate our wedding with us.',
    whatsapp: '',
    heroTag: 'Two families, one big party',
    countSub: 'Until the muhurtham begins at 7:30 AM',
    coverPhoto: 'templates/wedding-European/images/garden.jpg', groomPhoto: '', bridePhoto: '', venuePhoto: 'templates/wedding-European/images/garden.jpg',
    groomTimeline: [
        {
            "year": "1997",
            "title": "Born in Madurai",
            "description": "Arrived on a Tuesday and immediately demanded dosa.",
            "image": ""
        },
        {
            "year": "2005",
            "title": "The cricket bat years",
            "description": "First bat, two broken windows, and one very patient neighbour.",
            "image": ""
        },
        {
            "year": "2015",
            "title": "Engineering, mostly canteen",
            "description": "Studied hard, ate harder. Discovered that 3 AM maggi counts as a skill.",
            "image": ""
        },
        {
            "year": "2019",
            "title": "First job, one wrong text",
            "description": "Moved to Chennai, started a career, and sent one very important message to the wrong person.",
            "image": ""
        }
    ],
    brideTimeline: [
        {
            "year": "1999",
            "title": "Born in Coimbatore",
            "description": "Arrived with a loud cry, which she says was singing.",
            "image": ""
        },
        {
            "year": "2007",
            "title": "First stage performance",
            "description": "Forgot the steps, remembered the smile. The audience clapped for both.",
            "image": ""
        },
        {
            "year": "2017",
            "title": "Design school",
            "description": "Sketched buildings, collected bangles and ran the most popular tea-and-gossip club on campus.",
            "image": ""
        },
        {
            "year": "2019",
            "title": "Replied to a stranger",
            "description": "Got a text about cricket tickets. Had opinions. Shared all of them.",
            "image": ""
        }
    ],
    story: [
        {
            "year": "2019 · Chapter one",
            "title": "Hey, wrong number",
            "text": "Karthik meant to text his cousin about cricket tickets. Ananya replied with a 14-point critique of his bowling. Neither of them stopped texting for three years.",
            "image": "templates/wedding-European/images/still2.jpg",
            "caption": "Where it all began"
        },
        {
            "year": "2021 · Chapter two",
            "title": "The biriyani date",
            "text": "Their first real meal together. He ordered for two, she finished his half, and the waiter asked if they were celebrating something. They were.",
            "image": "templates/wedding-European/images/still5.jpg",
            "caption": "Second helping, always"
        },
        {
            "year": "2025 · Chapter three",
            "title": "He asked. She cried first.",
            "text": "A quiet evening, a very shaky speech, and a ring he had rehearsed with for six weeks. She said yes before he finished the sentence.",
            "image": "templates/wedding-European/images/still8.jpg",
            "caption": "She said yes"
        },
        {
            "year": "2027 · Chapter four",
            "title": "Forever, with Wi-Fi",
            "text": "Now we are doing it in front of everyone we love, under a rose pavilion, with a very long snack menu. Come be part of it.",
            "image": "templates/wedding-European/images/garden.jpg",
            "caption": "See you there"
        }
    ],
    events: [
        {
            "day": "Day 1 · Friday",
            "date": "2027-02-12",
            "title": "Mehendi",
            "time": "4:00 PM onwards",
            "place": "Garden lawn, The Rose Pavilion",
            "note": "Henna dries. Gossip doesn't.",
            "start": "16:00"
        },
        {
            "day": "Day 2 · Saturday",
            "date": "2027-02-13",
            "title": "Sangeet",
            "time": "7:00 PM onwards",
            "place": "Grand lawn stage",
            "note": "Cousins have rehearsed. Allegedly.",
            "start": "19:00"
        },
        {
            "day": "Day 3 · Sunday · The main event",
            "date": "2027-02-14",
            "title": "Muhurtham",
            "time": "Muhurtham at 7:30 AM sharp",
            "place": "Breakfast and blessings after",
            "note": "Yes, the auspicious time really is 7:30 AM.",
            "start": "07:30"
        },
        {
            "day": "Day 3 · Sunday evening",
            "date": "2027-02-14",
            "title": "Reception",
            "time": "7:00 PM onwards",
            "place": "Dinner, DJ and a very long photo queue",
            "note": "Dance floor opens at 8:15, or when the aunties say.",
            "start": "19:00"
        }
    ],
    venueAddress: 'The Rose Pavilion, Garden Estate Road, East Coast Road, Chennai 600119',
    mapQuery: '',
    bgMusic: '',
  },
  schema: [
    { title: 'Couple & date', target: '#top', fields: [
      { path: 'groom', label: "Groom's name", type: 'text', max: 40 },
      { path: 'bride', label: "Bride's name", type: 'text', max: 40 },
      { path: 'weddingDate', label: 'Wedding date', type: 'date' },
      { path: 'weddingTime', label: 'Start time', type: 'time' },
      { path: 'heroTag', label: 'Line above the names', type: 'text', max: 60 },
      { path: 'invitationMessage', label: 'Invitation message', type: 'textarea', rows: 3, max: 240 },
      { path: 'countSub', label: 'Countdown text', type: 'text', max: 120 },
    ] },
    { title: 'Photos', target: '#couple', help: 'Upload photos for the envelope card, the couple cards and the venue.', fields: [
      { path: 'coverPhoto', label: 'Envelope cover photo', type: 'image' },
      { path: 'groomPhoto', label: "Groom's photo", type: 'image' },
      { path: 'bridePhoto', label: "Bride's photo", type: 'image' },
      { path: 'venuePhoto', label: 'Venue photo', type: 'image' },
    ] },
    { title: "Groom's timeline", target: '#timelines', fields: [
      { path: 'groomTimeline', label: 'Groom timeline (4 moments)', type: 'list', itemTitle: 'title', itemName: 'moment', max: 4,
        itemDefaults: { year: '', title: 'New moment', description: '', image: '' },
        fields: [{ key: 'year', label: 'Year' }, { key: 'title', label: 'Title' }, { key: 'description', label: 'Description', type: 'textarea' }, { key: 'image', label: 'Photo', type: 'image' }] },
    ] },
    { title: "Bride's timeline", target: '#timelines', fields: [
      { path: 'brideTimeline', label: 'Bride timeline (4 moments)', type: 'list', itemTitle: 'title', itemName: 'moment', max: 4,
        itemDefaults: { year: '', title: 'New moment', description: '', image: '' },
        fields: [{ key: 'year', label: 'Year' }, { key: 'title', label: 'Title' }, { key: 'description', label: 'Description', type: 'textarea' }, { key: 'image', label: 'Photo', type: 'image' }] },
    ] },
    { title: 'Our story', target: '#story', fields: [
      { path: 'story', label: 'Story chapters (4)', type: 'list', itemTitle: 'title', itemName: 'chapter', max: 4,
        itemDefaults: { year: '', title: 'New chapter', text: '', image: '', caption: '' },
        fields: [{ key: 'year', label: 'Year / chapter label' }, { key: 'title', label: 'Title' }, { key: 'text', label: 'Story', type: 'textarea' }, { key: 'caption', label: 'Photo caption' }, { key: 'image', label: 'Photo', type: 'image' }] },
    ] },
    { title: 'Events', target: '#events', fields: [
      { path: 'events', label: 'Events (4)', type: 'list', itemTitle: 'title', itemName: 'event', max: 4,
        itemDefaults: { day: '', date: '', title: 'New event', time: '', place: '', note: '', start: '10:00' },
        fields: [{ key: 'title', label: 'Event name' }, { key: 'day', label: 'Day label' }, { key: 'date', label: 'Date', type: 'date' }, { key: 'start', label: 'Start time (for calendar)', type: 'time' },
          { key: 'time', label: 'First line (time)' }, { key: 'place', label: 'Second line (place / details)' }, { key: 'note', label: 'Fun note', type: 'textarea' }] },
    ] },
    { title: 'Venue & contact', target: '#venue', fields: [
      { path: 'venue', label: 'Venue and location', type: 'textarea', rows: 2, max: 180 },
      { path: 'venueAddress', label: 'Full address', type: 'textarea', rows: 2, max: 200 },
      { path: 'mapQuery', label: 'Map search text (optional)', type: 'text', max: 140 },
      { path: 'whatsapp', label: 'WhatsApp number (optional)', type: 'text', max: 20 },
      { path: 'bgMusic', label: 'Background music (optional)', type: 'audio', hint: 'Use music you have the rights to. Plays after the guest’s first tap.' },
    ] },
  ],
});
