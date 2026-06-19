/**
 * HashmiTools.com — Theme Manager v3.0
 * ─────────────────────────────────────
 * Supports:
 *   • Mode:   light | dark  (default: light)
 *   • Accent: purple | blue | orange | green | pink | yellow  (default: purple)
 *
 * Storage keys: hashmi_mode, hashmi_accent
 * HTML attributes: data-mode="light|dark"  data-accent="purple|blue|..."
 *
 * Usage:
 *   HashmiTheme.setMode('dark')
 *   HashmiTheme.setAccent('blue')
 *   HashmiTheme.toggle()          — toggles mode
 *   HashmiTheme.openPicker()      — opens the picker panel
 *
 * Anti-flash: apply runs synchronously before first paint (inline in <head>)
 */
(function () {
  'use strict';

  /* ─── CONSTANTS ─────────────────────────────────────────────── */
  var MODE_KEY   = 'hashmi_mode';
  var ACCENT_KEY = 'hashmi_accent';
  var DEFAULT_MODE   = 'light';
  var DEFAULT_ACCENT = 'purple';

  var ACCENTS = {
    purple: { name: 'Default Purple', h: '248',  s: '83%', primary: '#6366f1', dark: '#4f46e5'  },
    blue:   { name: 'Ocean Blue',     h: '211',  s: '85%', primary: '#0ea5e9', dark: '#0284c7'  },
    orange: { name: 'Sunset Orange',  h: '25',   s: '95%', primary: '#f97316', dark: '#ea6c08'  },
    green:  { name: 'Forest Green',   h: '141',  s: '69%', primary: '#22c55e', dark: '#16a34a'  },
    pink:   { name: 'Berry Pink',     h: '330',  s: '81%', primary: '#ec4899', dark: '#db2777'  },
    yellow: { name: 'Golden Yellow',  h: '43',   s: '96%', primary: '#eab308', dark: '#ca8a04'  },
  };

  /* ─── STORAGE ────────────────────────────────────────────────── */
  function store(key, val) {
    try { localStorage.setItem(key, val); } catch(e) {}
  }
  function load(key) {
    try { return localStorage.getItem(key); } catch(e) { return null; }
  }

  /* ─── APPLY ──────────────────────────────────────────────────── */
  function applyMode(mode) {
    var m = (mode === 'dark') ? 'dark' : 'light';
    document.documentElement.setAttribute('data-mode', m);
    // backward compat: many pages use data-theme
    document.documentElement.setAttribute('data-theme', m);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', m === 'dark' ? '#0a0e1a' : '#ffffff');
    return m;
  }

  function applyAccent(accent) {
    var a = ACCENTS[accent] ? accent : DEFAULT_ACCENT;
    var ac = ACCENTS[a];
    document.documentElement.setAttribute('data-accent', a);

    // Inject dynamic CSS variables
    var id = 'ht-accent-vars';
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement('style');
      el.id = id;
      // prepend to head so it can be overridden by later sheets if needed
      var head = document.head || document.getElementsByTagName('head')[0];
      head.insertBefore(el, head.firstChild);
    }
    // Light mode accent vars
    var lv = [
      '--accent:' + ac.primary,
      '--accent-primary:' + ac.primary,
      '--accent-hover:' + ac.dark,
      '--accent-rgb:' + hexToRgb(ac.primary),
      '--gradient-main:linear-gradient(135deg,' + ac.primary + ',' + ac.dark + ')',
      '--accent-purple:' + ac.primary,   // alias used by older pages
      '--accent-cyan:' + ac.primary,
      '--accent-blue:' + ac.primary,
    ].join(';');
    // Dark mode accent — slightly brighter
    var dv = [
      '--accent:' + ac.primary,
      '--accent-primary:' + ac.primary,
      '--accent-hover:' + ac.dark,
      '--accent-rgb:' + hexToRgb(ac.primary),
      '--gradient-main:linear-gradient(135deg,' + ac.primary + ',' + ac.dark + ')',
      '--accent-purple:' + ac.primary,
      '--accent-cyan:' + ac.primary,
      '--accent-blue:' + ac.primary,
    ].join(';');

    el.textContent =
      ':root {' + lv + '}' +
      '[data-mode="light"] {' + lv + '}' +
      '[data-mode="dark"] {' + dv + '}' +
      '[data-theme="light"] {' + lv + '}' +
      '[data-theme="dark"] {' + dv + '}';
    return a;
  }

  function hexToRgb(hex) {
    var r = parseInt(hex.slice(1,3),16);
    var g = parseInt(hex.slice(3,5),16);
    var b = parseInt(hex.slice(5,7),16);
    return r + ',' + g + ',' + b;
  }

  /* ─── PICKER UI ──────────────────────────────────────────────── */
  function buildPicker() {
    if (document.getElementById('ht-theme-picker')) return;

    var overlay = document.createElement('div');
    overlay.id = 'ht-theme-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Theme picker');
    overlay.style.cssText = 'display:none;position:fixed;inset:0;z-index:99998;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px)';
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closePicker();
    });

    var panel = document.createElement('div');
    panel.id = 'ht-theme-picker';
    panel.style.cssText = [
      'position:fixed',
      'top:50%', 'left:50%',
      'transform:translate(-50%,-50%)',
      'z-index:99999',
      'background:var(--bg-card,#1e293b)',
      'border:1px solid var(--border-glass,rgba(255,255,255,0.1))',
      'border-radius:16px',
      'padding:24px',
      'width:min(340px,94vw)',
      'box-shadow:0 24px 60px rgba(0,0,0,0.4)',
      'font-family:inherit',
      'color:var(--text-primary,#f1f5f9)',
    ].join(';');

    var accentSwatches = Object.entries(ACCENTS).map(function(kv) {
      var key = kv[0], ac = kv[1];
      return '<button class="ht-swatch" data-accent="' + key + '" ' +
        'title="' + ac.name + '" ' +
        'aria-label="' + ac.name + '" ' +
        'style="background:' + ac.primary + ';width:34px;height:34px;border-radius:50%;border:3px solid transparent;cursor:pointer;transition:transform 0.15s,border-color 0.15s;flex-shrink:0" ' +
        '></button>';
    }).join('');

    panel.innerHTML = [
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">',
        '<span style="font-size:1.05rem;font-weight:700">🎨 Theme Settings</span>',
        '<button id="ht-picker-close" aria-label="Close" style="background:none;border:none;color:var(--text-muted,#94a3b8);font-size:1.4rem;cursor:pointer;line-height:1;padding:0">&times;</button>',
      '</div>',

      '<!-- MODE -->',
      '<div style="margin-bottom:20px">',
        '<p style="font-size:0.8rem;font-weight:600;color:var(--text-muted,#94a3b8);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.05em">Display Mode</p>',
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">',
          '<button class="ht-mode-btn" data-mode="light" style="padding:10px 0;border-radius:10px;border:2px solid transparent;cursor:pointer;font-size:0.9rem;font-weight:600;transition:all 0.15s">☀️ Light</button>',
          '<button class="ht-mode-btn" data-mode="dark" style="padding:10px 0;border-radius:10px;border:2px solid transparent;cursor:pointer;font-size:0.9rem;font-weight:600;transition:all 0.15s">🌙 Dark</button>',
        '</div>',
      '</div>',

      '<!-- ACCENT -->',
      '<div>',
        '<p style="font-size:0.8rem;font-weight:600;color:var(--text-muted,#94a3b8);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.05em">Accent Color</p>',
        '<div style="display:flex;gap:10px;flex-wrap:wrap">' + accentSwatches + '</div>',
        '<p id="ht-accent-name" style="margin-top:10px;font-size:0.85rem;color:var(--text-muted,#94a3b8);min-height:1.2em"></p>',
      '</div>',
    ].join('');

    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    // Close button
    document.getElementById('ht-picker-close').addEventListener('click', closePicker);

    // Mode buttons
    panel.querySelectorAll('.ht-mode-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var m = this.getAttribute('data-mode');
        setMode(m);
        updatePickerState();
      }.bind(btn));
    });

    // Swatch buttons
    panel.querySelectorAll('.ht-swatch').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var a = this.getAttribute('data-accent');
        setAccent(a);
        updatePickerState();
      }.bind(btn));
    });

    // Keyboard close
    overlay.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closePicker();
    });

    updatePickerState();
  }

  function updatePickerState() {
    var overlay = document.getElementById('ht-theme-overlay');
    if (!overlay) return;
    var currentMode   = load(MODE_KEY)   || DEFAULT_MODE;
    var currentAccent = load(ACCENT_KEY) || DEFAULT_ACCENT;

    // Mode buttons
    overlay.querySelectorAll('.ht-mode-btn').forEach(function(btn) {
      var isActive = btn.getAttribute('data-mode') === currentMode;
      btn.style.background = isActive
        ? 'var(--accent,' + ACCENTS[currentAccent].primary + ')'
        : 'var(--bg-secondary,rgba(255,255,255,0.06))';
      btn.style.color      = isActive
        ? '#fff'
        : 'var(--text-primary,#f1f5f9)';
      btn.style.borderColor = isActive
        ? 'var(--accent,' + ACCENTS[currentAccent].primary + ')'
        : 'var(--border-glass,rgba(255,255,255,0.1))';
    });

    // Swatches
    overlay.querySelectorAll('.ht-swatch').forEach(function(btn) {
      var isActive = btn.getAttribute('data-accent') === currentAccent;
      btn.style.borderColor = isActive ? '#fff' : 'transparent';
      btn.style.transform   = isActive ? 'scale(1.18)' : 'scale(1)';
      btn.style.boxShadow   = isActive ? '0 0 0 2px ' + ACCENTS[currentAccent].primary : 'none';
    });

    // Accent name label
    var label = document.getElementById('ht-accent-name');
    if (label) {
      label.textContent = ACCENTS[currentAccent]
        ? '✔ ' + ACCENTS[currentAccent].name
        : '';
    }
  }

  function openPicker() {
    buildPicker();
    var overlay = document.getElementById('ht-theme-overlay');
    if (overlay) {
      overlay.style.display = 'block';
      updatePickerState();
      // Focus close btn for a11y
      var closeBtn = document.getElementById('ht-picker-close');
      if (closeBtn) setTimeout(function() { closeBtn.focus(); }, 50);
    }
  }

  function closePicker() {
    var overlay = document.getElementById('ht-theme-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  /* ─── UPDATE ALL PICKER BUTTONS IN NAVBAR ────────────────────── */
  function updateNavBtns(mode) {
    var selectors = [
      '#themeToggle', '#themeIcon', '.theme-toggle', '.theme-toggle-btn',
      '[data-theme-toggle]', '.theme-btn', '.ht-theme-btn'
    ];
    document.querySelectorAll(selectors.join(',')).forEach(function(el) {
      var icon = el.querySelector('i, [class*="fa-"]') || (el.tagName === 'I' ? el : null);
      if (icon) {
        if (mode === 'dark') {
          icon.className = icon.className
            .replace('fa-moon','').replace('fa-sun','')
            .trim() + ' fas fa-sun';
        } else {
          icon.className = icon.className
            .replace('fa-moon','').replace('fa-sun','')
            .trim() + ' fas fa-moon';
        }
      }
      el.setAttribute('aria-label', mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
      el.setAttribute('title',      mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    });
  }

  /* ─── PUBLIC API ─────────────────────────────────────────────── */
  function setMode(mode) {
    var m = applyMode(mode);
    store(MODE_KEY, m);
    updateNavBtns(m);
    updatePickerState();
    return m;
  }

  function setAccent(accent) {
    var a = applyAccent(accent);
    store(ACCENT_KEY, a);
    updatePickerState();
    return a;
  }

  function toggleMode() {
    var current = load(MODE_KEY) || DEFAULT_MODE;
    return setMode(current === 'dark' ? 'light' : 'dark');
  }

  /* ─── LEGACY COMPAT ──────────────────────────────────────────── */
  // Old pages call window.toggleTheme() — keep working
  window.toggleTheme = function() { toggleMode(); };
  // Some pages pass a specific theme string
  window.setTheme    = function(t) { setMode(t); };

  /* ─── INIT — runs BEFORE first paint ─────────────────────────── */
  var savedMode   = load(MODE_KEY)   || DEFAULT_MODE;
  var savedAccent = load(ACCENT_KEY) || DEFAULT_ACCENT;

  // Apply synchronously (prevents flash of wrong theme/color)
  applyMode(savedMode);
  applyAccent(savedAccent);

  /* ─── DOM-READY: inject theme picker button + bind events ─────── */
  function onReady() {
    updateNavBtns(load(MODE_KEY) || DEFAULT_MODE);

    // Inject theme-picker button into navbars that don't have one yet
    injectThemePickerBtn();

    // Bind legacy theme-toggle buttons to toggle mode
    document.addEventListener('click', function(e) {
      var btn = e.target.closest(
        '#themeToggle, .theme-toggle, .theme-toggle-btn, [data-theme-toggle], .theme-btn'
      );
      if (btn && !btn.classList.contains('ht-theme-btn')) {
        e.preventDefault();
        toggleMode();
      }
      // Picker open button
      if (e.target.closest('.ht-theme-btn, [data-open-theme-picker]')) {
        e.preventDefault();
        openPicker();
      }
    });

    // Keyboard shortcut Alt+T = toggle mode, Alt+P = open picker
    document.addEventListener('keydown', function(e) {
      if (e.altKey && e.key === 't') { e.preventDefault(); toggleMode(); }
      if (e.altKey && e.key === 'p') { e.preventDefault(); openPicker(); }
    });
  }

  function injectThemePickerBtn() {
    // If a .ht-theme-btn already exists anywhere, skip
    if (document.querySelector('.ht-theme-btn')) return;

    // Find a nav-actions / nav-right container or the navbar itself
    var containers = [
      document.querySelector('.nav-actions'),
      document.querySelector('.navbar-right'),
      document.querySelector('.nav-controls'),
      document.querySelector('.nav-inner'),
      document.querySelector('.navbar'),
      document.querySelector('nav'),
    ];

    var host = null;
    for (var i = 0; i < containers.length; i++) {
      if (containers[i]) { host = containers[i]; break; }
    }
    if (!host) return;

    var btn = document.createElement('button');
    btn.className = 'ht-theme-btn';
    btn.setAttribute('aria-label', 'Theme settings');
    btn.setAttribute('title', 'Theme settings');
    btn.setAttribute('data-open-theme-picker', '');
    btn.style.cssText = [
      'display:inline-flex',
      'align-items:center',
      'justify-content:center',
      'gap:5px',
      'background:var(--bg-card,rgba(255,255,255,0.08))',
      'border:1px solid var(--border-glass,rgba(255,255,255,0.12))',
      'color:var(--text-primary,#f1f5f9)',
      'border-radius:8px',
      'padding:6px 10px',
      'cursor:pointer',
      'font-size:0.85rem',
      'font-weight:600',
      'transition:all 0.2s',
      'white-space:nowrap',
      'flex-shrink:0',
    ].join(';');
    btn.innerHTML = '🎨 <span style="font-size:0.8rem">Theme</span>';

    // Add hover effect via JS (can't use stylesheet here easily)
    btn.addEventListener('mouseenter', function() {
      btn.style.background = 'var(--accent,' + ACCENTS[savedAccent].primary + ')';
      btn.style.color = '#fff';
    });
    btn.addEventListener('mouseleave', function() {
      btn.style.background = 'var(--bg-card,rgba(255,255,255,0.08))';
      btn.style.color = 'var(--text-primary,#f1f5f9)';
    });

    // Insert BEFORE the existing theme toggle if present, else append
    var existingToggle = host.querySelector(
      '#themeToggle, .theme-toggle, .theme-toggle-btn, [data-theme-toggle], .theme-btn'
    );
    if (existingToggle) {
      host.insertBefore(btn, existingToggle);
    } else {
      host.appendChild(btn);
    }
  }

  /* ─── RUN ────────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }

  /* ─── EXPOSE GLOBAL API ──────────────────────────────────────── */
  window.HashmiTheme = {
    setMode:     setMode,
    setAccent:   setAccent,
    toggle:      toggleMode,
    openPicker:  openPicker,
    closePicker: closePicker,
    get mode()   { return load(MODE_KEY)   || DEFAULT_MODE; },
    get accent() { return load(ACCENT_KEY) || DEFAULT_ACCENT; },
    accents:     ACCENTS,
  };

})();
