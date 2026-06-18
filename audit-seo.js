const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, 'tools');
const allToolFiles = fs.readdirSync(toolsDir).filter(f => f.endsWith('.html'));
const indexHtml = fs.readFileSync('index.html', 'utf-8');

console.log('═══════════════════════════════════════════════════════');
console.log('   HashmiTools SEO FULL AUDIT REPORT');
console.log('═══════════════════════════════════════════════════════\n');

// ── 1. Real <a href> links in index.html ──────────────────────────────
const linkRegex = /<a\s+[^>]*href=["']([^"'#]*\.html)["'][^>]*>/gi;
const linkedFiles = new Set();
let m;
while ((m = linkRegex.exec(indexHtml)) !== null) {
  const href = m[1].replace(/^.*tools\//, '').replace(/^\.\//, '');
  if (!href.startsWith('http') && !href.startsWith('//')) linkedFiles.add(href);
}

// ── 2. onclick JS navigation in index.html ────────────────────────────
const onclickMatches = indexHtml.match(/onclick\s*=\s*["'][^"']*tools[^"']*["']/g) || [];
const jsNavigate = indexHtml.match(/onclick\s*=\s*["'][^"']*location[^"']*["']/g) || [];

// ── 3. Orphan pages ───────────────────────────────────────────────────
const orphans = allToolFiles.filter(f => !linkedFiles.has(f));

console.log('SECTION 1 — INTERNAL LINKS ON HOMEPAGE');
console.log('─────────────────────────────────────────');
console.log(`Total tool files in /tools/: ${allToolFiles.length}`);
console.log(`Files linked via real <a href> from index.html: ${linkedFiles.size}`);
console.log(`onclick-based navigation (JS only): ${onclickMatches.length + jsNavigate.length}`);
console.log(`\n❌ ORPHAN PAGES (exist but NOT linked from homepage):`);
orphans.forEach(f => console.log(`   - tools/${f}`));

// ── 4. Canonical tag audit ────────────────────────────────────────────
console.log('\nSECTION 2 — CANONICAL TAG AUDIT');
console.log('─────────────────────────────────────────');
const BASE = 'https://hashmitools.com/tools/';
const VERCEL = 'https://hashmitools.vercel.app/tools/';
let canonMissing = 0, canonWrong = 0, canonOK = 0;
const wrongCanon = [];
allToolFiles.forEach(file => {
  const content = fs.readFileSync(path.join(toolsDir, file), 'utf-8');
  const cm = content.match(/rel=["']canonical["'][^>]*href=["']([^"']+)["']|href=["']([^"']+)["'][^>]*rel=["']canonical["']/);
  const canonical = cm ? (cm[1] || cm[2]) : null;
  const expectedBase = `https://hashmitools.com/tools/${file}`;
  const expectedVercel = `https://hashmitools.vercel.app/tools/${file}`;
  if (!canonical) {
    console.log(`   ❌ MISSING canonical: ${file}`);
    canonMissing++;
  } else if (canonical !== expectedBase && canonical !== expectedVercel) {
    console.log(`   ⚠️  WRONG canonical: ${file}`);
    console.log(`       Has:    ${canonical}`);
    console.log(`       Needs:  ${expectedVercel}`);
    wrongCanon.push(file);
    canonWrong++;
  } else {
    canonOK++;
  }
});
console.log(`\n   ✅ Correct: ${canonOK}  ❌ Missing: ${canonMissing}  ⚠️ Wrong: ${canonWrong}`);

// ── 5. noindex scan ───────────────────────────────────────────────────
console.log('\nSECTION 3 — NOINDEX SCAN');
console.log('─────────────────────────────────────────');
let noindexCount = 0;
allToolFiles.forEach(file => {
  const content = fs.readFileSync(path.join(toolsDir, file), 'utf-8');
  if (/noindex/i.test(content)) {
    console.log(`   ❌ NOINDEX found: ${file}`);
    noindexCount++;
  }
});
if (noindexCount === 0) console.log('   ✅ No noindex tags found');

// ── 6. robots.txt check ───────────────────────────────────────────────
console.log('\nSECTION 4 — ROBOTS.TXT CHECK');
console.log('─────────────────────────────────────────');
const robots = fs.readFileSync('robots.txt', 'utf-8');
if (/Disallow:\s*\/tools/i.test(robots)) {
  console.log('   ❌ CRITICAL: robots.txt is BLOCKING /tools/');
} else if (/Disallow:\s*\/\s*\n/m.test(robots)) {
  console.log('   ❌ CRITICAL: robots.txt is blocking EVERYTHING with Disallow: /');
} else {
  console.log('   ✅ robots.txt not blocking /tools/');
}
const hasSitemap = /Sitemap:/i.test(robots);
console.log(`   Sitemap declared in robots.txt: ${hasSitemap ? '✅ Yes' : '❌ No'}`);

// ── 7. onclick scan in index.html and tool pages ──────────────────────
console.log('\nSECTION 5 — ONCLICK JS NAVIGATION SCAN');
console.log('─────────────────────────────────────────');
const filesToCheck = ['index.html'];
let onclickTotal = 0;
filesToCheck.forEach(f => {
  const content = fs.readFileSync(f, 'utf-8');
  const oc = (content.match(/onclick\s*=\s*["'][^"']*(?:location|navigate|href)[^"']*["']/g) || []).length;
  const divCard = (content.match(/<(?:div|button)[^>]+class=["'][^"']*tool[^"']*["'][^>]+onclick/g) || []).length;
  if (oc + divCard > 0) {
    console.log(`   ⚠️  ${f}: ${oc} location-onclick, ${divCard} div/button-with-onclick tool cards`);
    onclickTotal += oc + divCard;
  }
});
if (onclickTotal === 0) console.log('   ✅ No problematic onclick navigation found');

// ── 8. H1 in raw HTML check ───────────────────────────────────────────
console.log('\nSECTION 6 — H1 IN RAW HTML (not JS-only)');
console.log('─────────────────────────────────────────');
let missingH1 = 0;
allToolFiles.forEach(file => {
  const content = fs.readFileSync(path.join(toolsDir, file), 'utf-8');
  if (!/<h1[\s>]/i.test(content)) {
    console.log(`   ❌ No H1 found: ${file}`);
    missingH1++;
  }
});
if (missingH1 === 0) console.log('   ✅ All pages have H1 in raw HTML');

// ── 9. Title tag check ────────────────────────────────────────────────
console.log('\nSECTION 7 — TITLE TAG AUDIT');
console.log('─────────────────────────────────────────');
let missingTitle = 0;
allToolFiles.forEach(file => {
  const content = fs.readFileSync(path.join(toolsDir, file), 'utf-8');
  const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
  if (!titleMatch) {
    console.log(`   ❌ No title: ${file}`);
    missingTitle++;
  }
});
if (missingTitle === 0) console.log('   ✅ All pages have title tags');

// ── Summary ───────────────────────────────────────────────────────────
console.log('\n═══════════════════════════════════════════════════════');
console.log('   SUMMARY');
console.log('═══════════════════════════════════════════════════════');
console.log(`Total tools: ${allToolFiles.length}`);
console.log(`Orphan pages (not linked from homepage): ${orphans.length}`);
console.log(`Wrong/missing canonicals: ${canonWrong + canonMissing}`);
console.log(`Noindex issues: ${noindexCount}`);
console.log(`\nOrphan list:`);
orphans.forEach(f => console.log(`  tools/${f}`));
