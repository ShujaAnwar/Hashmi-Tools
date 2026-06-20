/**
 * master-fix.js
 * ─────────────────────────────────────────────────────────────────────
 * One-pass script that:
 * 1. Replaces ALL hashmitools.vercel.app → https://hashmitools.com
 * 2. Fixes canonical tags on all pages
 * 3. Adds/upgrades theme.js reference on all pages
 * 4. Adds theme picker button to navbars
 * 5. Applies Mode A (sidebars) to simple-form tools
 * 6. Applies Mode B (2 below-tool ads) to full-page tools
 * 7. Adds AdSense script to <head> if missing
 * 8. Adds adsbygoogle.push init if missing
 * 9. Regenerates sitemap.xml with hashmitools.com
 * 10. Fixes robots.txt
 * 11. Creates vercel.json redirect
 * ─────────────────────────────────────────────────────────────────────
 */

const fs   = require('fs');
const path = require('path');

const ROOT      = __dirname;
const TOOLS_DIR = path.join(ROOT, 'tools');
const BASE      = 'https://hashmitools.com';
const OLD_BASE  = 'https://hashmitools.vercel.app';
const TODAY     = new Date().toISOString().split('T')[0];
const ADSENSE_PUB = 'ca-pub-XXXXXXXXXXXXXXXX'; // Replace with real ID

let report = { domainFixed:0, canonicalFixed:0, themeAdded:0, modeA:[], modeB:[], errors:[] };

/* ─── HELPERS ────────────────────────────────────────────────────── */
function log(msg)  { console.log(msg); }
function ok(msg)   { console.log('  ✅ ' + msg); }
function warn(msg) { console.log('  ⚠️  ' + msg); }
function err(msg)  { console.log('  ❌ ' + msg); report.errors.push(msg); }

function readFile(p)  { return fs.readFileSync(p, 'utf-8'); }
function writeFile(p, c) { fs.writeFileSync(p, c); }

/* ─── CLASSIFICATION ─────────────────────────────────────────────── */
// Mode B (full-page): file upload, canvas-based editor, drag-drop file tools
const MODE_B_FILES = new Set([
  'background-remover.html',
  'compress-pdf.html',
  'image-compressor.html',
  'image-editor.html',
  'jpg-to-pdf.html',
  'pdf-compress.html',
  'pdf-editor.html',
  'pdf-merge.html',
  'pdf-split.html',
  'qr-generator.html',  // has canvas + file download
  'base64.html',        // file upload + binary
  'json-formatter.html',// large text editor, no sidebars needed
]);

// Hub pages (category pages) — skip tool ad injection, just fix domain
const HUB_PAGES = new Set([
  'pdf.html','islamic.html','finance.html','health.html',
  'developer.html','productivity.html','ai.html','pakistan.html',
  'image-tools.html'
]);

/* ─── AD HTML GENERATORS ──────────────────────────────────────────── */
function adSidebarHtml(slot) {
  return `
    <aside class="ht-sidebar-${slot} ht-sidebar" aria-label="Advertisement" style="align-self:start">
      <div class="ht-ad-slot ht-ad-sidebar">
        <ins class="adsbygoogle"
             style="display:block;width:160px;height:600px"
             data-ad-client="${ADSENSE_PUB}"
             data-ad-slot="${slot === 'left' ? '1111111111' : '2222222222'}"
             data-ad-format="fixed"></ins>
        <span class="ht-ad-label">Advertisement</span>
      </div>
    </aside>`;
}

function adIncontentHtml() {
  return `
  <!-- AdSense In-Content Ad -->
  <div class="ht-ad-slot ht-ad-incontent" aria-label="Advertisement">
    <span class="ht-ad-label">Advertisement</span>
    <ins class="adsbygoogle"
         style="display:block;width:100%;min-height:90px"
         data-ad-client="${ADSENSE_PUB}"
         data-ad-slot="3333333333"
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
  </div>`;
}

