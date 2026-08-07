/**
 * seo-inject.js
 * Advanced SEO injection script for HashmiTools.com
 * Fixes: OG tags, Twitter Card, BreadcrumbList schema, Twitter meta,
 *        missing og:image, og:description, twitter:card across all tool pages.
 * Also adds: SiteLinksSearchBox schema to index.html
 */

'use strict';
const fs   = require('fs');
const path = require('path');

const BASE_URL  = 'https://hashmitools.com';
const OG_IMAGE  = 'https://hashmitools.com/og-image.png';

// ── Per-tool metadata catalogue ──────────────────────────────────────────
const TOOLS = {
  'tools/age-calculator.html': {
    title: 'Free Age Calculator – Calculate Exact Age in Years, Months & Days | HashmiTools',
    desc:  'Calculate your exact age in years, months, days and hours. Enter your date of birth and get precise age instantly. Free online age calculator — no signup needed.',
    keywords: 'age calculator, how old am i, date of birth calculator, exact age calculator, years months days calculator',
    category: 'Health & Utility',
    emoji: '🎂',
  },
  'tools/ai-hashtag.html': {
    title: 'Free AI Hashtag Generator – Instagram, TikTok & Twitter Hashtags | HashmiTools',
    desc:  'Generate AI-powered hashtags for Instagram, TikTok, Twitter/X and YouTube instantly. Get 30 trending niche hashtags per post — free, no login, no limits.',
    keywords: 'hashtag generator, ai hashtag generator, instagram hashtags, tiktok hashtags, twitter hashtags, free hashtag tool',
    category: 'AI Tools',
    emoji: '#️⃣',
  },
  'tools/ai.html': {
    title: 'Free AI Tools – ChatGPT, Summarizer & AI Utilities | HashmiTools',
    desc:  'Access a suite of free AI tools: text summarizer, AI writer, content generator and more — no API key needed. Powered by advanced AI models.',
    keywords: 'free ai tools, ai writer, text summarizer, ai content generator, chatgpt alternative',
    category: 'AI Tools',
    emoji: '🤖',
  },
  'tools/background-remover.html': {
    title: 'Free Background Remover – Remove Image Background Online | HashmiTools',
    desc:  'Remove background from any image instantly for free. AI-powered background eraser — upload your photo and download the transparent PNG in seconds.',
    keywords: 'background remover, remove background from image, transparent png, image background eraser free',
    category: 'Image Tools',
    emoji: '🖼️',
  },
  'tools/base64.html': {
    title: 'Free Base64 Encoder Decoder – Encode & Decode Online | HashmiTools',
    desc:  'Encode text or files to Base64 and decode Base64 strings back to plain text instantly. Free online Base64 encoder/decoder — no installation required.',
    keywords: 'base64 encoder, base64 decoder, base64 encode decode online, base64 converter free',
    category: 'Developer Tools',
    emoji: '🔡',
  },
  'tools/bmi-calculator.html': {
    title: 'Free BMI Calculator – Body Mass Index | Healthy Weight Check | HashmiTools',
    desc:  'Calculate your Body Mass Index (BMI) instantly. Find out if you are underweight, healthy, overweight or obese. Free online BMI calculator for adults.',
    keywords: 'bmi calculator, body mass index, healthy weight calculator, bmi chart, bmi calculator online free',
    category: 'Health Tools',
    emoji: '⚖️',
  },
  'tools/calorie-calculator.html': {
    title: 'Free Calorie Calculator – Daily Calorie Intake for Weight Loss | HashmiTools',
    desc:  'Calculate your daily calorie needs for weight loss, maintenance or muscle gain. Based on age, gender, weight, height and activity level. Free online calorie calculator.',
    keywords: 'calorie calculator, daily calorie intake, calorie counter, tdee calculator, weight loss calorie calculator',
    category: 'Health Tools',
    emoji: '🔥',
  },
  'tools/compound-interest.html': {
    title: 'Free Compound Interest Calculator – Investment Growth | HashmiTools',
    desc:  'Calculate compound interest on investments or loans. See how your money grows with daily, monthly or annual compounding. Free compound interest calculator.',
    keywords: 'compound interest calculator, investment calculator, compound interest formula, interest calculator online',
    category: 'Finance Tools',
    emoji: '📈',
  },
  'tools/computer-doctor.html': {
    title: 'Computer Doctor – AI PC Problem Diagnosis & Fix Guide | HashmiTools',
    desc:  'Diagnose PC problems with AI. Describe your computer issue and get step-by-step fix instructions. Free online computer troubleshooting tool.',
    keywords: 'computer doctor, pc problem diagnosis, computer troubleshooter, fix computer problems, pc repair guide',
    category: 'AI Tools',
    emoji: '🖥️',
  },
  'tools/compress-pdf.html': {
    title: 'Free PDF Compressor – Reduce PDF File Size Online | HashmiTools',
    desc:  'Compress PDF files to reduce size without losing quality. Fast online PDF compressor — no signup, no watermark, no file size limit.',
    keywords: 'compress pdf, reduce pdf size, pdf compressor online free, shrink pdf file, pdf size reducer',
    category: 'PDF Tools',
    emoji: '🗜️',
  },
  'tools/currency-converter.html': {
    title: 'Free Currency Converter – Live Exchange Rates PKR, USD, EUR | HashmiTools',
    desc:  'Convert currencies instantly with live exchange rates. Supports 150+ currencies including PKR, USD, EUR, GBP, SAR, AED. Free real-time currency converter.',
    keywords: 'currency converter, usd to pkr, live exchange rates, pkr to usd, dollar rate today pakistan, free currency converter',
    category: 'Finance Tools',
    emoji: '💱',
  },
  'tools/cv-builder.html': {
    title: 'Free CV Builder – Create Professional Resume Online | HashmiTools',
    desc:  'Build a professional CV or resume online for free. Choose from templates, add your details and download as PDF. No account needed.',
    keywords: 'cv builder, resume maker, free cv creator, professional resume builder, resume template online',
    category: 'Productivity Tools',
    emoji: '📄',
  },
  'tools/developer.html': {
    title: 'Free Developer Tools – JSON, Base64, URL Encoder & More | HashmiTools',
    desc:  'Essential free developer utilities: JSON formatter, Base64 encoder, URL encoder, QR code generator, password generator and more. All tools in one place.',
    keywords: 'developer tools online, json formatter, base64 encoder, url encoder decoder, free dev tools',
    category: 'Developer Tools',
    emoji: '👨‍💻',
  },
  'tools/emi-calculator.html': {
    title: 'Free EMI Calculator – Loan Monthly Payment & Amortization | HashmiTools',
    desc:  'Calculate loan EMI instantly. Get monthly payment, total interest, and full amortization schedule. Free online EMI calculator for car, home, and personal loans.',
    keywords: 'emi calculator, loan calculator, monthly installment calculator, home loan emi, car loan emi pakistan',
    category: 'Finance Tools',
    emoji: '🏦',
  },
  'tools/finance.html': {
    title: 'Free Finance Tools – EMI, Zakat, Currency & Investment Calculators | HashmiTools',
    desc:  'Complete suite of free finance tools: EMI calculator, Zakat calculator, currency converter, compound interest, SIP calculator and Pakistan tax calculator.',
    keywords: 'finance tools, emi calculator, zakat calculator, currency converter, investment calculator, pakistan finance tools',
    category: 'Finance Tools',
    emoji: '💰',
  },
  'tools/health.html': {
    title: 'Free Health Tools – BMI, Calorie & Ideal Weight Calculators | HashmiTools',
    desc:  'Free health calculators: BMI calculator, calorie calculator, ideal weight calculator, water intake calculator, and more. Take control of your health today.',
    keywords: 'health calculator, bmi calculator, calorie calculator, ideal weight, water intake calculator, health tools free',
    category: 'Health Tools',
    emoji: '🏥',
  },
  'tools/hex-rgb.html': {
    title: 'Free HEX to RGB Color Converter – Color Code Converter | HashmiTools',
    desc:  'Convert HEX color codes to RGB, HSL, and CMYK instantly. Free online color converter tool for designers and developers.',
    keywords: 'hex to rgb, rgb to hex, color converter, hex color code, color picker tool online',
    category: 'Developer Tools',
    emoji: '🎨',
  },
  'tools/hijri-converter.html': {
    title: 'Free Hijri Date Converter – Islamic Calendar to Gregorian | HashmiTools',
    desc:  'Convert Hijri (Islamic) dates to Gregorian and back. Find Islamic calendar dates for 2025-2026. Free online Hijri calendar converter.',
    keywords: 'hijri converter, islamic date converter, hijri to gregorian, gregorian to hijri, islamic calendar 2025',
    category: 'Islamic Tools',
    emoji: '🌙',
  },
  'tools/ideal-weight.html': {
    title: 'Free Ideal Weight Calculator – Healthy Body Weight by Height | HashmiTools',
    desc:  'Calculate your ideal body weight based on height, age, and gender using multiple formulas (Devine, Robinson, Miller). Free ideal weight calculator.',
    keywords: 'ideal weight calculator, healthy weight for height, body weight calculator, how much should i weigh',
    category: 'Health Tools',
    emoji: '⚖️',
  },
  'tools/image-compressor.html': {
    title: 'Free Image Compressor – Compress JPG PNG WebP Online | HashmiTools',
    desc:  'Compress images online for free. Reduce JPG, PNG, and WebP file sizes without losing quality. No signup, no watermark, instant download.',
    keywords: 'image compressor, compress jpg, compress png, reduce image size, image optimizer online free',
    category: 'Image Tools',
    emoji: '🗜️',
  },
  'tools/image-editor.html': {
    title: 'Free Online Image Editor – Resize, Crop & Edit Photos | HashmiTools',
    desc:  'Edit images online for free. Resize, crop, rotate, add filters and text to photos. No software download needed — works in browser.',
    keywords: 'image editor online, photo editor free, resize image, crop image online, edit photo online',
    category: 'Image Tools',
    emoji: '✏️',
  },
  'tools/image-tools.html': {
    title: 'Free Image Tools – Compress, Edit, Convert & Remove Background | HashmiTools',
    desc:  'Complete free image toolkit: compress images, edit photos, remove backgrounds, convert formats, and more — all online, no signup required.',
    keywords: 'image tools, free image editor, image compressor, background remover, image converter online',
    category: 'Image Tools',
    emoji: '🖼️',
  },
  'tools/inheritance-calculator.html': {
    title: 'Free Islamic Inheritance Calculator – Faraid Calculator | HashmiTools',
    desc:  'Calculate Islamic inheritance (Faraid) shares accurately. Distribute estate per Quran and Sunnah — enter heirs and asset value for exact shares.',
    keywords: 'islamic inheritance calculator, faraid calculator, mirath calculator, islamic estate distribution, inheritance shares islam',
    category: 'Islamic Tools',
    emoji: '📜',
  },
  'tools/iq-test.html': {
    title: 'Free Online IQ Test – Measure Your Intelligence | HashmiTools',
    desc:  'Take a free online IQ test and measure your intelligence quotient. Pattern recognition, logic, and spatial reasoning questions. Get your score in 10 minutes.',
    keywords: 'iq test free, online iq test, intelligence test, iq score test, free iq test online 2025',
    category: 'Productivity Tools',
    emoji: '🧠',
  },
  'tools/islamic.html': {
    title: 'Free Islamic Tools – Zakat, Prayer Times, Hijri Calendar | HashmiTools',
    desc:  'Complete Islamic toolkit: Zakat calculator, prayer times, Hijri date converter, Qurbani calculator, inheritance calculator and more. Free Islamic tools online.',
    keywords: 'islamic tools, zakat calculator, prayer times, hijri calendar, qurbani calculator, islamic inheritance',
    category: 'Islamic Tools',
    emoji: '☪️',
  },
  'tools/jpg-to-pdf.html': {
    title: 'Free JPG to PDF Converter – Convert Images to PDF | HashmiTools',
    desc:  'Convert JPG, PNG, and WebP images to PDF online for free. Combine multiple images into one PDF document. No signup, no watermark.',
    keywords: 'jpg to pdf, image to pdf, convert jpg to pdf online, png to pdf, free image to pdf converter',
    category: 'PDF Tools',
    emoji: '📸',
  },
  'tools/json-formatter.html': {
    title: 'Free JSON Formatter & Validator – Pretty Print JSON | HashmiTools',
    desc:  'Format, validate, and beautify JSON data online. Pretty-print JSON, detect errors, minify JSON — free online JSON formatter tool.',
    keywords: 'json formatter, json validator, json beautifier, pretty print json, format json online, json minifier',
    category: 'Developer Tools',
    emoji: '{ }',
  },
  'tools/link-shortener.html': {
    title: 'Free URL Shortener – Create Short Links via TinyURL & is.gd | HashmiTools',
    desc:  'Shorten any URL instantly for free. Get real short links from TinyURL or is.gd — no signup, no fake links. Generate QR codes too.',
    keywords: 'url shortener, link shortener, free url shortener, tinyurl alternative, shorten url online, short link generator',
    category: 'Developer Tools',
    emoji: '✂️',
  },
  'tools/medical-toolkit.html': {
    title: 'Free Medical Toolkit – Drug Interactions, Dosage & Health Guide | HashmiTools',
    desc:  'Free AI-powered medical toolkit: check drug interactions, calculate medication dosage, and get health information. Not a substitute for professional medical advice.',
    keywords: 'medical toolkit, drug interaction checker, medication dosage calculator, health information tool',
    category: 'Health Tools',
    emoji: '🩺',
  },
  'tools/mortgage-calculator.html': {
    title: 'Free Mortgage Calculator – Monthly Payment & Amortization | HashmiTools',
    desc:  'Calculate mortgage monthly payment, total interest, and full amortization schedule. Free online mortgage/home loan calculator for Pakistan and worldwide.',
    keywords: 'mortgage calculator, home loan calculator, monthly mortgage payment, housing finance calculator pakistan',
    category: 'Finance Tools',
    emoji: '🏠',
  },
  'tools/pakistan-tax.html': {
    title: 'Free Pakistan Income Tax Calculator – FBR Tax Slabs 2025-26 | HashmiTools',
    desc:  'Calculate Pakistan income tax for salaried individuals per FBR tax slabs 2025-26. Accurate, free online Pakistan tax calculator — updated for latest budget.',
    keywords: 'pakistan income tax calculator, fbr tax calculator 2025, salary tax calculator pakistan, income tax slabs 2025 pakistan',
    category: 'Pakistan Tools',
    emoji: '🇵🇰',
  },
  'tools/pakistan.html': {
    title: 'Free Pakistan Tools – Tax, Zakat, EMI & Local Calculators | HashmiTools',
    desc:  'Pakistan-specific free tools: income tax calculator, Zakat calculator, EMI calculator, prayer times, and more — designed for Pakistani users.',
    keywords: 'pakistan tools, pakistan calculator, fbr tax calculator, pakistan finance tools, pakistan online tools',
    category: 'Pakistan Tools',
    emoji: '🇵🇰',
  },
  'tools/password-generator.html': {
    title: 'Free Strong Password Generator – Secure Random Passwords | HashmiTools',
    desc:  'Generate strong, secure random passwords instantly. Choose length, include uppercase, numbers, symbols. Free online password generator — no data stored.',
    keywords: 'password generator, strong password generator, random password, secure password creator, free password tool',
    category: 'Developer Tools',
    emoji: '🔐',
  },
  'tools/pdf-compress.html': {
    title: 'Free PDF Compressor – Compress PDF Without Losing Quality | HashmiTools',
    desc:  'Compress PDF files online for free. Reduce PDF file size significantly without quality loss. No signup required, no watermarks added.',
    keywords: 'pdf compressor, compress pdf online, reduce pdf file size, pdf size reducer free, shrink pdf',
    category: 'PDF Tools',
    emoji: '📉',
  },
  'tools/pdf-editor.html': {
    title: 'Free PDF Editor – Edit PDF Text & Images Online | HashmiTools',
    desc:  'Edit PDF files online for free. Add text, images, and annotations to any PDF. No software download needed — works directly in your browser.',
    keywords: 'pdf editor, edit pdf online, free pdf editor, add text to pdf, annotate pdf online',
    category: 'PDF Tools',
    emoji: '✏️',
  },
  'tools/pdf-merge.html': {
    title: 'Free PDF Merger – Combine Multiple PDFs Online | HashmiTools',
    desc:  'Merge multiple PDF files into one document for free. Drag to reorder, combine PDFs instantly — no signup, no watermarks, unlimited merges.',
    keywords: 'pdf merger, merge pdf online, combine pdf files, join pdf free, pdf merge tool',
    category: 'PDF Tools',
    emoji: '📎',
  },
  'tools/pdf-split.html': {
    title: 'Free PDF Splitter – Split PDF into Separate Pages | HashmiTools',
    desc:  'Split a PDF into individual pages or extract specific page ranges for free. Online PDF splitter — no signup, no watermarks, instant download.',
    keywords: 'pdf splitter, split pdf online, extract pdf pages, divide pdf, pdf page extractor free',
    category: 'PDF Tools',
    emoji: '✂️',
  },
  'tools/pdf.html': {
    title: 'Free PDF Tools – Merge, Split, Compress & Edit PDFs | HashmiTools',
    desc:  'Complete free PDF toolkit: merge, split, compress, edit, and convert PDFs online. No software download, no signup, no watermarks.',
    keywords: 'pdf tools, free pdf tools, merge pdf, split pdf, compress pdf, edit pdf online',
    category: 'PDF Tools',
    emoji: '📄',
  },
  'tools/plan-umrah.html': {
    title: 'Free Umrah Planner – Plan Your Umrah Trip | HashmiTools',
    desc:  'Plan your Umrah trip with our free Umrah planner. Get Umrah checklist, duas, rituals guide, and travel tips for a perfect spiritual journey.',
    keywords: 'umrah planner, umrah guide, how to perform umrah, umrah checklist, umrah travel tips',
    category: 'Islamic Tools',
    emoji: '🕋',
  },
  'tools/plan-your-future.html': {
    title: 'Free Life Planner – Goal Setting & Future Planning Tool | HashmiTools',
    desc:  'Plan your future with AI assistance. Set goals, plan finances, career, health, and education. Free AI-powered life planning tool.',
    keywords: 'life planner, future planning tool, goal setting, career planner, financial planning, ai life planner',
    category: 'Productivity Tools',
    emoji: '🗓️',
  },
  'tools/prayer-times.html': {
    title: 'Free Prayer Times – Salah Times for Pakistan & Worldwide | HashmiTools',
    desc:  'Get accurate Islamic prayer times (Salah) for any city in Pakistan and worldwide. Free online prayer times tool — Fajr, Dhuhr, Asr, Maghrib, Isha.',
    keywords: 'prayer times, namaz times, salah times pakistan, fajr time, isha time, islamic prayer times',
    category: 'Islamic Tools',
    emoji: '🕌',
  },
  'tools/productivity.html': {
    title: 'Free Productivity Tools – Typing Test, IQ Test & More | HashmiTools',
    desc:  'Boost your productivity with free tools: typing speed test, IQ test, life planner, CV builder and more. All free, no signup required.',
    keywords: 'productivity tools, typing test, iq test, cv builder, life planner, free productivity tools online',
    category: 'Productivity Tools',
    emoji: '⚡',
  },
  'tools/qr-generator.html': {
    title: 'Free QR Code Generator – Create Custom QR Codes | HashmiTools',
    desc:  'Generate QR codes for URLs, text, WiFi, vCards and more. Customize colors, download as PNG or SVG — free online QR code generator, no signup.',
    keywords: 'qr code generator, create qr code, free qr code maker, custom qr code, wifi qr code generator',
    category: 'Developer Tools',
    emoji: '▦',
  },
  'tools/qurbani-calculator.html': {
    title: 'Free Qurbani Calculator – Shares & Animal Calculation | HashmiTools',
    desc:  'Calculate Qurbani shares for Eid ul Adha. Find how many animals needed based on family size. Free online Qurbani calculator with Islamic guidance.',
    keywords: 'qurbani calculator, eid ul adha calculator, bakra eid, qurbani shares, how many animals for qurbani',
    category: 'Islamic Tools',
    emoji: '🐄',
  },
  'tools/seo-audit.html': {
    title: 'Free SEO Audit Tool – Check Website SEO Score Online | HashmiTools',
    desc:  'Run a free SEO audit on any website URL. Check title tags, meta descriptions, headings, speed, and more. Get actionable SEO recommendations instantly.',
    keywords: 'seo audit tool, website seo checker, free seo analysis, seo score checker, on-page seo audit',
    category: 'Developer Tools',
    emoji: '🔍',
  },
  'tools/shorts-maker.html': {
    title: 'Free YouTube Shorts Maker – Create Viral Short Videos | HashmiTools',
    desc:  'Create YouTube Shorts and Reels content ideas using AI. Generate scripts, hooks, and captions for viral short videos — free online shorts maker.',
    keywords: 'youtube shorts maker, reels script generator, viral short video ideas, ai shorts creator, tiktok script generator',
    category: 'AI Tools',
    emoji: '🎬',
  },
  'tools/sip-calculator.html': {
    title: 'Free SIP Calculator – Mutual Fund Monthly Investment Returns | HashmiTools',
    desc:  'Calculate SIP (Systematic Investment Plan) returns on mutual fund investments. See monthly investment growth over time. Free online SIP calculator.',
    keywords: 'sip calculator, mutual fund calculator, monthly investment calculator, sip returns calculator, investment growth calculator',
    category: 'Finance Tools',
    emoji: '📊',
  },
  'tools/typing-test.html': {
    title: 'Free Typing Speed Test – WPM Test Online | HashmiTools',
    desc:  'Test your typing speed online. Measure words per minute (WPM) and accuracy. Free typing speed test with multiple difficulty levels and time modes.',
    keywords: 'typing speed test, typing test wpm, words per minute test, free typing test online, keyboard speed test',
    category: 'Productivity Tools',
    emoji: '⌨️',
  },
  'tools/url-encoder.html': {
    title: 'Free URL Encoder Decoder – Encode & Decode URLs Online | HashmiTools',
    desc:  'Encode or decode URLs instantly online. Convert special characters to percent-encoded format and back. Free URL encoder/decoder tool for developers.',
    keywords: 'url encoder, url decoder, percent encoding, encode url online, decode url, uri encoder decoder',
    category: 'Developer Tools',
    emoji: '🔗',
  },
  'tools/water-calculator.html': {
    title: 'Free Water Intake Calculator – Daily Water Needs | HashmiTools',
    desc:  'Calculate your daily water intake requirement based on weight, activity level, and climate. Free online water intake calculator to stay hydrated.',
    keywords: 'water intake calculator, daily water requirement, how much water to drink, hydration calculator, water calculator',
    category: 'Health Tools',
    emoji: '💧',
  },
  'tools/youtube-seo.html': {
    title: 'Free YouTube SEO Tool – Optimize Titles, Tags & Descriptions | HashmiTools',
    desc:  'Optimize YouTube videos for search. Generate SEO-friendly titles, tags, descriptions and thumbnails ideas with AI. Free YouTube SEO tool.',
    keywords: 'youtube seo, youtube title generator, youtube tags generator, youtube description generator, video seo tool free',
    category: 'AI Tools',
    emoji: '▶️',
  },
  'tools/zakat-calculator.html': {
    title: 'Free Zakat Calculator 2025 – Gold, Cash & Assets | HashmiTools',
    desc:  'Calculate Zakat accurately on gold, silver, cash, investments, and business assets. Free Islamic Zakat calculator — get exact Zakat amount in PKR instantly.',
    keywords: 'zakat calculator, zakat on gold, zakat on cash, zakat calculation 2025, nisab calculator, islamic zakat',
    category: 'Islamic Tools',
    emoji: '🌙',
  },
};

