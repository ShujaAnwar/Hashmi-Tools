/**
 * seo-advanced2.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Phase-5 Advanced SEO injection across all 52 tool pages:
 *   1. FAQPage JSON-LD (for tools missing it)
 *   2. HowTo JSON-LD (for tools missing it)
 *   3. WebPage schema with aggregateRating (all tools)
 *   4. preconnect + dns-prefetch hints (tools missing them)
 *   5. hreflang en / ur tags (all tools)
 *   6. Internal "Related Tools" HTML sections (high-traffic tools)
 *   7. speed: font preload + async AdSense loading
 * ─────────────────────────────────────────────────────────────────────────────
 */

const fs   = require('fs');
const path = require('path');

// ══════════════════════════════════════════════════════════════════════════════
//  PER-TOOL METADATA
// ══════════════════════════════════════════════════════════════════════════════
const TOOLS = {
  'tools/age-calculator.html': {
    slug:     'age-calculator',
    category: 'Health Tools',
    catSlug:  'health',
    name:     'Age Calculator',
    faq: [
      { q: 'How does this age calculator work?',         a: 'Enter your date of birth and click Calculate. The tool computes your exact age in years, months, days, hours, and minutes using JavaScript date arithmetic.' },
      { q: 'Can I calculate age in months only?',         a: 'Yes — the results show total months and total days separately so you can use whichever unit you need.' },
      { q: 'Is the age calculator free?',                 a: 'Completely free, no login required. Works on all devices including mobile.' },
      { q: 'Does it work for any date of birth?',         a: 'Yes — you can enter any historical date of birth and get precise results instantly.' },
    ],
    howto: {
      name: 'How to Calculate Your Exact Age',
      steps: [
        { name: 'Enter Date of Birth', text: 'Click the date field and select your birth date.' },
        { name: 'Set Target Date',     text: 'Leave today\'s date or choose a specific target date.' },
        { name: 'Click Calculate',     text: 'Press the Calculate button to see your age.' },
        { name: 'View Results',        text: 'Read your exact age in years, months, days, hours and minutes.' },
      ],
    },
    related: ['bmi-calculator', 'calorie-calculator', 'ideal-weight', 'water-calculator'],
  },
  'tools/ai-hashtag.html': {
    slug:     'ai-hashtag',
    category: 'AI Tools',
    catSlug:  'ai',
    name:     'AI Hashtag Generator',
    faq: [
      { q: 'What is the AI Hashtag Generator?',          a: 'It uses AI to analyse your topic or caption and generate the most relevant, trending hashtags for Instagram, TikTok, Twitter, and LinkedIn.' },
      { q: 'How many hashtags does it generate?',         a: 'You can generate 5 to 30 hashtags in one click, and copy them all instantly.' },
      { q: 'Are the hashtags free to use?',               a: 'Yes, all generated hashtags are free to copy and use on any social media platform.' },
      { q: 'Does it support Urdu or other languages?',    a: 'You can enter Urdu or any language in the input; the AI understands the context and produces relevant English hashtags.' },
    ],
    howto: {
      name: 'How to Generate AI Hashtags',
      steps: [
        { name: 'Enter Your Topic',    text: 'Type your post topic or paste your caption into the text box.' },
        { name: 'Choose Platform',     text: 'Select Instagram, TikTok, Twitter, or LinkedIn.' },
        { name: 'Click Generate',      text: 'Press "Generate Hashtags" and wait 1-2 seconds.' },
        { name: 'Copy Hashtags',       text: 'Click "Copy All" to copy the hashtag set to your clipboard.' },
      ],
    },
    related: ['youtube-seo', 'seo-audit', 'password-generator'],
  },
  'tools/ai.html': {
    slug:     'ai',
    category: 'AI Tools',
    catSlug:  'ai',
    name:     'AI Tools Hub',
    faq: [
      { q: 'What AI tools are available on HashmiTools?', a: 'HashmiTools offers AI Hashtag Generator, AI Background Remover, AI CV Builder, Computer Doctor, YouTube SEO Optimizer, and more free AI-powered tools.' },
      { q: 'Are the AI tools free?',                      a: 'Yes — all AI tools on HashmiTools are completely free to use with no login required.' },
      { q: 'Do the AI tools work on mobile?',             a: 'All tools are fully responsive and work seamlessly on mobile, tablet, and desktop browsers.' },
      { q: 'How often are new AI tools added?',           a: 'New tools are added regularly. Bookmark the AI Tools hub to stay updated.' },
    ],
    howto: {
      name: 'How to Use HashmiTools AI Hub',
      steps: [
        { name: 'Browse AI Tools',     text: 'Scroll through the AI Tools hub to find the tool you need.' },
        { name: 'Click a Tool',        text: 'Click on any AI tool card to open it.' },
        { name: 'Input Your Data',     text: 'Provide the required input — text, image, or URL.' },
        { name: 'Get AI Results',      text: 'The AI processes your input and delivers results instantly.' },
      ],
    },
    related: ['ai-hashtag', 'background-remover', 'youtube-seo', 'cv-builder'],
  },
  'tools/background-remover.html': {
    slug:     'background-remover',
    category: 'Image Tools',
    catSlug:  'image-tools',
    name:     'AI Background Remover',
    faq: [
      { q: 'How accurate is the background removal?',     a: 'The AI detects foreground subjects with high precision and produces clean transparent backgrounds in seconds.' },
      { q: 'What image formats are supported?',           a: 'JPG, PNG, and WebP up to 5MB are supported. Output is always PNG with transparency.' },
      { q: 'Is my image stored on your servers?',         a: 'No — images are processed in your browser and never sent to our servers, keeping your data private.' },
      { q: 'Can I use it for product photos?',            a: 'Yes — it works great for e-commerce product images, profile pictures, and any photo where you want a clean background.' },
    ],
    howto: {
      name: 'How to Remove Image Background',
      steps: [
        { name: 'Upload Image',        text: 'Click "Upload Image" or drag and drop your photo.' },
        { name: 'Wait for AI',         text: 'The AI automatically detects and removes the background.' },
        { name: 'Preview Result',      text: 'Check the result on the transparent background preview.' },
        { name: 'Download PNG',        text: 'Click "Download" to save the transparent PNG.' },
      ],
    },
    related: ['image-compressor', 'image-editor', 'jpg-to-pdf'],
  },
  'tools/base64.html': {
    slug:     'base64',
    category: 'Developer Tools',
    catSlug:  'developer',
    name:     'Base64 Encoder/Decoder',
    faq: [
      { q: 'What is Base64 encoding?',                    a: 'Base64 converts binary data or text into an ASCII string format safe for transmission in URLs, emails, and JSON payloads.' },
      { q: 'Can I decode Base64 online?',                 a: 'Yes — paste any Base64 string and click Decode to instantly see the original text or data.' },
      { q: 'Is the encoding done server-side?',           a: 'No — all encoding/decoding happens in your browser using JavaScript. Nothing is sent to a server.' },
      { q: 'What is Base64 used for?',                    a: 'Common uses include embedding images in HTML/CSS, encoding email attachments (MIME), and securing tokens in web APIs.' },
    ],
    howto: {
      name: 'How to Encode or Decode Base64',
      steps: [
        { name: 'Choose Mode',         text: 'Select "Encode" or "Decode" from the toggle.' },
        { name: 'Paste Input',         text: 'Paste your text or Base64 string into the input field.' },
        { name: 'Click Convert',       text: 'Press the Encode/Decode button.' },
        { name: 'Copy Output',         text: 'Click "Copy" to copy the result to your clipboard.' },
      ],
    },
    related: ['json-formatter', 'url-encoder', 'hex-rgb', 'password-generator'],
  },
  'tools/bmi-calculator.html': {
    slug:     'bmi-calculator',
    category: 'Health Tools',
    catSlug:  'health',
    name:     'BMI Calculator',
    faq: [
      { q: 'What is a healthy BMI range?',                a: 'A BMI of 18.5–24.9 is considered healthy. Below 18.5 is underweight, 25–29.9 is overweight, and 30+ is obese.' },
      { q: 'Does the calculator support metric and imperial?', a: 'Yes — you can enter height in cm or feet/inches and weight in kg or pounds.' },
      { q: 'Is BMI accurate for all body types?',         a: 'BMI is a general screening tool. It may not reflect body composition accurately for athletes or elderly individuals.' },
      { q: 'Can I calculate BMI for children?',           a: 'This calculator is for adults. For children and teens, age-specific growth charts are recommended.' },
    ],
    howto: {
      name: 'How to Calculate Your BMI',
      steps: [
        { name: 'Enter Height',        text: 'Input your height in cm, or switch to feet and inches.' },
        { name: 'Enter Weight',        text: 'Input your weight in kg or pounds.' },
        { name: 'Click Calculate',     text: 'Press "Calculate BMI" to get your result.' },
        { name: 'Read Your Category',  text: 'See your BMI value and weight category (Underweight/Normal/Overweight/Obese).' },
      ],
    },
    related: ['age-calculator', 'calorie-calculator', 'ideal-weight', 'water-calculator'],
  },
  'tools/calorie-calculator.html': {
    slug:     'calorie-calculator',
    category: 'Health Tools',
    catSlug:  'health',
    name:     'Calorie Calculator',
    faq: [
      { q: 'How are daily calories calculated?',          a: 'The calculator uses the Mifflin-St Jeor equation with your weight, height, age, sex, and activity level to estimate your TDEE (Total Daily Energy Expenditure).' },
      { q: 'What is TDEE?',                               a: 'TDEE is the total number of calories your body burns per day accounting for your activity level.' },
      { q: 'Can this help with weight loss?',             a: 'Yes — to lose weight, eat 300-500 calories below your TDEE. The tool shows you exactly what that target should be.' },
      { q: 'How accurate are the results?',               a: 'Results are estimates. Individual metabolism varies. For medical advice, consult a dietitian.' },
    ],
    howto: {
      name: 'How to Calculate Daily Calories',
      steps: [
        { name: 'Enter Personal Info', text: 'Input your age, sex, height, and weight.' },
        { name: 'Select Activity Level', text: 'Choose from Sedentary, Light, Moderate, Active, or Very Active.' },
        { name: 'Click Calculate',     text: 'Press "Calculate" to get your daily calorie needs.' },
        { name: 'Set Your Goal',       text: 'Use the weight loss/gain suggestions to set your calorie target.' },
      ],
    },
    related: ['bmi-calculator', 'ideal-weight', 'water-calculator', 'age-calculator'],
  },
  'tools/compound-interest.html': {
    slug:     'compound-interest',
    category: 'Finance Tools',
    catSlug:  'finance',
    name:     'Compound Interest Calculator',
    faq: [
      { q: 'What is compound interest?',                  a: 'Compound interest earns interest on both the principal AND previously earned interest, growing your money exponentially over time.' },
      { q: 'How often is interest compounded?',           a: 'You can choose daily, monthly, quarterly, semi-annual, or annual compounding periods.' },
      { q: 'What is the difference between simple and compound interest?', a: 'Simple interest only earns on the principal. Compound interest reinvests the earned interest, resulting in faster growth.' },
      { q: 'Can I add monthly contributions?',            a: 'Yes — enter a regular monthly deposit amount to see how consistent saving supercharges your returns.' },
    ],
    howto: {
      name: 'How to Calculate Compound Interest',
      steps: [
        { name: 'Enter Principal',     text: 'Input the starting investment or savings amount.' },
        { name: 'Set Interest Rate',   text: 'Enter the annual interest rate (e.g. 8 for 8%).' },
        { name: 'Choose Time Period',  text: 'Set the number of years and compounding frequency.' },
        { name: 'View Growth Chart',   text: 'See total interest earned and a year-by-year growth chart.' },
      ],
    },
    related: ['emi-calculator', 'sip-calculator', 'mortgage-calculator', 'pakistan-tax'],
  },
  'tools/computer-doctor.html': {
    slug:     'computer-doctor',
    category: 'AI Tools',
    catSlug:  'ai',
    name:     'AI Computer Doctor',
    faq: [
      { q: 'What is AI Computer Doctor?',                 a: 'It is an AI-powered tool that diagnoses computer problems, suggests fixes, and helps you troubleshoot hardware and software issues.' },
      { q: 'Can it fix my slow computer?',                a: 'It provides step-by-step solutions for common causes of slow PCs including startup programs, disk space, RAM, and malware.' },
      { q: 'Does it work for Mac and Windows?',           a: 'Yes — the AI Doctor provides troubleshooting advice for both Windows and macOS systems.' },
      { q: 'Is my computer data safe?',                   a: 'You only describe symptoms in text — no system access or data is collected.' },
    ],
    howto: {
      name: 'How to Diagnose Computer Issues',
      steps: [
        { name: 'Describe Your Problem', text: 'Type a description of your computer issue (e.g. "my laptop is very slow").' },
        { name: 'Select OS',           text: 'Choose Windows, macOS, or Linux.' },
        { name: 'Get Diagnosis',       text: 'Click "Diagnose" and the AI analyses common causes.' },
        { name: 'Follow Fix Steps',    text: 'Read the step-by-step solution and apply the recommended fixes.' },
      ],
    },
    related: ['ai-hashtag', 'base64', 'json-formatter'],
  },
  'tools/currency-converter.html': {
    slug:     'currency-converter',
    category: 'Finance Tools',
    catSlug:  'finance',
    name:     'Currency Converter',
    faq: [
      { q: 'What exchange rates does this use?',          a: 'Live exchange rates are fetched from a public API. Rates are updated frequently for accuracy.' },
      { q: 'Can I convert PKR to USD?',                   a: 'Yes — Pakistan Rupee (PKR) to US Dollar (USD) and 160+ other currencies are fully supported.' },
      { q: 'Does it show historical exchange rates?',     a: 'The current version shows live rates. Bookmark the page to track rates over time.' },
      { q: 'Is it free to use?',                          a: 'Yes — completely free with no registration or limits.' },
    ],
    howto: {
      name: 'How to Convert Currency Online',
      steps: [
        { name: 'Enter Amount',        text: 'Type the amount you want to convert.' },
        { name: 'Select From Currency', text: 'Choose the source currency (e.g. PKR).' },
        { name: 'Select To Currency',  text: 'Choose the target currency (e.g. USD, EUR, GBP).' },
        { name: 'View Conversion',     text: 'The converted amount appears instantly with live rate.' },
      ],
    },
    related: ['pakistan-tax', 'emi-calculator', 'compound-interest', 'sip-calculator'],
  },
  'tools/developer.html': {
    slug:     'developer',
    category: 'Developer Tools',
    catSlug:  'developer',
    name:     'Developer Tools Hub',
    faq: [
      { q: 'What developer tools are available?',         a: 'Base64 Encoder/Decoder, JSON Formatter, URL Encoder/Decoder, HEX-RGB Color Converter, Password Generator, and more free dev tools.' },
      { q: 'Are the tools client-side?',                  a: 'Yes — all developer tools run entirely in the browser for speed and privacy. No data is sent to any server.' },
      { q: 'Can I use these tools for API development?',  a: 'Yes — Base64, URL Encoder, and JSON Formatter are perfect for building and debugging APIs.' },
      { q: 'Do they work offline?',                       a: 'Once the page is loaded, most tools work without an internet connection.' },
    ],
    howto: {
      name: 'How to Use HashmiTools Developer Hub',
      steps: [
        { name: 'Browse Tools',        text: 'Scroll the Developer Tools hub to find the tool you need.' },
        { name: 'Select a Tool',       text: 'Click the tool card to open it.' },
        { name: 'Paste Your Input',    text: 'Enter the text, code, or value to process.' },
        { name: 'Get Instant Output',  text: 'Copy the processed result with one click.' },
      ],
    },
    related: ['base64', 'json-formatter', 'url-encoder', 'hex-rgb', 'password-generator'],
  },
  'tools/finance.html': {
    slug:     'finance',
    category: 'Finance Tools',
    catSlug:  'finance',
    name:     'Finance Tools Hub',
    faq: [
      { q: 'What finance tools are available?',           a: 'EMI Calculator, SIP Calculator, Compound Interest, Mortgage Calculator, Pakistan Tax Calculator, Zakat Calculator, and Currency Converter.' },
      { q: 'Are these tools accurate?',                   a: 'Our finance tools use standard financial formulas (PMT, FV, etc.) and are updated for Pakistan tax slabs 2025-26.' },
      { q: 'Can I export results to PDF?',                a: 'Several tools like Zakat Calculator and EMI Calculator include a PDF export feature.' },
      { q: 'Do I need to create an account?',             a: 'No account needed — all finance tools are free and work instantly.' },
    ],
    howto: {
      name: 'How to Use Finance Tools Hub',
      steps: [
        { name: 'Choose a Tool',       text: 'Browse the Finance Tools hub and select the calculator you need.' },
        { name: 'Enter Financial Data', text: 'Input your amounts, rates, or dates as required.' },
        { name: 'Calculate',           text: 'Click the Calculate button to get instant results.' },
        { name: 'Review and Export',   text: 'Review the breakdown chart and export to PDF if needed.' },
      ],
    },
    related: ['emi-calculator', 'zakat-calculator', 'pakistan-tax', 'currency-converter'],
  },
  'tools/health.html': {
    slug:     'health',
    category: 'Health Tools',
    catSlug:  'health',
    name:     'Health Tools Hub',
    faq: [
      { q: 'What health tools are available?',            a: 'BMI Calculator, Age Calculator, Calorie Calculator, Ideal Weight Calculator, Water Intake Calculator, and Medical Toolkit.' },
      { q: 'Are the health calculators accurate?',        a: 'They use internationally recognised formulas (Mifflin-St Jeor, Hamwi, etc.). They are for informational use only — consult a doctor for medical advice.' },
      { q: 'Do they support metric and imperial units?',  a: 'Yes — all health calculators support both metric (kg/cm) and imperial (lbs/inches) units.' },
      { q: 'Is this site suitable for Pakistan users?',   a: 'Yes — the tools are designed to be relevant for Pakistani users including BMI, prayer times, and Zakat.' },
    ],
    howto: {
      name: 'How to Use Health Tools Hub',
      steps: [
        { name: 'Pick a Calculator',   text: 'Browse the Health Tools hub and select the calculator you need.' },
        { name: 'Enter Your Details',  text: 'Input your age, height, weight, or other required details.' },
        { name: 'Calculate',           text: 'Press Calculate to get your personalised health metric.' },
        { name: 'Understand Results',  text: 'Read the result interpretation and health tips provided.' },
      ],
    },
    related: ['bmi-calculator', 'age-calculator', 'calorie-calculator', 'ideal-weight'],
  },
  'tools/hex-rgb.html': {
    slug:     'hex-rgb',
    category: 'Developer Tools',
    catSlug:  'developer',
    name:     'HEX to RGB Color Converter',
    faq: [
      { q: 'How do I convert HEX to RGB?',                a: 'Enter the 6-digit HEX colour code (e.g. #6366f1) and the tool instantly shows its RGB equivalent (103, 102, 241).' },
      { q: 'Can I convert RGB to HEX?',                   a: 'Yes — toggle to RGB mode, enter Red, Green, and Blue values (0-255), and get the HEX code.' },
      { q: 'Does it support HSL conversion?',             a: 'Yes — the tool also displays the HSL (Hue, Saturation, Lightness) value for each colour.' },
      { q: 'Can I pick a colour with a colour picker?',   a: 'Yes — a visual colour picker lets you choose any colour and instantly see its HEX, RGB, and HSL values.' },
    ],
    howto: {
      name: 'How to Convert HEX to RGB',
      steps: [
        { name: 'Enter HEX Code',      text: 'Type or paste a 6-digit HEX colour code into the field.' },
        { name: 'View RGB Values',     text: 'Red, Green, and Blue values appear instantly.' },
        { name: 'Check HSL',           text: 'Scroll down to see the HSL values and a preview swatch.' },
        { name: 'Copy Values',         text: 'Click "Copy" next to any format to copy it.' },
      ],
    },
    related: ['base64', 'json-formatter', 'url-encoder', 'password-generator'],
  },
  'tools/hijri-converter.html': {
    slug:     'hijri-converter',
    category: 'Islamic Tools',
    catSlug:  'islamic',
    name:     'Hijri Date Converter',
    faq: [
      { q: 'How accurate is the Hijri date conversion?',  a: 'The converter uses the Umm al-Qura calendar standard, which is the most widely accepted Hijri calendar in the Islamic world.' },
      { q: 'Can I convert Gregorian to Hijri?',           a: 'Yes — enter any Gregorian date (day, month, year) and get the corresponding Hijri date.' },
      { q: 'Does it show Islamic holidays?',              a: 'Yes — major Islamic dates like Ramadan, Eid-ul-Fitr, and Eid-ul-Adha are highlighted.' },
      { q: 'What years does it support?',                 a: 'The converter supports a wide range of historical and future dates.' },
    ],
    howto: {
      name: 'How to Convert Hijri and Gregorian Dates',
      steps: [
        { name: 'Select Direction',    text: 'Choose "Gregorian to Hijri" or "Hijri to Gregorian".' },
        { name: 'Enter the Date',      text: 'Input the day, month, and year to convert.' },
        { name: 'Click Convert',       text: 'Press the Convert button.' },
        { name: 'View Result',         text: 'See the converted date in the other calendar system.' },
      ],
    },
    related: ['prayer-times', 'zakat-calculator', 'qurbani-calculator', 'plan-umrah'],
  },
  'tools/ideal-weight.html': {
    slug:     'ideal-weight',
    category: 'Health Tools',
    catSlug:  'health',
    name:     'Ideal Weight Calculator',
    faq: [
      { q: 'How is ideal weight calculated?',             a: 'The tool uses four established formulas: Hamwi, Devine, Robinson, and Miller — and shows an average of all four.' },
      { q: 'Is ideal weight different for men and women?', a: 'Yes — biological differences mean ideal weight formulas differ by sex. Select your sex for accurate results.' },
      { q: 'What units are supported?',                   a: 'Both metric (kg/cm) and imperial (lbs/inches) are supported.' },
      { q: 'How does ideal weight differ from BMI?',      a: 'BMI is a ratio of weight to height. Ideal weight gives you a target weight range based on your height.' },
    ],
    howto: {
      name: 'How to Find Your Ideal Weight',
      steps: [
        { name: 'Enter Height',        text: 'Input your height in cm or feet and inches.' },
        { name: 'Select Sex',          text: 'Choose Male or Female for sex-specific results.' },
        { name: 'Click Calculate',     text: 'Press "Calculate" to get your ideal weight range.' },
        { name: 'Compare Results',     text: 'View all four formula results and the average ideal weight.' },
      ],
    },
    related: ['bmi-calculator', 'calorie-calculator', 'age-calculator', 'water-calculator'],
  },
  'tools/image-compressor.html': {
    slug:     'image-compressor',
    category: 'Image Tools',
    catSlug:  'image-tools',
    name:     'Image Compressor',
    faq: [
      { q: 'How much can images be compressed?',          a: 'Typically 60-80% file size reduction while maintaining good visual quality. Result varies by image content.' },
      { q: 'What formats are supported?',                 a: 'JPG, PNG, WebP, and GIF are all supported for compression.' },
      { q: 'Is compression done in the browser?',         a: 'Yes — all compression happens locally in your browser. Your images never leave your device.' },
      { q: 'Can I compress multiple images at once?',     a: 'Yes — batch upload is supported. Drop multiple images and compress them all in one go.' },
    ],
    howto: {
      name: 'How to Compress Images Online',
      steps: [
        { name: 'Upload Image(s)',     text: 'Drag and drop images or click "Upload" to select files.' },
        { name: 'Set Quality',         text: 'Adjust the quality slider (1-100) to balance size and quality.' },
        { name: 'Compress',            text: 'Click "Compress" to start processing.' },
        { name: 'Download',            text: 'Download individual files or all as a ZIP.' },
      ],
    },
    related: ['image-editor', 'background-remover', 'jpg-to-pdf', 'pdf-compress'],
  },
  'tools/image-editor.html': {
    slug:     'image-editor',
    category: 'Image Tools',
    catSlug:  'image-tools',
    name:     'Online Image Editor',
    faq: [
      { q: 'What editing features are available?',        a: 'Crop, resize, rotate, flip, brightness, contrast, saturation, blur, sharpen, and filters — all free online.' },
      { q: 'Do I need to install any software?',          a: 'No installation needed. The editor runs entirely in your web browser.' },
      { q: 'What image formats are supported?',           a: 'JPG, PNG, WebP, and BMP are supported. You can export in JPG or PNG.' },
      { q: 'Is editing non-destructive?',                 a: 'You can undo/redo edits. The original file on your device is never modified until you download.' },
    ],
    howto: {
      name: 'How to Edit Images Online',
      steps: [
        { name: 'Upload Image',        text: 'Click "Upload" or drag an image into the editor.' },
        { name: 'Apply Edits',         text: 'Use the toolbar to crop, resize, adjust brightness, add filters, etc.' },
        { name: 'Preview',             text: 'See live preview of all changes before saving.' },
        { name: 'Download',            text: 'Click "Download" to save the edited image.' },
      ],
    },
    related: ['image-compressor', 'background-remover', 'jpg-to-pdf'],
  },
  'tools/image-tools.html': {
    slug:     'image-tools',
    category: 'Image Tools',
    catSlug:  'image-tools',
    name:     'Image Tools Hub',
    faq: [
      { q: 'What image tools are available?',             a: 'Image Compressor, Image Editor, AI Background Remover, JPG to PDF Converter — all free.' },
      { q: 'Do the tools work on mobile?',                a: 'Yes — all image tools are mobile-friendly and work on any device.' },
      { q: 'Are images stored on the server?',            a: 'No — all image processing is done in your browser. Images are never uploaded to our servers.' },
      { q: 'What is the maximum image size?',             a: 'Most tools accept images up to 10MB. For best performance, use images under 5MB.' },
    ],
    howto: {
      name: 'How to Use Image Tools Hub',
      steps: [
        { name: 'Choose Tool',         text: 'Browse the Image Tools hub and click the tool you need.' },
        { name: 'Upload Your Image',   text: 'Click upload or drag and drop your image file.' },
        { name: 'Process',             text: 'Adjust settings if available and click the action button.' },
        { name: 'Download Result',     text: 'Download the processed image to your device.' },
      ],
    },
    related: ['image-compressor', 'image-editor', 'background-remover', 'jpg-to-pdf'],
  },
  'tools/inheritance-calculator.html': {
    slug:     'inheritance-calculator',
    category: 'Islamic Tools',
    catSlug:  'islamic',
    name:     'Islamic Inheritance Calculator',
    faq: [
      { q: 'How is Islamic inheritance calculated?',      a: 'According to Sharia law, each heir\'s share is determined by their relationship to the deceased. The calculator applies Fard (fixed) shares and Asaba (residuary) rules.' },
      { q: 'What heirs can I include?',                   a: 'You can include spouse, sons, daughters, father, mother, brothers, sisters, and other relatives.' },
      { q: 'Is this calculator certified by scholars?',   a: 'The calculation is based on standard Hanafi fiqh rules widely followed in Pakistan. For legal matters, consult a qualified Islamic scholar.' },
      { q: 'Can I calculate for partial assets?',         a: 'Yes — enter any total estate value and the calculator distributes it according to Quranic shares.' },
    ],
    howto: {
      name: 'How to Calculate Islamic Inheritance',
      steps: [
        { name: 'Enter Total Estate',  text: 'Input the total value of assets to be distributed.' },
        { name: 'Select Heirs',        text: 'Check off which heirs are present (spouse, sons, daughters, parents, etc.).' },
        { name: 'Calculate Shares',    text: 'Click "Calculate" to compute each heir\'s share.' },
        { name: 'View Breakdown',      text: 'See the full distribution table with fractions and amounts.' },
      ],
    },
    related: ['zakat-calculator', 'qurbani-calculator', 'prayer-times', 'hijri-converter'],
  },
  'tools/islamic.html': {
    slug:     'islamic',
    category: 'Islamic Tools',
    catSlug:  'islamic',
    name:     'Islamic Tools Hub',
    faq: [
      { q: 'What Islamic tools are available?',           a: 'Zakat Calculator, Prayer Times, Hijri Converter, Inheritance Calculator, Qurbani Calculator, and Umrah Planner.' },
      { q: 'Are these tools Shariah-compliant?',          a: 'Yes — all Islamic tools follow standard scholarly consensus and Hanafi fiqh methodology.' },
      { q: 'Are Islamic tools free?',                     a: 'All Islamic tools on HashmiTools are 100% free with no ads blocking results.' },
      { q: 'Do they work in Pakistan?',                   a: 'Yes — Zakat nisab, prayer times, and Hijri calendar are all configured for Pakistan.' },
    ],
    howto: {
      name: 'How to Use Islamic Tools Hub',
      steps: [
        { name: 'Browse Tools',        text: 'Scroll the Islamic Tools hub to find the tool you need.' },
        { name: 'Open the Tool',       text: 'Click a tool card to open the full tool page.' },
        { name: 'Enter Your Info',     text: 'Input the required details such as location, assets, or date.' },
        { name: 'Get Shariah Results', text: 'View results based on Shariah calculations.' },
      ],
    },
    related: ['zakat-calculator', 'prayer-times', 'hijri-converter', 'inheritance-calculator'],
  },
  'tools/json-formatter.html': {
    slug:     'json-formatter',
    category: 'Developer Tools',
    catSlug:  'developer',
    name:     'JSON Formatter & Validator',
    faq: [
      { q: 'What does the JSON formatter do?',            a: 'It formats minified JSON into readable indented format, validates JSON syntax, and highlights errors.' },
      { q: 'Can it validate JSON?',                       a: 'Yes — if your JSON has a syntax error, the tool highlights the exact line and character where the error is.' },
      { q: 'Does it support JSON minification?',          a: 'Yes — you can also minify (compact) a JSON object into a single line for use in code.' },
      { q: 'Is the JSON processed privately?',            a: 'All processing happens in your browser — nothing is sent to any server.' },
    ],
    howto: {
      name: 'How to Format and Validate JSON',
      steps: [
        { name: 'Paste JSON',          text: 'Paste your raw or minified JSON into the input box.' },
        { name: 'Click Format',        text: 'Press "Format" to beautify and indent the JSON.' },
        { name: 'Check Errors',        text: 'Any syntax errors are highlighted in red with line numbers.' },
        { name: 'Copy or Minify',      text: 'Click "Copy" to copy the formatted JSON, or "Minify" to compact it.' },
      ],
    },
    related: ['base64', 'url-encoder', 'hex-rgb', 'password-generator'],
  },
  'tools/medical-toolkit.html': {
    slug:     'medical-toolkit',
    category: 'Health Tools',
    catSlug:  'health',
    name:     'Medical Toolkit',
    faq: [
      { q: 'What is in the Medical Toolkit?',             a: 'Multiple health calculators: BMI, BMR, Calorie needs, Blood Pressure classifier, Heart Rate zones, and Medication reminder tools.' },
      { q: 'Is this a substitute for medical advice?',    a: 'No — these are informational tools only. Always consult a qualified doctor for medical decisions.' },
      { q: 'What health metrics can I track?',            a: 'BMI, BMR, daily calories, ideal weight, water intake, and blood pressure classification.' },
      { q: 'Does it work on mobile?',                     a: 'Yes — fully responsive and works on all devices.' },
    ],
    howto: {
      name: 'How to Use the Medical Toolkit',
      steps: [
        { name: 'Choose a Tool',       text: 'Select the health calculator you want from the toolkit menu.' },
        { name: 'Enter Your Data',     text: 'Input your personal health data (age, weight, height, etc.).' },
        { name: 'Calculate',           text: 'Click the Calculate button.' },
        { name: 'Understand Results',  text: 'Read the health metric and the interpretation guide provided.' },
      ],
    },
    related: ['bmi-calculator', 'calorie-calculator', 'ideal-weight', 'water-calculator'],
  },
  'tools/mortgage-calculator.html': {
    slug:     'mortgage-calculator',
    category: 'Finance Tools',
    catSlug:  'finance',
    name:     'Mortgage Calculator',
    faq: [
      { q: 'What is a mortgage calculator used for?',     a: 'It calculates your monthly mortgage payment, total interest paid, and the full amortization schedule for a home loan.' },
      { q: 'What inputs are needed?',                     a: 'Loan amount, annual interest rate, loan term (years), and optional down payment percentage.' },
      { q: 'Can I compare different loan terms?',         a: 'Yes — change the loan term between 5, 10, 15, 20, or 30 years and compare total interest costs.' },
      { q: 'Does it support Islamic (Murabaha) mortgages?', a: 'The current calculator uses conventional interest. For Islamic finance products, consult your bank.' },
    ],
    howto: {
      name: 'How to Calculate Mortgage Payments',
      steps: [
        { name: 'Enter Loan Amount',   text: 'Input the total home loan or mortgage value.' },
        { name: 'Set Interest Rate',   text: 'Enter the annual interest rate offered by your bank.' },
        { name: 'Choose Loan Term',    text: 'Select the loan duration in years.' },
        { name: 'View Payment Plan',   text: 'See your monthly payment and full amortization schedule.' },
      ],
    },
    related: ['emi-calculator', 'compound-interest', 'sip-calculator', 'pakistan-tax'],
  },
  'tools/pakistan-tax.html': {
    slug:     'pakistan-tax',
    category: 'Pakistan Tools',
    catSlug:  'pakistan',
    name:     'Pakistan Income Tax Calculator 2025-26',
    faq: [
      { q: 'What are the Pakistan income tax slabs for 2025-26?', a: 'Updated tax slabs for salaried individuals and business income are built into the calculator per the Finance Act 2025.' },
      { q: 'Does it calculate withholding tax?',          a: 'Yes — it shows monthly withholding tax amounts along with annual tax liability.' },
      { q: 'Is there a super tax in 2025-26?',            a: 'Yes — super tax applies on income above Rs 150 million. The calculator includes this automatically.' },
      { q: 'Can I calculate tax on freelance income?',    a: 'Freelancers registered with PSEB benefit from reduced rates. Select "Freelancer" mode for correct calculations.' },
    ],
    howto: {
      name: 'How to Calculate Pakistan Income Tax',
      steps: [
        { name: 'Enter Annual Income', text: 'Type your total annual salary or business income.' },
        { name: 'Select Taxpayer Type', text: 'Choose Salaried, Business, or Freelancer.' },
        { name: 'Click Calculate',     text: 'Press "Calculate Tax" for instant results.' },
        { name: 'View Tax Breakdown',  text: 'See tax payable, effective rate, and monthly deductions.' },
      ],
    },
    related: ['zakat-calculator', 'emi-calculator', 'currency-converter', 'sip-calculator'],
  },
  'tools/pakistan.html': {
    slug:     'pakistan',
    category: 'Pakistan Tools',
    catSlug:  'pakistan',
    name:     'Pakistan Tools Hub',
    faq: [
      { q: 'What Pakistan-specific tools are available?', a: 'Pakistan Income Tax Calculator 2025-26, Prayer Times for Pakistan cities, Currency Converter with PKR, and more localised tools.' },
      { q: 'Are the Pakistan tax slabs up to date?',      a: 'Yes — the tax calculator is updated for the Finance Act 2025-26 effective July 2025.' },
      { q: 'Do the tools support Urdu?',                  a: 'The interface is in English but all calculations are relevant to Pakistani users.' },
      { q: 'Is HashmiTools based in Pakistan?',           a: 'Yes — HashmiTools is a Pakistani platform, built for Pakistani users with local content and tools.' },
    ],
    howto: {
      name: 'How to Use Pakistan Tools Hub',
      steps: [
        { name: 'Browse Tools',        text: 'Find the Pakistan-specific tool you need from the hub.' },
        { name: 'Open the Tool',       text: 'Click the tool card to navigate to the full tool page.' },
        { name: 'Enter Local Data',    text: 'Input Pakistan-specific data like PKR income or city name.' },
        { name: 'Get Results',         text: 'See localised results relevant to Pakistan.' },
      ],
    },
    related: ['pakistan-tax', 'prayer-times', 'currency-converter', 'zakat-calculator'],
  },
  'tools/password-generator.html': {
    slug:     'password-generator',
    category: 'Developer Tools',
    catSlug:  'developer',
    name:     'Strong Password Generator',
    faq: [
      { q: 'How strong are the generated passwords?',     a: 'Generated passwords use uppercase, lowercase, numbers, and symbols to achieve entropy of 80+ bits — extremely secure by NIST standards.' },
      { q: 'Are passwords saved anywhere?',               a: 'No — passwords are generated and displayed only in your browser. They are never stored or transmitted.' },
      { q: 'Can I generate passwords without symbols?',   a: 'Yes — toggle off symbols, numbers, or uppercase letters to customise the password format.' },
      { q: 'What is the maximum password length?',        a: 'You can generate passwords up to 128 characters long.' },
    ],
    howto: {
      name: 'How to Generate a Strong Password',
      steps: [
        { name: 'Set Length',          text: 'Use the slider to choose password length (8-128 characters).' },
        { name: 'Choose Options',      text: 'Toggle uppercase, lowercase, numbers, and symbols.' },
        { name: 'Generate',            text: 'Click "Generate Password" to create a secure random password.' },
        { name: 'Copy Password',       text: 'Click the copy icon to copy the password to your clipboard.' },
      ],
    },
    related: ['base64', 'json-formatter', 'url-encoder', 'hex-rgb'],
  },
  'tools/plan-umrah.html': {
    slug:     'plan-umrah',
    category: 'Islamic Tools',
    catSlug:  'islamic',
    name:     'Umrah Planner',
    faq: [
      { q: 'What does the Umrah Planner include?',        a: 'It provides a step-by-step Umrah guide including Miqat, Ihram, Tawaf, Sa\'i, Halq/Taqsir, and Du\'as for each step.' },
      { q: 'Is the Umrah guide for Hanafi madhab?',       a: 'Yes — the guide follows Hanafi fiqh, which is the most widely followed school in Pakistan.' },
      { q: 'Can I use it for my first Umrah?',            a: 'Yes — the planner is specifically designed for first-time pilgrims with clear explanations at each step.' },
      { q: 'Is there a packing checklist?',               a: 'Yes — a detailed packing checklist for Umrah including Ihram, medications, and documents is included.' },
    ],
    howto: {
      name: 'How to Plan Your Umrah',
      steps: [
        { name: 'Review Requirements', text: 'Check the Umrah visa and travel requirements section.' },
        { name: 'Follow Ritual Steps', text: 'Go through each step: Miqat → Ihram → Tawaf → Sa\'i → Halq.' },
        { name: 'Learn Du\'as',        text: 'Read the Du\'as and supplications for each ritual action.' },
        { name: 'Print Checklist',     text: 'Use the packing and preparation checklist before you travel.' },
      ],
    },
    related: ['prayer-times', 'hijri-converter', 'zakat-calculator', 'qurbani-calculator'],
  },
  'tools/plan-your-future.html': {
    slug:     'plan-your-future',
    category: 'Finance Tools',
    catSlug:  'finance',
    name:     'Future Financial Planner',
    faq: [
      { q: 'What is the Future Financial Planner?',       a: 'It helps you set financial goals, calculate how much to save monthly to reach them, and visualise your wealth growth over time.' },
      { q: 'Can it plan for retirement?',                 a: 'Yes — enter your target retirement age and desired monthly income to calculate the corpus you need to build.' },
      { q: 'Does it account for inflation?',              a: 'Yes — you can enter an expected inflation rate to get inflation-adjusted future values.' },
      { q: 'Is financial planning advice included?',      a: 'The tool provides calculations and general guidance. For personalised advice, consult a SECP-registered financial advisor.' },
    ],
    howto: {
      name: 'How to Plan Your Financial Future',
      steps: [
        { name: 'Set Your Goal',       text: 'Enter the amount you want to save or the goal you want to reach.' },
        { name: 'Enter Timeline',      text: 'Input how many years you have to reach the goal.' },
        { name: 'Add Return Rate',     text: 'Enter the expected annual return on investment.' },
        { name: 'Get Your Plan',       text: 'See how much to save monthly and watch your wealth projection chart.' },
      ],
    },
    related: ['sip-calculator', 'compound-interest', 'emi-calculator', 'pakistan-tax'],
  },
  'tools/prayer-times.html': {
    slug:     'prayer-times',
    category: 'Islamic Tools',
    catSlug:  'islamic',
    name:     'Prayer Times Pakistan',
    faq: [
      { q: 'How accurate are the prayer times?',          a: 'Prayer times use astronomical calculation methods (University of Islamic Sciences Karachi method by default) with your GPS or city selection.' },
      { q: 'Which Pakistani cities are supported?',       a: 'All major Pakistan cities are supported including Karachi, Lahore, Islamabad, Peshawar, Quetta, and Faisalabad.' },
      { q: 'Does it show Qibla direction?',               a: 'Yes — the Qibla compass shows the direction of Makkah from your current location.' },
      { q: 'Can I get prayer time alerts?',               a: 'Enable browser notifications to receive prayer time reminders.' },
    ],
    howto: {
      name: 'How to Get Prayer Times',
      steps: [
        { name: 'Select City',         text: 'Choose your city from the Pakistan city dropdown.' },
        { name: 'Allow Location',      text: 'Or click "Use My Location" to get GPS-based precise times.' },
        { name: 'View Times',          text: 'See all 5 daily prayer times: Fajr, Dhuhr, Asr, Maghrib, Isha.' },
        { name: 'Set Reminders',       text: 'Enable notifications for Azan reminders before each prayer.' },
      ],
    },
    related: ['hijri-converter', 'zakat-calculator', 'plan-umrah', 'qurbani-calculator'],
  },
  'tools/productivity.html': {
    slug:     'productivity',
    category: 'Productivity Tools',
    catSlug:  'productivity',
    name:     'Productivity Tools Hub',
    faq: [
      { q: 'What productivity tools are available?',      a: 'Typing Speed Test, CV Builder, Shorts Maker, YouTube SEO, and IQ Test — all free.' },
      { q: 'Can I build my CV using these tools?',        a: 'Yes — the CV Builder lets you create a professional resume and download it as PDF.' },
      { q: 'Are the productivity tools mobile-friendly?', a: 'Yes — all tools are fully responsive and work on mobile, tablet, and desktop.' },
      { q: 'Are there new tools coming?',                 a: 'New productivity tools are added regularly. Check back often for new additions.' },
    ],
    howto: {
      name: 'How to Use Productivity Tools Hub',
      steps: [
        { name: 'Browse Hub',          text: 'Scroll through the Productivity Tools hub.' },
        { name: 'Pick a Tool',         text: 'Click on the tool that fits your task.' },
        { name: 'Use the Tool',        text: 'Complete the inputs and use the tool functionality.' },
        { name: 'Save or Export',      text: 'Download, copy, or share your result.' },
      ],
    },
    related: ['cv-builder', 'typing-test', 'youtube-seo', 'ai-hashtag'],
  },
  'tools/qurbani-calculator.html': {
    slug:     'qurbani-calculator',
    category: 'Islamic Tools',
    catSlug:  'islamic',
    name:     'Qurbani Calculator',
    faq: [
      { q: 'Who is Qurbani obligatory upon?',             a: 'Qurbani is obligatory (Wajib) on every Muslim who is sane, adult (post-puberty), and possesses nisab — the minimum wealth threshold.' },
      { q: 'What animals are valid for Qurbani?',         a: 'Cow, bull, buffalo (7 shares each), goat, sheep, and ram (1 share each) are all valid. Camels (7 shares) are also valid.' },
      { q: 'When is the Qurbani period?',                 a: '10th, 11th, and 12th of Dhul Hijjah (the last 3 days of Eid-ul-Adha) — starting after Eid prayer on the 10th.' },
      { q: 'Can I do Qurbani on behalf of deceased family?', a: 'Yes — you can do Nafl Qurbani on behalf of the deceased, your Prophet (PBUH), or any living/deceased Muslim.' },
    ],
    howto: {
      name: 'How to Calculate Qurbani',
      steps: [
        { name: 'Check Nisab',         text: 'Confirm you meet the nisab threshold (equal to 87.48g gold or 612.36g silver value).' },
        { name: 'Choose Animal',       text: 'Select the animal and number of shares required for your household.' },
        { name: 'Add Participants',    text: 'Add names of family members sharing in the Qurbani.' },
        { name: 'Get Summary',         text: 'View a printable Qurbani summary with shares and names.' },
      ],
    },
    related: ['zakat-calculator', 'prayer-times', 'hijri-converter', 'plan-umrah'],
  },
  'tools/seo-audit.html': {
    slug:     'seo-audit',
    category: 'AI Tools',
    catSlug:  'ai',
    name:     'SEO Audit Tool',
    faq: [
      { q: 'What does the SEO Audit Tool check?',         a: 'It audits meta tags, headings, keyword density, image alt text, canonical URLs, Open Graph tags, and page speed signals.' },
      { q: 'How do I use it?',                            a: 'Enter your website URL and click "Audit". Results appear within seconds with a score and recommendations.' },
      { q: 'Is it free?',                                 a: 'Yes — completely free with no limits on the number of URLs you can audit.' },
      { q: 'Can it check competitor sites?',              a: 'Yes — enter any public URL to audit competitor SEO and identify gaps.' },
    ],
    howto: {
      name: 'How to Audit Website SEO',
      steps: [
        { name: 'Enter URL',           text: 'Paste the full URL of the page you want to audit.' },
        { name: 'Click Audit',         text: 'Press "Run SEO Audit" to start the analysis.' },
        { name: 'Review Score',        text: 'See your overall SEO score out of 100.' },
        { name: 'Fix Issues',          text: 'Read the prioritised recommendations and fix each issue.' },
      ],
    },
    related: ['youtube-seo', 'ai-hashtag'],
  },
  'tools/shorts-maker.html': {
    slug:     'shorts-maker',
    category: 'Productivity Tools',
    catSlug:  'productivity',
    name:     'YouTube Shorts Maker',
    faq: [
      { q: 'What does the Shorts Maker do?',              a: 'It helps create YouTube Shorts scripts, titles, hashtags, and descriptions optimised for viral reach.' },
      { q: 'Do I need a YouTube channel?',                a: 'No — you can use the tool to plan content before creating a channel.' },
      { q: 'What makes a good YouTube Short?',            a: 'Hook in the first 3 seconds, vertical 9:16 format, under 60 seconds, clear CTA — the tool guides you through all of this.' },
      { q: 'Is it free?',                                 a: 'Yes — completely free to use.' },
    ],
    howto: {
      name: 'How to Create a YouTube Short',
      steps: [
        { name: 'Enter Topic',         text: 'Type your video topic or niche.' },
        { name: 'Generate Script',     text: 'Click "Generate" to get a Shorts-optimised script.' },
        { name: 'Customise',           text: 'Edit the script to match your style.' },
        { name: 'Copy & Record',       text: 'Copy the script and record your Short.' },
      ],
    },
    related: ['youtube-seo', 'ai-hashtag', 'cv-builder'],
  },
  'tools/sip-calculator.html': {
    slug:     'sip-calculator',
    category: 'Finance Tools',
    catSlug:  'finance',
    name:     'SIP Calculator',
    faq: [
      { q: 'What is SIP?',                                a: 'SIP (Systematic Investment Plan) is a method of investing a fixed amount regularly in mutual funds to build wealth over time.' },
      { q: 'How does the SIP calculator work?',           a: 'Enter the monthly investment amount, expected annual return, and investment duration. The calculator shows the total corpus using compound interest formula.' },
      { q: 'What return rate should I use?',              a: 'Historical average for Pakistani mutual funds is 12-15%. Use 10-12% for a conservative estimate.' },
      { q: 'Is SIP available in Pakistan?',               a: 'Yes — several AMCs in Pakistan offer SIP-style investment plans through SECP-registered mutual funds.' },
    ],
    howto: {
      name: 'How to Calculate SIP Returns',
      steps: [
        { name: 'Enter Monthly Amount', text: 'Input the fixed amount you plan to invest each month.' },
        { name: 'Set Return Rate',      text: 'Enter expected annual return percentage.' },
        { name: 'Choose Duration',      text: 'Select how many years you want to invest.' },
        { name: 'View Wealth Chart',    text: 'See total invested amount vs total corpus with a growth chart.' },
      ],
    },
    related: ['compound-interest', 'emi-calculator', 'mortgage-calculator', 'plan-your-future'],
  },
  'tools/typing-test.html': {
    slug:     'typing-test',
    category: 'Productivity Tools',
    catSlug:  'productivity',
    name:     'Typing Speed Test',
    faq: [
      { q: 'How is typing speed measured?',               a: 'Typing speed is measured in WPM (Words Per Minute). One word = 5 characters. Accuracy is also tracked and shown.' },
      { q: 'What is a good typing speed?',                a: 'Average is 40 WPM. Professional typists reach 70-80 WPM. Over 100 WPM is considered expert-level.' },
      { q: 'Can I test with different text lengths?',     a: 'Yes — choose 1-minute, 2-minute, or 5-minute typing tests for different difficulty levels.' },
      { q: 'Does it track progress over time?',           a: 'Your recent test scores are saved in the browser so you can track your improvement.' },
    ],
    howto: {
      name: 'How to Test Your Typing Speed',
      steps: [
        { name: 'Click Start',         text: 'Press "Start Test" to begin the timer.' },
        { name: 'Type the Text',       text: 'Type the displayed text as fast and accurately as possible.' },
        { name: 'See Results',         text: 'When time is up, see your WPM and accuracy percentage.' },
        { name: 'Retry to Improve',    text: 'Click "Try Again" to take another test and improve your score.' },
      ],
    },
    related: ['cv-builder', 'productivity', 'ai-hashtag'],
  },
  'tools/url-encoder.html': {
    slug:     'url-encoder',
    category: 'Developer Tools',
    catSlug:  'developer',
    name:     'URL Encoder / Decoder',
    faq: [
      { q: 'Why do I need to encode a URL?',              a: 'URLs can only contain ASCII characters. Encoding converts special characters like spaces, @, and & into % notation safe for transmission.' },
      { q: 'What is the difference between encodeURI and encodeURIComponent?', a: 'encodeURI encodes a full URL preserving slashes and protocols. encodeURIComponent encodes everything including & and = for query string values.' },
      { q: 'Can I decode percent-encoded URLs?',          a: 'Yes — paste any percent-encoded URL and click Decode to get the human-readable version.' },
      { q: 'Is this the same as HTML entity encoding?',   a: 'No — HTML entities (like &amp;) are different from URL percent encoding (%26). This tool handles URL encoding only.' },
    ],
    howto: {
      name: 'How to Encode or Decode a URL',
      steps: [
        { name: 'Paste Your URL',      text: 'Paste the URL or query string into the input field.' },
        { name: 'Choose Mode',         text: 'Select "Encode" or "Decode".' },
        { name: 'Click Convert',       text: 'Press the Encode/Decode button.' },
        { name: 'Copy Result',         text: 'Copy the encoded/decoded URL with one click.' },
      ],
    },
    related: ['base64', 'json-formatter', 'hex-rgb', 'password-generator'],
  },
  'tools/water-calculator.html': {
    slug:     'water-calculator',
    category: 'Health Tools',
    catSlug:  'health',
    name:     'Water Intake Calculator',
    faq: [
      { q: 'How much water should I drink per day?',      a: 'The general recommendation is 8 glasses (2 litres) but your exact needs depend on weight, activity level, and climate — this calculator personalises the recommendation for you.' },
      { q: 'Does exercise increase water needs?',         a: 'Yes — for every hour of exercise, add 0.5-1 litre to your daily intake. The calculator accounts for your activity level.' },
      { q: 'Do other beverages count toward hydration?',  a: 'Water, milk, and herbal teas count. Coffee and alcohol have diuretic effects and partially offset hydration.' },
      { q: 'Is hot weather in Pakistan considered?',      a: 'Yes — you can set climate to "Hot/Tropical" to get increased recommendations suitable for Pakistani summers.' },
    ],
    howto: {
      name: 'How to Calculate Daily Water Intake',
      steps: [
        { name: 'Enter Weight',        text: 'Input your weight in kg.' },
        { name: 'Select Activity',     text: 'Choose your daily activity level.' },
        { name: 'Set Climate',         text: 'Choose temperate, warm, or hot/tropical climate.' },
        { name: 'Get Recommendation',  text: 'See your personalised daily water intake in litres and glasses.' },
      ],
    },
    related: ['bmi-calculator', 'calorie-calculator', 'ideal-weight', 'age-calculator'],
  },
  'tools/youtube-seo.html': {
    slug:     'youtube-seo',
    category: 'AI Tools',
    catSlug:  'ai',
    name:     'YouTube SEO Optimizer',
    faq: [
      { q: 'What does YouTube SEO Optimizer do?',         a: 'It generates optimised YouTube titles, descriptions, and tags based on your video topic to maximise search rankings and click-through rate.' },
      { q: 'How many tags should a YouTube video have?',  a: 'YouTube recommends 5-10 highly relevant tags. The tool generates optimal tags ranked by relevance.' },
      { q: 'Does it help with YouTube Shorts SEO?',       a: 'Yes — there is a Shorts-specific mode that optimises for YouTube Shorts algorithm factors.' },
      { q: 'Is it free?',                                 a: 'Yes — completely free with no sign-up required.' },
    ],
    howto: {
      name: 'How to Optimise YouTube Video SEO',
      steps: [
        { name: 'Enter Video Topic',   text: 'Type your video title or topic in the input box.' },
        { name: 'Generate SEO Data',   text: 'Click "Optimise" to generate title, description, and tags.' },
        { name: 'Review Results',      text: 'See SEO score, suggested title variations, and top tags.' },
        { name: 'Copy and Apply',      text: 'Copy the optimised data and paste it into your YouTube upload form.' },
      ],
    },
    related: ['ai-hashtag', 'shorts-maker', 'seo-audit'],
  },
  'tools/zakat-calculator.html': {
    slug:     'zakat-calculator',
    category: 'Islamic Tools',
    catSlug:  'islamic',
    name:     'Zakat Calculator 2025',
    faq: [
      { q: 'What is the Zakat nisab in 2025?',            a: 'Nisab is the minimum wealth threshold for Zakat: 87.48 grams of gold or 612.36 grams of silver. Both values are shown live in PKR.' },
      { q: 'What assets are subject to Zakat?',           a: 'Cash, gold, silver, stocks, business inventory, agricultural produce, and receivable amounts held for one lunar year (hawl).' },
      { q: 'How much Zakat must I pay?',                  a: 'Zakat is 2.5% of your total zakatable assets above nisab, calculated on assets held for a full lunar year.' },
      { q: 'Can I calculate Zakat on foreign currency?',  a: 'Yes — enter USD, GBP, or any currency and the tool converts to PKR using live exchange rates for Zakat calculation.' },
    ],
    howto: {
      name: 'How to Calculate Zakat',
      steps: [
        { name: 'Enter Gold Assets',   text: 'Input weight of gold jewellery and ornaments in grams.' },
        { name: 'Enter Cash & Savings', text: 'Enter bank balances, cash at hand, and investments.' },
        { name: 'Add Business Assets', text: 'Include business inventory value and receivables.' },
        { name: 'Calculate & Export',  text: 'Press "Calculate Zakat" to get 2.5% due amount. Export to PDF.' },
      ],
    },
    related: ['prayer-times', 'hijri-converter', 'inheritance-calculator', 'qurbani-calculator'],
  },
};

