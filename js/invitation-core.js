// ====== 1. PASTE YOUR KEYS HERE ======
const CFG = {
  cloudName: "YOUR_CLOUD_NAME",
  uploadPreset: "YOUR_UNSIGNED_PRESET",
  firebase: { apiKey: "", authDomain: "", projectId: "", storageBucket: "", messagingSenderId: "", appId: "" }
};
// =====================================

const OCC = {
  wedding: { n: 'Wedding', s: 'Anu & Arjun' },
  engagement: { n: 'Engagement', s: 'Meera & Nikhil' },
  birthday: { n: 'Birthday', s: 'Aadhi turns 2' },
  babyshower: { n: 'Baby shower', s: 'Baby on the way' },
  housewarming: { n: 'Housewarming', s: 'Our new home' },
  other: { n: 'Celebration', s: 'You are invited' }
};

const PAL = {
  ivory: { n: 'Ivory Burgundy', bg: '#f7efe1', dk: '#5e1a28', ac: '#7a2233', a2: '#d1ac62' },
  slate: { n: 'Slate Blue', bg: '#f4f6fa', dk: '#4e617f', ac: '#4e617f', a2: '#bccbe3' },
  noir: { n: 'Noir Cream', bg: '#f1e8dd', dk: '#1d1816', ac: '#8a6a4a', a2: '#d8bf9c' },
  sage: { n: 'Sage Green', bg: '#f5f4ec', dk: '#3f5642', ac: '#55704f', a2: '#bccdb0' },
  rose: { n: 'Dusty Rose', bg: '#fbf1ef', dk: '#5a2f3d', ac: '#a14e68', a2: '#efc3cc' },
  gold: { n: 'Burgundy Gold', bg: '#fbf4e8', dk: '#4a1020', ac: '#9a6b1e', a2: '#e0c27a' },
  night: { n: 'Midnight Gold', bg: '#f6f1e6', dk: '#14182b', ac: '#a98534', a2: '#e6cc84' },
  marigold: { n: 'Marigold', bg: '#fff4e0', dk: '#6b3a0a', ac: '#c8670a', a2: '#f5c27a' },
  pop: { n: 'Party Pop', bg: '#e8f7ff', dk: '#1d3557', ac: '#e8552a', a2: '#ffb199' },
  confetti: { n: 'Confetti Night', bg: '#efeaff', dk: '#1b1740', ac: '#b07f00', a2: '#ffd23f' },
  wine: { n: 'Peony Wine', bg: '#fbf1f3', dk: '#4a0716', ac: '#8f1d3c', a2: '#f4b6c6' },
  lotus: { n: 'Lotus Ivory', bg: '#f7f1e4', dk: '#56602e', ac: '#b4566d', a2: '#eab4c0' },
  emerald: { n: 'Emerald Gold', bg: '#f3f6ef', dk: '#0f3a30', ac: '#a97c28', a2: '#efd48a' },
  palace: { n: 'Udaipur Palace', bg: '#f7f1e4', dk: '#3a2d28', ac: '#9c7b43', a2: '#d8bc82' }
};

const T = {
  w1: { n: 'Royal Gold', occ: 'wedding', fam: 'royal', pal: 'ivory', fx: '✨',
    intro: 'images/olive/wedding-card-open.mp4',
    poster: 'images/olive/wedding-card-poster.jpg',
    thumb: 'images/olive/wedding-card-thumb.jpg',
    fl: ['mari', 'jasmine', 'rose'], hero: 'arch', edge: 'zig', an: 'spark', tl: 'icons', dt: 'odo', sym: '✦' },
  
  // New Modern Palace Wedding Template inspired by your reference image
  w7: { n: 'Udaipur Palace Arch', occ: 'wedding', fam: 'modern', pal: 'palace', fx: '🏰',
    intro: 'videos/wedding-open-palace.mp4',
    poster: 'images/wedding-palace-poster.jpg',
    fl: ['jasmine', 'rose', 'blossom'], hero: 'arch', edge: 'torn', an: 'spark', tl: 'hearts', dt: 'heart', frame: 'baroque', hang: 1, row: 1, sym: 'A & K' },

  w2: { n: 'Peony Romance', occ: 'wedding', fam: 'modern', pal: 'wine', fx: '🌺', intro: 'videos/wedding-open-2.mp4', fl: ['peony', 'rose'], hero: 'full', edge: 'torn', an: 'petal', tl: 'hearts', dt: 'heart', row: 1 },
  w3: { n: 'Temple Lotus', occ: 'wedding', fam: 'classic', pal: 'lotus', fx: '🪷', intro: 'videos/wedding-open-3.mp4', fl: ['lotus', 'jasmine'], hero: 'paper', bands: 'paper', edge: 'none', an: 'fly', tl: 'line', dt: 'odo', hang: 1, sym: 'ॐ' },
  w4: { n: 'Winter Baroque', occ: 'wedding', fam: 'floral', pal: 'slate', fx: '❄️', intro: 'videos/wedding-open-4.mp4', fl: ['blossom', 'hydra', 'peony'], hero: 'full', edge: 'torn', an: 'snow', tl: 'hearts', dt: 'heart', frame: 'baroque', row: 1 },
  w5: { n: 'Sage Garden Arch', occ: 'wedding', fam: 'floral', pal: 'sage', fx: '🕊️', intro: 'videos/wedding-open-5.mp4', fl: ['rose', 'hydra', 'jasmine'], hero: 'arch', bands: 'paper', edge: 'scal', an: 'petal', tl: 'line', dt: 'odo', frame: 'arch', row: 1 },
  w6: { n: 'Emerald Palace', occ: 'wedding', fam: 'royal', pal: 'emerald', fx: '🌙', fl: ['jasmine', 'mari', 'rose'], hero: 'arch', edge: 'scal', an: 'spark', tl: 'icons', dt: 'odo', frame: 'arch', sym: '☪' },
  e1: { n: 'Rose Promise', occ: 'engagement', fam: 'floral', pal: 'rose', fx: '🌹', fl: ['rose', 'blossom'], an: 'spark', tl: 'hearts', dt: 'heart' },
  b1: { n: 'Party Pop', occ: 'birthday', fam: 'fun', pal: 'pop', fx: '🎈', an: 'bal', edge: 'scal' },
  b2: { n: 'Midnight Confetti', occ: 'birthday', fam: 'fun', pal: 'confetti', fx: '🎉', an: 'conf' },
  s1: { n: 'Soft Clouds', occ: 'babyshower', fam: 'floral', pal: 'slate', fx: '☁️', an: 'star', edge: 'scal' },
  h1: { n: 'Marigold Home', occ: 'housewarming', fam: 'royal', pal: 'marigold', fx: '🪔', an: 'mari', edge: 'torn' },
  o1: { n: 'Classic Ivory', occ: 'other', fam: 'royal', pal: 'sage', fx: '✨', an: 'spark' }
};

