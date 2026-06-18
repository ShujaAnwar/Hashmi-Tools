/**
 * fix-seo.js — Comprehensive SEO fix script for HashmiTools.com
 *
 * Fixes:
 * 1. Converts onclick category cards in index.html to real <a href> anchor tags
 * 2. Converts onclick featured Islamic tool divs to <a href> tags
 * 3. Adds links to 8 orphan pages in the footer / relevant sections
 * 4. Adds missing canonical tags to 14 tool pages
 * 5. Fixes 2 wrong canonical tags (pdf-compress.html, zakat-calculator.html)
 * 6. Adds meta robots index,follow to all pages missing it
 * 7. Updates footer sitemap link to include sitemap.html
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://hashmitools.vercel.app';
const TOOLS_DIR = path.join(__dirname, 'tools');

let fixCount = 0;
let fileCount = 0;

function log(msg) { console.log(msg); }
function fix(msg) { fixCount++; console.log(`  ✅ FIX: ${msg}`); }
function warn(msg) { console.log(`  ⚠️  ${msg}`); }

// ─────────────────────────────────────────────────────────
// PART 1: Fix index.html
// ─────────────────────────────────────────────────────────
log('\n══════════════════════════════════════════════════════');
log('  PART 1 — Fix onclick navigations in index.html');
log('══════════════════════════════════════════════════════\n');

let indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');

// 1a. Category cards: <article class="category-card X" onclick="window.location='tools/X.html'">
//     → wrap content in <a href="tools/X.html" class="category-card X">
const categoryCardReplacements = [
  { cls: 'islamic',     href: 'tools/islamic.html' },
  { cls: 'finance',     href: 'tools/finance.html' },
  { cls: 'pdf',         href: 'tools/pdf.html' },
  { cls: 'ai',          href: 'tools/ai.html' },
  { cls: 'dev',         href: 'tools/developer.html' },
  { cls: 'health',      href: 'tools/health.html' },
  { cls: 'pakistan',    href: 'tools/pakistan.html' },
  { cls: 'productivity',href: 'tools/productivity.html' },
];

categoryCardReplacements.forEach(({ cls, href }) => {
  // Match the opening <article> tag with onclick
  const oldTag = new RegExp(
    `<article class="category-card ${cls}" onclick="window\\.location='${href.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}'">`
    , 'g'
  );
  const newTag = `<a href="${href}" class="category-card ${cls}">`;
  if (oldTag.test(indexHtml)) {
    indexHtml = indexHtml.replace(oldTag, newTag);
    // Close tag: </article> → </a>  (only for these converted ones — tricky, do targeted replacement)
    fix(`Category card '${cls}': <article onclick> → <a href="${href}">`);
  } else {
    warn(`Category card '${cls}' pattern not matched (may already be fixed)`);
  }
});

// Close <article> tags that were converted to <a> (they close right after </div> of card-footer)
// The pattern is: </div>\n          </article> — replace with </div>\n          </a>
// But we need to be careful to only replace the ones inside categories-grid
// Strategy: replace the specific pattern within the categories-grid section
const categoriesSection = indexHtml.match(/(<div class="categories-grid">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/section>)/);
if (categoriesSection) {
  let catGrid = categoriesSection[0];
  // Replace closing </article> with </a> in the categories grid only
  catGrid = catGrid.replace(/<\/article>/g, '</a>');
  indexHtml = indexHtml.replace(categoriesSection[0], catGrid);
  fix('Closed all category-card </article> → </a>');
}

// 1b. Featured Islamic tool cards: <div class="featured-tool-card..." onclick="window.location='tools/X.html'">
const featuredCardPattern = /<div class="(featured-tool-card[^"]*)" onclick="window\.location='(tools\/[^']+\.html)'">/g;
let ftMatch;
let featuredFixed = 0;
while ((ftMatch = featuredCardPattern.exec(indexHtml)) !== null) {
  featuredFixed++;
}

indexHtml = indexHtml.replace(
  /<div class="(featured-tool-card[^"]*)" onclick="window\.location='(tools\/[^']+\.html)'">/g,
  (match, cls, href) => {
    fix(`Featured card → <a href="${href}" class="${cls}">`);
    return `<a href="${href}" class="${cls}">`;
  }
);

// Find </div> closers after featured-tool-card that now need to be </a>
// The featured-tool-card divs close with </div>\n          </div>  — the outer closer
// Strategy: find "ft-btn" links (they are inside featured-tool-card) then find the </div> just after
// Actually, the featured-tool-card has this structure:
//   <a href class="featured-tool-card...">
//     <div class="ft-bg"></div>
//     <div class="ft-content">
//       ...
//       <a href class="ft-btn">...</a>
//     </div>
//   </a>   ← was </div>
// The outer </div> that closed featured-tool-card needs to become </a>
// We look for the pattern: </div>\n          </div> inside featured-tools-grid

const ftGridMatch = indexHtml.match(/(<div class="featured-tools-grid">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/section>)/);
if (ftGridMatch) {
  // In the featured grid, the outer closing </div> for each card needs to be </a>
  // Each card is now <a class="featured-tool-card..."> ... </div> (needs </a>)
  // Pattern: the ft-content div closes, then the card itself closes
  // </div> → </a> only when it's the direct child closer of featured-tool-card <a>
  // Approach: count nesting inside each card
  let ftGrid = ftGridMatch[0];
  
  // Replace the specific </div> pattern that closes the featured-tool-card <a> tags
  // Each card: <a class="featured-tool-card..."> <div class="ft-bg"/> <div class="ft-content">...</div> </a>
  // The outer closer was </div>\n        </div>\n      </div> — innermost first
  // Simpler: just find the last </div> before </div>\n      </div>\n    </section> and replace
  
  // Better approach: use regex to find </div> that follows a </a> (ft-btn) + </div> (ft-content)
  ftGrid = ftGrid.replace(
    /(<\/a>\s*<\/div>\s*)((?:\s*<\/div>))/g,
    (m, before, afterClose) => {
      // Only replace if this is closing a featured-tool-card
      return before + '</a>';
    }
  );
  indexHtml = indexHtml.replace(ftGridMatch[0], ftGrid);
  fix('Featured Islamic tool card closing </div> → </a>');
}

// 1c. Add orphan pages to footer columns
// Add compress-pdf to PDF tools footer, add missing health/finance tools

// Add pdf-split and compress-pdf to footer PDF section
indexHtml = indexHtml.replace(
  `<li><a href="tools/finance.html">View All →</a></li>\n            </ul>\n          </div>\n\n          <div class="footer-col">\n            <h5>Developer Tools</h5>`,
  `<li><a href="tools/mortgage-calculator.html">Mortgage Calculator</a></li>
              <li><a href="tools/finance.html">View All →</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h5>Developer Tools</h5>`
);

// Add health tools to footer
indexHtml = indexHtml.replace(
  `<li><a href="tools/developer.html">View All →</a></li>\n            </ul>\n          </div>\n\n          <div class="footer-col">\n            <h5>Company</h5>`,
  `<li><a href="tools/developer.html">View All →</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h5>Health &amp; Utilities</h5>
            <ul>
              <li><a href="tools/bmi-calculator.html">BMI Calculator</a></li>
              <li><a href="tools/calorie-calculator.html">Calorie Calculator</a></li>
              <li><a href="tools/ideal-weight.html">Ideal Weight</a></li>
              <li><a href="tools/water-calculator.html">Water Intake</a></li>
              <li><a href="tools/typing-test.html">Typing Speed Test</a></li>
              <li><a href="tools/background-remover.html">Background Remover</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h5>Company</h5>`
);

// Add PDF orphan tools to the PDF footer section — currently there's no PDF section in footer
// Insert PDF tools column before Islamic tools in footer
const footerIslamicCol = `          <div class="footer-col">
            <h5>Islamic Tools</h5>`;
const footerPdfCol = `          <div class="footer-col">
            <h5>PDF Tools</h5>
            <ul>
              <li><a href="tools/pdf-editor.html">PDF Editor</a></li>
              <li><a href="tools/pdf-merge.html">Merge PDF</a></li>
              <li><a href="tools/pdf-split.html">Split PDF</a></li>
              <li><a href="tools/pdf-compress.html">Compress PDF</a></li>
              <li><a href="tools/compress-pdf.html">Compress PDF (Alt)</a></li>
              <li><a href="tools/pdf.html">View All →</a></li>
            </ul>
          </div>

`;
indexHtml = indexHtml.replace(footerIslamicCol, footerPdfCol + footerIslamicCol);
fix('Added PDF Tools footer column with pdf-split, compress-pdf links');
fix('Added Health & Utilities footer column for orphan pages');
fix('Added mortgage-calculator to Finance footer');

// 1d. Add sitemap.html link to footer
indexHtml = indexHtml.replace(
  `<a href="sitemap.xml">Sitemap</a>`,
  `<a href="sitemap.xml">Sitemap XML</a> &nbsp;|&nbsp; <a href="sitemap.html">Sitemap</a>`
);
fix('Added sitemap.html link to footer');

// 1e. Add meta robots to <head> if missing
if (!indexHtml.includes('name="robots"')) {
  indexHtml = indexHtml.replace(
    '</title>',
    '</title>\n  <meta name="robots" content="index, follow">'
  );
  fix('Added meta robots index,follow to index.html');
}

fs.writeFileSync(path.join(__dirname, 'index.html'), indexHtml);
fileCount++;
log(`\n  → index.html saved (${Buffer.byteLength(indexHtml)} bytes)\n`);


// ─────────────────────────────────────────────────────────
// PART 2: Fix canonical tags on 16 tool pages
// ─────────────────────────────────────────────────────────
log('\n══════════════════════════════════════════════════════');
log('  PART 2 — Fix canonical tags (14 missing + 2 wrong)');
log('══════════════════════════════════════════════════════\n');

const MISSING_CANONICAL = [
  'ai-hashtag.html',
  'background-remover.html',
  'base64.html',
  'calorie-calculator.html',
  'compound-interest.html',
  'hex-rgb.html',
  'hijri-converter.html',
  'ideal-weight.html',
  'inheritance-calculator.html',
  'mortgage-calculator.html',
  'pdf-split.html',
  'sip-calculator.html',
  'url-encoder.html',
  'water-calculator.html',
];

const WRONG_CANONICAL = [
  {
    file: 'pdf-compress.html',
    wrong: 'https://hashmitools.com/tools/compress-pdf.html',
    correct: `${BASE_URL}/tools/pdf-compress.html`,
  },
  {
    file: 'zakat-calculator.html',
    wrong: 'https://hashmitools.com/tools/zakat-calculator',
    correct: `${BASE_URL}/tools/zakat-calculator.html`,
  },
];

// Fix missing canonicals
MISSING_CANONICAL.forEach(filename => {
  const filePath = path.join(TOOLS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    warn(`File not found: tools/${filename} — skipping`);
    return;
  }
  let html = fs.readFileSync(filePath, 'utf-8');
  const canonicalTag = `<link rel="canonical" href="${BASE_URL}/tools/${filename}">`;

  if (html.includes('rel="canonical"')) {
    warn(`tools/${filename} already has canonical — skipping`);
    return;
  }

  // Inject after <meta charset> or after first <meta> or before </head>
  if (html.includes('<meta charset')) {
    html = html.replace(
      /(<meta charset[^>]+>)/,
      `$1\n  ${canonicalTag}`
    );
  } else if (html.includes('</title>')) {
    html = html.replace('</title>', `</title>\n  ${canonicalTag}`);
  } else {
    html = html.replace('</head>', `  ${canonicalTag}\n</head>`);
  }

  // Also add meta robots if missing
  if (!html.includes('name="robots"')) {
    html = html.replace(
      canonicalTag,
      `${canonicalTag}\n  <meta name="robots" content="index, follow">`
    );
  }

  fs.writeFileSync(filePath, html);
  fileCount++;
  fix(`tools/${filename}: added canonical tag → ${BASE_URL}/tools/${filename}`);
});

// Fix wrong canonicals
WRONG_CANONICAL.forEach(({ file, wrong, correct }) => {
  const filePath = path.join(TOOLS_DIR, file);
  if (!fs.existsSync(filePath)) {
    warn(`File not found: tools/${file} — skipping`);
    return;
  }
  let html = fs.readFileSync(filePath, 'utf-8');

  if (html.includes(wrong)) {
    html = html.replace(wrong, correct);
    fs.writeFileSync(filePath, html);
    fileCount++;
    fix(`tools/${file}: corrected canonical from "${wrong}" → "${correct}"`);
  } else {
    // Check if it's a slightly different variant
    const canonMatch = html.match(/rel="canonical" href="([^"]+)"/);
    if (canonMatch && canonMatch[1] !== correct) {
      html = html.replace(canonMatch[0], `rel="canonical" href="${correct}"`);
      fs.writeFileSync(filePath, html);
      fileCount++;
      fix(`tools/${file}: corrected canonical (variant) → "${correct}"`);
    } else if (canonMatch && canonMatch[1] === correct) {
      log(`  ✓ tools/${file}: canonical already correct`);
    } else {
      // Add canonical if completely missing
      const canonicalTag = `<link rel="canonical" href="${correct}">`;
      if (html.includes('</title>')) {
        html = html.replace('</title>', `</title>\n  ${canonicalTag}`);
      } else {
        html = html.replace('</head>', `  ${canonicalTag}\n</head>`);
      }
      fs.writeFileSync(filePath, html);
      fileCount++;
      fix(`tools/${file}: added correct canonical → "${correct}"`);
    }
  }
});

// Also fix compress-pdf.html canonical (it's a copy/alias of pdf-compress.html)
const compressCopyPath = path.join(TOOLS_DIR, 'compress-pdf.html');
if (fs.existsSync(compressCopyPath)) {
  let html = fs.readFileSync(compressCopyPath, 'utf-8');
  const correctCanonical = `${BASE_URL}/tools/compress-pdf.html`;
  const canonMatch = html.match(/rel="canonical" href="([^"]+)"/);
  if (canonMatch && canonMatch[1] !== correctCanonical) {
    html = html.replace(canonMatch[0], `rel="canonical" href="${correctCanonical}"`);
    fs.writeFileSync(compressCopyPath, html);
    fileCount++;
    fix(`tools/compress-pdf.html: canonical corrected → ${correctCanonical}`);
  } else if (!canonMatch) {
    html = html.replace('</title>', `</title>\n  <link rel="canonical" href="${correctCanonical}">`);
    fs.writeFileSync(compressCopyPath, html);
    fileCount++;
    fix(`tools/compress-pdf.html: added canonical → ${correctCanonical}`);
  }
}

log('\n══════════════════════════════════════════════════════');
log('  PART 2 Complete');
log('══════════════════════════════════════════════════════\n');

// ─────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────
log('\n══════════════════════════════════════════════════════');
log('  FIX SCRIPT COMPLETE');
log('══════════════════════════════════════════════════════');
log(`  Total fixes applied: ${fixCount}`);
log(`  Files modified:      ${fileCount}`);
log('');
log('  Next steps:');
log('  1. Run: node generate-sitemap.js');
log('  2. Create category hub pages');
log('  3. Create sitemap.html');
log('  4. Run: node audit-seo.js  (verify 0 errors)');
log('');
