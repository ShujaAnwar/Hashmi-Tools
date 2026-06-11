/**
 * HashmiTools.com — Theme Manager v2.0
 * Light Mode Default | Dark Mode Toggle
 * Persists preference via localStorage
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'hashmi-theme';
  const DEFAULT_THEME = 'light';

  /* ---- Apply theme before paint (prevents flash) ---- */
  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function setStoredTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      // ignore
    }
  }

  function applyTheme(theme) {
    const validTheme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', validTheme);
    // Also set on body for compatibility
    document.body && document.body.setAttribute('data-theme', validTheme);

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', validTheme === 'dark' ? '#0a0e1a' : '#ffffff');
    }
  }

  function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || DEFAULT_THEME;
  }

  function toggleTheme() {
    const current = getCurrentTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setStoredTheme(next);
    updateToggleButtons(next);
    return next;
  }

  function updateToggleButtons(theme) {
    // Handle all theme toggle buttons across the page
    const buttons = document.querySelectorAll(
      '#themeToggle, .theme-toggle, .theme-toggle-btn, [data-theme-toggle]'
    );

    buttons.forEach(function (btn) {
      const icon = btn.querySelector('i, .theme-icon, [class*="fa-"]');
      const label = btn.querySelector('.theme-label');

      if (icon) {
        if (theme === 'dark') {
          icon.className = icon.className.replace('fa-moon', 'fa-sun');
          // Handle if fa classes aren't present
          if (!icon.className.includes('fa-')) {
            icon.textContent = '☀️';
          }
        } else {
          icon.className = icon.className.replace('fa-sun', 'fa-moon');
          if (!icon.className.includes('fa-')) {
            icon.textContent = '🌙';
          }
        }
      }

      if (label) {
        label.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
      }

      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
      btn.setAttribute('title', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    });
  }

  /* ---- Initialize ---- */
  function init() {
    // Determine theme
    const stored = getStoredTheme();
    const theme = stored || DEFAULT_THEME;

    // Apply immediately
    applyTheme(theme);

    // Wait for DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        bindButtons(theme);
      });
    } else {
      bindButtons(theme);
    }
  }

  function bindButtons(initialTheme) {
    updateToggleButtons(initialTheme);

    // Bind click events to all toggle buttons
    document.addEventListener('click', function (e) {
      const btn = e.target.closest(
        '#themeToggle, .theme-toggle, .theme-toggle-btn, [data-theme-toggle]'
      );
      if (btn) {
        e.preventDefault();
        toggleTheme();
      }
    });

    // Keyboard shortcut: Alt+T to toggle theme
    document.addEventListener('keydown', function (e) {
      if (e.altKey && e.key === 't') {
        e.preventDefault();
        toggleTheme();
      }
    });
  }

  /* ---- Run immediately (before DOM ready for flash prevention) ---- */
  const savedTheme = getStoredTheme();
  if (savedTheme) {
    applyTheme(savedTheme);
  } else {
    applyTheme(DEFAULT_THEME);
  }

  // Expose API globally
  window.HashmiTheme = {
    toggle: toggleTheme,
    get: getCurrentTheme,
    set: function (theme) {
      applyTheme(theme);
      setStoredTheme(theme);
      updateToggleButtons(theme);
    }
  };

  // Initialize binding
  init();

})();