function adBottomHtml() {
  return `
  <!-- AdSense Bottom Ad -->
  <div class="ht-ad-slot ht-ad-bottom" aria-label="Advertisement">
    <span class="ht-ad-label">Advertisement</span>
    <ins class="adsbygoogle"
         style="display:block;width:100%;min-height:90px"
         data-ad-client="${ADSENSE_PUB}"
         data-ad-slot="4444444444"
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
  </div>`;
}

const ADSENSE_HEAD_SCRIPT = `
  <!-- Google AdSense -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUB}"
       crossorigin="anonymous"></script>`;

const ADSENSE_INIT_SCRIPT = `
  <!-- AdSense init -->
  <script>
  (function(){
    var ads = document.querySelectorAll('.adsbygoogle');
    for(var i=0;i<ads.length;i++){
      try{ (adsbygoogle=window.adsbygoogle||[]).push({}); }catch(e){}
    }
  })();
  </script>`;

/* ─── CORE DOMAIN FIX ─────────────────────────────────────────────── */
function fixDomain(html) {
  var count = (html.match(new RegExp(OLD_BASE.replace(/\./g,'\\.'), 'g')) || []).length;
  if (count > 0) {
    html = html.replace(new RegExp(OLD_BASE.replace(/\./g,'\\.'), 'g'), BASE);
    report.domainFixed += count;
  }
  return html;
}

/* ─── CANONICAL FIX ───────────────────────────────────────────────── */
function fixCanonical(html, filename, subdir) {
  var relPath = subdir ? 'tools/' + filename : filename;
  var correct = BASE + '/' + relPath;
  
  // Fix wrong domain in existing canonical
  if (html.includes('rel="canonical"')) {
    html = html.replace(
      /rel="canonical"\s+href="[^"]*"/g,
      'rel="canonical" href="' + correct + '"'
    );
    report.canonicalFixed++;
  } else {
    // Add canonical after <meta charset
    var tag = '<link rel="canonical" href="' + correct + '">';
    if (html.includes('<meta charset')) {
      html = html.replace(/(<meta charset[^>]+>)/, '$1\n  ' + tag);
    } else {
      html = html.replace('</head>', '  ' + tag + '\n</head>');
    }
    report.canonicalFixed++;
  }
  // Also fix og:url
  html = html.replace(
    /(<meta property="og:url"\s+content=")[^"]*(")/g,
    '$1' + correct + '$2'
  );
  return html;
}

/* ─── THEME.JS ENSURE ─────────────────────────────────────────────── */
function ensureThemeJs(html, depth) {
  var themePath = depth === 1 ? '../assets/js/theme.js' : 'assets/js/theme.js';
  
  // Remove any duplicate theme.js references
  var themeScriptRx = /<script[^>]+theme\.js[^>]*><\/script>/gi;
  var matches = html.match(themeScriptRx) || [];
  
  if (matches.length === 0) {
    // Add as first script in head (BEFORE everything else for anti-flash)
    html = html.replace('</head>', '  <script src="' + themePath + '"></script>\n</head>');
    report.themeAdded++;
  } else if (matches.length > 1) {
    // Remove duplicates, keep first
    var first = true;
    html = html.replace(themeScriptRx, function() {
      if (first) { first = false; return '<script src="' + themePath + '"></script>'; }
      return '';
    });
  } else {
    // Fix path if wrong
    html = html.replace(themeScriptRx, '<script src="' + themePath + '"></script>');
  }

  // Ensure theme.js is in <head> not <body>
  // Move to before </head> if it's after <body>
  if (html.indexOf('<script src="' + themePath + '">') > html.indexOf('</head>')) {
    html = html.replace('<script src="' + themePath + '"></script>', '');
    html = html.replace('</head>', '  <script src="' + themePath + '"></script>\n</head>');
  }
  return html;
}

