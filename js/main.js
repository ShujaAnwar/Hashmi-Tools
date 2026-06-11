/* ============================================
   HashmiTools.com — Main JavaScript
   Animations | Search | Interactivity | Utils
   ============================================ */

'use strict';

// ============================================
// PRELOADER
// ============================================
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    setTimeout(() => {
      preloader.classList.add('hide');
    }, 1500);
  }
  initAll();
});

function initAll() {
  initNavbar();
  initSearch();
  initTheme();
  initHeroCanvas();
  initScrollAnimations();
  initCounters();
  initFAQ();
  initScrollTop();
  initHamburger();
  initCookieBanner();
  initHeroSearch();
}

// ============================================
// NAVBAR
// ============================================
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

// ============================================
// HAMBURGER MENU
// ============================================
function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const spans = hamburger.querySelectorAll('span');
    if (navLinks.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
    }
  });
}

// ============================================
// THEME TOGGLE — Light Mode Default
// ============================================
function initTheme() {
  // Theme is already applied by assets/js/theme.js
  // Just sync the icon on DOM ready
  const icon = document.getElementById('themeIcon');
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  updateThemeIcon(current, icon);
}

function updateThemeIcon(theme, icon) {
  if (!icon) return;
  icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// ============================================
// SEARCH OVERLAY
// ============================================
const toolsData = [
  { name: 'Zakat Calculator', url: 'tools/zakat-calculator.html', cat: 'Islamic', icon: '🕌' },
  { name: 'Prayer Times', url: 'tools/prayer-times.html', cat: 'Islamic', icon: '🕐' },
  { name: 'Islamic Inheritance Calculator', url: 'tools/inheritance-calculator.html', cat: 'Islamic', icon: '⚖️' },
  { name: 'Hijri Gregorian Converter', url: 'tools/hijri-converter.html', cat: 'Islamic', icon: '📅' },
  { name: 'Qurbani Share Calculator', url: 'tools/qurbani-calculator.html', cat: 'Islamic', icon: '🐑' },
  { name: 'EMI Calculator', url: 'tools/emi-calculator.html', cat: 'Finance', icon: '💰' },
  { name: 'Mortgage Calculator', url: 'tools/mortgage-calculator.html', cat: 'Finance', icon: '🏠' },
  { name: 'Pakistan Tax Calculator', url: 'tools/pakistan-tax.html', cat: 'Finance', icon: '🇵🇰' },
  { name: 'Currency Converter', url: 'tools/currency-converter.html', cat: 'Finance', icon: '💱' },
  { name: 'Compound Interest Calculator', url: 'tools/compound-interest.html', cat: 'Finance', icon: '📈' },
  { name: 'SIP Investment Calculator', url: 'tools/sip-calculator.html', cat: 'Finance', icon: '💹' },
  { name: 'BMI Calculator', url: 'tools/bmi-calculator.html', cat: 'Health', icon: '❤️' },
  { name: 'Calorie Calculator', url: 'tools/calorie-calculator.html', cat: 'Health', icon: '🥗' },
  { name: 'Water Intake Calculator', url: 'tools/water-calculator.html', cat: 'Health', icon: '💧' },
  { name: 'Age Calculator', url: 'tools/age-calculator.html', cat: 'Health', icon: '🎂' },
  { name: 'Ideal Weight Calculator', url: 'tools/ideal-weight.html', cat: 'Health', icon: '⚖️' },
  { name: 'JSON Formatter', url: 'tools/json-formatter.html', cat: 'Developer', icon: '{ }' },
  { name: 'QR Code Generator', url: 'tools/qr-generator.html', cat: 'Developer', icon: '▦' },
  { name: 'Password Generator', url: 'tools/password-generator.html', cat: 'Developer', icon: '🔐' },
  { name: 'HEX to RGB Converter', url: 'tools/hex-rgb.html', cat: 'Developer', icon: '🎨' },
  { name: 'URL Encoder / Decoder', url: 'tools/url-encoder.html', cat: 'Developer', icon: '🔗' },
  { name: 'Base64 Encoder / Decoder', url: 'tools/base64.html', cat: 'Developer', icon: '64' },
  { name: 'PDF Merge', url: 'tools/pdf-merge.html', cat: 'PDF', icon: '📄' },
  { name: 'PDF Split', url: 'tools/pdf-split.html', cat: 'PDF', icon: '✂️' },
  { name: 'PDF Compress', url: 'tools/pdf-compress.html', cat: 'PDF', icon: '🗜️' },
  { name: 'JPG to PDF', url: 'tools/jpg-to-pdf.html', cat: 'PDF', icon: '🖼️' },
  { name: 'AI Hashtag Generator', url: 'tools/ai-hashtag.html', cat: 'AI', icon: '#️⃣' },
  { name: 'AI Blog Title Generator', url: 'tools/ai-blog-title.html', cat: 'AI', icon: '📝' },
  { name: 'AI Text Humanizer', url: 'tools/ai-humanizer.html', cat: 'AI', icon: '🤖' },
  { name: 'AI Caption Generator', url: 'tools/ai-caption.html', cat: 'AI', icon: '💬' },
  { name: 'AI Resume Summary', url: 'tools/ai-resume.html', cat: 'AI', icon: '📋' },
  { name: 'Word Counter', url: 'tools/word-counter.html', cat: 'Productivity', icon: '📊' },
  { name: 'Pomodoro Timer', url: 'tools/pomodoro.html', cat: 'Productivity', icon: '⏱️' },
  { name: 'Unit Converter', url: 'tools/unit-converter.html', cat: 'Productivity', icon: '🔄' },
];

function initSearch() {
  const navSearchBtn = document.getElementById('navSearchBtn');
  const searchOverlay = document.getElementById('searchOverlay');
  const searchClose = document.getElementById('searchClose');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');

  if (!navSearchBtn || !searchOverlay) return;

  navSearchBtn.addEventListener('click', () => {
    searchOverlay.classList.add('active');
    setTimeout(() => searchInput && searchInput.focus(), 100);
  });

  if (searchClose) searchClose.addEventListener('click', closeSearch);
  searchOverlay.addEventListener('click', (e) => { if (e.target === searchOverlay) closeSearch(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSearch(); });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (!searchResults) return;
      if (!q) { searchResults.innerHTML = ''; return; }
      
      const results = toolsData.filter(t =>
        t.name.toLowerCase().includes(q) || t.cat.toLowerCase().includes(q)
      ).slice(0, 8);

      if (!results.length) {
        searchResults.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:0.875rem;">No tools found. Try another keyword.</div>';
        return;
      }

      searchResults.innerHTML = results.map(r => `
        <a href="${r.url}" class="search-result-item">
          <span style="font-size:1.3rem;width:32px;text-align:center;">${r.icon}</span>
          <div>
            <div style="font-size:0.9rem;font-weight:600;">${r.name}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);">${r.cat} Tools</div>
          </div>
        </a>
      `).join('');
    });
  }
}