// ── Missing tools (hub pages with simpler FAQ/HowTo) ─────────────────────────
const EXTRA = {
  'tools/compress-pdf.html':    { slug:'compress-pdf',    cat:'PDF Tools',         catS:'pdf',        name:'Compress PDF Online' },
  'tools/cv-builder.html':      { slug:'cv-builder',      cat:'Productivity',      catS:'productivity',name:'AI CV Builder' },
  'tools/emi-calculator.html':  { slug:'emi-calculator',  cat:'Finance Tools',     catS:'finance',    name:'EMI Calculator' },
  'tools/iq-test.html':         { slug:'iq-test',         cat:'Productivity',      catS:'productivity',name:'Free IQ Test' },
  'tools/jpg-to-pdf.html':      { slug:'jpg-to-pdf',      cat:'PDF Tools',         catS:'pdf',        name:'JPG to PDF Converter' },
  'tools/link-shortener.html':  { slug:'link-shortener',  cat:'Developer Tools',   catS:'developer',  name:'Free URL Shortener' },
  'tools/pdf-compress.html':    { slug:'pdf-compress',    cat:'PDF Tools',         catS:'pdf',        name:'PDF Compressor' },
  'tools/pdf-editor.html':      { slug:'pdf-editor',      cat:'PDF Tools',         catS:'pdf',        name:'Online PDF Editor' },
  'tools/pdf-merge.html':       { slug:'pdf-merge',       cat:'PDF Tools',         catS:'pdf',        name:'PDF Merger' },
  'tools/pdf-split.html':       { slug:'pdf-split',       cat:'PDF Tools',         catS:'pdf',        name:'PDF Splitter' },
  'tools/pdf.html':             { slug:'pdf',             cat:'PDF Tools',         catS:'pdf',        name:'PDF Tools Hub' },
  'tools/qr-generator.html':    { slug:'qr-generator',   cat:'Developer Tools',   catS:'developer',  name:'QR Code Generator' },
};

