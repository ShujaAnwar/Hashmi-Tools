# HashmiTools.com — Complete Free Online Tools Website

## 🚀 Project Overview
A comprehensive static website featuring **30+ free online tools** across 8 categories: Islamic Tools, Finance Tools, PDF Tools, AI Tools, Developer Tools, Health Tools, Pakistan Tools, and Productivity Tools.

**Live URL:** https://hashmitools.com  
**Admin Panel:** https://hashmitools.com/admin/  
**Admin Credentials:** `admin` / `hashmitools2025` (change after first login)

---

## ✅ Completed Features (Phase 1 + Phase 2 + Phase 3)

### 🏠 Core Pages
- `index.html` — Homepage with hero, category grid, tool cards, search bar
- `about.html` — About page
- `contact.html` — Contact form
- `blog.html` — Blog listing page
- `trending.html` — Trending tools page
- `privacy.html` — Privacy Policy (AdSense required)
- `terms.html` — Terms of Service (AdSense required)

### 🕌 Islamic Tools (`tools/islamic.html`)
- **Zakat Calculator** — Cash, gold, silver, business inventory, Nisab auto, PDF certificate
- **Inheritance Calculator (Faraid)** — 17 heir types, exact fractions, all madhabs, Awl & Radd
- **Hijri Calendar Converter** — Kuwaiti Algorithm, Islamic events, countdown, month view
- **Prayer Times Calculator** — GPS-based, multiple calculation methods

### 💰 Finance Tools (`tools/finance.html`)
- **EMI Calculator** — Full amortization, prepayment analysis, jsPDF export
- **SIP Calculator** — 4 modes: Regular/Step-Up/Goal-Based/Lump Sum, Chart.js
- **Mortgage Calculator** — PITI breakdown, amortization chart, PDF report
- **Compound Interest** — A=P(1+r/n)^(nt), multiple compounding periods
- **Currency Converter** — Live rates, PKR focus
- **Pakistan Tax Calculator** — FBR 2024-25 slabs, salaried & non-salaried

### 📄 PDF Tools (`tools/pdf.html`)
- **PDF Merge** — pdf-lib.js, drag-reorder, page ranges
- **PDF Split** — 4 modes: range/extract/every-N/single pages
- **PDF Compress** — Canvas JPEG resampling, quality slider, metadata removal
- **JPG to PDF** — jsPDF, multi-image, A4/Letter, custom margins

### 🤖 AI Tools (`tools/ai.html`)
- **AI Hashtag Generator** — Mistral-7B-Instruct via HF API, 5 platforms
- **AI Content Writer** — Blog posts, captions, tone control
- **AI Email Writer** — Professional/sales/support emails
- **AI SEO Meta Generator** — Title tags, meta descriptions
- **AI Code Explainer** — Multi-language, plain English explanation

### 💻 Developer Tools (`tools/developer.html`)
- **QR Code Generator** — Logo embedding, custom colors, PNG/SVG, error correction
- **Base64 Encoder/Decoder** — 4 modes: text/image/file
- **URL Encoder/Decoder** — 4 modes, URL parsing, param extraction
- **HEX↔RGB↔HSL Converter** — Full color tool, Tailwind/Material palettes, WCAG
- **JSON Formatter** — Format/minify/validate, tree view, syntax highlight
- **Password Generator** — Crypto-secure, custom rules, strength meter
- **Typing Speed Test** ⭐ NEW — Live WPM, accuracy, 3 levels, shareable results

### ❤️ Health Tools (`tools/health.html`)
- **BMI Calculator** — WHO classification, gauge chart, healthy range
- **Calorie Calculator (TDEE)** — 3 BMR formulas, macros, 12-week projection
- **Water Intake Calculator** — 35ml/kg formula, glass tracker, hourly schedule
- **Ideal Weight Calculator** — 5 formulas (Devine/Robinson/Miller/Hamwi/BMI)
- **Age Calculator** — Exact age, zodiac, birthday countdown

