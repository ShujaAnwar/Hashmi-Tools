/**
 * fix-hubs.js — Fix hub/category pages and remaining FAIL pages
 */
const fs = require('fs');

const fixes = [
  // ai.html — add about link + how-it-works before footer
  {
    file: 'tools/ai.html',
    search: `<footer style="background:var(--bg-secondary);padding:40px 0;text-align:center;border-top:1px solid var(--border-glass);">
    <div class="container">
      <p style="color:var(--text-secondary)">© 2025 <a href="../index.html" style="color:#a78bfa">HashmiTools.com</a> — Free AI Tools</p>
      <div style="display:flex;gap:24px;justify-content:center;margin-top:16px;flex-wrap:wrap;">
        <a href="../privacy.html" style="color:var(--text-muted);font-size:0.9rem">Privacy Policy</a>
        <a href="../terms.html" style="color:var(--text-muted);font-size:0.9rem">Terms</a>
        <a href="../contact.html" style="color:var(--text-muted);font-size:0.9rem">Contact</a>
      </div>
    </div>
  </footer>`,
    replacement: `<footer style="background:var(--bg-secondary);padding:40px 0;text-align:center;border-top:1px solid var(--border-glass);">
    <div class="container">
      <p style="color:var(--text-secondary)">© 2026 <a href="../index.html" style="color:#a78bfa">HashmiTools.com</a> — Free AI Tools</p>
      <div style="display:flex;gap:24px;justify-content:center;margin-top:16px;flex-wrap:wrap;">
        <a href="../about.html" style="color:var(--text-muted);font-size:0.9rem">About</a>
        <a href="../privacy.html" style="color:var(--text-muted);font-size:0.9rem">Privacy Policy</a>
        <a href="../terms.html" style="color:var(--text-muted);font-size:0.9rem">Terms</a>
        <a href="../contact.html" style="color:var(--text-muted);font-size:0.9rem">Contact</a>
      </div>
    </div>
  </footer>`
  },

];

// Generic hub fix — replace "© 2025" in footer with "© 2026" and add About link
const hubFiles = [
  'tools/developer.html',
  'tools/finance.html', 
  'tools/health.html',
  'tools/image-tools.html',
  'tools/islamic.html',
  'tools/pakistan.html',
  'tools/pdf.html',
  'tools/productivity.html',
];

for (const file of hubFiles) {
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, 'utf8');
  // Update copyright year
  html = html.replace(/© 2025/g, '© 2026');
  // Add About link before Privacy in footer links
  html = html.replace(/<a href="\.\.\/privacy\.html">/g, '<a href="../about.html">About</a><a href="../contact.html">Contact</a><a href="../privacy.html">');
  // Avoid duplicating if already has about
  if ((html.match(/about\.html/g) || []).length > 2) {
    // Too many, revert contact de-dup
    html = html.replace(/<a href="\.\.\/about\.html">About<\/a><a href="\.\.\/contact\.html">Contact<\/a><a href="\.\.\/about\.html">About<\/a><a href="\.\.\/contact\.html">Contact<\/a>/g, 
      '<a href="../about.html">About</a><a href="../contact.html">Contact</a>');
  }
  fs.writeFileSync(file, html);
  console.log(`✓ Fixed footer: ${file}`);
}

// Process specific fixes
for (const fix of fixes) {
  if (!fs.existsSync(fix.file)) { console.log(`SKIP: ${fix.file}`); continue; }
  let html = fs.readFileSync(fix.file, 'utf8');
  if (html.includes(fix.search)) {
    html = html.replace(fix.search, fix.replacement);
    fs.writeFileSync(fix.file, html);
    console.log(`✓ Fixed: ${fix.file}`);
  } else {
    // Fallback: just update year and add about link
    html = html.replace(/© 2025/g, '© 2026');
    html = html.replace(/<a href="\.\.\/privacy\.html"/g, '<a href="../about.html" style="color:var(--text-muted);font-size:0.9rem">About</a>\n        <a href="../contact.html" style="color:var(--text-muted);font-size:0.9rem">Contact</a>\n        <a href="../privacy.html"');
    fs.writeFileSync(fix.file, html);
    console.log(`✓ Fallback fixed: ${fix.file}`);
  }
}

console.log('Done');