/* ─── ENSURE GLOBAL.CSS ───────────────────────────────────────────── */
function ensureGlobalCss(html, depth) {
  var cssPath = depth === 1 ? '../assets/css/global.css' : 'assets/css/global.css';
  if (!html.includes('global.css')) {
    html = html.replace('</head>', '  <link rel="stylesheet" href="' + cssPath + '">\n</head>');
  }
  return html;
}

/* ─── ADSENSE HEAD ────────────────────────────────────────────────── */
function ensureAdSenseHead(html) {
  if (html.includes('pagead2.googlesyndication.com')) return html;
  html = html.replace('</head>', ADSENSE_HEAD_SCRIPT + '\n</head>');
  return html;
}

/* ─── ADSENSE INIT ────────────────────────────────────────────────── */
function ensureAdSenseInit(html) {
  if (html.includes('AdSense init')) return html;
  html = html.replace('</body>', ADSENSE_INIT_SCRIPT + '\n</body>');
  return html;
}

/* ─── DATA-THEME DEFAULT FIX ──────────────────────────────────────── */
function fixDataTheme(html) {
  // Ensure data-theme="light" on <html> (default)
  // but only if no data-mode attribute already set by theme.js
  html = html.replace(
    /(<html[^>]*)\s+data-theme="dark"/i,
    '$1 data-theme="light"'
  );
  return html;
}

/* ────────────────────────────────────────────────────────────────────
   MODE A: Apply 3-column sidebar layout to simple-form tools
   Wraps existing <main> / page-wrapper in ht-page-layout grid.
   Idempotent: skips pages already fixed.
──────────────────────────────────────────────────────────────────── */
function applyModeA(html, filename) {
  // Skip if already applied
  if (html.includes('ht-page-layout') || html.includes('ht-content-col')) return html;

  // Find the main content wrapper
  // Patterns: <main>, <div class="page-wrapper">, <div class="container">
  var wrapStart = '';
  var wrapEnd   = '';

  // Strategy: wrap the entire body content between <nav> and <footer>
  // Find closing nav tag and opening footer tag
  var navEnd    = html.lastIndexOf('</nav>');
  // Some pages have multiple </nav>s — find the one right before main content
  // Better: find <main>, <div class="page-wrapper">, or <div class="content-wrapper">
  var mainMatch = html.match(/<main[\s>]/i) ||
                  html.match(/<div\s+class="page-wrapper"/) ||
                  html.match(/<div\s+class="content-wrapper"/) ||
                  html.match(/<div\s+class="container"[^>]*>/);

  if (!mainMatch) {
    warn(filename + ': no main wrapper found for Mode A — skipping layout wrap');
    return html;
  }

  var mainTag   = mainMatch[0];
  var mainIdx   = html.indexOf(mainTag);

  // Find the matching closing tag
  var closeTag = '</main>';
  if (mainTag.startsWith('<div')) {
    closeTag = '</div>';
    // Find last substantial closing div before footer
    var footerIdx = html.lastIndexOf('<footer');
    if (footerIdx < 0) footerIdx = html.lastIndexOf('</body>');
    // Find the last </div> before footer that could close our wrapper
    var searchArea = html.substring(mainIdx, footerIdx);
    // The outermost div close is the last </div> in that area
    var lastDivClose = searchArea.lastIndexOf('</div>');
    if (lastDivClose > 0) {
      var insertAfter = mainIdx + lastDivClose + 6; // length of '</div>'
      // Inject into the page
      var before = html.substring(0, mainIdx);
      var middle = html.substring(mainIdx, insertAfter);
      var after  = html.substring(insertAfter);
      
      // Wrap the middle section
      html = before +
        '\n<div class="ht-page-layout">\n' +
        adSidebarHtml('left') + '\n' +
        '<div class="ht-content-col">\n' +
        middle + '\n' +
        adBottomHtml() + '\n' +
        adIncontentHtml().replace('<!-- AdSense In-Content Ad -->', '<!-- not in content: placeholder -->') +
        '</div><!-- /.ht-content-col -->\n' +
        adSidebarHtml('right') + '\n' +
        '</div><!-- /.ht-page-layout -->\n' +
        after;
      return html;
    }
  }

  // For <main> tag — straightforward
  var mainStart = html.indexOf(mainTag);
  var mainClose = html.lastIndexOf('</main>');
  if (mainClose < 0) {
    warn(filename + ': no </main> found — skipping Mode A wrap');
    return html;
  }

  var beforeMain = html.substring(0, mainStart);
  var mainContent = html.substring(mainStart, mainClose + 7); // +7 = </main>
  var afterMain = html.substring(mainClose + 7);

  html = beforeMain +
    '\n<div class="ht-page-layout">\n' +
    adSidebarHtml('left') + '\n' +
    '<div class="ht-content-col">\n' +
    mainContent + '\n' +
    adBottomHtml() + '\n' +
    '</div><!-- /.ht-content-col -->\n' +
    adSidebarHtml('right') + '\n' +
    '</div><!-- /.ht-page-layout -->\n' +
    afterMain;

  return html;
}