const DEF = { fl: ['rose', 'jasmine'], hero: 'full', bands: 'alt', edge: 'zig', an: 'petal', tl: 'icons', dt: 'odo' };
Object.keys(T).forEach(k => { T[k] = { ...DEF, ...T[k] }; });

const PLACEHOLDERS_LIVE = false;
const fut = n => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
const DEMO = {
  wedding: { bride: 'Aarav', groom: 'Kiara', bfam: 'Son of Mr. and Mrs. Sharma', gfam: 'Daughter of Mr. and Mrs. Kapoor', title: '', date: fut(75), time: '18:00', venue: 'The Oberoi Udaivilas, Udaipur, Rajasthan', map: '', host: 'The Sharma and Kapoor families',
    message: 'Two hearts, one beautiful beginning. We joyfully invite you to celebrate our wedding with us.',
    sched: '6:00 PM - Wedding Ceremony\n7:30 PM - Grand Reception & Dinner\n9:00 PM - Musical Night', dress: 'Royal traditional or formal wear', phone: '' },
  birthday: { bride: '', groom: '', bfam: '', gfam: '', title: 'Aadhi turns 2', date: fut(20), time: '16:00', venue: 'Rainbow Party Hall, Kakkanad, Kochi', map: '', host: 'Anu and Arjun',
    message: 'Come celebrate our little star with cake, games and lots of fun!',
    sched: '4:00 PM - Welcome and games\n5:00 PM - Cake cutting\n5:30 PM - Dinner and fun', dress: 'Bright and colourful outfits', phone: '' },
  babyshower: { bride: '', groom: '', bfam: '', gfam: '', title: 'Baby on the way', date: fut(45), time: '11:00', venue: 'Lotus Banquet Hall, Edappally, Kochi', map: '', host: 'Meera and Nikhil',
    message: 'A little one is on the way and we would love to share the joy with you.',
    sched: '11:00 AM - Welcome\n12:00 PM - Blessings and games\n1:00 PM - Lunch', dress: 'Soft pastel colours', phone: '' },
  housewarming: { bride: '', groom: '', bfam: '', gfam: '', title: 'Our new home', date: fut(30), time: '09:00', venue: 'Vrindavan, Thrikkakkara, Ernakulam', map: '', host: 'Anil and Latha',
    message: 'We have moved into our new home and would be happy to have you bless it with your presence.',
    sched: '9:00 AM - Pooja ceremony\n10:30 AM - Breakfast\n12:30 PM - Lunch', dress: 'Traditional wear', phone: '' },
  other: { bride: '', groom: '', bfam: '', gfam: '', title: 'You are invited', date: fut(30), time: '17:00', venue: 'Community Hall, Kochi', map: '', host: 'Your host name',
    message: 'We would love to have you join us for a special evening with family and friends.',
    sched: '5:00 PM - Welcome\n6:00 PM - Program\n8:00 PM - Dinner', dress: '', phone: '' }
};
DEMO.engagement = { ...DEMO.wedding, bride: 'Aarav', groom: 'Kiara', time: '18:00', message: 'Two hearts, one beautiful beginning. Join us for our engagement ceremony.', sched: '6:00 PM - Ring Ceremony\n7:30 PM - Celebration & Dinner' };

const TDEMO = {
  w7: { bride: 'Aarav', groom: 'Kiara', bfam: 'Son of Mr. and Mrs. Sharma', gfam: 'Daughter of Mr. and Mrs. Kapoor', venue: 'The Oberoi Udaivilas, Udaipur, Rajasthan', time: '18:00' }
};
const demoFor = id => ({ ...DEMO[T[id].occ], ...(TDEMO[id] || {}) });