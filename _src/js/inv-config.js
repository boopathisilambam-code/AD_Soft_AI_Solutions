/* =========================================================
   INVITATION PLATFORM — CONFIG  (fill these in once)
   ========================================================= */
window.INV_CONFIG = {
  // Firebase web-app config (Project settings → Your apps → Web app)
  firebase: {
  apiKey: "AIzaSyC94YPBZNKKPIt22ociotCQbYnc2ZR6Lmw",
  authDomain: "ad-soft-technologies.firebaseapp.com",
  projectId: "ad-soft-technologies",
  storageBucket: "ad-soft-technologies.firebasestorage.app",
  messagingSenderId: "877722051605",
  appId: "1:877722051605:web:0264cd012532309e9f5a1c",
  measurementId: "G-F3ETJQGL5Q"
  },

  // Cloudinary — create an UNSIGNED upload preset (Settings → Upload → Upload presets)
  cloudinary: {
    cloudName: 'da4dneb1d',
    uploadPreset: 'ad-soft-invitation',
    folder: 'invitations',
  },

  // EmailJS (https://www.emailjs.com) - sends the invitation link to the creator's email
  emailjs: {
    serviceId: 'YOUR_SERVICE_ID',
    templateId: 'YOUR_TEMPLATE_ID',
    publicKey: 'YOUR_PUBLIC_KEY',
  },
  // Private collection where creator emails are stored (clients can write, never read)
  leadsCollection: 'invitationLeads',

  // Firestore collection used by this platform (kept separate from your existing data)
  collection: 'premiumInvitations',

  // Add a folder name here every time you build a new template in /templates/<id>/
  templates: [
    'royal-ivory',
    'olivas',
    'violet-butterfly',
    'wedding-European',
    'wedding-invitation',
    'aadhi-birthday',
    'chocolate-birthday-invitation',
  ],

  // Public page that renders a saved invitation (relative to site root)
  viewerUrl: 'invitation',

  // Optional: site root if the pages are not served from the site root
  // siteRoot: '/',

  maxImageMB: 10,
  maxAudioMB: 12,
};