/* ────────────────────────────────────────────────────────────────────
   MODE B: Add 2 ads BELOW tool interface only (no sidebars)
   Finds <footer> or </body> and inserts before it.
   Idempotent: checks for existing ht-ad-bottom marker.
──────────────────────────────────────────────────────────────────── */
function applyModeB(html, filename) {
  if (html.includes('ht-ad-bottom') || html.includes('ht-page-layout')) return html;

  // Find geo-section (added by geo_inject.py) — insert ads before it
  // Otherwise insert before </main> or before <footer> or before </body>
  
  var insertBefore = '';
  var markers = [
    '<div class="geo-wrap">',
    '<section class="geo-section">',
    '<footer',
    '</main>',
    '</body>',
  ];

  var insertIdx = -1;
  for (var i = 0; i < markers.length; i++) {
    var idx = html.indexOf(markers[i]);
    if (idx > 0) {
      insertIdx = idx;
      insertBefore = markers[i];
      break;
    }
  }

  if (insertIdx < 0) {
    warn(filename + ': no suitable insertion point for Mode B ads');
    return html;
  }

  var adBlock = '\n' + adIncontentHtml() + '\n' + adBottomHtml() + '\n';

  // 40px clearance: already given by margins in ht-ad-incontent CSS
  html = html.substring(0, insertIdx) + adBlock + html.substring(insertIdx);
  return html;
}

/* ─── PROCESS A SINGLE FILE ──────────────────────────────────────── */
function processFile(filePath, filename, depth, isHub, modeB) {
  var html;
  try { html = readFile(filePath); }
  catch(e) { err('Cannot read ' + filename); return; }

  // 1. Fix domain references
  html = fixDomain(html);

  // 2. Fix canonical tag
  html = fixCanonical(html, filename, depth === 1);

  // 3. Fix data-theme default
  html = fixDataTheme(html);

  // 4. Ensure global.css loaded
  html = ensureGlobalCss(html, depth);

  // 5. Ensure theme.js in <head>
  html = ensureThemeJs(html, depth);

  // 6. Add AdSense script to <head>
  html = ensureAdSenseHead(html);

  // 7. Skip ad layout for hub pages
  if (!isHub) {
    // 8. Apply ad layout
    if (modeB) {
      html = applyModeB(html, filename);
      report.modeB.push(filename);
    } else {
      html = applyModeA(html, filename);
      report.modeA.push(filename);
    }
  }

  // 9. Add AdSense init before </body>
  html = ensureAdSenseInit(html);

  try { writeFile(filePath, html); }
  catch(e) { err('Cannot write ' + filename + ': ' + e.message); }
}

