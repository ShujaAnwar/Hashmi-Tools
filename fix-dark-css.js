/**
 * fix-dark-css.js
 * Fixes tool pages that have `:root { dark-bg-colors }` which causes black screen on light mode.
 * Pattern: :root has --bg-primary dark (#0a0e...) AND [data-theme="light"] has light colors.
 * Fix: swap them — make :root have light colors, [data-mode="dark"] have dark colors.
 */
const fs = require('fs');
const path = require('path');

const toolDir = path.join(__dirname, 'tools');
const files = fs.readdirSync(toolDir).filter(f => f.endsWith('.html'));

let fixed = 0;
let skipped = 0;

files.forEach(file => {
  const fp = path.join(toolDir, file);
  let html = fs.readFileSync(fp, 'utf8');

  // Detect the pattern: :root has dark bg-primary (starts with #0a, #0f, #1a, #11 etc.)
  const rootDarkPattern = /:root\s*\{([^}]*--bg-primary\s*:\s*#(?:0[a-f0-9]|1[0-9a-f])[^}]*)\}/i;
  const match = html.match(rootDarkPattern);

  if (!match) {
    skipped++;
    return;
  }

  // Also check there's a [data-theme="light"] block
  const hasLightBlock = html.includes('[data-theme="light"]') || html.includes("[data-theme='light']");
  
  // Strategy: Replace :root { dark } with [data-mode="dark"] { dark }
  // and replace [data-theme="light"] { light } with :root,[data-mode="light"] { light }
  
  // Step 1: Rename :root { dark-vars } → [data-mode="dark"],[data-theme="dark"] { dark-vars }
  html = html.replace(
    /(:root)\s*(\{[^}]*--bg-primary\s*:\s*#(?:0[a-f0-9]|1[0-9a-f])[^}]*\})/gi,
    '[data-mode="dark"],[data-theme="dark"]$2'
  );

  // Step 2: Rename [data-theme="light"] { } → :root,[data-mode="light"],[data-theme="light"] { }
  html = html.replace(
    /\[data-theme="light"\]\s*(\{)/g,
    ':root,[data-mode="light"],[data-theme="light"]$1'
  );
  html = html.replace(
    /\[data-theme='light'\]\s*(\{)/g,
    ":root,[data-mode='light'],[data-theme='light']$1"
  );

  fs.writeFileSync(fp, html, 'utf8');
  console.log(`Fixed: ${file}`);
  fixed++;
});

console.log(`\nDone: ${fixed} fixed, ${skipped} skipped (no dark :root pattern)`);
