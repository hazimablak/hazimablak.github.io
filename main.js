(function () {
  'use strict';

  var root = document.documentElement;
  var I18N = window.I18N;
  var LANGS = ['tr', 'en', 'ar'];
  var LANG_CODES = { tr: 'TR', en: 'EN', ar: 'AR' };
  var LANG_NAMES = { tr: 'Türkçe', en: 'English', ar: 'العربية' };
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) { /* gizli sekme vb. durumlarda sessizce geç */ }
    return null;
  }

  /* ---------- Dil ---------- */
  var textNodes = $$('[data-i18n]');
  var attrNodes = $$('[data-i18n-attr]');

  function eachAttr(el, fn) {
    el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
      var parts = pair.split(':');
      fn(parts[0].trim(), parts[1].trim());
    });
  }

  // Türkçe sözlük sayfanın kendisinden okunur; metin tek yerde durur.
  textNodes.forEach(function (el) { I18N.tr[el.getAttribute('data-i18n')] = el.textContent; });
  attrNodes.forEach(function (el) {
    eachAttr(el, function (attr, key) { I18N.tr[key] = el.getAttribute(attr); });
  });

  var current = 'tr';
  function t(key) {
    var value = I18N[current][key];
    return value === undefined ? I18N.tr[key] : value;
  }

  function setLang(lang, remember) {
    if (LANGS.indexOf(lang) < 0) lang = 'tr';
    current = lang;
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    textNodes.forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
    attrNodes.forEach(function (el) {
      eachAttr(el, function (attr, key) { el.setAttribute(attr, t(key)); });
    });
    $$('[data-lang]').forEach(function (btn) {
      if (btn.getAttribute('data-lang') === lang) btn.setAttribute('aria-current', 'true');
      else btn.removeAttribute('aria-current');
    });
    $('#lang-current').textContent = LANG_CODES[lang];
    $('#lang-btn').setAttribute('aria-label', t('a11y.lang') + ': ' + LANG_NAMES[lang]);
    startRoles();
    if (remember) store('lang', lang);
  }

  /* ---------- Girişte dönen unvan (yazıp silme) ---------- */
  var roleEl = $('#role');
  var roleTimer = null;

  function startRoles() {
    var roles = t('hero.roles').split('|');
    clearTimeout(roleTimer);
    roleEl.textContent = roles[0];
    if (calm || roles.length < 2) return;

    var index = 0, length = roles[0].length, deleting = true;
    function tick() {
      var word = roles[index];
      var delay;
      if (deleting) {
        length -= 1;
        delay = 35;
        if (length === 0) { deleting = false; index = (index + 1) % roles.length; delay = 350; }
      } else {
        length += 1;
        delay = 70;
        if (length === roles[index].length) { deleting = true; delay = 2200; }
      }
      roleEl.textContent = roles[index].slice(0, length);
      if (word !== roles[index]) roleEl.textContent = '';
      roleTimer = setTimeout(tick, delay);
    }
    roleTimer = setTimeout(tick, 2200);
  }

  /* Dil menüsü: tek düğme, tıklayınca diğer diller açılır */
  var langBox = $('#lang');
  var langBtn = $('#lang-btn');
  var langMenu = $('#lang-menu');
  function setLangMenu(open) {
    langMenu.hidden = !open;
    langBtn.setAttribute('aria-expanded', String(open));
    if (open) { var cur = $('[aria-current="true"]', langMenu); if (cur) cur.focus(); }
  }
  langBtn.addEventListener('click', function () { setLangMenu(langMenu.hidden); });
  document.addEventListener('click', function (e) { if (!langBox.contains(e.target)) setLangMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !langMenu.hidden) { setLangMenu(false); langBtn.focus(); }
  });
  $$('[data-lang]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      setLang(btn.getAttribute('data-lang'), true);
      setLangMenu(false);
      langBtn.focus();
    });
  });
  setLang(root.lang, false); // başlangıç dili <head> içindeki betikte seçildi

  /* ---------- Tema ---------- */
  $('#theme-toggle').addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    store('theme', next);
  });

  /* ---------- Mobil menü ---------- */
  var nav = $('#nav');
  var menuBtn = $('#menu-toggle');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  }
  menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Kaydırma: ilerleme çubuğu ve üst çubuk çizgisi ---------- */
  var header = $('#site-header');
  var bar = $('#progress-bar');
  var ticking = false;
  function onScroll() {
    var max = root.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
    header.classList.toggle('scrolled', window.scrollY > 8);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- Menüde bulunulan bölümü işaretle ---------- */
  var links = {};
  $$('a', nav).forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
  var hasIO = 'IntersectionObserver' in window;
  if (hasIO) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        Object.keys(links).forEach(function (id) { links[id].removeAttribute('aria-current'); });
        links[entry.target.id].setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) spy.observe(section);
    });
  }

  /* ---------- Kaydırınca belirme ve sayı sayma ---------- */
  function countUp(el) {
    var target = Number(el.getAttribute('data-count'));
    if (calm || !target) return;
    var start = null, duration = 1100;
    function step(now) {
      if (start === null) start = now;
      var p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = '0';
    requestAnimationFrame(step);
  }

  var reveals = $$('.reveal');
  // Aynı ızgaradaki kartlar sırayla gelsin
  $$('.grid, .bento, .apps, .stats-grid, .two-col').forEach(function (group) {
    $$('.reveal', group).forEach(function (el, i) { el.style.setProperty('--d', (i % 3) * 0.09 + 's'); });
  });

  if (hasIO) {
    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        $$('[data-count]', entry.target).forEach(countUp);
        seen.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { seen.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Kartlarda fareyi izleyen ışık ---------- */
  if (window.matchMedia('(hover: hover)').matches) {
    $$('.card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- Proje filtresi ve "tümünü göster" ---------- */
  // "Tümü" seçiliyken ilk açılışta görünen proje sayısı: geniş ekranda 3 sütunu,
  // dar ekranda 2 sütunu boşluksuz dolduracak kadar.
  var FIRST = window.matchMedia('(min-width: 981px)').matches ? 7 : 6;
  var filterBtns = $$('[data-filter]');
  var projects = $$('#project-grid .project:not(.more)');
  var showMore = $('#show-more');
  var activeCat = 'all';
  var expanded = projects.length <= FIRST;

  function renderProjects(animate) {
    projects.forEach(function (card, i) {
      var match = activeCat === 'all' || card.getAttribute('data-cat').split(' ').indexOf(activeCat) >= 0;
      var show = match && (expanded || activeCat !== 'all' || i < FIRST);
      var wasHidden = card.hidden;
      card.hidden = !show;
      card.classList.remove('pop');
      if (show && animate && (wasHidden || animate === 'all')) {
        card.classList.add('in');        // henüz görünmemiş kart gizli kalmasın
        void card.offsetWidth;           // animasyonu yeniden başlat
        card.classList.add('pop');
      }
    });
    showMore.hidden = expanded || activeCat !== 'all';
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      activeCat = btn.getAttribute('data-filter');
      filterBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      renderProjects('all');
    });
  });
  $('button', showMore).addEventListener('click', function () {
    expanded = true;
    renderProjects(true);
  });
  renderProjects(false);

  /* ---------- E-posta adresini kopyala ---------- */
  var copyBtn = $('#copy-email');
  copyBtn.addEventListener('click', function () {
    var text = copyBtn.getAttribute('data-copy');
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(function () {
      copyBtn.classList.add('done');
      setTimeout(function () { copyBtn.classList.remove('done'); }, 1800);
    }).catch(function () { /* izin verilmediyse adres zaten görünür durumda */ });
  });

  /* ---------- İletişim formu (Formspree) ---------- */
  var form = $('#contact-form');
  var status = $('#form-status');
  var submit = $('#form-submit');

  function say(key, kind) {
    status.textContent = key ? t(key) : '';
    status.className = 'form-status' + (kind ? ' ' + kind : '');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    submit.disabled = true;
    say('form.sending');
    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    }).then(function (res) {
      if (!res.ok) throw new Error('rejected');
      form.reset();
      say('form.sent', 'ok');
    }).catch(function (err) {
      say(err.message === 'rejected' ? 'form.error' : 'form.network', 'err');
    }).then(function () {
      submit.disabled = false;
    });
  });

  $('#year').textContent = new Date().getFullYear();
})();
