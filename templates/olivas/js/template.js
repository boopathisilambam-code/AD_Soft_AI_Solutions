(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const params = new URLSearchParams(location.search);
  const intro = $('#intro');
  const envelope = $('#envelope');
  const site = $('#site');
  const origin = location.origin;
  const embedded = window.parent !== window && origin !== 'null';
  let base = document.baseURI;
  let data = null;
  let countdownTimer;
  let lightboxIndex = 0;
  let galleryImages = [];

  const setText = (selector, value, root = document) => {
    const node = $(selector, root);
    if (node) node.textContent = value == null ? '' : String(value);
  };
  const safeUrl = (value) => {
    if (!value) return '';
    try {
      const url = new URL(value, base);
      return ['http:', 'https:', 'data:', 'blob:'].includes(url.protocol) ? url.href : '';
    } catch (error) {
      return '';
    }
  };
  const formatDate = (value, options = {}) => {
    if (!value) return '';
    const date = new Date(`${value}T12:00:00`);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-GB', options);
  };
  const html = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };
  const image = (src, alt) => {
    const node = document.createElement('img');
    node.src = safeUrl(src);
    node.alt = alt || '';
    node.loading = 'lazy';
    node.decoding = 'async';
    return node;
  };

  function openInvitation() {
    if (!intro || intro.classList.contains('hidden')) return;
    if (envelope) envelope.classList.add('open');
    setTimeout(() => {
      intro.classList.add('hidden');
      site.classList.add('ready');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 950);
  }

  function renderEvents() {
    const list = $('.events');
    list.replaceChildren();
    (data.events || []).forEach((event) => {
      const article = html('article');
      article.append(image(event.image, event.title));
      const copy = html('div');
      copy.append(
        html('small', '', event.category),
        html('h3', 'script', event.title),
        html('p', '', event.date),
        html('b', '', event.time),
        html('p', '', event.description),
      );
      article.append(copy);
      list.append(article);
    });
  }

  function renderTimeline() {
    const list = $('.timeline');
    list.replaceChildren();
    (data.timeline || []).forEach((event) => {
      const article = html('article');
      article.append(html('time', '', event.time));
      article.append(html('i'));
      const content = html('div');
      content.append(html('h3', '', event.title), html('p', '', event.description));
      article.append(content);
      list.append(article);
    });
  }

  function renderStoryPoints() {
    const list = $('.story-points');
    list.replaceChildren();
    (data.storyPoints || []).forEach((point) => {
      const article = html('article');
      article.append(
        html('b', '', point.number),
        html('h3', '', point.title),
        html('p', '', point.description),
      );
      list.append(article);
    });
  }

  function renderGallery() {
    const list = $('.gallery');
    list.replaceChildren();
    galleryImages = [];
    (data.gallery || []).forEach((photo, index) => {
      const button = html('button', index === 0 ? 'tall' : index === 3 ? 'wide' : '');
      button.type = 'button';
      button.setAttribute('aria-label', `Open photo ${index + 1}`);
      const img = image(photo.src, photo.alt || 'Wedding photo');
      button.append(img);
      button.addEventListener('click', () => showPhoto(index));
      list.append(button);
      galleryImages.push(img);
    });
  }

  function showPhoto(index) {
    if (!galleryImages.length) return;
    lightboxIndex = (index + galleryImages.length) % galleryImages.length;
    $('#large').src = galleryImages[lightboxIndex].src;
    $('#lightbox').classList.add('show');
  }

  function renderCountdown() {
    clearInterval(countdownTimer);
    const tick = () => {
      const target = new Date(`${data.weddingDate}T${data.weddingTime || '09:30'}:00${data.utcOffset || '+05:30'}`).getTime();
      const remaining = target - Date.now();
      if (Number.isNaN(target)) return;
      if (remaining <= 0) {
        ['days', 'hours', 'minutes', 'seconds'].forEach((key) => setText(`#${key}`, '00'));
        setText('#countNote', 'THE BIG DAY IS HERE!');
        clearInterval(countdownTimer);
        return;
      }
      const values = {
        days: Math.floor(remaining / 86400000),
        hours: Math.floor((remaining % 86400000) / 3600000),
        minutes: Math.floor((remaining % 3600000) / 60000),
        seconds: Math.floor((remaining % 60000) / 1000),
      };
      Object.entries(values).forEach(([key, value]) => {
        setText(`#${key}`, String(value).padStart(key === 'days' ? 3 : 2, '0'));
      });
    };
    tick();
    countdownTimer = setInterval(tick, 1000);
  }

  function render() {
    const coupleLine = `${data.groom || ''} & ${data.bride || ''}`;
    const date = formatDate(data.weddingDate, { day: 'numeric', month: 'long', year: 'numeric' });
    const dateCompact = formatDate(data.weddingDate, { day: '2-digit', month: '2-digit', year: 'numeric' })
      .split('/').join(' · ');
    const dateOrdinal = formatDate(data.weddingDate, { day: 'numeric', month: 'long', year: 'numeric' });
    const bindings = {
      ...data,
      coupleLine,
      dateLong: date ? `${date.toUpperCase()} · INDIA` : '',
      dateCompact,
      dateOrdinal,
    };

    $$('[data-bind]').forEach((node) => {
      const value = node.dataset.bind.split('.').reduce((result, part) => result == null ? undefined : result[part], bindings);
      if (value != null) node.textContent = String(value);
    });
    const initialMarqueeDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
      .split('/').join(' · ');
    $$('.marquee span').forEach((node) => {
      if (node.textContent === initialMarqueeDate) node.textContent = dateCompact;
    });

    const heroUrl = safeUrl(data.heroImage);
    $('.photo').style.backgroundImage = heroUrl ? `url("${heroUrl.replace(/"/g, '%22')}")` : 'none';
    const storyUrl = safeUrl(data.storyImage);
    const storyPhoto = $('.story img');
    if (storyUrl) storyPhoto.src = storyUrl;
    else storyPhoto.removeAttribute('src');

    const primary = /^#[\da-f]{6}$/i.test(data.primaryColor || '') ? data.primaryColor : '#a9435b';
    const accent = /^#[\da-f]{6}$/i.test(data.accentColor || '') ? data.accentColor : '#b88a43';
    document.documentElement.style.setProperty('--rose', primary);
    document.documentElement.style.setProperty('--gold', accent);

    renderEvents();
    renderTimeline();
    renderStoryPoints();
    renderGallery();

    const mapQuery = data.mapQuery || `${data.venueName || ''} ${data.venueAddress || ''}`.trim();
    const encodedQuery = encodeURIComponent(mapQuery);
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;
    const mapFrame = $('.map');
    mapFrame.src = `https://www.google.com/maps?q=${encodedQuery}&output=embed`;
    $('[data-map-link]').href = mapUrl;
    $('#rsvp').hidden = data.rsvpEnabled === false;

    const audio = $('#audio');
    const musicUrl = safeUrl(data.music && data.music.url);
    if (musicUrl) audio.src = musicUrl;
    else {
      audio.pause();
      audio.removeAttribute('src');
    }
    renderCountdown();
  }

  function send(message) {
    if (embedded) window.parent.postMessage(message, origin);
  }

  window.addEventListener('message', (event) => {
    if (!embedded || event.source !== window.parent || event.origin !== origin) return;
    const message = event.data || {};
    if (message.type === 'inv:data' && message.data) {
      if (message.base) base = message.base;
      data = message.data;
      render();
    } else if (message.type === 'inv:open') {
      openInvitation();                            /* editor preview: open the card without waiting for a tap */
    } else if (message.type === 'inv:scrollTo' && typeof message.selector === 'string') {
      const go = () => { const t = $(message.selector); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
      if (intro && !intro.classList.contains('hidden')) { openInvitation(); setTimeout(go, 1100); } else go();
    } else if (message.type === 'inv:rsvp:result') {
      const button = $('#rsvpForm button[type="submit"]');
      button.disabled = false;
      button.textContent = 'SEND YOUR RSVP ↗';
      if (message.ok) {
        setText('#success', 'Thank you! Your RSVP has been received. ♡');
        $('#success').classList.add('show');
        $('#rsvpForm').reset();
      } else {
        setText('#success', message.error || 'Your RSVP could not be sent. Please try again.');
        $('#success').classList.add('show');
      }
    }
  });

  $('#open').addEventListener('click', openInvitation);
  $('#skip').addEventListener('click', openInvitation);
  if (params.get('skip') === '1') openInvitation();

  $('#rsvpForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const button = $('button[type="submit"]', form);
    const payload = Object.fromEntries(new FormData(form).entries());
    button.disabled = true;
    button.textContent = 'SENDING…';
    if (embedded) {
      send({ type: 'inv:rsvp', id: `${Date.now()}-${Math.random()}`, payload });
    } else {
      setText('#success', `Thank you, ${payload.name}! Your response has been noted. ♡`);
      $('#success').classList.add('show');
      button.disabled = false;
      button.textContent = 'SEND YOUR RSVP ↗';
      form.reset();
    }
  });

  const lightbox = $('#lightbox');
  $('#close').addEventListener('click', () => lightbox.classList.remove('show'));
  $('#prev').addEventListener('click', () => showPhoto(lightboxIndex - 1));
  $('#next').addEventListener('click', () => showPhoto(lightboxIndex + 1));
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) lightbox.classList.remove('show');
  });
  document.addEventListener('keydown', (event) => {
    if (!lightbox.classList.contains('show')) return;
    if (event.key === 'Escape') lightbox.classList.remove('show');
    if (event.key === 'ArrowLeft') showPhoto(lightboxIndex - 1);
    if (event.key === 'ArrowRight') showPhoto(lightboxIndex + 1);
  });

  const audio = $('#audio');
  $('#music').addEventListener('click', async () => {
    if (!audio.src) return;
    try {
      if (audio.paused) await audio.play();
      else audio.pause();
      $('#music').style.transform = audio.paused ? '' : 'rotate(25deg)';
    } catch (error) {
      setText('#countNote', 'Music could not be played. Please try another audio file.');
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  $$('.reveal').forEach((node) => observer.observe(node));

  const petals = $('#petals');
  setInterval(() => {
    if (document.hidden || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const petal = html('i', 'petal');
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.setProperty('--drift', `${Math.random() * 180 - 90}px`);
    petal.style.animationDuration = `${7 + Math.random() * 8}s`;
    petals.append(petal);
    setTimeout(() => petal.remove(), 16000);
  }, 550);

  send({ type: 'inv:ready' });
})();