### 🇵🇰 Pakistan Tools (`tools/pakistan.html`)
- **Pakistan Income Tax** — FBR 2024-25, effective rate, monthly deduction
- **Currency Converter** — PKR/USD/EUR/SAR/AED live rates

### ⚡ Productivity Tools (`tools/productivity.html`)
- **Typing Speed Test** — WPM, accuracy, shareable
- **Age Calculator** — Cross-listed
- **Image Compressor** — Canvas API, before/after slider
- **Background Remover** — remove.bg API
- **QR Generator** — Cross-listed
- **Hijri Converter** — Cross-listed

### 🔑 Admin C-Panel (`admin/index.html`) ⭐ NEW
- Password-protected dashboard
- Manage Tools (enable/disable each tool)
- Analytics overview with Chart.js
- Site Settings (name, tagline, description, Google Analytics)
- Contact Details editor (email, phone, WhatsApp, social links)
- SEO Settings (meta title format, description, OG image, robots)
- AdSense Configuration (publisher ID, ad slot IDs)
- Appearance (theme, accent color, font scale)
- API Keys management (HuggingFace, remove.bg, exchange rates)
- Security (change username/password)
- Activity Log

---

## 🔍 SEO Implementation

### Technical SEO
- `sitemap.xml` — All 40+ URLs with priority, changefreq, lastmod
- `robots.txt` — Allow all, disallow /admin/, Google/Bing/Yandex specific
- Canonical URLs on every page
- Mobile-responsive (viewport meta tag)

### On-Page SEO
- Unique `<title>` tags on every page (keyword-rich)
- Unique `<meta description>` on every page (under 160 chars)
- `<meta keywords>` on all pages
- Open Graph tags (og:title, og:description, og:url, og:image)
- Twitter Card tags

### Structured Data (JSON-LD)
- `WebSite` schema with SearchAction on homepage
- `Organization` schema on homepage
- `ItemList` schema listing all tools on homepage
- `CollectionPage` + `BreadcrumbList` on all 8 category hub pages
- `WebApplication` schema on Typing Speed Test
- FAQ schema (via JS toggle) on all category hub pages

### Internal Linking
- Category hub pages link to all individual tools
- Individual tools link back to category hubs
- Cross-category internal links in navbars
- Related tool suggestions in productivity/developer pages

---

## 💰 AdSense Readiness

### Ad Slot Positions
Each category hub page has:
1. `ins.adsbygoogle` — 728×90 Leaderboard (after hero)
2. `ins.adsbygoogle` — 336×280 Rectangle (after tool grid)

Admin panel allows updating publisher ID and slot IDs from dashboard.

### AdSense Requirements Met ✅
- Privacy Policy page: `privacy.html`
- Terms of Service page: `terms.html`
- Contact page with real contact info: `contact.html`
- About page: `about.html`
- Original content on every page
- Mobile-responsive design
- No copyright violations
- Unique tool pages with real functionality

---

## 🗂️ File Structure

