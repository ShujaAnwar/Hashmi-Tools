/* ============================================
   HashmiTools.com — Main JavaScript
   Animations | Search | Interactivity | Utils
   ============================================ */

'use strict';

// ============================================
// BOOT — runs immediately when script is parsed
// (script is at end of <body>, so DOM is ready)
// ============================================
(function boot() {
  // Hide preloader instantly — never wait for images/fonts/ads
  const preloader = document.getElementById('preloader');
  if (preloader) preloader.classList.add('hide');

  // If DOM is already ready (script at end of body = always true), run now.
  // If somehow deferred, wait for DOMContentLoaded.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    // DOM is already parsed — call directly
    initAll();
  }
})();

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
// ============================================
// COMPLETE TOOLS DATABASE — All 44+ Tools
// ============================================
const toolsData = [
  // ── Islamic Tools ──────────────────────────────────────────────
  { name: 'Zakat Calculator', url: 'tools/zakat-calculator.html', cat: 'Islamic', icon: '🕌', tags: ['zakat','nisab','gold','silver','charity','islamiq','islamic','sadqa'] },
  { name: 'Prayer Times', url: 'tools/prayer-times.html', cat: 'Islamic', icon: '🕐', tags: ['prayer','namaz','salah','fajr','zuhr','asr','maghrib','isha','azan','adhan','timings','times'] },
  { name: 'Islamic Inheritance Calculator', url: 'tools/inheritance-calculator.html', cat: 'Islamic', icon: '⚖️', tags: ['inheritance','wirasat','mirasi','faraidh','estate','property','division'] },
  { name: 'Hijri / Gregorian Date Converter', url: 'tools/hijri-converter.html', cat: 'Islamic', icon: '📅', tags: ['hijri','gregorian','calendar','date','converter','islamic date','lunar'] },

  // ── Finance Tools ──────────────────────────────────────────────
  { name: 'EMI Calculator', url: 'tools/emi-calculator.html', cat: 'Finance', icon: '💰', tags: ['emi','loan','installment','monthly payment','bank','car loan','home loan','qist'] },
  { name: 'Mortgage Calculator', url: 'tools/mortgage-calculator.html', cat: 'Finance', icon: '🏠', tags: ['mortgage','home loan','house','property','real estate','payment'] },
  { name: 'Pakistan Tax Calculator', url: 'tools/pakistan-tax.html', cat: 'Finance', icon: '🇵🇰', tags: ['tax','pakistan','income tax','fbr','salary','withholding','pkr'] },
  { name: 'Currency Converter', url: 'tools/currency-converter.html', cat: 'Finance', icon: '💱', tags: ['currency','converter','exchange rate','pkr','usd','eur','dollar','rupee','forex'] },
  { name: 'Compound Interest Calculator', url: 'tools/compound-interest.html', cat: 'Finance', icon: '📈', tags: ['compound interest','investment','return','profit','savings','apr'] },
  { name: 'SIP Investment Calculator', url: 'tools/sip-calculator.html', cat: 'Finance', icon: '💹', tags: ['sip','mutual fund','investment','return','systematic','portfolio'] },

  // ── Health Tools ──────────────────────────────────────────────
  { name: 'BMI Calculator', url: 'tools/bmi-calculator.html', cat: 'Health', icon: '❤️', tags: ['bmi','body mass index','weight','height','obesity','overweight','health'] },
  { name: 'Calorie Calculator', url: 'tools/calorie-calculator.html', cat: 'Health', icon: '🥗', tags: ['calorie','diet','nutrition','food','weight loss','tdee','bmr'] },
  { name: 'Water Intake Calculator', url: 'tools/water-calculator.html', cat: 'Health', icon: '💧', tags: ['water','intake','hydration','daily water','drink','health'] },
  { name: 'Age Calculator', url: 'tools/age-calculator.html', cat: 'Health', icon: '🎂', tags: ['age','birthday','years','months','days','born','date of birth','calculate age'] },
  { name: 'Ideal Weight Calculator', url: 'tools/ideal-weight.html', cat: 'Health', icon: '⚖️', tags: ['ideal weight','healthy weight','target weight','body','fitness'] },

  // ── Developer Tools ──────────────────────────────────────────────
  { name: 'JSON Formatter & Validator', url: 'tools/json-formatter.html', cat: 'Developer', icon: '{ }', tags: ['json','formatter','validator','prettify','minify','parse','api','data'] },
  { name: 'QR Code Generator', url: 'tools/qr-generator.html', cat: 'Developer', icon: '▦', tags: ['qr code','qr','generator','barcode','scan','link','wifi','contact'] },
  { name: 'Password Generator', url: 'tools/password-generator.html', cat: 'Developer', icon: '🔐', tags: ['password','generator','random','secure','strong','crypto','secret'] },
  { name: 'HEX to RGB Color Converter', url: 'tools/hex-rgb.html', cat: 'Developer', icon: '🎨', tags: ['hex','rgb','color','converter','css','design','color code','palette'] },
  { name: 'URL Encoder / Decoder', url: 'tools/url-encoder.html', cat: 'Developer', icon: '🔗', tags: ['url','encode','decode','percent encoding','uri','query string','web'] },
  { name: 'Base64 Encoder / Decoder', url: 'tools/base64.html', cat: 'Developer', icon: '64', tags: ['base64','encode','decode','binary','string','image','data'] },
  { name: 'Typing Speed Test', url: 'tools/typing-test.html', cat: 'Developer', icon: '⌨️', tags: ['typing','speed','test','wpm','words per minute','keyboard','practice'] },
  { name: 'Link Shortener', url: 'tools/link-shortener.html', cat: 'Developer', icon: '✂️', tags: ['link shortener','url shortener','short link','bitly','tiny url','shorten','redirect','custom link'] },

  // ── PDF Tools ──────────────────────────────────────────────
  { name: 'PDF Merge', url: 'tools/pdf-merge.html', cat: 'PDF', icon: '📄', tags: ['pdf','merge','combine','join','multiple pdf','combine pdf'] },
  { name: 'PDF Split', url: 'tools/pdf-split.html', cat: 'PDF', icon: '✂️', tags: ['pdf','split','extract','pages','separate','divide'] },
  { name: 'PDF Compress', url: 'tools/pdf-compress.html', cat: 'PDF', icon: '🗜️', tags: ['pdf','compress','reduce','size','optimize','smaller','lightweight'] },
  { name: 'JPG to PDF Converter', url: 'tools/jpg-to-pdf.html', cat: 'PDF', icon: '🖼️', tags: ['jpg','jpeg','png','image','to pdf','convert','photos'] },
  { name: 'PDF Editor', url: 'tools/pdf-editor.html', cat: 'PDF', icon: '✏️', tags: ['pdf','editor','edit','annotate','text','add','modify'] },
  { name: 'Compress PDF', url: 'tools/compress-pdf.html', cat: 'PDF', icon: '📦', tags: ['compress','pdf','file size','reduce','shrink'] },

  // ── Image Tools ──────────────────────────────────────────────
  { name: 'Image Editor', url: 'tools/image-editor.html', cat: 'Image', icon: '🖼️', tags: ['image','editor','crop','resize','rotate','filter','photo','edit'] },
  { name: 'Image Compressor', url: 'tools/image-compressor.html', cat: 'Image', icon: '🗜️', tags: ['image','compress','optimize','reduce','size','jpg','png','webp'] },
  { name: 'Background Remover', url: 'tools/background-remover.html', cat: 'Image', icon: '🪄', tags: ['background','remover','remove','bg','transparent','cutout','photo'] },

  // ── AI Tools ──────────────────────────────────────────────
  { name: 'AI Hashtag Generator', url: 'tools/ai-hashtag.html', cat: 'AI', icon: '#️⃣', tags: ['hashtag','generator','ai','instagram','twitter','social media','tags'] },
  { name: 'YouTube SEO Tool', url: 'tools/youtube-seo.html', cat: 'AI', icon: '▶️', tags: ['youtube','seo','title','description','tags','generator','video','channel','rank','optimize','thumbnail'] },
  { name: 'SEO Audit Pro', url: 'tools/seo-audit.html', cat: 'AI', icon: '🔍', tags: ['seo','audit','website','analysis','crawl','score','technical','meta','canonical','backlinks','performance'] },
  { name: 'AI Shorts Maker', url: 'tools/shorts-maker.html', cat: 'AI', icon: '🎬', tags: ['shorts','reels','tiktok','video','clips','highlight','cut','viral','youtube shorts','ai','ffmpeg','video editor','long video','short clips','social media video'] },

  // ── Pakistan Tools ──────────────────────────────────────────────
  { name: 'Pakistan Tax Calculator', url: 'tools/pakistan-tax.html', cat: 'Pakistan', icon: '🇵🇰', tags: ['tax','pakistan','fbr','income','salary','withholding','pkr','2025'] },

  // ── Productivity ──────────────────────────────────────────────
  { name: 'Typing Speed Test', url: 'tools/typing-test.html', cat: 'Productivity', icon: '⌨️', tags: ['typing','speed','wpm','test','keyboard','practice','accuracy'] },
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
      const raw = e.target.value;
      const q = raw.toLowerCase().trim();
      if (!searchResults) return;
      if (!q) {
        searchResults.innerHTML = renderSearchCategories();
        return;
      }

      const results = intelligentSearch(q, 10);

      if (!results.length) {
        searchResults.innerHTML = `
          <div style="padding:24px;text-align:center;">
            <div style="font-size:2rem;margin-bottom:8px;">🔍</div>
            <div style="font-weight:600;margin-bottom:4px;">No tools found for "<strong>${raw}</strong>"</div>
            <div style="font-size:0.8rem;color:var(--text-muted);">Try: "zakat", "pdf", "qr code", "youtube", "seo", "password"…</div>
          </div>`;
        return;
      }

      searchResults.innerHTML = results.map(r => `
        <a href="${r.url}" class="search-result-item" style="display:flex;align-items:center;gap:12px;padding:12px 16px;text-decoration:none;color:var(--text-primary);border-bottom:1px solid var(--border-color);transition:background 0.15s;">
          <span style="font-size:1.4rem;width:36px;text-align:center;flex-shrink:0;">${r.icon}</span>
          <div style="flex:1;min-width:0;">
            <div style="font-size:0.92rem;font-weight:600;">${highlightMatch(r.name, q)}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">${r.cat} Tools</div>
          </div>
          <i class="fas fa-arrow-right" style="color:var(--text-muted);font-size:0.7rem;flex-shrink:0;"></i>
        </a>
      `).join('') + `<div style="padding:8px 16px;font-size:0.72rem;color:var(--text-muted);text-align:center;">${results.length} result${results.length!==1?'s':''} for "<em>${raw}</em>"</div>`;
    });

    // Show categories on focus with empty input
    searchInput.addEventListener('focus', () => {
      if (!searchInput.value.trim()) {
        searchResults.innerHTML = renderSearchCategories();
      }
    });
  }
}