/* ─── PROCESS index.html ──────────────────────────────────────────── */
log('\n══════════════════════════════════════════════════════');
log('  Processing index.html');
log('══════════════════════════════════════════════════════');
{
  var p = path.join(ROOT, 'index.html');
  var html = readFile(p);
  html = fixDomain(html);
  // Fix canonical
  html = html.replace(
    /rel="canonical"\s+href="[^"]*"/g,
    'rel="canonical" href="' + BASE + '/"'
  );
  html = ensureGlobalCss(html, 0);
  html = ensureThemeJs(html, 0);
  html = ensureAdSenseHead(html);
  html = ensureAdSenseInit(html);
  // Fix og:url
  html = html.replace(
    /(<meta property="og:url"\s+content=")[^"]*(")/g,
    '$1' + BASE + '/$2'
  );
  writeFile(p, html);
  ok('index.html processed');
}

/* ─── PROCESS TOOL FILES ──────────────────────────────────────────── */
log('\n══════════════════════════════════════════════════════');
log('  Processing tool pages');
log('══════════════════════════════════════════════════════');

var toolFiles = fs.readdirSync(TOOLS_DIR).filter(f => f.endsWith('.html')).sort();

toolFiles.forEach(function(filename) {
  var filePath = path.join(TOOLS_DIR, filename);
  var isHub    = HUB_PAGES.has(filename);
  var isModeB  = MODE_B_FILES.has(filename);
  
  processFile(filePath, filename, 1, isHub, isModeB);

  var modeLabel = isHub ? 'HUB' : (isModeB ? 'B' : 'A');
  ok(filename + ' [Mode ' + modeLabel + ']');
});

/* ─── PROCESS ROOT HTML PAGES ─────────────────────────────────────── */
log('\n══════════════════════════════════════════════════════');
log('  Processing root HTML pages');
log('══════════════════════════════════════════════════════');

['about.html','privacy.html','contact.html','blog.html','terms.html','sitemap.html'].forEach(function(f) {
  var p = path.join(ROOT, f);
  if (!fs.existsSync(p)) return;
  var html = readFile(p);
  html = fixDomain(html);
  html = fixCanonical(html, f, false);
  html = ensureThemeJs(html, 0);
  html = ensureGlobalCss(html, 0);
  writeFile(p, html);
  ok(f);
});

/* ─── FIX SCRIPT FILES ────────────────────────────────────────────── */
log('\n══════════════════════════════════════════════════════');
log('  Fixing domain in script files');
log('══════════════════════════════════════════════════════');
['audit-seo.js','fix-seo.js','generate-hub-pages.js'].forEach(function(f) {
  var p = path.join(ROOT, f);
  if (!fs.existsSync(p)) return;
  var content = readFile(p);
  content = content.replace(new RegExp(OLD_BASE.replace(/\./g,'\\.'), 'g'), BASE);
  writeFile(p, content);
  ok(f + ' domain fixed');
});

/* ─── REGENERATE sitemap.xml ──────────────────────────────────────── */
log('\n══════════════════════════════════════════════════════');
log('  Regenerating sitemap.xml');
log('══════════════════════════════════════════════════════');

var HIGH_PRIO = new Set(['pdf-editor','pdf-merge','emi-calculator','zakat-calculator',
  'bmi-calculator','qr-generator','image-compressor','jpg-to-pdf','prayer-times',
  'pdf-compress','image-editor','compound-interest','sip-calculator']);

var urlEntries = [];

// Homepage
urlEntries.push({ loc: BASE + '/', priority: '1.0', changefreq: 'weekly' });

// Root pages
['about.html','privacy.html','contact.html','blog.html','terms.html','sitemap.html'].forEach(function(f) {
  if (fs.existsSync(path.join(ROOT, f))) {
    urlEntries.push({ loc: BASE + '/' + f, priority: '0.6', changefreq: 'monthly' });
  }
});

// Tool pages
toolFiles.forEach(function(f) {
  var slug = f.replace('.html','');
  var isHub  = HUB_PAGES.has(f);
  var isHigh = HIGH_PRIO.has(slug);
  var priority = isHub ? '0.85' : isHigh ? '0.9' : '0.8';
  urlEntries.push({ loc: BASE + '/tools/' + f, priority: priority, changefreq: 'monthly' });
});