```
/
├── index.html              Homepage
├── about.html
├── contact.html
├── blog.html
├── trending.html
├── privacy.html
├── terms.html
├── sitemap.xml             ← Updated with all 40+ URLs
├── robots.txt              ← Updated with /admin/ block
├── manifest.json           PWA
├── admin/
│   └── index.html          ← Admin C-Panel (NEW)
├── tools/
│   ├── islamic.html        ← Category Hub (NEW)
│   ├── finance.html        ← Category Hub (NEW)
│   ├── pdf.html            ← Category Hub (NEW)
│   ├── ai.html             ← Category Hub (NEW)
│   ├── developer.html      ← Category Hub (NEW)
│   ├── health.html         ← Category Hub (NEW)
│   ├── pakistan.html       ← Category Hub (NEW)
│   ├── productivity.html   ← Category Hub (NEW)
│   ├── typing-test.html    ← NEW Tool
│   ├── zakat-calculator.html
│   ├── inheritance-calculator.html
│   ├── emi-calculator.html
│   ├── sip-calculator.html
│   ├── mortgage-calculator.html
│   ├── compound-interest.html
│   ├── currency-converter.html
│   ├── pakistan-tax.html
│   ├── pdf-merge.html
│   ├── pdf-split.html
│   ├── pdf-compress.html
│   ├── jpg-to-pdf.html
│   ├── ai-hashtag.html
│   ├── qr-generator.html
│   ├── base64.html
│   ├── url-encoder.html
│   ├── hex-rgb.html
│   ├── json-formatter.html
│   ├── password-generator.html
│   ├── bmi-calculator.html
│   ├── calorie-calculator.html
│   ├── water-calculator.html
│   ├── ideal-weight.html
│   ├── age-calculator.html
│   ├── hijri-converter.html
│   ├── prayer-times.html
│   ├── image-compressor.html
│   └── background-remover.html
├── css/
│   └── style.css
└── js/
    └── (scripts)
```

---

## 🔧 localStorage Schema

| Key | Description |
|-----|-------------|
| `theme` | `"dark"` \| `"light"` |
| `hf_api_key` | Hugging Face API token |
| `removebg_api_key` | remove.bg API key |
| `typingScores` | Array of typing test results (WPM, acc, date) |
| `zakatHistory` | Past Zakat calculations |
| `admin_credentials` | Admin username/password hash |
| `admin_site` | Site settings |
| `admin_contact` | Contact details |
| `admin_seo` | SEO configuration |
| `admin_ads` | AdSense publisher/slot IDs |
| `admin_tools` | Tool enabled/disabled states |
| `admin_log` | Activity log entries |
| `glassesDrank` | Daily water intake tracker |
| `glassesDate` | Date for water reset |

---

## 🧮 Key Formulas Used

| Tool | Formula |
|------|---------|
| EMI | `P×r×(1+r)^n / [(1+r)^n - 1]` |
| SIP FV | `P × [(1+r)^n - 1] / r × (1+r)` |
| Compound Interest | `A = P(1+r/n)^(nt)` |
| Mifflin-St Jeor BMR | `10W + 6.25H - 5A ± 5/161` |
| Water Intake | `35ml/kg × activity_multiplier × climate_multiplier` |
| Zakat Rate | `2.5% of wealth above Nisab after 1 Hijri year` |
| WPM | `(correct_chars / 5) / time_in_minutes` |
| Typing Accuracy | `(correct_keystrokes / total_keystrokes) × 100` |

---

## 🔑 Third-Party API Requirements

| Service | Purpose | Cost |
|---------|---------|------|
| Hugging Face | AI Tools (Mistral-7B) | Free tier |
| remove.bg | Background Removal | 50 free/month |
| ExchangeRate API | Currency Rates | Free tier |

---

## 📋 Next Steps Recommended

1. **Google Search Console** — Submit sitemap, verify ownership
2. **Google Analytics** — Add GA4 Measurement ID in Admin panel
3. **AdSense Application** — Apply after 3 months of live content
4. **Schema Testing** — Test all JSON-LD at schema.org/SchemaMarkup
5. **Core Web Vitals** — Optimize LCP, CLS, FID scores
6. **Content Blog** — Add 10+ SEO articles about tool usage
7. **Backlinks** — Submit to directories (Product Hunt, GitHub, etc.)
8. **Social Media** — Create profiles, share tool pages
9. **Unit Converter** — Add to productivity section
10. **Loan Comparison** — Add to finance section

---

## ⚡ Performance Notes

- All processing is 100% client-side (no server needed)
- CDN libraries: Font Awesome, Google Fonts, Chart.js, pdf-lib, jsPDF
- No user data sent to servers (privacy-first)
- PWA manifest for mobile installation
- Preloader for smooth page load experience
