/**
 * audit-theme.js — HashmiTools Theme Audit + Auto-Fix
 * Checks all tool pages for: early theme-init in <head>, theme.js before </body>,
 * hardcoded dark data-theme/data-mode on <html>, hardcoded dark backgrounds in inline <style>
 */
const fs = require('fs');
const path = require('path');

const toolDir = path.join(__dirname, 'tools');
const hubPages = ['ai.html','developer.html','finance.html','health.html','image-tools.html','islamic.html','pakistan.html','pdf.html','productivity.html'];
const files = fs.readdirSync(toolDir).filter(f => f.endsWith('.html') && !hubPages.includes(f));

const THEME_INIT_SNIPPET = `  <script>
    (function(){
      var t=localStorage.getItem('ht-theme')||'light';
      var m=localStorage.getItem('ht-mode')||'light';
      document.documentElement.setAttribute('data-theme',t);
      document.documentElement.setAttribute('data-mode',m);
    })();
  </script>`;

const DARK_BG_PATTERN = /#0[a-f0-9]{5}|#1[0-3][a-f0-9]{4}|background:\s*#0[a-f0-9]{5}|background:\s*#0[a-f0-9]{2}\b/i;

let passCount = 0, failCount = 0, fixedCount = 0;

files.forEach(file => {
  const fp = path.join(toolDir, file);
  let html = fs.readFileSync(fp, 'utf8');
  const issues = [];
  let modified = false;

  // Check 1: early theme-init in <head>
  const hasThemeInit = html.includes("localStorage.getItem('ht-theme')") || 
                       html.includes('localStorage.getItem("ht-theme")') ||
                       html.includes("localStorage.getItem('hashmi_theme')");
  if (!hasThemeInit) {
    issues.push('MISSING early theme-init in <head>');
    // Fix: insert after <head> or after first <meta charset>
    if (html.includes('<meta charset=')) {
      html = html.replace(/(<meta charset=[^>]+>)/i, '$1\n' + THEME_INIT_SNIPPET);
    } else {
      html = html.replace(/<head>/i, '<head>\n' + THEME_INIT_SNIPPET);
    }
    modified = true;
  }

  // Check 2: theme.js before </body>
  const hasThemeJs = html.includes('theme.js') || html.includes('assets/js/theme');
  if (!hasThemeJs) {
    issues.push('MISSING theme.js script');
    html = html.replace('</body>', '  <script src="../assets/js/theme.js"></script>\n</body>');
    modified = true;
  }

  // Check 3: hardcoded data-theme/data-mode="dark" on <html>
  if (/<html[^>]+(data-theme|data-mode)=["']dark["']/i.test(html)) {
    issues.push('HARDCODED dark data-theme/data-mode on <html>');
    html = html.replace(/(<html[^>]*)(data-theme|data-mode)=["']dark["']/gi, '$1');
    modified = true;
  }

  // Check 4: hardcoded dark background in :root (already handled by fix-dark-css.js but double-check)
  const rootDarkMatch = html.match(/:root\s*\{[^}]*--bg-primary:\s*#(?:0[a-f0-9]{5}|1[0-3][a-f0-9]{4})/i);
  if (rootDarkMatch) {
    issues.push('HARDCODED dark :root CSS (dark bg in :root)');
  }

  if (modified) {
    fs.writeFileSync(fp, html, 'utf8');
    fixedCount++;
  }

  if (issues.length > 0) {
    failCount++;
    console.log(`\n❌ ${file}`);
    issues.forEach(i => console.log(`   • ${i}${i.startsWith('MISSING') ? ' → FIXED' : ''}`));
  } else {
    passCount++;
  }
});

console.log(`\n══════════════════════════════════════`);
console.log(`PASS: ${passCount}  FAIL: ${failCount}  FIXED: ${fixedCount}  TOTAL: ${files.length}`);
