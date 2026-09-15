'use strict';
// Run with Playwright available: node scripts/test-adsense.cjs
// BASE_URL defaults to an already-running local preview. No production writes.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
// Test tracked public pages only: user drafts are deliberately not published by this PR.
const pages = execFileSync('git', ['ls-files', '*.html'], { cwd: root, encoding: 'utf8' })
  .trim().split('\n').filter(file => !file.startsWith('admin/') && !file.startsWith('backend/'));
let inlineScripts = 0;
for (const file of pages) {
  const html = read(file);
  assert.match(html, /name="google-adsense-account" content="ca-pub-5313876284153733"/, file);
  assert.doesNotMatch(html, /<script[^>]+src=["'][^"']*(adsbygoogle|googletagmanager)/i, file);
  const footer = html.match(/<footer\b[\s\S]*?<\/footer>/i)?.[0] || '';
  for (const name of ['about', 'contact', 'privacy', 'terms', 'disclaimer']) {
    assert.match(footer, new RegExp(`href=["'][^"']*${name}\\.html`), `${file}: ${name} footer link`);
  }
  for (const script of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bsrc=/.test(script[1])) continue;
    if (/application\/ld\+json/.test(script[1])) JSON.parse(script[2]);
    else if (!/type=["']module/.test(script[1])) new vm.Script(script[2], { filename: file });
    inlineScripts++;
  }
}
assert.equal(read('ads.txt').trim(), 'google.com, pub-5313876284153733, DIRECT, f08c47fec0942fa0');
assert.doesNotMatch(read('sitemap.xml'), /tools\/shorts-maker\.html/);
assert.doesNotMatch(read('js/main.js'), /url: 'tools\//);
console.log(`PASS static: ${pages.length} published pages, ${inlineScripts} inline script/schema blocks`);

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  const adRequests = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (/googlesyndication|doubleclick|google-analytics/.test(request.url())) adRequests.push(request.url()); });
  const go = async route => {
    const response = await page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 30000 });
    assert.equal(response.status(), 200, route);
  };
  try {
    await go('/contact.html');
    await page.locator('#contactName').fill('Test & Example');
    await page.locator('#contactEmail').fill('test@example.com');
    await page.locator('#contactSubject').selectOption('bug');
    await page.locator('#contactMessage').fill('A & B? <test>');
    await page.locator('#submitBtn').click();
    const draft = new URL(await page.locator('#contactMailLink').getAttribute('href'));
    assert.match(draft.searchParams.get('body'), /A & B\? <test>/);
    assert.equal(await page.locator('#contactSuccess').isVisible(), true);
    assert.match(await page.locator('#contactSuccess').innerText(), /has not been sent/);
    assert.equal(await page.locator('#contactMessage').getAttribute('maxlength'), '1000');
    console.log('PASS contact: encoded draft, honest status, input limit');

    await go('/tools/json-formatter.html');
    await page.locator('#navSearchBtn').click();
    await page.locator('#searchInput').fill('zakat');
    assert.equal(await page.locator('#searchResults a').first().getAttribute('href'), '/tools/zakat-calculator.html');
    await page.locator('#searchInput').fill('<img src=x onerror=window.searchInjected=1>');
    assert.equal(await page.locator('#searchResults img').count(), 0);
    assert.equal(await page.evaluate(() => window.searchInjected), undefined);
    console.log('PASS nested search: correct links and escaped input');

    await page.setViewportSize({ width: 390, height: 844 });
    await go('/');
    await page.locator('#hamburger').click();
    assert.equal(await page.locator('#hamburger').getAttribute('aria-expanded'), 'true');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#hamburger').getAttribute('aria-expanded'), 'false');
    console.log('PASS mobile menu: open, close and accessible state');
    await page.setViewportSize({ width: 1280, height: 900 });

    await go('/tools/seo-audit.html');
    await page.locator('#saUrlInput').fill('https://example.com/test');
    await page.locator('#saHtmlInput').fill('<html lang="en"><head><title>Local SEO test page</title><meta name="robots" content="&lt;img src=x onerror=window.auditInjected=1&gt;"><link rel="canonical" href="javascript:alert(1)"></head><body><h1>Local audit</h1><p>Original sample content.</p></body></html>');
    await page.evaluate(() => { window.auditFetches = 0; window.fetch = async () => { window.auditFetches++; throw new Error('Network forbidden in local test'); }; });
    await page.evaluate(() => runAudit());
    assert.equal(await page.locator('#saScoreSection').evaluate(el => el.classList.contains('show')), true);
    assert.equal(await page.evaluate(() => window.auditFetches), 0);
    assert.equal(await page.locator('#saMetaContent img, #saMetaContent a[href^="javascript:"]').count(), 0);
    assert.equal(await page.evaluate(() => window.auditInjected), undefined);
    await page.locator('#saHtmlInput').fill('');
    await page.evaluate(() => runAudit());
    assert.match(await page.locator('#saErrorDesc').innerText(), /Paste the page HTML/);
    assert.equal(await page.evaluate(() => window.auditFetches), 1);
    console.log('PASS SEO: local mode, safe output, no proxy without permission');

    await go('/tools/shorts-maker.html');
    assert.equal(await page.locator('#videoFileInput').isDisabled(), true);
    assert.equal(await page.locator('#currentApiBase').innerText(), 'Not configured');
    await page.locator('#backendUrlInput').fill('http://localhost:3001');
    await page.evaluate(() => saveBackendUrl());
    assert.match(await page.locator('#backendStatusMsg').innerText(), /valid HTTPS/);
    console.log('PASS video: disabled without backend, invalid URL rejected');

    await go('/tools/cv-builder.html');
    let acceptAI = false;
    page.on('dialog', dialog => acceptAI ? dialog.accept() : dialog.dismiss());
    await page.evaluate(() => { window.aiCalls = 0; window.fetch = async () => { window.aiCalls++; return { ok: false, status: 503 }; }; });
    await page.evaluate(() => runAtsScore());
    assert.equal(await page.evaluate(() => window.aiCalls), 0);
    assert.match(await page.locator('#atsResultArea').innerText(), /Local checklist estimate/);
    acceptAI = true;
    await page.evaluate(() => runAtsScore());
    assert.match(await page.locator('#atsResultArea').innerText(), /No score was generated/);
    assert.equal(await page.locator('.cv-ats-score-circle').count(), 0);
    console.log('PASS CV: local alternative, no fabricated AI failure score');

    for (const route of ['/about.html', '/privacy.html', '/terms.html', '/tools/ai-hashtag.html']) await go(route);
    assert.deepEqual(adRequests, [], 'No advertising requests before consent configuration');
    assert.deepEqual(errors, [], 'No uncaught browser errors');
    console.log('PASS browser: no uncaught errors or advertising requests on tested pages');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