function closeSearch() {
  const overlay = document.getElementById('searchOverlay');
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');
  if (overlay) overlay.classList.remove('active');
  if (input) input.value = '';
  if (results) results.innerHTML = '';
}

// ============================================
// HERO SEARCH
// ============================================
function initHeroSearch() {
  const input = document.getElementById('heroSearch');
  if (!input) return;

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') performHeroSearch();
  });
}

function performHeroSearch() {
  const input = document.getElementById('heroSearch');
  if (!input) return;
  const q = input.value.toLowerCase().trim();
  if (!q) return;

  const found = toolsData.find(t => t.name.toLowerCase().includes(q));
  if (found) {
    window.location.href = found.url;
  } else {
    // Open search overlay with the query
    const overlay = document.getElementById('searchOverlay');
    const searchInput = document.getElementById('searchInput');
    if (overlay && searchInput) {
      overlay.classList.add('active');
      searchInput.value = q;
      searchInput.dispatchEvent(new Event('input'));
    }
  }
}

// ============================================
// HERO CANVAS (Particle Animation)
// ============================================
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.1,
      color: Math.random() > 0.5 ? '#6366f1' : '#06b6d4',
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: 80 }, createParticle);
  }

  function drawLine(p1, p2, dist) {
    const alpha = 1 - dist / 120;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = `rgba(99,102,241,${alpha * 0.15})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, i) => {
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
      if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Connect nearby particles
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (dist < 120) drawLine(p, p2, dist);
      }
    });

    animId = requestAnimationFrame(animate);
  }

  init();
  animate();
  window.addEventListener('resize', () => { resize(); });
}

// ============================================
// SCROLL ANIMATIONS (Intersection Observer)
// ============================================
function initScrollAnimations() {
  const reveals = document.querySelectorAll('.category-card, .tool-card, .why-card, .blog-card, .featured-tool-card, .dev-tool-item, .related-tool-card');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  reveals.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `opacity 0.6s ease ${i * 0.05}s, transform 0.6s ease ${i * 0.05}s`;
    observer.observe(el);
  });

  // Section header animations
  const headers = document.querySelectorAll('.section-header');
  const headerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.2 });

  headers.forEach(h => {
    h.style.opacity = '0';
    h.style.transform = 'translateY(20px)';
    h.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    headerObserver.observe(h);
  });
}

// ============================================
// COUNTER ANIMATIONS
// ============================================
function initCounters() {
  const counters = document.querySelectorAll('[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;

  const suffix = target >= 1000 ? '+' : (target >= 99 ? '%' : '+');
  
  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    const display = target >= 1000 ? (current / 1000).toFixed(1) + 'K' : Math.floor(current).toString();
    el.textContent = display + suffix;
  }, 16);
}

// ============================================
// FAQ ACCORDION
// ============================================
function initFAQ() {
  const questions = document.querySelectorAll('.faq-question');
  
  questions.forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const answer = item.querySelector('.faq-answer');
      const icon = q.querySelector('.faq-icon');
      
      // Close others
      document.querySelectorAll('.faq-answer.open').forEach(a => {
        if (a !== answer) {
          a.classList.remove('open');
          const otherIcon = a.closest('.faq-item').querySelector('.faq-icon');
          if (otherIcon) otherIcon.classList.remove('open');
        }
      });
      
      answer.classList.toggle('open');
      if (icon) icon.classList.toggle('open');
    });
  });
}

// ============================================
// SCROLL TO TOP
// ============================================
function initScrollTop() {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ============================================
// COOKIE BANNER
// ============================================
function initCookieBanner() {
  const banner = document.getElementById('cookieBanner');
  if (!banner) return;

  const accepted = localStorage.getItem('ht-cookies');
  if (accepted) {
    banner.classList.add('hidden');
    return;
  }

  setTimeout(() => { banner.style.display = 'flex'; }, 2000);
}

function acceptCookies() {
  localStorage.setItem('ht-cookies', 'accepted');
  const banner = document.getElementById('cookieBanner');
  if (banner) {
    banner.style.transform = 'translateY(150%)';
    banner.style.opacity = '0';
    setTimeout(() => banner.classList.add('hidden'), 400);
  }
}

function declineCookies() {
  localStorage.setItem('ht-cookies', 'declined');
  const banner = document.getElementById('cookieBanner');
  if (banner) {
    banner.style.transform = 'translateY(150%)';
    setTimeout(() => banner.classList.add('hidden'), 400);
  }
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(msg, type = 'info', duration = 3000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${msg}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ============================================
// COPY TO CLIPBOARD
// ============================================
function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard!', 'success');
    if (btn) {
      const orig = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      setTimeout(() => { btn.innerHTML = orig; }, 2000);
    }
  }).catch(() => {
    // Fallback
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    showToast('Copied!', 'success');
  });
}

// ============================================
// FORMAT NUMBERS
// ============================================
function formatNumber(num, locale = 'en-PK') {
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat(locale).format(Math.round(num));
}

function formatCurrency(amount, currency = 'PKR', locale = 'en-PK') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

// ============================================
// TABS
// ============================================
function initTabs(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const tabs = container.querySelectorAll('.tab-btn');
  const panes = container.querySelectorAll('.tab-pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const pane = container.querySelector(`#${target}`);
      if (pane) pane.classList.add('active');
    });
  });
}

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        const offset = 80;
        const y = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });
});

// ============================================
// LOCAL STORAGE HELPERS
// ============================================
const Storage = {
  set(key, val) { localStorage.setItem(`ht_${key}`, JSON.stringify(val)); },
  get(key, def = null) {
    try { return JSON.parse(localStorage.getItem(`ht_${key}`)) || def; }
    catch { return def; }
  },
  del(key) { localStorage.removeItem(`ht_${key}`); }
};

// Track recently viewed tools
function trackToolView(toolName, toolUrl, toolIcon) {
  const recent = Storage.get('recent_tools', []);
  const filtered = recent.filter(t => t.url !== toolUrl).slice(0, 4);
  filtered.unshift({ name: toolName, url: toolUrl, icon: toolIcon, ts: Date.now() });
  Storage.set('recent_tools', filtered);
}

// ============================================
// EXPORT UTILITIES
// ============================================
window.HashmiTools = {
  showToast,
  copyToClipboard,
  formatNumber,
  formatCurrency,
  initTabs,
  trackToolView,
  acceptCookies,
  declineCookies,
  performHeroSearch,
  Storage
};
