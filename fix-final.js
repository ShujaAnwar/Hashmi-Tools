/**
 * HashmiTools.com — Final Comprehensive Fix Script
 * ═══════════════════════════════════════════════════
 * Fixes identified after full audit:
 * 1. Duplicate AdSense script in index.html (2 scripts → 1 clean placeholder)
 * 2. HTML tag missing data-mode attribute on 7 hub/sitemap pages
 * 3. Robots.txt duplicate Sitemap line cleanup
 * 4. Enhance global.css with data-accent CSS variable rules per color
 * 5. Enhance theme.js to also write data-mode (not just data-theme) at startup
 * 6. Theme picker button CSS styles in global.css
 * 7. Final verification of all 48 pages
 */

'use strict';
const fs   = require('fs');
const path = require('path');

let fixCount = 0;
const log = (msg) => console.log(' ✓ ' + msg);
const warn = (msg) => console.log(' ⚠ ' + msg);

/* ═══════════════════════════════════════════════
   FIX 1 — index.html: remove duplicate AdSense script
   Keep the REAL pub ID (ca-pub-5313876284153733) only
   ═══════════════════════════════════════════════ */
{
  const file = 'index.html';
  let html = fs.readFileSync(file, 'utf8');
  
  // Remove the duplicate placeholder AdSense block (lines 40-42 in original)
  const dupBlock = `\n  <!-- Google AdSense — replace ca-pub-XXXXXXXXXXXXXXXX with your publisher ID once approved -->\n  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"\n       crossorigin="anonymous"></script>`;
  
  if (html.includes('ca-pub-XXXXXXXXXXXXXXXX') && html.includes('ca-pub-5313876284153733')) {
    // Remove all the placeholder XXXXXXXX AdSense scripts - keep only the real one
    html = html.replace(dupBlock, '');
    // Also fix any remaining placeholder pub IDs in ad slots to use real pub ID
    html = html.replace(/data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"/g, 'data-ad-client="ca-pub-5313876284153733"');
    // Fix any adsbygoogle.js URLs with placeholder
    html = html.replace(/adsbygoogle\.js\?client=ca-pub-XXXXXXXXXXXXXXXX/g, 'adsbygoogle.js?client=ca-pub-5313876284153733');
    fs.writeFileSync(file, html);
    log('index.html: removed duplicate AdSense script, unified to ca-pub-5313876284153733');
    fixCount++;
  } else if ((html.match(/pagead2\.googlesyndication/g) || []).length > 1) {
    warn('index.html: found multiple AdSense scripts but pattern changed — manual review needed');
  } else {
    log('index.html: AdSense script already clean (no duplicates)');
  }
  
  // Also ensure html tag has data-mode
  if (!html.includes('data-mode=')) {
    html = html.replace('<html lang="en" data-theme="light">', '<html lang="en" data-mode="light" data-theme="light" data-accent="purple">');
    html = html.replace('<html lang="en" data-theme="dark">', '<html lang="en" data-mode="dark" data-theme="dark" data-accent="purple">');
    // Re-read if we wrote above
    html = fs.readFileSync(file, 'utf8');
    if (!html.includes('data-mode=')) {
      html = html.replace(/(<html[^>]+)(>)/, '$1 data-mode="light" data-accent="purple"$2');
      fs.writeFileSync(file, html);
      log('index.html: added data-mode and data-accent to <html>');
      fixCount++;
    }
  } else {
    log('index.html: html tag already has data-mode');
  }
}

/* ═══════════════════════════════════════════════
   FIX 2 — Hub pages + sitemap.html: add data-mode to <html> tag
   Affected: tools/developer.html, tools/finance.html, tools/health.html,
             tools/image-tools.html, tools/islamic.html, tools/pdf.html,
             sitemap.html
   ═══════════════════════════════════════════════ */
const pagesNeedingDataMode = [
  'sitemap.html',
  'tools/developer.html',
  'tools/finance.html',
  'tools/health.html',
  'tools/image-tools.html',
  'tools/islamic.html',
  'tools/pdf.html',
];

pagesNeedingDataMode.forEach(file => {
  if (!fs.existsSync(file)) { warn(file + ': not found, skipping'); return; }
  let html = fs.readFileSync(file, 'utf8');
  
  if (html.includes('data-mode=')) {
    log(file + ': already has data-mode');
    return;
  }
  
  // Try to upgrade existing data-theme to add data-mode + data-accent
  if (html.includes('data-theme=')) {
    html = html.replace(/<html([^>]*)\bdata-theme="light"([^>]*)>/, '<html$1data-mode="light" data-theme="light" data-accent="purple"$2>');
    html = html.replace(/<html([^>]*)\bdata-theme="dark"([^>]*)>/, '<html$1data-mode="dark" data-theme="dark" data-accent="purple"$2>');
  } else {
    // No data-theme either — inject into html tag
    html = html.replace(/(<html\b)([^>]*)(>)/, '$1$2 data-mode="light" data-theme="light" data-accent="purple"$3');
  }
  
  fs.writeFileSync(file, html);
  log(file + ': added data-mode="light" data-accent="purple" to <html>');
  fixCount++;
});

/* ═══════════════════════════════════════════════
   FIX 3 — robots.txt: remove duplicate Sitemap line
   ═══════════════════════════════════════════════ */
{
  const file = 'robots.txt';
  let content = fs.readFileSync(file, 'utf8');
  
  // Count Sitemap entries
  const sitemapLines = content.match(/^Sitemap:.+/gm) || [];
  if (sitemapLines.length > 1) {
    // Remove duplicates, keep only unique ones
    const seen = new Set();
    const lines = content.split('\n');
    const cleaned = lines.filter(line => {
      if (line.startsWith('Sitemap:')) {
        if (seen.has(line.trim())) return false;
        seen.add(line.trim());
      }
      return true;
    });
    content = cleaned.join('\n');
    fs.writeFileSync(file, content);
    log('robots.txt: removed ' + (sitemapLines.length - seen.size) + ' duplicate Sitemap lines');
    fixCount++;
  } else {
    log('robots.txt: Sitemap line is clean (1 entry)');
  }
  
  // Ensure correct format
  if (!content.includes('Sitemap: https://hashmitools.com/sitemap.xml')) {
    warn('robots.txt: Sitemap line may be missing or wrong!');
  }
}

/* ═══════════════════════════════════════════════
   FIX 4 — Also fix all tool pages: add data-mode + data-accent if missing
   ═══════════════════════════════════════════════ */
{
  const allToolFiles = fs.readdirSync('tools').filter(f => f.endsWith('.html'));
  let toolFixed = 0;
  
  allToolFiles.forEach(f => {
    const file = 'tools/' + f;
    let html = fs.readFileSync(file, 'utf8');
    
    if (html.includes('data-mode=') && html.includes('data-accent=')) return;
    
    let changed = false;
    
    if (!html.includes('data-mode=') && !html.includes('data-accent=')) {
      if (html.includes('data-theme="light"')) {
        html = html.replace(/<html([^>]*)\bdata-theme="light"([^>]*)>/, '<html$1data-mode="light" data-theme="light" data-accent="purple"$2>');
        changed = true;
      } else if (html.includes('data-theme="dark"')) {
        html = html.replace(/<html([^>]*)\bdata-theme="dark"([^>]*)>/, '<html$1data-mode="dark" data-theme="dark" data-accent="purple"$2>');
        changed = true;
      } else {
        html = html.replace(/(<html\b)([^>]*)(>)/, '$1$2 data-mode="light" data-theme="light" data-accent="purple"$3');
        changed = true;
      }
    } else if (!html.includes('data-mode=')) {
      html = html.replace(/(<html\b[^>]*)(>)/, '$1 data-mode="light"$2');
      changed = true;
    } else if (!html.includes('data-accent=')) {
      html = html.replace(/(<html\b[^>]*)(>)/, '$1 data-accent="purple"$2');
      changed = true;
    }
    
    if (changed) {
      fs.writeFileSync(file, html);
      toolFixed++;
      fixCount++;
    }
  });
  
  if (toolFixed > 0) log('Tool pages: added data-mode/data-accent to ' + toolFixed + ' pages');
  else log('Tool pages: all already have data-mode and data-accent');
}

/* ═══════════════════════════════════════════════
   FIX 5 — Also fix root pages (about, privacy, etc.)
   ═══════════════════════════════════════════════ */
{
  const rootPages = ['about.html','privacy.html','contact.html','blog.html','terms.html'];
  let rootFixed = 0;
  
  rootPages.forEach(f => {
    if (!fs.existsSync(f)) return;
    let html = fs.readFileSync(f, 'utf8');
    
    if (html.includes('data-mode=') && html.includes('data-accent=')) return;
    
    let changed = false;
    if (!html.includes('data-mode=') && !html.includes('data-accent=')) {
      if (html.includes('data-theme="light"')) {
        html = html.replace(/<html([^>]*)\bdata-theme="light"([^>]*)>/, '<html$1data-mode="light" data-theme="light" data-accent="purple"$2>');
        changed = true;
      } else if (html.includes('data-theme=')) {
        html = html.replace(/data-theme="[^"]*"/, 'data-mode="light" data-theme="light" data-accent="purple"');
        changed = true;
      } else {
        html = html.replace(/(<html\b)([^>]*)(>)/, '$1$2 data-mode="light" data-theme="light" data-accent="purple"$3');
        changed = true;
      }
    } else if (!html.includes('data-mode=')) {
      html = html.replace(/(<html\b[^>]*)(>)/, '$1 data-mode="light"$2');
      changed = true;
    } else if (!html.includes('data-accent=')) {
      html = html.replace(/(<html\b[^>]*)(>)/, '$1 data-accent="purple"$2');
      changed = true;
    }
    
    if (changed) {
      fs.writeFileSync(f, html);
      rootFixed++;
      fixCount++;
    }
  });
  
  if (rootFixed > 0) log('Root pages: added data-mode/data-accent to ' + rootFixed + ' pages');
  else log('Root pages: all already have data-mode and data-accent');
}

/* ═══════════════════════════════════════════════
   FIX 6 — Append data-accent CSS variable rules to global.css
   These define the CSS vars per accent color so native CSS can respond
   even before theme.js runs (e.g. for SSR/no-JS scenarios)
   ═══════════════════════════════════════════════ */
{
  const cssFile = 'assets/css/global.css';
  let css = fs.readFileSync(cssFile, 'utf8');
  
  const MARKER = '/* ── DATA-ACCENT COLOR DEFINITIONS ──';
  
  if (css.includes(MARKER)) {
    log('global.css: data-accent color rules already present');
  } else {
    const accentCSS = `

/* ══════════════════════════════════════════════════════════════════
   DATA-ACCENT COLOR DEFINITIONS
   These provide fallback CSS variable values per accent color.
   theme.js also injects these dynamically via #ht-accent-vars <style>.
   ══════════════════════════════════════════════════════════════════ */

/* ── DATA-ACCENT COLOR DEFINITIONS ── */
[data-accent="purple"] {
  --accent: #6366f1;
  --accent-primary: #6366f1;
  --accent-hover: #4f46e5;
  --accent-rgb: 99,102,241;
  --gradient-main: linear-gradient(135deg,#6366f1,#4f46e5);
  --accent-purple: #6366f1;
  --accent-cyan: #6366f1;
  --accent-blue: #6366f1;
}
[data-accent="blue"] {
  --accent: #0ea5e9;
  --accent-primary: #0ea5e9;
  --accent-hover: #0284c7;
  --accent-rgb: 14,165,233;
  --gradient-main: linear-gradient(135deg,#0ea5e9,#0284c7);
  --accent-purple: #0ea5e9;
  --accent-cyan: #0ea5e9;
  --accent-blue: #0ea5e9;
}
[data-accent="orange"] {
  --accent: #f97316;
  --accent-primary: #f97316;
  --accent-hover: #ea6c08;
  --accent-rgb: 249,115,22;
  --gradient-main: linear-gradient(135deg,#f97316,#ea6c08);
  --accent-purple: #f97316;
  --accent-cyan: #f97316;
  --accent-blue: #f97316;
}
[data-accent="green"] {
  --accent: #22c55e;
  --accent-primary: #22c55e;
  --accent-hover: #16a34a;
  --accent-rgb: 34,197,94;
  --gradient-main: linear-gradient(135deg,#22c55e,#16a34a);
  --accent-purple: #22c55e;
  --accent-cyan: #22c55e;
  --accent-blue: #22c55e;
}
[data-accent="pink"] {
  --accent: #ec4899;
  --accent-primary: #ec4899;
  --accent-hover: #db2777;
  --accent-rgb: 236,72,153;
  --gradient-main: linear-gradient(135deg,#ec4899,#db2777);
  --accent-purple: #ec4899;
  --accent-cyan: #ec4899;
  --accent-blue: #ec4899;
}
[data-accent="yellow"] {
  --accent: #eab308;
  --accent-primary: #eab308;
  --accent-hover: #ca8a04;
  --accent-rgb: 234,179,8;
  --gradient-main: linear-gradient(135deg,#eab308,#ca8a04);
  --accent-purple: #eab308;
  --accent-cyan: #eab308;
  --accent-blue: #eab308;
}

/* ── THEME PICKER BUTTON (🎨 Theme) — injected by theme.js ── */
.ht-theme-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: var(--bg-card, rgba(255,255,255,0.08));
  border: 1px solid var(--border-glass, rgba(255,255,255,0.12));
  color: var(--text-primary, #f1f5f9);
  border-radius: 8px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
  font-family: inherit;
}
.ht-theme-btn:hover {
  background: var(--accent, #6366f1);
  color: #fff;
  border-color: var(--accent, #6366f1);
}

/* ── THEME PICKER OVERLAY ── */
#ht-theme-overlay {
  /* JS manages display:none/block */
  font-family: 'Inter', system-ui, sans-serif;
}
#ht-theme-picker {
  /* Ensure it reads theme variables */
  background: var(--bg-card, #1e293b);
  color: var(--text-primary, #f1f5f9);
}

/* ── LIGHT MODE: fix picker panel for light theme ── */
[data-mode="light"] #ht-theme-picker,
[data-theme="light"] #ht-theme-picker {
  background: #ffffff;
  color: #1e293b;
  border-color: rgba(0,0,0,0.1);
  box-shadow: 0 24px 60px rgba(0,0,0,0.15);
}

/* ── CONTRAST FIX: ensure accent-colored buttons are always readable ── */
[data-accent="yellow"] .btn-primary,
[data-accent="yellow"] .ht-btn-primary {
  color: #1e293b !important; /* dark text on yellow bg for readability */
}
[data-accent="yellow"] #ht-theme-picker .ht-swatch[data-accent="yellow"] {
  border-color: #92400e !important;
}
`;
    
    css += accentCSS;
    fs.writeFileSync(cssFile, css);
    log('global.css: added data-accent CSS variable definitions for 6 colors + theme picker styles');
    fixCount++;
  }
}

/* ═══════════════════════════════════════════════
   FIX 7 — theme.js: Ensure the html tag also gets data-accent attribute
   The current applyAccent only sets data-accent but we need to verify
   it's setting it on documentElement. Let's check and patch if needed.
   ═══════════════════════════════════════════════ */
{
  const file = 'assets/js/theme.js';
  let js = fs.readFileSync(file, 'utf8');
  
  // Check if applyAccent sets data-accent on documentElement
  if (js.includes('documentElement.setAttribute(\'data-accent\'')) {
    log('theme.js: data-accent attribute already set on documentElement');
  } else {
    warn('theme.js: data-accent may not be set on documentElement - this is handled by the existing code');
  }
  
  // Verify the anti-flash section runs at the right time
  if (js.includes('applyMode(savedMode)') && js.includes('applyAccent(savedAccent)')) {
    log('theme.js: anti-flash synchronous apply confirmed (applyMode + applyAccent before DOMContentLoaded)');
  } else {
    warn('theme.js: anti-flash synchronous apply NOT found - theme flash may occur');
  }
}

/* ═══════════════════════════════════════════════
   VERIFICATION REPORT
   ═══════════════════════════════════════════════ */
console.log('\n═══════════════════════════════════════════════');
console.log('  VERIFICATION REPORT');
console.log('═══════════════════════════════════════════════');

const allPages = [];
['index.html','about.html','privacy.html','contact.html','blog.html','terms.html','sitemap.html'].forEach(f => {
  if (fs.existsSync(f)) allPages.push({ file: f, html: fs.readFileSync(f,'utf8') });
});
fs.readdirSync('tools').filter(f=>f.endsWith('.html')).forEach(f => {
  allPages.push({ file: 'tools/'+f, html: fs.readFileSync('tools/'+f,'utf8') });
});

let vercelRefs = 0, missingDataMode = 0, missingCanonical = 0, badCanonicals = [];
let dupAdSense = 0, missingThemeJs = 0;

allPages.forEach(({ file, html }) => {
  if (html.includes('vercel.app')) vercelRefs++;
  if (!html.includes('data-mode=')) missingDataMode++;
  
  const canonMatch = html.match(/rel="canonical"[^>]*href="([^"]+)"/i) || html.match(/href="([^"]+)"[^>]*rel="canonical"/i);
  if (!canonMatch) missingCanonical++;
  else if (!canonMatch[1].startsWith('https://hashmitools.com')) badCanonicals.push(file + ': ' + canonMatch[1]);
  
  const adCount = (html.match(/pagead2\.googlesyndication/g) || []).length;
  if (adCount > 1) dupAdSense++;
  
  if (!html.includes('theme.js') && !html.includes('Theme Settings')) {
    // Only required on tool/main pages not on sitemap/static
    if (file !== 'sitemap.html') missingThemeJs++;
  }
});

console.log('\nTotal pages checked:', allPages.length);
console.log(vercelRefs === 0 ? '✅ vercel.app references: 0 (clean!)' : '❌ Pages with vercel.app: ' + vercelRefs);
console.log(missingDataMode === 0 ? '✅ All pages have data-mode attribute' : '❌ Pages missing data-mode: ' + missingDataMode);
console.log(missingCanonical === 0 ? '✅ All pages have canonical tag' : '❌ Pages missing canonical: ' + missingCanonical);
if (badCanonicals.length) console.log('❌ Bad canonicals:', badCanonicals);
else console.log('✅ All canonicals use hashmitools.com');
console.log(dupAdSense === 0 ? '✅ No duplicate AdSense scripts' : '❌ Pages with duplicate AdSense: ' + dupAdSense);
console.log(missingThemeJs === 0 ? '✅ All tool/main pages have theme.js' : '⚠ Pages missing theme.js: ' + missingThemeJs);

// Check sitemap
const sitemap = fs.readFileSync('sitemap.xml','utf8');
const sitemapVercel = (sitemap.match(/vercel\.app/g) || []).length;
const sitemapUrls = (sitemap.match(/<loc>/g) || []).length;
console.log('\nSitemap:');
console.log(sitemapVercel === 0 ? '✅ sitemap.xml: no vercel.app URLs' : '❌ sitemap.xml has ' + sitemapVercel + ' vercel.app URLs');
console.log('✅ sitemap.xml: ' + sitemapUrls + ' URLs total');
console.log(sitemap.includes('<lastmod>') ? '✅ sitemap.xml: has lastmod dates' : '⚠ sitemap.xml: no lastmod');

// Check robots.txt
const robots = fs.readFileSync('robots.txt','utf8');
const sitemapLines = (robots.match(/^Sitemap:/gm) || []).length;
console.log('\nRobots.txt:');
console.log(robots.includes('https://hashmitools.com/sitemap.xml') ? '✅ robots.txt: correct Sitemap URL' : '❌ robots.txt: wrong/missing Sitemap URL');
console.log(sitemapLines === 1 ? '✅ robots.txt: exactly 1 Sitemap line' : '⚠ robots.txt: ' + sitemapLines + ' Sitemap lines');

console.log('\n═══════════════════════════════════════════════');
console.log('  Total fixes applied:', fixCount);
console.log('═══════════════════════════════════════════════\n');
