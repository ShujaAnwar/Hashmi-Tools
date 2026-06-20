/**
 * generate-hub-pages.js
 * Creates/overwrites category hub pages and generates sitemap.html + sitemap.xml
 * All pages: proper canonical, meta tags, breadcrumb, full tool grid with <a href> links
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://hashmitools.com';
const TODAY = new Date().toISOString().split('T')[0];

// ─────────────────────────────────────────────────────────
// CATEGORY DEFINITIONS
// ─────────────────────────────────────────────────────────
const CATEGORIES = {
  'pdf.html': {
    title: 'Free PDF Tools Online — Merge, Split, Compress, Convert PDF | HashmiTools',
    h1: 'Free PDF Tools Online',
    subtitle: 'Merge, Split, Compress, Edit, Convert — Everything you need for PDF files',
    description: 'HashmiTools offers the most complete suite of free PDF tools available online. Merge multiple PDFs into one, split large PDFs into smaller files, compress PDFs to reduce file size without losing quality, convert images to PDF, and edit PDF content — all directly in your browser with no upload required. Our PDF tools use client-side processing so your documents stay 100% private.',
    icon: '📄',
    color: '#ef4444',
    canonical: `${BASE_URL}/tools/pdf.html`,
    tools: [
      { href: 'pdf-editor.html', icon: '✏️', name: 'PDF Editor', desc: 'Edit text, add images, draw shapes & annotate any PDF online' },
      { href: 'pdf-merge.html', icon: '📎', name: 'Merge PDF', desc: 'Combine multiple PDF files into a single document instantly' },
      { href: 'pdf-split.html', icon: '✂️', name: 'Split PDF', desc: 'Split large PDFs into smaller files by page range' },
      { href: 'pdf-compress.html', icon: '🗜️', name: 'Compress PDF', desc: 'Reduce PDF file size without losing quality' },
      { href: 'compress-pdf.html', icon: '🗜️', name: 'Compress PDF (Alt)', desc: 'Alternative PDF compression tool for smaller files' },
      { href: 'jpg-to-pdf.html', icon: '🖼️', name: 'JPG to PDF', desc: 'Convert JPG, PNG and other images to PDF instantly' },
    ],
    breadcrumb: [{ name: 'Home', href: '../index.html' }, { name: 'PDF Tools' }],
    faq: [
      { q: 'Are these PDF tools free to use?', a: 'Yes, all PDF tools on HashmiTools are 100% free. No subscription, no sign-up, no hidden fees.' },
      { q: 'Is my PDF data safe?', a: 'Yes. All processing happens locally in your browser. Your PDF files are never uploaded to any server.' },
      { q: 'What is the maximum PDF file size?', a: 'You can process PDFs up to 50MB directly in your browser. Larger files may require a desktop application.' },
      { q: 'Can I use these tools on mobile?', a: 'Yes, all HashmiTools PDF tools are fully responsive and work on smartphones and tablets.' },
    ]
  },

  'image-tools.html': {
    title: 'Free Image Tools Online — Compress, Edit, Remove Background | HashmiTools',
    h1: 'Free Image Tools Online',
    subtitle: 'Compress, Edit, Convert and Enhance images — directly in your browser',
    description: 'HashmiTools provides powerful free image editing and processing tools that work entirely in your browser. Compress images to reduce file size, edit photos with professional tools, remove backgrounds with AI precision, and convert between formats. No software installation needed — just upload and process.',
    icon: '🖼️',
    color: '#8b5cf6',
    canonical: `${BASE_URL}/tools/image-tools.html`,
    tools: [
      { href: 'image-editor.html', icon: '🎨', name: 'Image Editor', desc: 'Crop, resize, filter, annotate and edit images online' },
      { href: 'image-compressor.html', icon: '🗜️', name: 'Image Compressor', desc: 'Reduce image file size without visible quality loss' },
      { href: 'background-remover.html', icon: '✂️', name: 'Background Remover', desc: 'Remove image backgrounds with AI precision — free' },
      { href: 'jpg-to-pdf.html', icon: '📄', name: 'Image to PDF', desc: 'Convert JPG, PNG images to PDF in seconds' },
    ],
    breadcrumb: [{ name: 'Home', href: '../index.html' }, { name: 'Image Tools' }],
    faq: [
      { q: 'Can I remove backgrounds from photos for free?', a: 'Yes, the Background Remover tool is completely free and uses AI to automatically detect and remove backgrounds.' },
      { q: 'What image formats are supported?', a: 'HashmiTools image tools support JPG, PNG, WebP, GIF and BMP formats.' },
      { q: 'Is the image compression lossless?', a: 'The Image Compressor uses smart compression to reduce file size while maintaining visible quality. You can adjust the quality level.' },
    ]
  },

  'finance.html': {
    title: 'Free Finance Calculators Online — EMI, Mortgage, SIP, Tax | HashmiTools',
    h1: 'Free Finance Calculators Online',
    subtitle: 'EMI, Mortgage, SIP, Compound Interest, Tax & Currency tools',
    description: 'Make smart financial decisions with HashmiTools\' professional-grade finance calculators. Calculate loan EMI with full amortization schedules, plan mortgage payments, estimate SIP investment returns, compute compound interest, calculate Pakistan FBR income tax, convert currencies in real-time, and much more. All calculators are free, instant, and require no sign-up.',
    icon: '💰',
    color: '#f59e0b',
    canonical: `${BASE_URL}/tools/finance.html`,
    tools: [
      { href: 'emi-calculator.html', icon: '💳', name: 'EMI Calculator', desc: 'Calculate loan EMI with full amortization schedule and pie chart' },
      { href: 'mortgage-calculator.html', icon: '🏠', name: 'Mortgage Calculator', desc: 'Calculate monthly mortgage payments, total interest and payoff schedule' },
      { href: 'sip-calculator.html', icon: '📈', name: 'SIP Calculator', desc: 'Calculate mutual fund SIP returns with compound growth projections' },
      { href: 'compound-interest.html', icon: '📊', name: 'Compound Interest', desc: 'Calculate compound interest growth for any investment period' },
      { href: 'currency-converter.html', icon: '💱', name: 'Currency Converter', desc: 'Convert between 150+ world currencies with live exchange rates' },
      { href: 'pakistan-tax.html', icon: '🇵🇰', name: 'Pakistan Tax Calculator', desc: 'FBR income tax calculator for salaried and business persons 2024-25' },
    ],
    breadcrumb: [{ name: 'Home', href: '../index.html' }, { name: 'Finance Tools' }],
    faq: [
      { q: 'Are the finance calculators accurate?', a: 'Yes. Our EMI, mortgage, and SIP calculators use standard financial formulas. Results match bank and official calculations.' },
      { q: 'Which Pakistan tax year does the tax calculator support?', a: 'The Pakistan Tax Calculator is updated for FBR tax slabs for the fiscal year 2024-25 for both salaried and business individuals.' },
      { q: 'Can I export or print calculator results?', a: 'The EMI Calculator provides a downloadable amortization schedule. Results from all calculators can be printed using your browser\'s print function.' },
    ]
  },

  'developer.html': {
    title: 'Free Developer Tools Online — JSON, Base64, QR Code, Regex | HashmiTools',
    h1: 'Free Developer Tools Online',
    subtitle: 'JSON formatter, Base64, URL encoder, QR generator, Password maker & more',
    description: 'HashmiTools provides a complete toolkit for developers and programmers. Format and validate JSON, encode/decode Base64 strings, encode/decode URLs, generate secure passwords, create QR codes, convert HEX to RGB colors, test regex patterns, and preview Markdown — all in your browser with no sign-up required.',
    icon: '💻',
    color: '#06b6d4',
    canonical: `${BASE_URL}/tools/developer.html`,
    tools: [
      { href: 'json-formatter.html', icon: '{ }', name: 'JSON Formatter', desc: 'Format, validate, minify and beautify JSON data instantly' },
      { href: 'base64.html', icon: '64', name: 'Base64 Encoder/Decoder', desc: 'Encode text and files to Base64, decode Base64 strings' },
      { href: 'url-encoder.html', icon: '🔗', name: 'URL Encoder/Decoder', desc: 'Encode and decode URLs and query string parameters' },
      { href: 'hex-rgb.html', icon: '🎨', name: 'HEX to RGB Converter', desc: 'Convert HEX color codes to RGB values and vice versa' },
      { href: 'qr-generator.html', icon: '📱', name: 'QR Code Generator', desc: 'Generate custom QR codes for URLs, text, contact cards and more' },
      { href: 'password-generator.html', icon: '🔐', name: 'Password Generator', desc: 'Generate ultra-strong, random passwords with custom rules' },
    ],
    breadcrumb: [{ name: 'Home', href: '../index.html' }, { name: 'Developer Tools' }],
    faq: [
      { q: 'Are these developer tools free?', a: 'Yes, all developer tools on HashmiTools are 100% free with no usage limits or sign-up required.' },
      { q: 'Is Base64 encoding secure?', a: 'Base64 is an encoding scheme, not encryption. It is reversible and should not be used to secure sensitive data.' },
      { q: 'Can I generate QR codes in bulk?', a: 'Currently the QR Code Generator creates one code at a time with customization options. Batch generation is on our roadmap.' },
    ]
  },

  'islamic.html': {
    title: 'Free Islamic Tools Online — Zakat, Prayer Times, Hijri Calendar | HashmiTools',
    h1: 'Free Islamic Tools Online',
    subtitle: 'Zakat Calculator, Prayer Times, Inheritance, Hijri Calendar — Shariah-compliant',
    description: 'HashmiTools offers a comprehensive suite of Shariah-compliant Islamic tools used by Muslims worldwide. Calculate Zakat on gold, silver, cash and business assets with both English and Urdu support. Get accurate Namaz prayer times for any city globally. Calculate Islamic inheritance (Faraid) shares per Quran and Sunnah. Convert between Hijri and Gregorian calendar dates. All tools are built following authentic Islamic principles.',
    icon: '🕌',
    color: '#10b981',
    canonical: `${BASE_URL}/tools/islamic.html`,
    tools: [
      { href: 'zakat-calculator.html', icon: '🕌', name: 'Zakat Calculator', desc: 'Complete Zakat calculation with Gold Nisab, Silver Nisab, Cash & Business assets. Urdu support + PDF export' },
      { href: 'prayer-times.html', icon: '🕐', name: 'Prayer Times', desc: 'Accurate Namaz timings for any city worldwide with auto-location and Qibla direction' },
      { href: 'inheritance-calculator.html', icon: '⚖️', name: 'Islamic Inheritance', desc: 'Calculate Faraid inheritance shares for all heirs per Quran and Sunnah' },
      { href: 'hijri-converter.html', icon: '📅', name: 'Hijri Calendar Converter', desc: 'Convert between Hijri (Islamic) and Gregorian calendar dates instantly' },
    ],
    breadcrumb: [{ name: 'Home', href: '../index.html' }, { name: 'Islamic Tools' }],
    faq: [
      { q: 'Is the Zakat Calculator Shariah-compliant?', a: 'Yes. The Zakat Calculator follows authentic Shariah principles, supporting both Gold Nisab and Silver Nisab calculations as per the majority scholarly opinion.' },
      { q: 'How accurate are the prayer times?', a: 'Prayer times are calculated using standard astronomical algorithms (ISNA, MWL, and other methods) for any global city and are accurate to within minutes.' },
      { q: 'Does the Inheritance Calculator support all heir types?', a: 'Yes. The Islamic Inheritance Calculator handles all categories of heirs including spouses, children, parents, siblings and others per the Quran and established Fiqh.' },
      { q: 'Is the Hijri date converter accurate?', a: 'The Hijri-Gregorian converter uses standard astronomical calculations. Results are accurate for most years; minor 1-day differences may exist depending on moon sighting.' },
    ]
  },

  'health.html': {
    title: 'Free Health Calculators Online — BMI, Calorie, Ideal Weight | HashmiTools',
    h1: 'Free Health & Fitness Calculators',
    subtitle: 'BMI, Calorie, Ideal Weight, Water Intake & Age Calculator',
    description: 'Track your health and fitness goals with HashmiTools\' free health calculators. Calculate your Body Mass Index (BMI) to assess your weight category, estimate daily calorie needs for weight management, find your ideal body weight, determine daily water intake requirements, calculate your exact age, and test your typing speed. All tools are instant, free and based on established medical guidelines.',
    icon: '❤️',
    color: '#f43f5e',
    canonical: `${BASE_URL}/tools/health.html`,
    tools: [
      { href: 'bmi-calculator.html', icon: '⚖️', name: 'BMI Calculator', desc: 'Calculate Body Mass Index and assess your healthy weight range' },
      { href: 'calorie-calculator.html', icon: '🍎', name: 'Calorie Calculator', desc: 'Calculate daily calorie needs based on age, weight, height and activity' },
      { href: 'ideal-weight.html', icon: '💪', name: 'Ideal Weight Calculator', desc: 'Find your ideal body weight using multiple medical formulas' },
      { href: 'water-calculator.html', icon: '💧', name: 'Water Intake Calculator', desc: 'Calculate daily water intake requirement based on your body weight' },
      { href: 'age-calculator.html', icon: '🎂', name: 'Age Calculator', desc: 'Calculate your exact age in years, months, days and hours' },
      { href: 'typing-test.html', icon: '⌨️', name: 'Typing Speed Test', desc: 'Test and improve your typing speed with WPM and accuracy tracking' },
    ],
    breadcrumb: [{ name: 'Home', href: '../index.html' }, { name: 'Health Tools' }],
    faq: [
      { q: 'What BMI range is considered healthy?', a: 'A BMI between 18.5 and 24.9 is considered normal weight. Below 18.5 is underweight, 25–29.9 is overweight, and 30+ is obese.' },
      { q: 'How is daily calorie need calculated?', a: 'The Calorie Calculator uses the Mifflin-St Jeor equation, which accounts for age, gender, height, weight and physical activity level.' },
      { q: 'How much water should I drink per day?', a: 'A general guideline is 8 glasses (2 liters) per day, but the Water Intake Calculator gives a more precise recommendation based on your body weight.' },
    ]
  }
};

// ─────────────────────────────────────────────────────────
// HTML TEMPLATE BUILDER
// ─────────────────────────────────────────────────────────
function buildCategoryPage(filename, cat) {
  const toolCards = cat.tools.map(t => `
      <a href="${t.href}" class="hub-tool-card">
        <div class="htc-icon">${t.icon}</div>
        <div class="htc-body">
          <h3>${t.name}</h3>
          <p>${t.desc}</p>
        </div>
        <div class="htc-arrow">→</div>
      </a>`).join('\n');

  const breadcrumbHtml = cat.breadcrumb.map((b, i) => {
    if (b.href) return `<a href="${b.href}">${b.name}</a>`;
    return `<span aria-current="page">${b.name}</span>`;
  }).join(' <span class="bc-sep">›</span> ');

  const faqItems = cat.faq.map((f, i) => `
        <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
          <button class="faq-q" aria-expanded="false" onclick="toggleFaq(this)">
            <span itemprop="name">${f.q}</span>
            <span class="faq-icon">+</span>
          </button>
          <div class="faq-a" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
            <p itemprop="text">${f.a}</p>
          </div>
        </div>`).join('\n');

  const faqSchemaItems = cat.faq.map(f => `{"@type":"Question","name":${JSON.stringify(f.q)},"acceptedAnswer":{"@type":"Answer","text":${JSON.stringify(f.a)}}}`).join(',');

  const breadcrumbSchema = cat.breadcrumb.map((b, i) => {
    const pos = i + 1;
    const url = b.href ? `${BASE_URL}/tools/` + b.href.replace('../', '').replace('index.html', '') : `${BASE_URL}/tools/${filename}`;
    return `{"@type":"ListItem","position":${pos},"name":${JSON.stringify(b.name)},"item":${JSON.stringify(url)}}`;
  }).join(',');

  const otherCats = Object.entries(CATEGORIES)
    .filter(([f]) => f !== filename)
    .slice(0, 4)
    .map(([f, c]) => `<a href="${f}" class="rel-cat-link">${c.icon} ${c.h1}</a>`)
    .join('\n        ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${cat.title}</title>
  <meta name="description" content="${cat.description.slice(0, 160)}">
  <meta name="keywords" content="${cat.tools.map(t => t.name).join(', ')}, HashmiTools, free online tools">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${cat.canonical}">

  <!-- Open Graph -->
  <meta property="og:title" content="${cat.title}">
  <meta property="og:description" content="${cat.description.slice(0, 200)}">
  <meta property="og:url" content="${cat.canonical}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="HashmiTools">

  <!-- Favicon -->
  <link rel="icon" href="../assets/images/favicon.png" type="image/png">

  <!-- Fonts & Icons -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">

  <!-- Structured Data -->
  <script type="application/ld+json">
  [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": ${JSON.stringify(cat.h1)},
      "description": ${JSON.stringify(cat.description)},
      "url": ${JSON.stringify(cat.canonical)},
      "publisher": {
        "@type": "Organization",
        "name": "HashmiTools",
        "url": "https://hashmitools.com"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [${breadcrumbSchema},{"@type":"ListItem","position":${cat.breadcrumb.length + 1},"name":${JSON.stringify(cat.h1)},"item":${JSON.stringify(cat.canonical)}}]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [${faqSchemaItems}]
    }
  ]
  </script>

  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #0f172a; --bg-card: #1e293b; --bg-hover: #334155;
      --text: #f1f5f9; --text-muted: #94a3b8; --text-secondary: #cbd5e1;
      --accent: ${cat.color}; --border: #334155;
      --radius: 12px; --shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; min-height: 100vh; }
    a { color: inherit; text-decoration: none; }

    /* NAV */
    .nav { position: sticky; top: 0; z-index: 100; background: rgba(15,23,42,0.95); backdrop-filter: blur(10px); border-bottom: 1px solid var(--border); }
    .nav-inner { max-width: 1200px; margin: 0 auto; padding: 0 20px; display: flex; align-items: center; gap: 20px; height: 60px; }
    .nav-logo { font-size: 1.2rem; font-weight: 800; }
    .logo-accent { color: var(--accent); }
    .nav-links { display: flex; gap: 8px; margin-left: auto; }
    .nav-link { padding: 6px 14px; border-radius: 8px; color: var(--text-muted); font-size: 0.9rem; transition: all 0.2s; }
    .nav-link:hover, .nav-link.active { background: var(--bg-hover); color: var(--text); }

    /* HERO */
    .hero { padding: 60px 20px 40px; text-align: center; }
    .hero-badge { display: inline-block; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 50px; padding: 6px 16px; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 16px; }
    .hero h1 { font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 800; margin-bottom: 12px; }
    .hero h1 span { color: var(--accent); }
    .hero p { color: var(--text-muted); max-width: 680px; margin: 0 auto 24px; font-size: 1.05rem; }

    /* BREADCRUMB */
    .breadcrumb { max-width: 1200px; margin: 0 auto; padding: 12px 20px; font-size: 0.9rem; color: var(--text-muted); }
    .breadcrumb a { color: var(--accent); }
    .breadcrumb a:hover { text-decoration: underline; }
    .bc-sep { margin: 0 8px; }

    /* TOOLS GRID */
    .tools-section { max-width: 1200px; margin: 0 auto; padding: 20px 20px 60px; }
    .tools-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; margin-top: 12px; }
    .hub-tool-card { display: flex; align-items: center; gap: 16px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; transition: all 0.2s; }
    .hub-tool-card:hover { background: var(--bg-hover); border-color: var(--accent); transform: translateY(-2px); box-shadow: var(--shadow); }
    .htc-icon { font-size: 2rem; min-width: 48px; text-align: center; }
    .htc-body { flex: 1; }
    .htc-body h3 { font-size: 1rem; font-weight: 700; margin-bottom: 4px; }
    .htc-body p { font-size: 0.85rem; color: var(--text-muted); }
    .htc-arrow { color: var(--accent); font-size: 1.2rem; font-weight: bold; }

    /* DESCRIPTION SECTION */
    .desc-section { max-width: 1200px; margin: 0 auto; padding: 40px 20px; background: var(--bg-card); border-radius: var(--radius); }
    .desc-section h2 { font-size: 1.4rem; margin-bottom: 16px; }
    .desc-section p { color: var(--text-secondary); line-height: 1.8; }

    /* FAQ */
    .faq-section { max-width: 1200px; margin: 40px auto; padding: 0 20px; }
    .faq-section h2 { font-size: 1.4rem; margin-bottom: 20px; }
    .faq-item { border: 1px solid var(--border); border-radius: var(--radius); margin-bottom: 8px; overflow: hidden; }
    .faq-q { width: 100%; background: var(--bg-card); border: none; color: var(--text); padding: 16px 20px; cursor: pointer; text-align: left; font-size: 0.95rem; font-weight: 600; display: flex; justify-content: space-between; align-items: center; gap: 12px; font-family: inherit; }
    .faq-q:hover { background: var(--bg-hover); }
    .faq-icon { font-size: 1.4rem; min-width: 20px; text-align: center; transition: transform 0.2s; }
    .faq-a { display: none; padding: 16px 20px; background: var(--bg); color: var(--text-secondary); font-size: 0.9rem; line-height: 1.7; }
    .faq-a.open { display: block; }

    /* RELATED CATEGORIES */
    .related-section { max-width: 1200px; margin: 40px auto; padding: 0 20px 60px; }
    .related-section h2 { font-size: 1.2rem; margin-bottom: 16px; }
    .rel-cats { display: flex; flex-wrap: wrap; gap: 10px; }
    .rel-cat-link { background: var(--bg-card); border: 1px solid var(--border); border-radius: 50px; padding: 8px 20px; font-size: 0.9rem; transition: all 0.2s; }
    .rel-cat-link:hover { background: var(--accent); color: #fff; border-color: var(--accent); }

    /* FOOTER */
    .footer { background: #0a0f1a; border-top: 1px solid var(--border); text-align: center; padding: 24px 20px; color: var(--text-muted); font-size: 0.9rem; }
    .footer a { color: var(--accent); }

    @media (max-width: 600px) {
      .tools-grid { grid-template-columns: 1fr; }
      .nav-links { display: none; }
    }
  </style>
</head>
<body>

  <!-- NAV -->
  <nav class="nav" aria-label="Main navigation">
    <div class="nav-inner">
      <a href="../index.html" class="nav-logo">⚡ Hashmi<span class="logo-accent">Tools</span></a>
      <div class="nav-links">
        <a href="../index.html" class="nav-link">Home</a>
        <a href="pdf.html" class="nav-link${filename === 'pdf.html' ? ' active' : ''}">PDF</a>
        <a href="image-tools.html" class="nav-link${filename === 'image-tools.html' ? ' active' : ''}">Images</a>
        <a href="finance.html" class="nav-link${filename === 'finance.html' ? ' active' : ''}">Finance</a>
        <a href="developer.html" class="nav-link${filename === 'developer.html' ? ' active' : ''}">Developer</a>
        <a href="islamic.html" class="nav-link${filename === 'islamic.html' ? ' active' : ''}">Islamic</a>
        <a href="health.html" class="nav-link${filename === 'health.html' ? ' active' : ''}">Health</a>
      </div>
    </div>
  </nav>

  <!-- BREADCRUMB -->
  <nav aria-label="Breadcrumb">
    <div class="breadcrumb">${breadcrumbHtml} <span class="bc-sep">›</span> <span aria-current="page">${cat.h1}</span></div>
  </nav>

  <!-- HERO -->
  <header class="hero">
    <div class="hero-badge">${cat.icon} Free Online Tools</div>
    <h1><span>${cat.h1}</span></h1>
    <p>${cat.subtitle}</p>
  </header>

  <!-- TOOLS GRID -->
  <main>
    <section class="tools-section" aria-label="${cat.h1} list">
      <div class="tools-grid">
        ${toolCards}
      </div>
    </section>

    <!-- DESCRIPTION -->
    <section class="desc-section">
      <h2>About ${cat.h1}</h2>
      <p>${cat.description}</p>
    </section>

    <!-- FAQ -->
    <section class="faq-section">
      <h2>Frequently Asked Questions</h2>
      ${faqItems}
    </section>

    <!-- RELATED CATEGORIES -->
    <section class="related-section">
      <h2>Explore More Tool Categories</h2>
      <div class="rel-cats">
        ${otherCats}
      </div>
    </section>
  </main>

  <!-- FOOTER -->
  <footer class="footer">
    <p>© 2025 <a href="../index.html">HashmiTools.com</a> — Free Online Tools | 
       <a href="../privacy.html">Privacy</a> | 
       <a href="../about.html">About</a> | 
       <a href="../sitemap.html">Sitemap</a></p>
  </footer>

  <script>
  function toggleFaq(btn) {
    const ans = btn.nextElementSibling;
    const icon = btn.querySelector('.faq-icon');
    const open = ans.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
    icon.textContent = open ? '−' : '+';
  }
  </script>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────
// WRITE CATEGORY PAGES
// ─────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════');
console.log('  Generating Category Hub Pages');
console.log('══════════════════════════════════════════════════════\n');

const toolsDir = path.join(__dirname, 'tools');
let created = 0;

Object.entries(CATEGORIES).forEach(([filename, cat]) => {
  const filePath = path.join(toolsDir, filename);
  const html = buildCategoryPage(filename, cat);
  fs.writeFileSync(filePath, html);
  created++;
  console.log(`  ✅ Created: tools/${filename} (${cat.tools.length} tools)`);
});

console.log(`\n  → ${created} category hub pages generated`);

// ─────────────────────────────────────────────────────────
// GENERATE sitemap.html
// ─────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════');
console.log('  Generating sitemap.html');
console.log('══════════════════════════════════════════════════════\n');

const ALL_TOOL_CATEGORIES = {
  'PDF Tools': [
    { href: 'tools/pdf-editor.html', name: 'PDF Editor' },
    { href: 'tools/pdf-merge.html', name: 'Merge PDF' },
    { href: 'tools/pdf-split.html', name: 'Split PDF' },
    { href: 'tools/pdf-compress.html', name: 'Compress PDF' },
    { href: 'tools/compress-pdf.html', name: 'Compress PDF (Alt)' },
    { href: 'tools/jpg-to-pdf.html', name: 'JPG / Image to PDF' },
  ],
  'Image Tools': [
    { href: 'tools/image-editor.html', name: 'Image Editor' },
    { href: 'tools/image-compressor.html', name: 'Image Compressor' },
    { href: 'tools/background-remover.html', name: 'Background Remover' },
  ],
  'Finance & Calculator Tools': [
    { href: 'tools/emi-calculator.html', name: 'EMI Calculator' },
    { href: 'tools/mortgage-calculator.html', name: 'Mortgage Calculator' },
    { href: 'tools/sip-calculator.html', name: 'SIP Calculator' },
    { href: 'tools/compound-interest.html', name: 'Compound Interest Calculator' },
    { href: 'tools/currency-converter.html', name: 'Currency Converter' },
    { href: 'tools/pakistan-tax.html', name: 'Pakistan FBR Tax Calculator' },
  ],
  'Islamic Tools': [
    { href: 'tools/zakat-calculator.html', name: 'Zakat Calculator' },
    { href: 'tools/prayer-times.html', name: 'Prayer Times' },
    { href: 'tools/inheritance-calculator.html', name: 'Islamic Inheritance Calculator' },
    { href: 'tools/hijri-converter.html', name: 'Hijri Calendar Converter' },
  ],
  'Health & Fitness Tools': [
    { href: 'tools/bmi-calculator.html', name: 'BMI Calculator' },
    { href: 'tools/calorie-calculator.html', name: 'Calorie Calculator' },
    { href: 'tools/ideal-weight.html', name: 'Ideal Weight Calculator' },
    { href: 'tools/water-calculator.html', name: 'Water Intake Calculator' },
    { href: 'tools/age-calculator.html', name: 'Age Calculator' },
    { href: 'tools/typing-test.html', name: 'Typing Speed Test' },
  ],
  'Developer Tools': [
    { href: 'tools/json-formatter.html', name: 'JSON Formatter' },
    { href: 'tools/base64.html', name: 'Base64 Encoder / Decoder' },
    { href: 'tools/url-encoder.html', name: 'URL Encoder / Decoder' },
    { href: 'tools/hex-rgb.html', name: 'HEX to RGB Color Converter' },
    { href: 'tools/qr-generator.html', name: 'QR Code Generator' },
    { href: 'tools/password-generator.html', name: 'Password Generator' },
    { href: 'tools/ai-hashtag.html', name: 'AI Hashtag Generator' },
  ],
  'Category Hub Pages': [
    { href: 'tools/pdf.html', name: 'PDF Tools Hub' },
    { href: 'tools/image-tools.html', name: 'Image Tools Hub' },
    { href: 'tools/finance.html', name: 'Finance Tools Hub' },
    { href: 'tools/developer.html', name: 'Developer Tools Hub' },
    { href: 'tools/islamic.html', name: 'Islamic Tools Hub' },
    { href: 'tools/health.html', name: 'Health Tools Hub' },
    { href: 'tools/ai.html', name: 'AI Tools Hub' },
    { href: 'tools/pakistan.html', name: 'Pakistan Tools Hub' },
    { href: 'tools/productivity.html', name: 'Productivity Tools Hub' },
  ],
  'Pages': [
    { href: 'index.html', name: 'HashmiTools Home' },
    { href: 'about.html', name: 'About HashmiTools' },
    { href: 'privacy.html', name: 'Privacy Policy' },
    { href: 'terms.html', name: 'Terms & Conditions' },
    { href: 'contact.html', name: 'Contact Us' },
    { href: 'blog.html', name: 'Blog' },
  ],
};

const sitemapCategoryHtml = Object.entries(ALL_TOOL_CATEGORIES).map(([cat, tools]) => `
    <section class="sitemap-cat">
      <h2>${cat}</h2>
      <ul>
        ${tools.map(t => `<li><a href="${t.href}">${t.name}</a></li>`).join('\n        ')}
      </ul>
    </section>`).join('\n');

const sitemapHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sitemap — All HashmiTools Free Online Tools</title>
  <meta name="description" content="Complete sitemap of all 100+ free online tools on HashmiTools.com — PDF, Image, Finance, Islamic, Health, Developer and more.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${BASE_URL}/sitemap.html">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root { --bg: #0f172a; --bg-card: #1e293b; --text: #f1f5f9; --text-muted: #94a3b8; --accent: #6366f1; --border: #334155; }
    body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .nav { background: rgba(15,23,42,0.95); border-bottom: 1px solid var(--border); padding: 16px 20px; display: flex; align-items: center; gap: 20px; }
    .nav-logo { font-weight: 800; font-size: 1.2rem; color: var(--text); }
    .nav-logo span { color: var(--accent); }
    .hero { text-align: center; padding: 50px 20px 30px; }
    .hero h1 { font-size: 2rem; font-weight: 800; margin-bottom: 8px; }
    .hero p { color: var(--text-muted); }
    .sitemap-grid { max-width: 1200px; margin: 0 auto; padding: 20px 20px 60px; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 28px; }
    .sitemap-cat { background: var(--bg-card); border-radius: 12px; padding: 24px; border: 1px solid var(--border); }
    .sitemap-cat h2 { font-size: 1rem; font-weight: 700; color: var(--text); margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid var(--accent); }
    .sitemap-cat ul { list-style: none; display: flex; flex-direction: column; gap: 8px; }
    .sitemap-cat li a { font-size: 0.9rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px; }
    .sitemap-cat li a::before { content: '→'; color: var(--accent); font-size: 0.8rem; }
    .sitemap-cat li a:hover { color: var(--text); text-decoration: none; }
    .footer { background: #0a0f1a; border-top: 1px solid var(--border); text-align: center; padding: 20px; color: var(--text-muted); font-size: 0.9rem; }
    .footer a { color: var(--accent); }
  </style>
</head>
<body>
  <nav class="nav" aria-label="Main navigation">
    <a href="index.html" class="nav-logo">⚡ Hashmi<span>Tools</span></a>
    <a href="index.html" style="color: var(--text-muted); font-size:0.9rem; margin-left:auto;">← Back to Home</a>
  </nav>

  <header class="hero">
    <h1>Complete Site Map</h1>
    <p>All free online tools on HashmiTools.com organized by category</p>
  </header>

  <main class="sitemap-grid">
    ${sitemapCategoryHtml}
  </main>

  <footer class="footer">
    <p>© 2025 <a href="index.html">HashmiTools.com</a> — 
       <a href="sitemap.xml">XML Sitemap</a> | 
       <a href="privacy.html">Privacy</a> | 
       <a href="about.html">About</a></p>
  </footer>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'sitemap.html'), sitemapHtml);
console.log('  ✅ Created: sitemap.html');

// ─────────────────────────────────────────────────────────
// GENERATE sitemap.xml
// ─────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════');
console.log('  Regenerating sitemap.xml');
console.log('══════════════════════════════════════════════════════\n');

const rootFiles = fs.readdirSync(__dirname)
  .filter(f => f.endsWith('.html') && !['sitemap.html', 'trending.html', 'blog.html'].includes(f));
const toolFiles = fs.readdirSync(toolsDir)
  .filter(f => f.endsWith('.html'));

// Assign priorities
const HIGH_PRIORITY_TOOLS = ['pdf-editor', 'pdf-merge', 'emi-calculator', 'zakat-calculator',
  'bmi-calculator', 'qr-generator', 'image-compressor', 'jpg-to-pdf', 'prayer-times'];

let urlEntries = [];

// Homepage
urlEntries.push({ loc: `${BASE_URL}/index.html`, priority: '1.0', changefreq: 'weekly' });
// Sitemap HTML
urlEntries.push({ loc: `${BASE_URL}/sitemap.html`, priority: '0.5', changefreq: 'monthly' });

// Root pages
rootFiles.filter(f => f !== 'index.html').forEach(file => {
  urlEntries.push({ loc: `${BASE_URL}/${file}`, priority: '0.6', changefreq: 'monthly' });
});

// Tool pages
toolFiles.forEach(file => {
  const slug = file.replace('.html', '');
  const isHigh = HIGH_PRIORITY_TOOLS.some(t => slug.includes(t));
  const isCat = ['pdf', 'islamic', 'finance', 'health', 'developer', 'productivity', 'ai', 'pakistan', 'image-tools'].includes(slug);
  const priority = isCat ? '0.85' : isHigh ? '0.9' : '0.8';
  urlEntries.push({ loc: `${BASE_URL}/tools/${file}`, priority, changefreq: 'monthly' });
});

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlEntries.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemapXml);
console.log(`  ✅ sitemap.xml regenerated with ${urlEntries.length} URLs`);
console.log(`     Root pages: ${rootFiles.length}`);
console.log(`     Tool pages: ${toolFiles.length}`);

console.log('\n══════════════════════════════════════════════════════');
console.log('  ALL DONE');
console.log('══════════════════════════════════════════════════════\n');
