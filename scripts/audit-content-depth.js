#!/usr/bin/env node
/**
 * audit-content-depth.js
 * HashmiTools AdSense Content Depth Audit
 * Measures every tool page for Google AdSense "low value content" criteria
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ── Strip HTML tags and noise ──────────────────────────────────────────────
function stripHtml(html) {
  // Remove script/style blocks entirely
  html = html.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  html = html.replace(/<style[\s\S]*?<\/style>/gi, ' ');
  // Remove nav, footer, header, form elements (labels, buttons, inputs, options)
  html = html.replace(/<(nav|header|footer)[\s\S]*?<\/\1>/gi, ' ');
  html = html.replace(/<(form|select|option|input|button|label)[^>]*>[\s\S]*?<\/\1>/gi, ' ');
  html = html.replace(/<(input|br|hr|img)[^>]*>/gi, ' ');
  // Remove all remaining tags
  html = html.replace(/<[^>]+>/g, ' ');
  // Decode common entities
  html = html.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  html = html.replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, ' ').replace(/&[a-z]+;/g, ' ');
  // Collapse whitespace
  return html.replace(/\s+/g, ' ').trim();
}

function wordCount(text) {
  return text.split(/\s+/).filter(w => w.length > 2).length;
}

// ── Content signal detectors ───────────────────────────────────────────────
function hasHowItWorks(html, text) {
  // Must have actual formula/method explanation, not just "How to Use" steps
  const formulaSignals = [
    /how\s+it\s+works?/i,
    /formula/i,
    /calcul(ated|ation|ates)/i,
    /method\b/i,
    /algorithm/i,
    /equation/i,
    /behind\s+the\s+(scenes|tool|calculator)/i,
    /works?\s+by/i,
    /computed?\s+(using|from|as)/i,
  ];
  return formulaSignals.some(rx => rx.test(text)) && text.length > 500;
}

function hasWorkedExample(html, text) {
  const exampleSignals = [
    /for\s+example/i,
    /example[:\s]/i,
    /suppose\s+(you|we|a|an)/i,
    /let['']?s\s+say/i,
    /consider\s+(a|an|the\s+following)/i,
    /sample\s+(calculation|input|scenario|result)/i,
    /worked\s+example/i,
    /e\.g\./i,
    /step[\s-]by[\s-]step/i,
    /result(?:s)?\s*[=:]/i,
  ];
  return exampleSignals.some(rx => rx.test(text));
}

function faqCount(html) {
  // Count substantial FAQ items — schema or H3/H4-based Q&A blocks
  const schemaMatches = (html.match(/"@type"\s*:\s*"Question"/g) || []).length;
  if (schemaMatches >= 3) return schemaMatches;
  // Fallback: count faq-style heading+answer pairs
  const headingQs = (html.match(/<h[34][^>]*>[^<]{15,}[?][^<]*<\/h[34]>/gi) || []).length;
  return headingQs;
}

function hasWhoShouldUse(html, text) {
  return /who\s+(should|can|needs?|uses?|is\s+this|this\s+is)\b/i.test(text) ||
         /ideal\s+for\b/i.test(text) ||
         /designed\s+for\b/i.test(text) ||
         /perfect\s+for\b/i.test(text) ||
         /best\s+for\b/i.test(text) ||
         /useful\s+(for|to)\b/i.test(text);
}

// ── Uniqueness check — detect templated boilerplate ────────────────────────
const templatePhrases = [
  'fast, free and easy to use',
  'simply enter your',
  'just enter your',
  'all you need to do is',
  'our free online tool',
  'this free tool allows you to',
  'no registration required',
  'works on all devices',
  'completely free to use',
  'user-friendly interface',
  'intuitive interface',
  'easy to use interface',
  'start using our',
  'use our free',
  'simple and easy',
];

function templateScore(text) {
  const lower = text.toLowerCase();
  let hits = 0;
  templatePhrases.forEach(p => { if (lower.includes(p)) hits++; });
  return hits; // 0-2 = OK, 3-4 = questionable, 5+ = templated
}

// ── Main audit ─────────────────────────────────────────────────────────────
const toolsDir = path.join(__dirname, 'tools');
const files = fs.readdirSync(toolsDir)
  .filter(f => f.endsWith('.html'))
  .sort();

const results = [];
let strongCount = 0, thinCount = 0, criticalCount = 0;

for (const file of files) {
  const filePath = path.join(toolsDir, file);
  const html = fs.readFileSync(filePath, 'utf8');
  const text = stripHtml(html);
  const wc   = wordCount(text);
  const hiw  = hasHowItWorks(html, text);
  const ex   = hasWorkedExample(html, text);
  const faq  = faqCount(html);
  const who  = hasWhoShouldUse(html, text);
  const tmpl = templateScore(text);
  const isUnique = tmpl <= 2;

  // Verdict logic
  let verdict;
  const score = (wc >= 600 ? 2 : wc >= 300 ? 1 : 0)
              + (hiw ? 2 : 0)
              + (ex  ? 1 : 0)
              + (faq >= 5 ? 2 : faq >= 3 ? 1 : 0)
              + (who ? 1 : 0)
              + (isUnique ? 1 : -2);

  if (score >= 7)      { verdict = 'STRONG';   strongCount++; }
  else if (score >= 3) { verdict = 'THIN';     thinCount++; }
  else                 { verdict = 'CRITICAL';  criticalCount++; }

  results.push({
    file, wc, hiw, ex, faq, who,
    unique: isUnique ? 'Y' : `N(${tmpl}hits)`,
    score, verdict
  });
}

// ── Print report ───────────────────────────────────────────────────────────
const W = [42, 7, 7, 5, 5, 5, 12, 6, 10];
const cols = ['File', 'Words', 'HowItW', 'Ex', 'FAQ', 'Who', 'Unique', 'Score', 'Verdict'];

function padR(s, n) { return String(s).padEnd(n); }
function padL(s, n) { return String(s).padStart(n); }

const header = cols.map((c, i) => padR(c, W[i])).join(' | ');
const divider = W.map(w => '-'.repeat(w)).join('-+-');

console.log('\n' + '═'.repeat(120));
console.log('  HashmiTools.com — Content Depth Audit (AdSense Compliance)');
console.log('═'.repeat(120));
console.log(header);
console.log(divider);

results.forEach(r => {
  const row = [
    padR(r.file, W[0]),
    padL(r.wc, W[1]),
    padR(r.hiw ? 'YES' : 'NO', W[2]),
    padR(r.ex  ? 'YES' : 'NO', W[3]),
    padL(r.faq, W[4]),
    padR(r.who ? 'YES' : 'NO', W[5]),
    padR(r.unique, W[6]),
    padL(r.score, W[7]),
    padR(r.verdict, W[8]),
  ].join(' | ');
  console.log(row);
});

console.log(divider);
console.log(`\nSUMMARY: ${results.length} tool pages`);
console.log(`  ✅ STRONG:   ${strongCount} pages`);
console.log(`  ⚠️  THIN:     ${thinCount} pages`);
console.log(`  🚨 CRITICAL: ${criticalCount} pages`);

console.log('\nCRITICAL pages (must deepen or noindex):');
results.filter(r => r.verdict === 'CRITICAL').forEach(r =>
  console.log(`  🚨 ${r.file} — ${r.wc} words`)
);
console.log('\nTHIN pages (must deepen):');
results.filter(r => r.verdict === 'THIN').forEach(r =>
  console.log(`  ⚠️  ${r.file} — ${r.wc} words`)
);

// Machine-readable JSON for scripting
fs.writeFileSync(
  path.join(__dirname, 'audit-report.json'),
  JSON.stringify(results, null, 2)
);
console.log('\nFull report saved to audit-report.json\n');