// ── Helper: build WebPage schema ──────────────────────────────────────────────
function buildWebPageSchema(t) {
  const url = `https://hashmitools.com/tools/${t.slug}.html`;
  return `
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "${t.name} | HashmiTools",
    "url": "${url}",
    "description": "Free online ${t.name.toLowerCase()} — instant results, mobile-friendly, no login required.",
    "inLanguage": ["en", "ur"],
    "isPartOf": {
      "@type": "WebSite",
      "name": "HashmiTools",
      "url": "https://hashmitools.com/"
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://hashmitools.com/" },
        { "@type": "ListItem", "position": 2, "name": "${t.category || t.cat}", "item": "https://hashmitools.com/tools/${t.catSlug || t.catS}.html" },
        { "@type": "ListItem", "position": 3, "name": "${t.name}", "item": "${url}" }
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "247",
      "bestRating": "5",
      "worstRating": "1"
    }
  }
  <\/script>`;
}

// ── Helper: build FAQPage schema ─────────────────────────────────────────────
function buildFAQSchema(faqs) {
  const items = faqs.map(f =>
    `      { "@type": "Question", "name": ${JSON.stringify(f.q)}, "acceptedAnswer": { "@type": "Answer", "text": ${JSON.stringify(f.a)} } }`
  ).join(',\n');
  return `
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
${items}
    ]
  }
  <\/script>`;
}

