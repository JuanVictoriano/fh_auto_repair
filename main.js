/* ==========================================================================
   F&H Auto Repair — main.js
   Three jobs: mobile nav, hero slideshow, and the live shop-status readout.
   No dependencies.
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     SHOP HOURS — single source of truth.
     Edit here and both the readout and the Contact page hours update.
     Values are 24h decimal, in Brooklyn local time. null = closed.
     ------------------------------------------------------------------ */
  var HOURS = {
    0: null,              // Sunday — closed
    1: [9, 18],           // Monday
    2: [9, 18],
    3: [9, 18],
    4: [9, 18],
    5: [9, 18],           // Friday
    6: [9, 17]            // Saturday
  };

  var DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  /* ------------------------------------------------------------------
     Brooklyn time, regardless of where the visitor's device is set.
     ------------------------------------------------------------------ */
  function shopNow() {
    var parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false
    }).formatToParts(new Date());

    var lookup = {};
    parts.forEach(function (p) { lookup[p.type] = p.value; });

    var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    var hour = parseInt(lookup.hour, 10) % 24;

    return {
      day: days[lookup.weekday],
      decimal: hour + parseInt(lookup.minute, 10) / 60
    };
  }

  function label(decimal) {
    var h = Math.floor(decimal);
    var m = Math.round((decimal - h) * 60);
    var suffix = h >= 12 ? 'PM' : 'AM';
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ':' + (m < 10 ? '0' + m : m) + ' ' + suffix;
  }

  function nextOpenDay(from) {
    for (var i = 1; i <= 7; i++) {
      var d = (from + i) % 7;
      if (HOURS[d]) return { day: d, opens: HOURS[d][0], tomorrow: i === 1 };
    }
    return null;
  }

  function renderStatus() {
    var host = document.querySelector('[data-status]');
    if (!host) return;

    var now = shopNow();
    var today = HOURS[now.day];
    var text, open = false;

    if (today && now.decimal >= today[0] && now.decimal < today[1]) {
      open = true;
      text = 'Open now — closes ' + label(today[1]);
    } else if (today && now.decimal < today[0]) {
      text = 'Closed — opens ' + label(today[0]) + ' today';
    } else {
      var next = nextOpenDay(now.day);
      text = next
        ? 'Closed — opens ' + label(next.opens) + ' ' +
          (next.tomorrow ? 'tomorrow' : DAY_NAMES[next.day])
        : 'Closed';
    }

    host.className = 'readout__value status ' + (open ? 'status--open' : 'status--closed');
    host.innerHTML = '<span class="status__dot" aria-hidden="true"></span><span>' + text + '</span>';
  }

  /* Highlight today's line on the Contact page hours list. */
  function markToday() {
    var list = document.querySelector('[data-hours]');
    if (!list) return;
    var today = shopNow().day;
    var row = list.querySelector('[data-day="' + today + '"]');
    if (row) {
      row.classList.add('is-today');
      var day = row.querySelector('.hours__day');
      if (day) day.setAttribute('aria-current', 'date');
    }
  }

  /* ------------------------------------------------------------------
     Mobile navigation
     ------------------------------------------------------------------ */
  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  /* ------------------------------------------------------------------
     Hero slideshow
     ------------------------------------------------------------------ */
  function initSlideshow() {
    var root = document.querySelector('[data-slideshow]');
    if (!root) return;

    var slides = Array.prototype.slice.call(root.querySelectorAll('.slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-dot]'));
    var caption = document.querySelector('[data-caption]');
    var prev = document.querySelector('[data-prev]');
    var next = document.querySelector('[data-next]');
    if (slides.length < 2) return;

    var index = 0;
    var timer = null;
    var INTERVAL = 6500;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) { s.classList.toggle('is-active', n === index); });
      dots.forEach(function (d, n) { d.setAttribute('aria-current', String(n === index)); });
      if (caption) caption.textContent = slides[index].getAttribute('data-label') || '';
    }

    function start() {
      if (reduced) return;
      stop();
      timer = window.setInterval(function () { show(index + 1); }, INTERVAL);
    }
    function stop() { if (timer) { window.clearInterval(timer); timer = null; } }

    dots.forEach(function (dot, n) {
      dot.addEventListener('click', function () { show(n); start(); });
    });
    if (prev) prev.addEventListener('click', function () { show(index - 1); start(); });
    if (next) next.addEventListener('click', function () { show(index + 1); start(); });

    var hero = root.closest('.hero');
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    hero.addEventListener('focusin', stop);

    document.addEventListener('visibilitychange', function () {
      document.hidden ? stop() : start();
    });

    hero.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { show(index - 1); start(); }
      if (e.key === 'ArrowRight') { show(index + 1); start(); }
    });

    show(0);
    start();
  }

  /* Stamp the current year into the footer. */
  function initYear() {
    var el = document.querySelector('[data-year]');
    if (el) el.textContent = new Date().getFullYear();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initSlideshow();
    renderStatus();
    markToday();
    initYear();
    window.setInterval(renderStatus, 60000);
  });
})();