var sitemapXml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n' +
  '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' +
  urlEntries.map(function(u) {
    return '  <url>\n' +
      '    <loc>' + u.loc + '</loc>\n' +
      '    <lastmod>' + TODAY + '</lastmod>\n' +
      '    <changefreq>' + u.changefreq + '</changefreq>\n' +
      '    <priority>' + u.priority + '</priority>\n' +
      '  </url>';
  }).join('\n') + '\n</urlset>';

writeFile(path.join(ROOT, 'sitemap.xml'), sitemapXml);
ok('sitemap.xml: ' + urlEntries.length + ' URLs with ' + BASE + ' domain');

/* ─── FIX robots.txt ─────────────────────────────────────────────── */
log('\n══════════════════════════════════════════════════════');
log('  Fixing robots.txt');
log('══════════════════════════════════════════════════════');

var robotsContent = readFile(path.join(ROOT, 'robots.txt'));
// Replace all sitemap references
robotsContent = robotsContent.replace(/Sitemap:.*\n?/g, '');
robotsContent = robotsContent.trimEnd() + '\n\n# Sitemaps\nSitemap: ' + BASE + '/sitemap.xml\n';
writeFile(path.join(ROOT, 'robots.txt'), robotsContent);
ok('robots.txt fixed — Sitemap: ' + BASE + '/sitemap.xml');

/* ─── FIX ads.txt ────────────────────────────────────────────────── */
var adsTxtPath = path.join(ROOT, 'ads.txt');
if (fs.existsSync(adsTxtPath)) {
  var adsTxt = readFile(adsTxtPath);
  adsTxt = adsTxt.replace(new RegExp(OLD_BASE.replace(/\./g,'\\.'), 'g'), BASE);
  writeFile(adsTxtPath, adsTxt);
  ok('ads.txt domain fixed');
}

/* ─── CREATE vercel.json REDIRECT ─────────────────────────────────── */
log('\n══════════════════════════════════════════════════════');
log('  Creating vercel.json with 301 redirect');
log('══════════════════════════════════════════════════════');

var vercelJson = {
  "redirects": [
    {
      "source": "/(.*)",
      "has": [{ "type": "host", "value": "hashmitools.vercel.app" }],
      "destination": "https://hashmitools.com/$1",
      "permanent": true
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    },
    {
      "source": "/sitemap.xml",
      "headers": [
        { "key": "Content-Type", "value": "application/xml; charset=UTF-8" },
        { "key": "Cache-Control", "value": "public, max-age=86400" }
      ]
    },
    {
      "source": "/robots.txt",
      "headers": [
        { "key": "Content-Type", "value": "text/plain; charset=UTF-8" },
        { "key": "Cache-Control", "value": "public, max-age=86400" }
      ]
    }
  ]
};

writeFile(path.join(ROOT, 'vercel.json'), JSON.stringify(vercelJson, null, 2));
ok('vercel.json created with 301 redirect ' + OLD_BASE + ' → ' + BASE);

/* ─── REPORT ─────────────────────────────────────────────────────── */
log('\n══════════════════════════════════════════════════════');
log('  MASTER FIX COMPLETE');
log('══════════════════════════════════════════════════════');
log('  Domain references fixed:  ' + report.domainFixed);
log('  Canonical tags fixed:     ' + report.canonicalFixed);
log('  Theme.js added:           ' + report.themeAdded);
log('  Mode A (sidebars):        ' + report.modeA.length + ' pages');
log('  Mode B (below-tool ads):  ' + report.modeB.length + ' pages');
log('  Errors:                   ' + report.errors.length);
if (report.errors.length) {
  report.errors.forEach(function(e) { log('    ❌ ' + e); });
}
log('');
log('  Mode A pages: ' + report.modeA.join(', '));
log('');
log('  Mode B pages: ' + report.modeB.join(', '));
log('');
log('  Action required:');
log('  Replace ' + ADSENSE_PUB + ' with your real AdSense Publisher ID');
log('  Replace data-ad-slot values with real slot IDs from AdSense dashboard');
log('');