function intelligentSearch(q, limit = 8) {
  const terms = q.split(/\s+/).filter(Boolean);
  const seen = new Set();
  const scored = [];

  toolsData.forEach(t => {
    const key = t.url;
    if (seen.has(key)) return;
    const nameL = t.name.toLowerCase();
    const catL = t.cat.toLowerCase();
    const tagsL = (t.tags || []).map(x => x.toLowerCase());

    let score = 0;
    terms.forEach(term => {
      if (nameL === term) score += 100;
      else if (nameL.startsWith(term)) score += 60;
      else if (nameL.includes(term)) score += 40;
      if (catL.includes(term)) score += 25;
      tagsL.forEach(tag => {
        if (tag === term) score += 35;
        else if (tag.includes(term)) score += 20;
        else if (term.includes(tag) && tag.length >= 4) score += 15;
      });
    });

    if (score > 0) { seen.add(key); scored.push({ ...t, score }); }
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

function highlightMatch(text, q) {
  if (!q) return text;
  const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi');
  return text.replace(regex, '<mark style="background:var(--accent,#6366f1);color:#fff;border-radius:3px;padding:0 2px;">$1</mark>');
}

function renderSearchCategories() {
  const cats = [...new Set(toolsData.map(t => t.cat))];
  const catIcons = { Islamic:'🕌', Finance:'💰', Health:'❤️', Developer:'💻', PDF:'📄', Image:'🖼️', AI:'🤖', Pakistan:'🇵🇰', Productivity:'⏱️' };
  return `<div style="padding:12px 16px 4px;font-size:0.72rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;">Browse by Category</div>` +
    cats.map(c => {
      const tools = toolsData.filter(t => t.cat === c);
      return `<div style="padding:4px 0;">
        <div style="padding:6px 16px;font-size:0.78rem;font-weight:600;color:var(--text-secondary);">${catIcons[c]||'🔧'} ${c} <span style="color:var(--text-muted);font-weight:400;">(${tools.length})</span></div>
        ${tools.slice(0,3).map(t=>`<a href="${t.url}" class="search-result-item" style="display:flex;align-items:center;gap:10px;padding:8px 24px;text-decoration:none;color:var(--text-primary);transition:background 0.15s;font-size:0.85rem;"><span>${t.icon}</span> ${t.name}</a>`).join('')}
        ${tools.length > 3 ? `<div style="padding:4px 24px;font-size:0.75rem;color:var(--accent,#6366f1);cursor:pointer;" onclick="document.getElementById('searchInput').value='${c.toLowerCase()}';document.getElementById('searchInput').dispatchEvent(new Event('input'))">+${tools.length-3} more ${c} tools →</div>` : ''}
      </div>`;
    }).join('<hr style="margin:0;border:none;border-top:1px solid var(--border-color);">')
    + `<div style="padding:10px 16px;font-size:0.72rem;color:var(--text-muted);text-align:center;">⌨️ Type to search all ${toolsData.length} tools • Press <kbd style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:4px;padding:1px 4px;font-size:0.68rem;">Esc</kbd> to close</div>`;
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

  const results = intelligentSearch(q, 5);
  if (results.length === 1) {
    // Exact single match — go directly
    window.location.href = results[0].url;
  } else if (results.length > 1) {
    // Multiple matches — open search overlay showing results
    const overlay = document.getElementById('searchOverlay');
    const searchInput = document.getElementById('searchInput');
    if (overlay && searchInput) {
      overlay.classList.add('active');
      searchInput.value = input.value;
      searchInput.dispatchEvent(new Event('input'));
      setTimeout(() => searchInput.focus(), 100);
    }
  } else {
    // No match — open overlay so user sees the category browser
    const overlay = document.getElementById('searchOverlay');
    const searchInput = document.getElementById('searchInput');
    if (overlay && searchInput) {
      overlay.classList.add('active');
      searchInput.value = input.value;
      searchInput.dispatchEvent(new Event('input'));
      setTimeout(() => searchInput.focus(), 100);
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

  let fired = false;
  function runAll() {
    if (fired) return;
    fired = true;
    counters.forEach(c => animateCounter(c));
  }

  // Use IntersectionObserver with low threshold so hero stats trigger on load
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px 100px 0px' });
    counters.forEach(c => observer.observe(c));
  } else {
    // Fallback for browsers without IntersectionObserver
    runAll();
  }

  // Hard fallback: run after 600ms regardless (catches hero-visible stats)
  setTimeout(runAll, 600);
}

function animateCounter(el) {
  // Guard: don't animate twice
  if (el.dataset.animated === '1') return;
  el.dataset.animated = '1';

  const target = parseInt(el.dataset.target, 10);
  if (isNaN(target)) return;

  // Determine suffix from data-suffix attr, or auto-detect
  const customSuffix = el.dataset.suffix;
  let suffix = '';
  if (customSuffix !== undefined) {
    suffix = customSuffix;
  } else if (el.dataset.target === '99') {
    suffix = '%';
  } else {
    suffix = '+';
  }

  const duration = 1800;
  const frameRate = 16;
  const totalFrames = duration / frameRate;
  const increment = Math.max(1, target / totalFrames);
  let current = 0;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    const display = target >= 1000
      ? (current / 1000).toFixed(1) + 'K'
      : Math.floor(current).toString();
    el.textContent = display + suffix;
  }, frameRate);
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

  // If already accepted/declined — hide immediately, no flicker
  const consent = localStorage.getItem('ht-cookies');
  if (consent === 'accepted' || consent === 'declined') {
    banner.style.display = 'none';
    return;
  }

  // Show after 1.5s (don't block first paint)
  setTimeout(() => {
    banner.style.display = 'flex';
    requestAnimationFrame(() => banner.classList.add('visible'));
  }, 1500);
}

function acceptCookies() {
  localStorage.setItem('ht-cookies', 'accepted');
  _hideCookieBanner();
}

function declineCookies() {
  localStorage.setItem('ht-cookies', 'declined');
  _hideCookieBanner();
}

function _hideCookieBanner() {
  const banner = document.getElementById('cookieBanner');
  if (!banner) return;
  banner.style.transform = 'translateY(150%)';
  banner.style.opacity   = '0';
  banner.style.transition = 'transform 0.35s ease, opacity 0.35s ease';
  setTimeout(() => {
    banner.style.display = 'none';
    banner.classList.add('hidden');
  }, 380);
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