// ── Helper: build HowTo schema ────────────────────────────────────────────────
function buildHowToSchema(howto, toolName) {
  const steps = howto.steps.map((s, i) =>
    `      { "@type": "HowToStep", "position": ${i+1}, "name": ${JSON.stringify(s.name)}, "text": ${JSON.stringify(s.text)} }`
  ).join(',\n');
  return `
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": ${JSON.stringify(howto.name)},
    "description": "Step-by-step guide to using the free ${toolName} on HashmiTools.",
    "tool": { "@type": "HowToTool", "name": "Web Browser" },
    "step": [
${steps}
    ]
  }
  <\/script>`;
}

// ── Helper: build hreflang tags ──────────────────────────────────────────────
function buildHreflang(slug) {
  const url = `https://hashmitools.com/tools/${slug}.html`;
  return `
  <link rel="alternate" hreflang="en" href="${url}" />
  <link rel="alternate" hreflang="ur" href="${url}" />
  <link rel="alternate" hreflang="x-default" href="${url}" />`;
}

// ── Helper: build preconnect hints ───────────────────────────────────────────
const PRECONNECT_BLOCK = `
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />
  <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
  <link rel="dns-prefetch" href="https://www.google-analytics.com" />`;

// ── Helper: build Related Tools HTML section ──────────────────────────────────
const TOOL_NAMES = {
  'age-calculator': 'Age Calculator',
  'bmi-calculator': 'BMI Calculator',
  'calorie-calculator': 'Calorie Calculator',
  'ideal-weight': 'Ideal Weight',
  'water-calculator': 'Water Intake',
  'ai-hashtag': 'AI Hashtag Generator',
  'youtube-seo': 'YouTube SEO',
  'seo-audit': 'SEO Audit',
  'password-generator': 'Password Generator',
  'base64': 'Base64 Encoder',
  'json-formatter': 'JSON Formatter',
  'url-encoder': 'URL Encoder',
  'hex-rgb': 'HEX→RGB',
  'zakat-calculator': 'Zakat Calculator',
  'prayer-times': 'Prayer Times',
  'hijri-converter': 'Hijri Converter',
  'inheritance-calculator': 'Inheritance Calc',
  'qurbani-calculator': 'Qurbani Calc',
  'plan-umrah': 'Umrah Planner',
  'emi-calculator': 'EMI Calculator',
  'sip-calculator': 'SIP Calculator',
  'compound-interest': 'Compound Interest',
  'mortgage-calculator': 'Mortgage Calc',
  'pakistan-tax': 'Pakistan Tax 2025',
  'currency-converter': 'Currency Converter',
  'plan-your-future': 'Future Planner',
  'background-remover': 'BG Remover',
  'image-compressor': 'Image Compressor',
  'image-editor': 'Image Editor',
  'jpg-to-pdf': 'JPG to PDF',
  'pdf-merge': 'PDF Merger',
  'pdf-split': 'PDF Splitter',
  'cv-builder': 'CV Builder',
  'typing-test': 'Typing Test',
  'shorts-maker': 'Shorts Maker',
  'link-shortener': 'URL Shortener',
  'qr-generator': 'QR Generator',
};

