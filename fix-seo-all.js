/**
 * fix-seo-all.js
 * Comprehensive SEO fix for all HashmiTools tool pages.
 * Adds/fixes: title, meta desc, canonical, robots, JSON-LD, H1, FAQ, How-to
 */
const fs = require('fs');
const path = require('path');

// ── Per-tool SEO data ────────────────────────────────────────────────────────
const SEO = {
  'age-calculator.html': {
    title: 'Free Age Calculator Online – Exact Years, Months & Days | HashmiTools',
    desc: 'Calculate your exact age in years, months, days, hours and minutes. Free online age calculator — just enter your date of birth and get instant results.',
    h1: 'Age Calculator',
    faqItems: [
      ['How does the age calculator work?', 'Enter your date of birth. The tool subtracts it from today\'s date and gives you exact years, months, and days, accounting for leap years.'],
      ['Can I calculate someone else\'s age?', 'Yes — just enter their birth date. There is no limit on whose age you calculate.'],
      ['Does it work for future dates?', 'The tool is designed for past birth dates. Entering a future date will show negative results.'],
      ['Is this tool free?', 'Yes, 100% free. No login, no signup, no download required.'],
      ['What is the most accurate way to calculate age?', 'This tool uses your exact date of birth including year, month, and day to give the most precise calculation.'],
    ],
    howTo: ['Enter your date of birth in the date field.','Optionally set a reference date (defaults to today).','Click Calculate Age.','See your age in years, months, days, hours, and minutes.'],
    schema: 'AgeCalculator',
  },
  'ai-hashtag.html': {
    title: 'Free AI Hashtag Generator – Instagram, TikTok, Twitter | HashmiTools',
    desc: 'Generate trending, niche-specific hashtags for Instagram, TikTok, Twitter/X, and YouTube instantly. Free AI-powered hashtag generator — no login required.',
    h1: 'AI Hashtag Generator',
    faqItems: [
      ['How does the AI hashtag generator work?', 'Enter your topic or keyword and the tool generates a mix of broad, niche, and trending hashtags relevant to your content.'],
      ['How many hashtags should I use on Instagram?', 'Instagram recommends 3–5 targeted hashtags per post, though up to 30 are allowed. Quality and relevance matter more than quantity.'],
      ['Can I use these hashtags on TikTok?', 'Yes — the generated hashtags work on all major platforms: Instagram, TikTok, Twitter/X, YouTube, and LinkedIn.'],
      ['Are the hashtags updated for current trends?', 'The tool generates contextually relevant hashtags based on your input. For real-time trending tags, combine them with platform-native tools.'],
      ['Is this tool free to use?', 'Completely free. No account needed, no usage limits.'],
    ],
    howTo: ['Type your topic, keyword, or post idea in the input box.','Select your target platform (Instagram, TikTok, etc.).','Click Generate Hashtags.','Copy the result and paste into your post.'],
    schema: 'HashtagGenerator',
  },
  'background-remover.html': {
    title: 'Free Background Remover – Remove Image Background Online | HashmiTools',
    desc: 'Remove image backgrounds instantly and for free. No Photoshop needed — upload your photo and get a transparent PNG background in seconds.',
    faqItems: [
      ['How do I remove an image background?', 'Upload your image, click Remove Background, and download the transparent PNG result in seconds.'],
      ['What image formats are supported?', 'JPG, PNG, and WebP images are supported. The output is always a transparent PNG file.'],
      ['Is background removal completely free?', 'Yes, completely free. Unlimited use, no signup, no watermarks on results.'],
      ['Can I change the background to a different color?', 'Yes — after removing the background you can fill it with any color or a custom image using the background options panel.'],
      ['How accurate is the background removal?', 'The AI detects subject edges automatically. For complex backgrounds, use the manual touch-up brush to refine edges.'],
    ],
    howTo: ['Click Upload Image or drag and drop your photo.','The AI automatically detects and removes the background.','Optionally choose a new background color or image.','Download the result as a transparent PNG.'],
    schema: 'BackgroundRemover',
  },
  'base64.html': {
    title: 'Free Base64 Encoder & Decoder Online | HashmiTools',
    desc: 'Encode text or files to Base64, or decode Base64 strings back to readable text instantly. Free online Base64 encoder/decoder — no installation required.',
    faqItems: [
      ['What is Base64 encoding?', 'Base64 converts binary data (like images or files) into ASCII text so it can be safely transmitted in URLs, JSON, HTML, or email.'],
      ['How do I decode a Base64 string?', 'Paste your Base64 string into the Decode tab and click Decode. The original text or file will appear instantly.'],
      ['Can I encode an image to Base64?', 'Yes — upload an image file and it will be converted to a Base64 data URL that can be embedded directly in HTML/CSS.'],
      ['Is Base64 a form of encryption?', 'No. Base64 is encoding, not encryption. Anyone can decode it. Do not use Base64 to secure sensitive data.'],
      ['What is Base64 used for?', 'Common uses: embedding images in HTML/CSS, encoding email attachments (MIME), storing binary data in JSON/XML, and URL-safe data transport.'],
    ],
    howTo: ['Choose Encode or Decode from the tabs.','Paste your text or upload a file.','Click Encode/Decode.','Copy the result with the Copy button.'],
    schema: 'Base64Tool',
  },
  'bmi-calculator.html': {
    title: 'Free BMI Calculator – Body Mass Index Online | HashmiTools',
    desc: 'Calculate your Body Mass Index (BMI) instantly. Enter your height and weight to find out if you\'re underweight, healthy, overweight, or obese — free online BMI calculator.',
    faqItems: [
      ['What is BMI?', 'Body Mass Index (BMI) is a number calculated from height and weight. It is used as a screening tool for weight categories that may lead to health problems.'],
      ['What is a healthy BMI range?', 'A BMI between 18.5 and 24.9 is considered healthy. Under 18.5 is underweight; 25–29.9 is overweight; 30+ is obese.'],
      ['Is BMI accurate for everyone?', 'BMI doesn\'t account for muscle mass, bone density, or fat distribution. Athletes may show high BMI despite low body fat. Consult a doctor for a full assessment.'],
      ['What units does this calculator support?', 'Both metric (kg, cm) and imperial (lbs, inches/feet) units are supported.'],
      ['Should I use BMI to diagnose health conditions?', 'BMI is a screening indicator only. For a proper health diagnosis, consult a qualified healthcare professional.'],
    ],
    howTo: ['Select metric or imperial units.','Enter your height and weight.','Click Calculate BMI.','Review your BMI score and weight category explanation.'],
    schema: 'BMICalculator',
  },
  'calorie-calculator.html': {
    title: 'Free Calorie Calculator – Daily Calorie Needs (TDEE) | HashmiTools',
    desc: 'Calculate your daily calorie needs based on age, gender, height, weight, and activity level. Find your TDEE and BMR for free — ideal for weight loss or muscle gain.',
    faqItems: [
      ['What is TDEE?', 'TDEE stands for Total Daily Energy Expenditure — the total calories your body burns in a day including all activity. Eating below TDEE causes weight loss.'],
      ['What is BMR?', 'Basal Metabolic Rate (BMR) is the calories your body burns at complete rest. It\'s the minimum energy needed to keep you alive.'],
      ['How many calories should I eat to lose weight?', 'A 500 calorie daily deficit from your TDEE typically results in ~0.5kg (1lb) of weight loss per week.'],
      ['Which formula does this calculator use?', 'The Mifflin-St Jeor equation — currently the most accurate formula for estimating calorie needs for most people.'],
      ['Is this tool accurate for all body types?', 'The formula is a scientific estimate. Actual needs vary slightly. Track your actual intake and weight for 2–4 weeks and adjust accordingly.'],
    ],
    howTo: ['Enter your age, gender, height, and current weight.','Select your activity level from the dropdown.','Choose your goal (lose weight, maintain, or gain).','Click Calculate — your daily calorie target is shown instantly.'],
    schema: 'CalorieCalculator',
  },
  'compound-interest.html': {
    title: 'Free Compound Interest Calculator – Investment Returns | HashmiTools',
    desc: 'Calculate compound interest on investments, savings, and loans. See how your money grows over time with our free compound interest calculator — supports daily, monthly & yearly compounding.',
    faqItems: [
      ['What is compound interest?', 'Compound interest is interest calculated on both the initial principal and the accumulated interest from previous periods. It causes exponential growth.'],
      ['How often should interest compound for best returns?', 'More frequent compounding = higher returns. Daily compounding yields slightly more than monthly, which is more than yearly.'],
      ['What is the Rule of 72?', 'Divide 72 by the annual interest rate to estimate how many years it takes to double your money. At 8% APR: 72 ÷ 8 = 9 years.'],
      ['Does this calculator account for inflation?', 'No — this shows nominal growth. Subtract the inflation rate from the interest rate to estimate real (inflation-adjusted) returns.'],
      ['Can I use this for loan calculations?', 'Yes — enter your loan principal, interest rate, and term to see total interest paid over the loan period.'],
    ],
    howTo: ['Enter the principal amount (initial investment).','Set the annual interest rate (APR).','Choose compounding frequency (daily/monthly/yearly).','Enter the investment period in years and click Calculate.'],
    schema: 'CompoundInterestCalculator',
  },
  'compress-pdf.html': {
    title: 'Free PDF Compressor – Reduce PDF File Size Online | HashmiTools',
    desc: 'Compress PDF files online for free. Reduce PDF size without losing quality — perfect for email attachments, uploading to portals, and saving storage space.',
    faqItems: [
      ['How much can I reduce a PDF file size?', 'Compression varies by content. Image-heavy PDFs often reduce by 50–80%. Text-only PDFs may reduce by 10–30%.'],
      ['Will compression reduce image quality?', 'The tool uses smart compression that minimizes visible quality loss. You can choose the compression level (low/medium/high).'],
      ['Is my PDF secure after upload?', 'Files are processed in your browser and are not uploaded to any server. Your data stays completely private.'],
      ['What is the maximum PDF size I can compress?', 'Files up to 100MB are supported. For larger files, consider splitting the PDF first.'],
      ['Does it work on scanned PDFs?', 'Yes — scanned PDFs (image-based) can be compressed. The tool recompresses the embedded images to reduce file size.'],
    ],
    howTo: ['Click Upload PDF or drag your file into the upload area.','Select your desired compression level (Low/Medium/High).','Click Compress PDF.','Download the compressed file — size shown before and after.'],
    schema: 'PDFCompressor',
  },
  'currency-converter.html': {
    title: 'Free Currency Converter – Live Exchange Rates 150+ Currencies | HashmiTools',
    desc: 'Convert between 150+ world currencies with live exchange rates. Free online currency converter with PKR, USD, EUR, GBP, SAR and all major currencies — updated daily.',
    faqItems: [
      ['How often are exchange rates updated?', 'Rates are fetched from live data sources and updated daily. For critical financial transactions always verify with your bank.'],
      ['Can I convert Pakistani Rupee (PKR) to USD?', 'Yes — PKR to USD, EUR, SAR, AED, GBP and all major currencies are supported.'],
      ['Is this tool free?', 'Yes, completely free. No signup, no limits on conversions.'],
      ['How accurate are the exchange rates?', 'Rates are indicative market rates. Actual bank/exchange rates may differ by 1–3% due to spreads and fees.'],
      ['What currencies are supported?', 'Over 150 currencies including PKR, USD, EUR, GBP, AED, SAR, CAD, AUD, JPY, CNY, and all major world currencies.'],
    ],
    howTo: ['Select the currency you want to convert from.','Enter the amount.','Select the target currency.','The converted amount updates instantly.'],
    schema: 'CurrencyConverter',
  },
  'emi-calculator.html': {
    title: 'Free EMI Calculator – Loan Monthly Payment Calculator | HashmiTools',
    desc: 'Calculate your loan EMI (Equated Monthly Instalment) instantly. Enter loan amount, interest rate, and tenure to see monthly payment and total interest — free EMI calculator.',
    faqItems: [
      ['What is EMI?', 'EMI stands for Equated Monthly Instalment — the fixed monthly payment you make to repay a loan including both principal and interest.'],
      ['How is EMI calculated?', 'EMI = [P × r × (1+r)^n] / [(1+r)^n – 1], where P is principal, r is monthly interest rate, and n is number of months.'],
      ['What is a good EMI-to-income ratio?', 'Financial advisors recommend keeping total EMIs below 40–50% of your monthly take-home income to maintain a healthy budget.'],
      ['Can I calculate home loan EMI?', 'Yes — enter the home loan amount, annual interest rate, and repayment period (typically 10–30 years) to get exact monthly installments.'],
      ['Does this show total interest paid?', 'Yes — the calculator shows monthly EMI, total amount payable, and total interest paid over the full loan tenure.'],
    ],
    howTo: ['Enter the loan amount (principal).','Enter the annual interest rate (%).','Set the loan tenure in years or months.','Click Calculate — see your EMI, total payment, and amortization schedule.'],
    schema: 'EMICalculator',
  },
  'hex-rgb.html': {
    title: 'Free HEX to RGB Color Converter – CSS Color Codes | HashmiTools',
    desc: 'Convert HEX color codes to RGB, HSL, and CMYK instantly. Free online color converter for web designers and developers — supports all CSS color formats.',
    faqItems: [
      ['How do I convert HEX to RGB?', 'Enter your HEX code (e.g. #6366f1) and the tool instantly shows the RGB equivalent (e.g. rgb(99, 102, 241)).'],
      ['What is the difference between HEX and RGB?', 'HEX is a 6-digit hexadecimal representation (#RRGGBB) while RGB uses three decimal numbers (0–255 each). Both represent the same colors.'],
      ['Can I convert RGB to HEX?', 'Yes — use the RGB to HEX tab. Enter the R, G, B values (0–255 each) to get the hex code.'],
      ['What is HSL color?', 'HSL (Hue, Saturation, Lightness) is another color model popular in CSS. This tool also converts to HSL format.'],
      ['What color formats does this support?', 'HEX → RGB, RGB → HEX, HEX → HSL, and visual color picker are all supported.'],
    ],
    howTo: ['Choose the conversion direction (HEX→RGB or RGB→HEX).','Enter your color value.','The converted code appears instantly.','Click Copy to copy the CSS-ready value.'],
    schema: 'ColorConverter',
  },
  'hijri-converter.html': {
    title: 'Free Hijri & Gregorian Date Converter – Islamic Calendar | HashmiTools',
    desc: 'Convert between Hijri (Islamic) and Gregorian dates instantly. Free online Hijri date converter for all Islamic months — accurate to the day.',
    faqItems: [
      ['What is the Hijri calendar?', 'The Hijri calendar is the Islamic lunar calendar used by Muslims worldwide to determine religious dates like Ramadan, Eid, and Hajj.'],
      ['How accurate is this converter?', 'The converter uses the standard Umm al-Qura (Saudi Arabia) algorithm for high accuracy. Minor regional variations in moon sighting may differ by 1 day.'],
      ['Can I convert today\'s date to Hijri?', 'Yes — the tool defaults to today\'s date and shows the current Hijri date instantly on load.'],
      ['What is the current Hijri year?', 'The current Hijri year is calculated dynamically. The Islamic calendar is approximately 11 days shorter than the Gregorian calendar each year.'],
      ['Is this tool useful for planning Islamic events?', 'Yes — use it to find exact Gregorian dates for Ramadan, Eid ul-Fitr, Eid ul-Adha, Muharram, and other Islamic observances.'],
    ],
    howTo: ['Select conversion direction: Hijri to Gregorian or Gregorian to Hijri.','Enter the date using the date picker or manual fields.','Click Convert.','See the equivalent date in the other calendar system.'],
    schema: 'HijriConverter',
  },
  'ideal-weight.html': {
    title: 'Free Ideal Weight Calculator – Healthy Weight for Your Height | HashmiTools',
    desc: 'Find your ideal body weight based on height, age, and gender using multiple formulas (Robinson, Miller, Devine). Free online ideal weight calculator.',
    faqItems: [
      ['How is ideal weight calculated?', 'This tool uses 4 formulas: Robinson (1983), Miller (1983), Devine (1974), and Hamwi — then shows the average as your recommended range.'],
      ['What is the ideal weight for 5\'7" (170 cm)?', 'For a 5\'7" male, ideal weight is approximately 63–75 kg. For females, approximately 58–70 kg (varies by formula used).'],
      ['Is ideal weight the same as healthy BMI weight?', 'They are related but different. Ideal weight formulas focus on height/gender ratios, while BMI considers weight relative to height squared.'],
      ['Does muscle mass affect ideal weight calculations?', 'Yes — athletes and very muscular individuals will weigh more than the "ideal" weight suggests, yet be perfectly healthy.'],
      ['Is this calculator suitable for children?', 'No — this tool is designed for adults. Children\'s healthy weight should be assessed using age-specific growth charts by a pediatrician.'],
    ],
    howTo: ['Enter your height (in cm or feet/inches).','Select your gender.','Optionally set your age for more accurate results.','Click Calculate — see your ideal weight range from multiple formulas.'],
    schema: 'IdealWeightCalculator',
  },
  'image-compressor.html': {
    title: 'Free Image Compressor – Reduce Image Size Online | HashmiTools',
    desc: 'Compress JPG, PNG, and WebP images online for free. Reduce image file size without visible quality loss — perfect for websites, social media, and email.',
    faqItems: [
      ['How much will my image be compressed?', 'Compression varies by image content. Most photos compress by 40–80% with minimal visible quality loss at the default settings.'],
      ['Does this compress PNG images?', 'Yes — PNG, JPG, WebP, and GIF images are all supported. The tool optimizes each format appropriately.'],
      ['Will the image dimensions change?', 'No — by default only file size is reduced. You can optionally resize (change dimensions) using the resize option.'],
      ['Are my images uploaded to a server?', 'No — all compression is done directly in your browser. Your images never leave your device.'],
      ['What is the maximum file size supported?', 'Files up to 20MB per image are supported. For larger images, try splitting them or use the resize option first.'],
    ],
    howTo: ['Upload one or more images by clicking or dragging into the upload area.','Adjust the quality slider (default is 80% — best balance).','Click Compress Images.','Download individual images or all compressed images as a ZIP.'],
    schema: 'ImageCompressor',
  },
  'image-editor.html': {
    title: 'Free Online Image Editor – Crop, Filter, Text & Effects | HashmiTools',
    desc: 'Edit images online for free — crop, resize, rotate, add text, apply filters, and adjust brightness/contrast. No download needed. Free browser-based image editor.',
    faqItems: [
      ['Can I edit photos without installing software?', 'Yes — this is a fully browser-based editor. No download, no signup, no plugins required.'],
      ['What editing features are available?', 'Crop, resize, rotate, flip, brightness, contrast, saturation, blur, sharpen, text overlay, stickers, filters, and draw tools.'],
      ['What image formats can I save as?', 'Save as JPG, PNG, or WebP with adjustable quality settings.'],
      ['Can I add text to images?', 'Yes — click the Text tool, type your text, and drag it anywhere on the image. Adjust font size, color, and style.'],
      ['Is this good for creating social media posts?', 'Yes — use preset sizes for Instagram, Facebook, Twitter/X, and YouTube thumbnails.'],
    ],
    howTo: ['Upload your image using the upload button.','Select a tool from the toolbar (Crop, Text, Filter, etc.).','Apply your edits to the canvas.','Click Download to save your edited image.'],
    schema: 'ImageEditor',
  },
  'inheritance-calculator.html': {
    title: 'Free Islamic Inheritance Calculator – Mirath & Faraid | HashmiTools',
    desc: 'Calculate Islamic inheritance shares (Faraid) based on Quran & Sunnah. Free Mirath calculator — enter heirs and get exact percentage shares for each family member.',
    faqItems: [
      ['What is Faraid?', 'Faraid is the Islamic system of inheritance prescribed in the Quran. It specifies fixed shares for heirs like spouse, children, parents, and siblings.'],
      ['How does this calculator work?', 'Enter the deceased\'s gender, total estate value, and list of surviving heirs. The tool calculates each heir\'s share according to Hanafi (or other) school rules.'],
      ['Is Islamic inheritance law the same in all madhabs?', 'The core shares are from the Quran and are the same. Minor differences exist between Hanafi, Shafi\'i, Maliki, and Hanbali schools in edge cases.'],
      ['What happens if there are no direct heirs?', 'In the absence of direct heirs, inheritance passes to agnatic (asaba) relatives. The tool handles complex cases including Usbah residue distribution.'],
      ['Is this calculator valid for legal purposes?', 'This is an educational tool. For legal estate distribution, consult a qualified Islamic scholar or estate attorney.'],
    ],
    howTo: ['Select the deceased\'s gender.','Enter the total estate value.','Check all surviving heirs from the list.','Click Calculate — see each heir\'s share in percentage and currency.'],
    schema: 'InheritanceCalculator',
  },
  'json-formatter.html': {
    title: 'Free JSON Formatter & Validator – Beautify & Minify JSON | HashmiTools',
    desc: 'Format, validate, beautify, and minify JSON online for free. Detect JSON errors instantly and convert minified JSON to readable indented format — no signup needed.',
    faqItems: [
      ['What does JSON formatting do?', 'JSON formatting (prettifying) takes compact JSON and adds proper indentation and line breaks to make it human-readable and easy to debug.'],
      ['How do I validate JSON?', 'Paste your JSON into the editor and click Validate. Any syntax errors are highlighted with the line number and error description.'],
      ['What is JSON minification?', 'Minification removes all whitespace and line breaks from JSON, making it smaller for use in production APIs and data transmission.'],
      ['Can I convert JSON to other formats?', 'This tool supports JSON ↔ formatting/minification. For conversion to XML, CSV, or YAML, check our other developer tools.'],
      ['Why is my JSON showing an error?', 'Common JSON errors: missing quotes around keys, trailing commas, single quotes instead of double quotes, or unescaped special characters in strings.'],
    ],
    howTo: ['Paste your JSON into the input editor.','Click Format/Beautify to make it readable, or Minify to compress it.','Errors are highlighted automatically.','Click Copy to copy the formatted result.'],
    schema: 'JSONFormatter',
  },
  'jpg-to-pdf.html': {
    title: 'Free JPG to PDF Converter – Convert Images to PDF Online | HashmiTools',
    desc: 'Convert JPG, PNG, and WebP images to PDF online for free. Merge multiple images into a single PDF document — fast, secure, no watermarks, no signup required.',
    faqItems: [
      ['Can I convert multiple images to one PDF?', 'Yes — upload multiple images, arrange them in order, and combine them all into a single PDF document.'],
      ['What image formats are supported?', 'JPG, JPEG, PNG, WebP, GIF, and BMP images are all supported for PDF conversion.'],
      ['Will the PDF have a watermark?', 'No — the converted PDF has no watermarks whatsoever. Completely clean output.'],
      ['Can I control the page size and orientation?', 'Yes — choose A4, Letter, or custom page size, and portrait or landscape orientation before converting.'],
      ['Is the conversion done securely?', 'All processing happens in your browser. Your images are never uploaded to a server.'],
    ],
    howTo: ['Upload one or more image files (JPG, PNG, etc.).','Arrange images in the desired page order by drag-and-drop.','Choose page size and orientation.','Click Convert to PDF and download the result.'],
    schema: 'JPGtoPDF',
  },
  'link-shortener.html': {
    title: 'Free Link Shortener – Shorten URLs Like Bitly | HashmiTools',
    desc: 'Shorten long URLs instantly for free. Create short links, generate QR codes, and track click counts — no signup needed. Free Bitly-alternative link shortener.',
    faqItems: [
      ['How does the link shortener work?', 'Enter any long URL and the tool generates a unique short code. The short link is stored in your browser\'s localStorage for easy access.'],
      ['Can I track how many times a link is clicked?', 'Yes — each short link has a click counter that increments every time you open it. View all your links and their click counts in the history panel.'],
      ['Are shortened links permanent?', 'Links are stored in your browser\'s localStorage. They persist until you clear your browser storage or delete them manually.'],
      ['Can I generate a QR code for my short link?', 'Yes — after shortening, click the QR button to generate and download a QR code for the short URL.'],
      ['Is this a server-based link shortener?', 'This is a client-side tool — links are stored only in your browser. They don\'t work on other devices or after clearing browser data.'],
    ],
    howTo: ['Paste your long URL into the input field.','Click Shorten — a short link is generated instantly.','Copy the short link or generate a QR code.','View and manage all your shortened links in the history panel.'],
    schema: 'LinkShortener',
  },
  'mortgage-calculator.html': {
    title: 'Free Mortgage Calculator – Home Loan Monthly Payment | HashmiTools',
    desc: 'Calculate your mortgage monthly payment, total interest, and amortization schedule. Free online home loan calculator — works for Pakistan, USA, UK, and worldwide.',
    faqItems: [
      ['What is a mortgage?', 'A mortgage is a loan used to buy property, where the property itself serves as collateral. You repay it in fixed monthly installments over a set term.'],
      ['How is a mortgage payment calculated?', 'Monthly payment = [P × r × (1+r)^n] / [(1+r)^n - 1], where P = loan amount, r = monthly interest rate, n = total months.'],
      ['What is LTV (Loan-to-Value)?', 'LTV is the ratio of the loan amount to the property value. A lower LTV (larger down payment) means better interest rates and lower risk.'],
      ['How much down payment do I need in Pakistan?', 'Pakistani banks typically require 20–30% down payment for home financing. Islamic financing options (Diminishing Musharakah) are also available.'],
      ['Does this include property taxes and insurance?', 'This calculator shows principal + interest only. Add estimated taxes and insurance separately for total housing cost (PITI).'],
    ],
    howTo: ['Enter the home price and your down payment amount.','Set the annual interest rate and loan term (years).','Click Calculate Mortgage.','Review your monthly payment and full amortization schedule.'],
    schema: 'MortgageCalculator',
  },
  'pakistan-tax.html': {
    title: 'Free Pakistan Income Tax Calculator – FBR Tax 2024-25 | HashmiTools',
    desc: 'Calculate Pakistan income tax for salaried individuals and businesses per FBR rates for 2024-25. Free online Pakistan tax calculator — accurate, fast, up-to-date.',
    faqItems: [
      ['What tax slabs are used in this calculator?', 'The calculator uses the latest FBR (Federal Board of Revenue) income tax slabs for the 2024-25 tax year as announced in the federal budget.'],
      ['Is income from salary taxed differently than business income?', 'Yes — salaried persons have different tax slabs than business or self-employed individuals. Select your income type for accurate results.'],
      ['What is the tax-free threshold in Pakistan?', 'For the 2024-25 tax year, income up to PKR 600,000/year is exempt from income tax for salaried individuals.'],
      ['Does this calculate withholding tax?', 'Yes — the calculator shows both annual and monthly withholding tax amounts for salaried employees.'],
      ['Can I use this for filing my tax return?', 'This is an estimation tool. For filing your actual tax return, use the FBR IRIS portal or consult a tax consultant.'],
    ],
    howTo: ['Select your income type (salaried or business).','Enter your annual or monthly income in PKR.','Add any applicable deductions (provident fund, Zakat, etc.).','Click Calculate Tax — see annual tax, monthly deduction, and effective rate.'],
    schema: 'PakistanTaxCalculator',
  },
  'password-generator.html': {
    title: 'Free Password Generator – Strong & Secure Passwords | HashmiTools',
    desc: 'Generate strong, random, secure passwords instantly. Customize length (8–64 chars), include uppercase, numbers, symbols. Free online password generator — no data stored.',
    faqItems: [
      ['How long should a strong password be?', 'Security experts recommend at least 16 characters. Longer passwords are exponentially harder to crack. This tool supports up to 64 characters.'],
      ['Is my generated password stored anywhere?', 'No — passwords are generated locally in your browser and never sent to any server. Zero data stored.'],
      ['What makes a password strong?', 'A strong password is long (16+ chars), random, uses uppercase, lowercase, numbers, and symbols, and is unique per account.'],
      ['Should I include symbols in my password?', 'Yes — adding symbols (!, @, #, $, etc.) dramatically increases password entropy and makes brute-force attacks much harder.'],
      ['Can I generate multiple passwords at once?', 'Yes — use the bulk generation option to create multiple passwords simultaneously for different accounts.'],
    ],
    howTo: ['Set the desired password length using the slider.','Check options: uppercase, lowercase, numbers, symbols.','Click Generate Password.','Click Copy to copy it to your clipboard, then store it in a password manager.'],
    schema: 'PasswordGenerator',
  },
  'pdf-editor.html': {
    title: 'Free PDF Editor Online – Edit PDF Text, Images & More | HashmiTools',
    desc: 'Edit PDF files online for free — add text, images, shapes, highlights, and signatures. No installation needed. Free browser-based PDF editor with no watermarks.',
    faqItems: [
      ['Can I edit text in a PDF?', 'Yes — use the text tool to add new text to any position on the PDF page. Note: editing existing embedded text requires the PDF to be text-based (not scanned).'],
      ['Can I add my signature to a PDF?', 'Yes — use the signature tool to draw, type, or upload your signature and place it anywhere on the document.'],
      ['Will the edited PDF have watermarks?', 'No — the output PDF is completely clean with no HashmiTools watermarks.'],
      ['Can I edit scanned PDFs?', 'You can annotate and overlay text on scanned PDFs. For full OCR-based text editing, the PDF must be processed with OCR first.'],
      ['Is this secure — are my PDFs uploaded to a server?', 'All editing is done in your browser. Your PDF files are never uploaded to any external server.'],
    ],
    howTo: ['Upload your PDF file using the upload button.','Select a tool: Text, Image, Draw, Highlight, or Signature.','Apply edits to the PDF canvas.','Click Download to save the edited PDF.'],
    schema: 'PDFEditor',
  },
  'pdf-merge.html': {
    title: 'Free PDF Merger – Combine Multiple PDFs Online | HashmiTools',
    desc: 'Merge multiple PDF files into one document online for free. Drag to reorder pages, combine PDFs instantly — no signup, no watermarks, no file size limits.',
    faqItems: [
      ['How many PDFs can I merge at once?', 'You can merge up to 20 PDF files in a single operation. For very large merges, process them in batches.'],
      ['Can I reorder pages before merging?', 'Yes — drag and drop the uploaded PDF thumbnails to arrange them in the desired order before merging.'],
      ['What is the maximum file size for each PDF?', 'Each individual PDF can be up to 100MB. The total combined size should not exceed 200MB.'],
      ['Will the merged PDF retain all original content?', 'Yes — text, images, bookmarks, and formatting are all preserved. Fonts and layout remain intact.'],
      ['Can I extract specific pages instead of merging?', 'Use our PDF Split tool for page extraction. This tool is specifically for merging/combining multiple PDFs.'],
    ],
    howTo: ['Upload 2 or more PDF files by clicking or dragging into the upload area.','Drag thumbnails to reorder the documents.','Click Merge PDFs.','Download the combined PDF file.'],
    schema: 'PDFMerger',
  },
  'pdf-split.html': {
    title: 'Free PDF Splitter – Split PDF Pages Online | HashmiTools',
    desc: 'Split a PDF into individual pages or custom page ranges online for free. Extract specific pages from PDF documents — fast, secure, no signup, no watermarks.',
    faqItems: [
      ['How do I split a PDF into individual pages?', 'Upload your PDF, choose "Split All Pages," and each page will be extracted as a separate PDF file, downloadable as a ZIP archive.'],
      ['Can I extract specific page ranges?', 'Yes — use the custom range option. Enter ranges like "1-3, 5, 8-10" to extract exactly the pages you need.'],
      ['Is the file uploaded to a server?', 'No — all PDF splitting happens in your browser using JavaScript. Your file stays on your device.'],
      ['How many pages can I split?', 'PDFs with up to 500 pages are supported. Very large PDFs may take a few seconds to process.'],
      ['Can I split a password-protected PDF?', 'Password-protected PDFs cannot be split without first removing the password. Use a PDF password remover tool first.'],
    ],
    howTo: ['Upload your PDF file.','Choose split method: all pages, custom range, or by file size.','Click Split PDF.','Download individual page files or a ZIP archive of all pages.'],
    schema: 'PDFSplitter',
  },
  'prayer-times.html': {
    title: 'Free Prayer Times – Accurate Namaz Times by City | HashmiTools',
    desc: 'Get accurate daily Namaz (prayer) times for any city worldwide. Fajr, Dhuhr, Asr, Maghrib, and Isha times with Qibla direction — free Islamic prayer time tool.',
    faqItems: [
      ['How are prayer times calculated?', 'Prayer times are calculated using geographic coordinates (latitude/longitude) and standard astronomical formulas (University of Islamic Sciences, Karachi method by default).'],
      ['Can I get prayer times for my exact location?', 'Yes — click "Use My Location" to auto-detect your city and get the most accurate prayer times for your exact coordinates.'],
      ['Which calculation method is used?', 'The tool defaults to the Karachi (UISK) method used in Pakistan. You can switch to other methods (MWL, ISNA, Egypt, Makkah) in Settings.'],
      ['Does this show Qibla direction?', 'Yes — the Qibla compass shows the direction of Makkah from your location.'],
      ['Are these times the same as my local mosque?', 'Times may vary slightly from local mosques depending on their preferred calculation method and local moon sighting conventions.'],
    ],
    howTo: ['Enter your city name or click "Use My Location".','Select your preferred calculation method (default: Karachi/UISK).','View all five daily prayer times.','Use the Qibla compass to find the direction of Makkah.'],
    schema: 'PrayerTimes',
  },
  'qr-generator.html': {
    title: 'Free QR Code Generator – Create Custom QR Codes | HashmiTools',
    desc: 'Generate QR codes for URLs, text, WiFi, contacts, and more. Customize colors, add a logo, and download as PNG or SVG — free online QR code generator.',
    faqItems: [
      ['What can I encode in a QR code?', 'URLs, plain text, phone numbers, email addresses, WiFi credentials, vCards (contacts), SMS messages, and location coordinates.'],
      ['Can I customize my QR code colors?', 'Yes — change the foreground and background colors, and optionally add a logo or image to the center of the QR code.'],
      ['What format can I download the QR code in?', 'Download as PNG (for digital use) or SVG (for print, scales to any size without quality loss).'],
      ['What is the maximum data a QR code can hold?', 'A QR code can hold up to 4,296 alphanumeric characters. For long URLs, consider shortening them first for a cleaner, smaller QR code.'],
      ['Can smartphones scan QR codes without an app?', 'Yes — all modern smartphones (iOS and Android) can scan QR codes using the built-in camera app without any additional apps.'],
    ],
    howTo: ['Select QR code type (URL, Text, WiFi, etc.) from the dropdown.','Enter your data in the input field.','Customize colors and size if desired.','Click Generate and download as PNG or SVG.'],
    schema: 'QRCodeGenerator',
  },
  'seo-audit.html': {
    title: 'Free SEO Audit Tool – Website SEO Checker & Score | HashmiTools',
    desc: 'Audit any webpage for 25+ on-page SEO factors. Get an SEO score, prioritized issues, meta tag analysis, heading structure, and Open Graph check — free online SEO auditor.',
    faqItems: [
      ['What does the SEO Audit Pro check?', 'It checks 25+ factors: HTTPS, title tag length, meta description, H1 tag, canonical URL, robots meta, viewport, Open Graph, Twitter Card, images alt text, structured data, URL structure, content length, and more.'],
      ['How is the SEO score calculated?', 'Each check is weighted by importance (Critical=5pts, Warning=3pts, Info=1pt). Your score is earned points ÷ total possible × 100.'],
      ['Why can\'t the tool fetch some URLs?', 'Some websites block cross-origin (CORS) requests. The tool automatically tries multiple proxy fallbacks. Very strict sites may block all external fetch attempts.'],
      ['Does this check backlinks or Google rankings?', 'No — this is an on-page SEO auditor. For backlinks and ranking data, use Google Search Console or Ahrefs/SEMrush.'],
      ['How often should I run an SEO audit?', 'Run an audit after any major site update or monthly as routine maintenance. Focus on fixing Critical issues first.'],
    ],
    howTo: ['Enter the full URL of the page you want to audit (e.g. https://example.com/page).','Click Audit Now — results appear in seconds.','Review the score ring and sub-category scores.','Fix Critical issues first, then Warnings, for the biggest SEO impact.'],
    schema: 'SEOAudit',
  },
  'sip-calculator.html': {
    title: 'Free SIP Calculator – Mutual Fund Investment Returns | HashmiTools',
    desc: 'Calculate returns on your SIP (Systematic Investment Plan) investments. See how monthly contributions grow with compound interest over time — free online SIP calculator.',
    faqItems: [
      ['What is SIP?', 'SIP (Systematic Investment Plan) is a method of investing a fixed amount regularly (monthly) into mutual funds. It benefits from rupee-cost averaging and compound growth.'],
      ['How is SIP return calculated?', 'SIP returns are calculated using the Future Value of an annuity formula: FV = P × [(1+r)^n - 1] / r × (1+r), where P = monthly investment, r = monthly rate, n = months.'],
      ['What is a good SIP return rate?', 'Equity mutual funds historically return 12–15% per year over long periods. Debt funds typically return 6–8%. Use conservative estimates (10%) for planning.'],
      ['Can I use this for Pakistani mutual funds?', 'Yes — enter the monthly investment in PKR and the expected annual return rate from your fund\'s historical performance.'],
      ['What is rupee-cost averaging in SIP?', 'Since you invest a fixed amount monthly, you buy more units when prices are low and fewer when prices are high — averaging out the cost over time.'],
    ],
    howTo: ['Enter your monthly SIP investment amount.','Set the expected annual return rate.','Enter the investment duration in years.','Click Calculate — see total investment, expected returns, and maturity value.'],
    schema: 'SIPCalculator',
  },
  'typing-test.html': {
    title: 'Free Typing Speed Test – WPM & Accuracy Test Online | HashmiTools',
    desc: 'Test your typing speed and accuracy online for free. Measure WPM (words per minute), CPM, and accuracy with real-time results — no signup, works on all devices.',
    faqItems: [
      ['How is typing speed measured?', 'Typing speed is measured in WPM (Words Per Minute). Each "word" equals 5 characters including spaces. Accuracy is the percentage of characters typed correctly.'],
      ['What is a good typing speed?', 'Average typists reach 40–60 WPM. Professional typists typically type 80–100+ WPM. Top speed typists can exceed 150 WPM.'],
      ['How do I improve my typing speed?', 'Practice daily, use all 10 fingers (touch typing), don\'t look at the keyboard, and focus on accuracy before speed. Consistent practice shows improvement within weeks.'],
      ['Does this test work on mobile devices?', 'Yes — the typing test works on mobile using the on-screen keyboard, though WPM will naturally be lower than on a physical keyboard.'],
      ['Can I practice with custom text?', 'Yes — switch to Custom Text mode and paste any text you want to practice with.'],
    ],
    howTo: ['Click Start Test or simply begin typing when the countdown ends.','Type the displayed text as accurately and quickly as possible.','The test ends automatically after the selected time (30s/60s/2min).','View your WPM, accuracy percentage, and error count.'],
    schema: 'TypingTest',
  },
  'url-encoder.html': {
    title: 'Free URL Encoder & Decoder Online – Percent Encoding | HashmiTools',
    desc: 'Encode or decode URLs and URI components online for free. Convert special characters to percent-encoding and back — essential for web developers and API testing.',
    faqItems: [
      ['What is URL encoding?', 'URL encoding (percent-encoding) converts special characters (spaces, &, =, ?, etc.) into % + hex code format so they can be safely used in URLs.'],
      ['When do I need to URL encode?', 'When passing special characters in query strings, building API requests, creating redirects, or handling user input that goes into a URL.'],
      ['What is the difference between encodeURI and encodeURIComponent?', 'encodeURI encodes the entire URL (preserving / : ? =). encodeURIComponent encodes a single parameter value and converts all special chars including /and ?.'],
      ['Can I decode a URL with %20 and similar codes?', 'Yes — paste the encoded URL into the decode tab and it converts %20 → space, %3D → =, %26 → & and all other percent-encoded characters.'],
      ['Does this support base64 URL encoding?', 'This tool handles standard percent-encoding. For Base64 encoding/decoding, use our Base64 tool.'],
    ],
    howTo: ['Select Encode or Decode from the tabs.','Paste your URL or text into the input field.','The result appears instantly.','Click Copy to copy the output.'],
    schema: 'URLEncoder',
  },
  'water-calculator.html': {
    title: 'Free Water Intake Calculator – Daily Hydration Needs | HashmiTools',
    desc: 'Calculate how much water you should drink daily based on your weight, activity level, and climate. Free online water intake calculator for optimal hydration.',
    faqItems: [
      ['How much water should I drink per day?', 'The general guideline is 8 cups (2 litres) per day, but actual needs depend on your weight, activity level, and climate. This calculator gives a personalized recommendation.'],
      ['Does the 8 glasses rule apply to everyone?', 'No — a larger, more active person in a hot climate needs much more than 8 glasses. Use this calculator for a personalized target.'],
      ['Does tea, coffee, or juice count toward water intake?', 'Yes, partially. Water-rich beverages count toward hydration, but caffeinated drinks have a mild diuretic effect. Plain water is still the best source.'],
      ['How do I know if I\'m drinking enough water?', 'Pale yellow urine is a sign of good hydration. Dark yellow or amber urine indicates dehydration. Thirst is often a late signal of dehydration.'],
      ['Should I drink more water during exercise?', 'Yes — add 300–500ml for every 30 minutes of moderate exercise. In hot weather or intense exercise, increase further.'],
    ],
    howTo: ['Enter your body weight (kg or lbs).','Select your activity level (sedentary to very active).','Choose your climate (temperate/hot/tropical).','Click Calculate — see your daily water target in litres and cups.'],
    schema: 'WaterCalculator',
  },
  'youtube-seo.html': {
    title: 'Free YouTube SEO Tool – Title, Description & Tags Generator | HashmiTools',
    desc: 'Generate SEO-optimized YouTube video titles, descriptions with timestamps, and viral tags. Free YouTube SEO tool for Pakistani creators — English, Roman Urdu, and Mixed.',
    faqItems: [
      ['How does the YouTube title generator work?', 'Enter your video topic and niche, select a title style (How-to, Listicle, Viral Hook, etc.), and the tool generates 5 SEO-optimized title options using proven templates.'],
      ['How many tags should a YouTube video have?', 'YouTube allows up to 500 characters of tags. Use 10–15 well-researched tags: 3–4 exact-match, 4–5 medium-tail, and 3–4 broad category tags.'],
      ['Does the description generator add timestamps?', 'Yes — enable the timestamp option and describe your video chapters. The tool formats them in the standard 0:00 MM:SS format that YouTube links to.'],
      ['Is Roman Urdu supported?', 'Yes — select Roman Urdu or Mixed (English+Urdu) language mode for titles and descriptions tailored to Pakistani YouTube audiences.'],
      ['Should I use the all-in-one tab or individual generators?', 'For a complete video upload, use the All-in-One tab — it generates an optimized title, full description with timestamps, and 30 categorized tags simultaneously.'],
    ],
    howTo: ['Enter your video topic and select your content niche.','Choose a tab: Title Generator, Description Generator, Tags Generator, or All-in-One.','Set your preferred language (English, Roman Urdu, or Mixed).','Click Generate — copy results and paste into YouTube Studio.'],
    schema: 'YouTubeSEOTool',
  },
  'zakat-calculator.html': {
    title: 'Free Zakat Calculator – Calculate Zakat on Gold, Cash & Assets | HashmiTools',
    desc: 'Calculate your Zakat accurately based on gold, silver, cash, investments, and business assets. Free Islamic Zakat calculator — enter your assets and get exact Zakat amount in PKR.',
    faqItems: [
      ['What is Zakat?', 'Zakat is one of the Five Pillars of Islam — an obligatory annual charity of 2.5% on wealth above the Nisab threshold, given to eligible recipients.'],
      ['What is Nisab?', 'Nisab is the minimum amount of wealth a Muslim must possess before Zakat becomes obligatory. It equals the value of 87.48g of gold or 612.36g of silver — whichever applies.'],
      ['What assets are Zakatable?', 'Cash, gold, silver, stocks/investments, business inventory, and receivable debts are all subject to Zakat. Personal use items (home, car, clothes) are generally exempt.'],
      ['Is 2.5% the correct Zakat rate?', '2.5% (1/40th) is the standard Zakat rate on most forms of wealth. Agricultural produce has different rates (5% or 10%). Consult a scholar for complex situations.'],
      ['Do I pay Zakat on my salary?', 'Zakat is not on income directly — it\'s on savings. If your savings (after deducting debts) have been above Nisab for a full lunar year (Hawl), 2.5% Zakat is due on them.'],
    ],
    howTo: ['Enter the current gold price per gram in PKR (or use the auto-fetch button).','Enter your cash, gold weight (grams), silver weight, and investment values.','Deduct any debts/liabilities you owe.','Click Calculate Zakat — see if you\'ve reached Nisab and the exact Zakat amount due.'],
    schema: 'ZakatCalculator',
  },
};

