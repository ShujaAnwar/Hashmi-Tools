/**
 * audit-seo.js — HashmiTools SEO Audit
 * Checks every tool page for required SEO elements
 */
const fs = require('fs');
const path = require('path');

const toolDir = path.join(__dirname, 'tools');
const files = fs.readdirSync(toolDir).filter(f => f.endsWith('.html') && !['ai.html','developer.html','finance.html','health.html','image-tools.html','islamic.html','pakistan.html','pdf.html','productivity.html'].includes(f));

const results = [];

files.forEach(file => {
  const fp = path.join(toolDir, file);
  const html = fs.readFileSync(fp, 'utf8');
  const issues = [];

  // Title check
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';
  if (!title) issues.push('MISSING title');
  else if (title.length < 30) issues.push(`title too short (${title.length} chars): "${title}"`);
  else if (title.length > 70) issues.push(`title too long (${title.length} chars)`);
  else if (!title.includes('HashmiTools') && !title.includes('hashmitools')) issues.push('title missing brand "HashmiTools"');

  // Meta description
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i) || html.match(/<meta\s+content="([^"]*)"\s+name="description"/i);
  const desc = descMatch ? descMatch[1].trim() : '';
  if (!desc) issues.push('MISSING meta description');
  else if (desc.length < 80) issues.push(`meta desc too short (${desc.length} chars)`);
  else if (desc.length > 170) issues.push(`meta desc too long (${desc.length} chars)`);

  // Canonical
  const canonMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i);
  const canon = canonMatch ? canonMatch[1] : '';
  if (!canon) issues.push('MISSING canonical');
  else if (!canon.includes('hashmitools.com')) issues.push(`canonical not on hashmitools.com: ${canon}`);

  // H1
  const h1Count = (html.match(/<h1[\s>]/gi) || []).length;
  if (h1Count === 0) issues.push('MISSING H1');
  else if (h1Count > 1) issues.push(`multiple H1s (${h1Count})`);

  // Robots meta
  if (!html.includes('name="robots"')) issues.push('MISSING robots meta');

  // JSON-LD
  if (!html.includes('application/ld+json')) issues.push('MISSING JSON-LD schema');

  // FAQ section
  const hasFaq = /faq|FAQ|frequently asked/i.test(html);
  if (!hasFaq) issues.push('MISSING FAQ section');

  // How to use
  const hasHowTo = /how to use|how-to|step[s]?:|Step \d/i.test(html);
  if (!hasHowTo) issues.push('MISSING How-to section');

  results.push({ file, title, issues });
});

// Print report
let passCount = 0;
let failCount = 0;
results.forEach(r => {
  if (r.issues.length === 0) {
    passCount++;
  } else {
    failCount++;
    console.log(`\n❌ ${r.file}`);
    r.issues.forEach(i => console.log(`   • ${i}`));
  }
});

console.log(`\n═══════════════════════════════════`);
console.log(`PASS: ${passCount}  FAIL: ${failCount}  TOTAL: ${results.length}`);