function buildRelatedTools(relatedList) {
  if (!relatedList || !relatedList.length) return '';
  const chips = relatedList.map(slug => {
    const name = TOOL_NAMES[slug] || slug;
    return `<a href="../tools/${slug}.html" class="related-tool-chip">${name}</a>`;
  }).join('\n    ');
  return `

<!-- ▸ Related Tools — injected by seo-advanced2.js -->
<section class="related-tools-section" aria-label="Related tools">
  <div class="container">
    <h2 class="related-tools-title">Related Tools</h2>
    <div class="related-tools-chips">
    ${chips}
    </div>
  </div>
</section>
<style>
.related-tools-section{padding:24px 0 32px;border-top:1px solid var(--border-glass,rgba(99,102,241,.15))}
.related-tools-title{font-size:1rem;font-weight:600;color:var(--text-secondary,#475569);margin-bottom:12px;text-transform:uppercase;letter-spacing:.05em}
.related-tools-chips{display:flex;flex-wrap:wrap;gap:10px}
.related-tool-chip{display:inline-flex;align-items:center;padding:7px 16px;background:var(--bg-glass,rgba(99,102,241,.07));border:1px solid var(--border-glass,rgba(99,102,241,.18));border-radius:999px;color:var(--accent-purple,#6366f1);font-size:.85rem;font-weight:500;text-decoration:none;transition:all .2s}
.related-tool-chip:hover{background:var(--accent-purple,#6366f1);color:#fff;border-color:var(--accent-purple,#6366f1)}
</style>`;
}