// ── Inject function ──────────────────────────────────────────────────────────
const toolDir2 = path.join(__dirname, 'tools');
let totalFixed = 0;

Object.entries(SEO).forEach(([file, seo]) => {
  const fp = path.join(toolDir2, file);
  if (!fs.existsSync(fp)) { console.log(`SKIP (not found): ${file}`); return; }

  let html = fs.readFileSync(fp, 'utf8');
  let changed = false;

  // 1. Fix title
  if (seo.title) {
    const newTitle = `<title>${seo.title}</title>`;
    if (html.includes('<title>')) {
      const oldTitle = html.match(/<title>[^<]*<\/title>/i)?.[0] || '';
      if (oldTitle !== newTitle) {
        html = html.replace(/<title>[^<]*<\/title>/i, newTitle);
        changed = true;
      }
    } else {
      html = html.replace(/<head>/i, `<head>\n  ${newTitle}`);
      changed = true;
    }
  }

  // 2. Fix/add meta description
  if (seo.desc) {
    const newDesc = `<meta name="description" content="${seo.desc}" />`;
    if (html.match(/<meta\s+name="description"/i)) {
      html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, newDesc);
      changed = true;
    } else {
      html = html.replace(/<\/title>/i, `</title>\n  ${newDesc}`);
      changed = true;
    }
  }

  // 3. Add robots meta if missing
  if (!html.includes('name="robots"')) {
    html = html.replace(/<\/title>/i, `</title>\n  <meta name="robots" content="index, follow" />`);
    changed = true;
  }

  // 4. Add JSON-LD WebApplication schema if missing
  if (!html.includes('application/ld+json') && seo.schema) {
    const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)?.[1] ||
      `https://hashmitools.com/tools/${file}`;
    const toolName = (seo.title || '').split('|')[0].trim().replace(/^Free\s+/,'');
    const desc2 = seo.desc || '';
    const faqSchema = seo.faqItems ? `
    ,{
      "@type": "FAQPage",
      "mainEntity": [${seo.faqItems.map(([q,a]) => `
        {"@type":"Question","name":${JSON.stringify(q)},"acceptedAnswer":{"@type":"Answer","text":${JSON.stringify(a)}}}`).join(',')}
      ]
    }` : '';
    const schema = `<script type="application/ld+json">
  [{"@context":"https://schema.org","@type":"WebApplication","name":${JSON.stringify(toolName)},"description":${JSON.stringify(desc2)},"url":${JSON.stringify(canonical)},"applicationCategory":"UtilityApplication","operatingSystem":"All","offers":{"@type":"Offer","price":"0","priceCurrency":"USD"},"provider":{"@type":"Organization","name":"HashmiTools","url":"https://hashmitools.com"}}${faqSchema}]
  </script>`;
    html = html.replace('</head>', `  ${schema}\n</head>`);
    changed = true;
  }

  // 5. Add FAQ section if missing
  const hasFaq = /id="faq"\s*>|class="faq"\s*>|<h[23][^>]*>.*FAQ|<h[23][^>]*>.*Frequently/i.test(html);
  if (!hasFaq && seo.faqItems) {
    const faqHtml = `
  <!-- FAQ Section -->
  <section id="faq" style="max-width:760px;margin:40px auto;padding:0 20px 40px;">
    <h2 style="font-family:'Space Grotesk',sans-serif;font-size:1.4rem;font-weight:700;margin-bottom:20px;color:var(--text-primary);">
      ❓ Frequently Asked Questions
    </h2>
    ${seo.faqItems.map(([q,a]) => `<details style="border:1px solid var(--border-color,#e5e7eb);border-radius:10px;margin-bottom:10px;overflow:hidden;">
      <summary style="padding:14px 18px;font-weight:600;cursor:pointer;font-size:0.92rem;list-style:none;display:flex;justify-content:space-between;align-items:center;color:var(--text-primary);">${q} <span style="color:var(--text-muted,#9ca3af);font-size:0.8rem;">▼</span></summary>
      <p style="padding:0 18px 14px;font-size:0.87rem;color:var(--text-secondary,#6b7280);line-height:1.65;margin:0;">${a}</p>
    </details>`).join('\n    ')}
  </section>`;
    // Insert before </main> or before footer or before </body>
    if (html.includes('</main>')) {
      html = html.replace('</main>', `${faqHtml}\n</main>`);
    } else if (html.includes('<footer')) {
      html = html.replace('<footer', `${faqHtml}\n  <footer`);
    } else {
      html = html.replace('</body>', `${faqHtml}\n</body>`);
    }
    changed = true;
  }

  // 6. Add How-to section if missing
  const hasHowTo = /how.to.use|how-to|step \d|steps to/i.test(html);
  if (!hasHowTo && seo.howTo) {
    const howHtml = `
  <!-- How to Use -->
  <section id="how-to-use" style="max-width:760px;margin:32px auto 0;padding:0 20px;">
    <h2 style="font-family:'Space Grotesk',sans-serif;font-size:1.4rem;font-weight:700;margin-bottom:16px;color:var(--text-primary);">
      📖 How to Use
    </h2>
    <ol style="padding-left:20px;margin:0;">
      ${seo.howTo.map(step => `<li style="padding:8px 0;font-size:0.9rem;color:var(--text-secondary,#6b7280);line-height:1.6;">${step}</li>`).join('\n      ')}
    </ol>
  </section>`;
    // Insert before FAQ section or before </main>
    if (html.includes('id="faq"')) {
      html = html.replace('<!-- FAQ Section -->', `${howHtml}\n\n  <!-- FAQ Section -->`);
    } else if (html.includes('</main>')) {
      html = html.replace('</main>', `${howHtml}\n</main>`);
    } else {
      html = html.replace('</body>', `${howHtml}\n</body>`);
    }
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(fp, html, 'utf8');
    console.log(`Fixed: ${file}`);
    totalFixed++;
  } else {
    console.log(`OK: ${file}`);
  }
});

console.log(`\nTotal files updated: ${totalFixed}`);
