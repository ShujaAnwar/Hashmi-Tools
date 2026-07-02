#!/usr/bin/env node
/**
 * inject-content.js
 * Usage: node inject-content.js <filename> <htmlBlock>
 * Injects HTML content block before </main> or <footer on a tool page
 */
'use strict';
const fs = require('fs');
const path = require('path');

const file = process.argv[2];
const block = process.argv[3];

if (!file || !block) {
  console.error('Usage: node inject-content.js <file> <htmlBlock>');
  process.exit(1);
}

const filePath = path.join(__dirname, 'tools', file);
let html = fs.readFileSync(filePath, 'utf8');

// Inject before </main> first, then <footer, then </body>
let injected = false;
if (html.includes('</main>')) {
  html = html.replace('</main>', block + '\n</main>');
  injected = true;
} else if (html.includes('<footer')) {
  html = html.replace('<footer', block + '\n<footer');
  injected = true;
} else {
  html = html.replace('</body>', block + '\n</body>');
  injected = true;
}

fs.writeFileSync(filePath, html);
console.log('✅ Injected into ' + file);