// ── Category → hub URL map ────────────────────────────────────────────────
const CAT_URL = {
  'Islamic Tools':     'tools/islamic.html',
  'Finance Tools':     'tools/finance.html',
  'Health Tools':      'tools/health.html',
  'Developer Tools':   'tools/developer.html',
  'PDF Tools':         'tools/pdf.html',
  'Image Tools':       'tools/image-tools.html',
  'AI Tools':          'tools/ai.html',
  'Pakistan Tools':    'tools/pakistan.html',
  'Productivity Tools':'tools/productivity.html',
};

// ── Helper: inject/replace meta block after <head> ────────────────────────
function injectMeta(html, filePath) {
  const rel  = filePath.replace(/\\/g, '/');
  const meta = TOOLS[rel];
  if (!meta) return html;

  const url        = BASE_URL + '/' + rel;
  const canonical  = url;
  const catUrl     = BASE_URL + '/' + (CAT_URL[meta.category] || 'index.html');
  const catName    = meta.category || 'Tools';
  const toolName   = meta.title.split('–')[0].replace(/^Free /, '').trim();

  // ── 1. Fix / replace <title> ──────────────────────────────────────────
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${meta.title}</title>`);

  // ── 2. Fix meta description ───────────────────────────────────────────
  html = html.replace(
    /<meta\s+name=["']description["'][^>]*>/i,
    `<meta name="description" content="${meta.desc}" />`
  );

  // ── 3. Fix / add keywords ─────────────────────────────────────────────
  if (html.includes('name="keywords"') || html.includes("name='keywords'")) {
    html = html.replace(
      /<meta\s+name=["']keywords["'][^>]*>/i,
      `<meta name="keywords" content="${meta.keywords}" />`
    );
  } else {
    html = html.replace(
      /<link rel="canonical"[^>]*>/i,
      m => `<meta name="keywords" content="${meta.keywords}" />\n  ${m}`
    );
  }

  // ── 4. Build OG block ─────────────────────────────────────────────────
  const ogBlock = `
  <!-- Open Graph -->
  <meta property="og:type"        content="website" />
  <meta property="og:title"       content="${meta.title}" />
  <meta property="og:description" content="${meta.desc}" />
  <meta property="og:url"         content="${canonical}" />
  <meta property="og:site_name"   content="HashmiTools" />
  <meta property="og:image"       content="${OG_IMAGE}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:locale"      content="en_US" />
  <!-- Twitter Card -->
  <meta name="twitter:card"        content="summary_large_image" />
  <meta name="twitter:title"       content="${meta.title}" />
  <meta name="twitter:description" content="${meta.desc}" />
  <meta name="twitter:image"       content="${OG_IMAGE}" />
  <meta name="twitter:site"        content="@HashmiTools" />`;

  // Remove old OG / Twitter tags completely, then re-add clean block
  html = html.replace(/\s*<!-- Open Graph -->[\s\S]*?(?=\s*<(?!meta property="og:|meta name="twitter:))/i, '\n');
  // Strip individual stale OG tags
  html = html.replace(/<meta\s+property=["']og:[^"']*["'][^>]*>\s*/gi, '');
  html = html.replace(/<meta\s+name=["']twitter:[^"']*["'][^>]*>\s*/gi, '');

  // Inject after canonical tag
  html = html.replace(
    /(<link\s+rel=["']canonical["'][^>]*>)/i,
    `$1\n${ogBlock}\n`
  );

  // ── 5. BreadcrumbList JSON-LD ─────────────────────────────────────────
  if (!html.includes('BreadcrumbList')) {
    const breadcrumbSchema = `
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "${BASE_URL}/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "${catName}",
        "item": "${catUrl}"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "${toolName}",
        "item": "${canonical}"
      }
    ]
  }
  </script>`;

    // Insert before </head>
    html = html.replace('</head>', breadcrumbSchema + '\n</head>');
  }

  return html;
}

// ── Process all files ─────────────────────────────────────────────────────
let modified = 0;
let skipped  = 0;

for (const relPath of Object.keys(TOOLS)) {
  const fullPath = path.join(__dirname, relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  SKIP (not found): ${relPath}`);
    skipped++;
    continue;
  }
  const original = fs.readFileSync(fullPath, 'utf8');
  const updated  = injectMeta(original, relPath);
  if (original !== updated) {
    fs.writeFileSync(fullPath, updated, 'utf8');
    console.log(`✅ Updated: ${relPath}`);
    modified++;
  } else {
    console.log(`—  No change: ${relPath}`);
  }
}

console.log(`\nDone. Modified: ${modified} | Skipped (not found): ${skipped}`);