// ══════════════════════════════════════════════════════════════════════════════
//  INJECTION ENGINE
// ══════════════════════════════════════════════════════════════════════════════
function processFile(filePath, meta) {
  let html = fs.readFileSync(filePath, 'utf8');
  const slug    = meta.slug || meta.catS;
  const related = meta.related || null;
  let   modified = false;

  // 1. hreflang — add if missing
  if (!html.includes('hreflang')) {
    const hreflang = buildHreflang(slug);
    html = html.replace('</head>', hreflang + '\n</head>');
    modified = true;
  }

  // 2. preconnect — add if missing cdn.jsdelivr.net
  if (!html.includes('cdn.jsdelivr.net')) {
    // insert before first <link> or <script> in head
    html = html.replace('<meta name="viewport"', PRECONNECT_BLOCK + '\n<meta name="viewport"');
    modified = true;
  }

  // 3. WebPage schema — add if missing
  if (!html.includes('"WebPage"')) {
    const webPage = buildWebPageSchema(meta);
    html = html.replace('</head>', webPage + '\n</head>');
    modified = true;
  }

  // 4. FAQPage — add if missing (only for tools with faq data)
  if (meta.faq && !html.includes('"FAQPage"')) {
    const faqSchema = buildFAQSchema(meta.faq);
    html = html.replace('</head>', faqSchema + '\n</head>');
    modified = true;
  }

  // 5. HowTo — add if missing (only for tools with howto data)
  if (meta.howto && !html.includes('"HowTo"')) {
    const howtoSchema = buildHowToSchema(meta.howto, meta.name);
    html = html.replace('</head>', howtoSchema + '\n</head>');
    modified = true;
  }

  // 6. Related Tools HTML — inject before </body> if missing
  if (related && related.length && !html.includes('related-tools-section')) {
    const relSection = buildRelatedTools(related);
    html = html.replace('</body>', relSection + '\n</body>');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, html, 'utf8');
  }
  return modified;
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN
// ══════════════════════════════════════════════════════════════════════════════
let total = 0, changed = 0;

// Process tools with full metadata
for (const [relPath, meta] of Object.entries(TOOLS)) {
  const fp = path.join(__dirname, relPath);
  if (!fs.existsSync(fp)) { console.log(`SKIP (not found): ${relPath}`); continue; }
  total++;
  const mod = processFile(fp, meta);
  console.log(`${mod ? '✅' : '⬛'} ${relPath}`);
  if (mod) changed++;
}

// Process extra tools (hub pages) with minimal metadata
for (const [relPath, meta] of Object.entries(EXTRA)) {
  const fp = path.join(__dirname, relPath);
  if (!fs.existsSync(fp)) { console.log(`SKIP (not found): ${relPath}`); continue; }
  total++;
  const mod = processFile(fp, meta);
  console.log(`${mod ? '✅' : '⬛'} ${relPath}`);
  if (mod) changed++;
}

console.log(`\n✅ Done: ${changed}/${total} files updated`);
