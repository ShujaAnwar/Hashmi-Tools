/**
 * fix-hubs2.js — Fix hub page footer duplicates and inject content
 */
const fs = require('fs');

// Hub content blocks: what each hub page is about
const hubContent = {
  'tools/developer.html': {
    title: 'Developer Tools That Work Entirely in Your Browser',
    intro: `HashmiTools Developer Tools is a curated collection of utilities for web developers, software engineers, and technical users who need reliable, fast tools without installing software or pasting sensitive code into unfamiliar services. Every tool in this section runs entirely client-side in your browser — your code, JSON, Base64 strings, and URL parameters never leave your device.`,
    body: `The collection includes: a JSON Formatter and Validator that instantly prettifies and validates JSON with syntax highlighting and error reporting; a Base64 Encoder/Decoder for encoding binary data and debugging API payloads; a URL Encoder/Decoder for encoding query strings and decoding percent-encoded URLs; an HEX/RGB Color Converter for designers working between design tools and CSS; a Password Generator with configurable length, character sets, and strength scoring; an SEO Audit tool that analyses any URL for on-page SEO issues; a QR Code Generator that creates scannable QR codes for URLs, text, and contact information; and a YouTube SEO Optimizer for video creators.\n\n<strong>How to use Developer Tools:</strong> Each tool is accessible via its own tab in this hub or directly from the tool cards above. All tools load instantly, work offline after the initial page load, and produce results you can copy to clipboard with a single click. No account, no API key, and no file uploads required for any tool in this section.`,
    faqItems: [
      { q: 'Are these developer tools safe to use with sensitive code or credentials?', a: 'All tools in the Developer section process data locally in your browser. Your JSON, Base64 strings, passwords, and URLs are never transmitted to HashmiTools servers or any third party. The Password Generator, in particular, uses the browser\'s cryptographically secure random number generator (window.crypto.getRandomValues) rather than Math.random(), making generated passwords genuinely secure. That said, as a general security practice, avoid pasting production database credentials, API secrets, or private keys into any web-based tool — use local command-line tools for handling the most sensitive materials.' },
      { q: 'How is the JSON Formatter different from JSONLint or other validators?', a: 'The HashmiTools JSON Formatter combines validation, prettification, and minification in a single interface with no ads interrupting your workflow. It highlights the exact location of syntax errors, supports nested object collapsing for large JSON structures, and formats output with configurable indentation (2-space or 4-space). It handles very large JSON payloads (multi-megabyte API responses) more gracefully than some online alternatives because processing is entirely client-side with no upload timeout. For developers debugging API responses in a hurry, the instant feedback on validation errors saves significant time.' },
      { q: 'Can I use the QR Generator for business cards or print materials?', a: 'Yes. The QR Generator produces SVG and high-resolution PNG QR codes suitable for print. For business card use, generate the QR code at the highest available resolution setting, download as PNG, and use at a minimum print size of 2cm × 2cm. QR codes smaller than 2cm × 2cm may fail to scan reliably on some smartphone cameras. Always test-scan your generated QR code before sending files to print. The tool supports URL, plain text, email, phone number, and SMS QR code types.' },
      { q: 'What is Base64 encoding and when do I need it as a developer?', a: 'Base64 is an encoding scheme that converts binary data (images, files, binary API payloads) into a string of printable ASCII characters. Developers need it when: embedding small images directly in HTML or CSS as data URIs (avoiding an extra HTTP request); handling API authentication headers (Basic Auth sends credentials as Base64-encoded "username:password"); debugging JWT tokens (which are Base64-encoded JSON); and processing binary file uploads in web applications. The HashmiTools Base64 Encoder/Decoder supports both encoding any text to Base64 and decoding Base64 strings back to their original form, with URL-safe Base64 variant support.' },
    ]
  },
  'tools/finance.html': {
    title: 'Free Financial Calculators Built for Pakistan\'s Economic Reality',
    intro: 'HashmiTools Finance Tools is a collection of calculators designed for the financial decisions that matter most to people in Pakistan, India, and the broader South Asian diaspora: understanding loan costs before signing, planning long-term investments, calculating zakat obligations, and navigating Pakistan\'s FBR tax system. Every calculation is transparent — the formulas are shown and the math is explained, so you understand the result, not just the number.',
    body: `The tools cover: EMI Calculator (monthly loan repayment with full amortisation breakdown); Compound Interest Calculator (investment growth with monthly compounding); SIP Calculator (systematic investment plan projections for mutual funds); Mortgage Calculator (home loan affordability); Pakistan Income Tax Calculator (FBR tax slabs for salaried and business income); Currency Converter (live exchange rates); and Zakat Calculator (nisab threshold and annual zakat obligation).\n\n<strong>How to use Finance Tools:</strong> Select the tool relevant to your financial decision. Enter your specific numbers — loan amount, interest rate, tenure, income, or investment amount. Results are calculated instantly. Use the amortisation tables in loan calculators to understand how much of each payment goes to principal vs. interest — this is where most borrowers find surprising information about the true cost of long-term loans.`,
    faqItems: [
      { q: 'How accurate are the tax calculations for Pakistan\'s FBR system?', a: 'The Pakistan Income Tax Calculator uses the current FBR tax slab rates as published in the Finance Act. Tax law in Pakistan changes annually with the Federal Budget (typically announced in June), and the calculator is updated accordingly. The calculations cover salaried income, business income, and senior citizen exemptions. Note that the calculator provides estimates based on standard deductions — it does not account for specialised scenarios such as agricultural income, real estate capital gains, or foreign income. For tax filing purposes, always consult a registered tax consultant or the FBR\'s official IRIS system for precise liability calculation.' },
      { q: 'What is the difference between flat rate and reducing balance interest?', a: 'This is the most important distinction for Pakistani borrowers comparing loan products. A flat rate applies the interest percentage to the original loan amount for the entire tenure — a PKR 500,000 loan at 12% flat rate for 3 years costs 500,000 × 12% × 3 = PKR 180,000 in interest, regardless of how much principal you\'ve repaid. A reducing balance (also called diminishing balance) rate applies interest only to the outstanding principal — so as you repay, the interest portion of each payment decreases. Most bank loans in Pakistan use reducing balance, while some consumer finance products use flat rates. A 12% flat rate is roughly equivalent to a 22-24% reducing balance rate — always ask your bank which method they use.' },
      { q: 'Does the Zakat Calculator follow Hanafi rulings?', a: 'Yes, the Zakat Calculator uses Hanafi methodology, which is the predominant school of Islamic jurisprudence in Pakistan. It calculates nisab based on the silver standard (612.35 grams of silver) which is typically lower than the gold standard and therefore more inclusive — capturing more Muslims within the Zakat obligation as the Hanafi school intends. Zakat is calculated at 2.5% of net zakatable assets that have been held above the nisab threshold for one complete lunar year (hawl). The calculator includes prompts to enter current market values of gold, silver, cash, investments, and business inventory.' },
    ]
  },
  'tools/health.html': {
    title: 'Free Health Calculators — Understand Your Body Metrics',
    intro: 'The HashmiTools Health section provides evidence-based body measurement calculators that help you understand key indicators of physical wellbeing. These tools use validated medical formulas to calculate BMI, ideal body weight, daily calorie requirements, water intake targets, and more. All calculations follow WHO and standard medical reference guidelines.',
    body: `<strong>Important disclaimer:</strong> These tools are for general informational and educational purposes only. They are not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified physician, dietitian, or healthcare professional before making decisions about diet, exercise, or health interventions based on these calculations.\n\nThe health toolkit includes: BMI Calculator (Body Mass Index with interpretation); Ideal Body Weight Calculator (Hamwi and Devine formula-based); Calorie Calculator (TDEE using Mifflin-St Jeor equation); Water Calculator (daily hydration requirements based on weight and activity); and a medical reference section with normal vital signs and lab value ranges.\n\n<strong>How to use Health Tools:</strong> All health calculators require you to enter basic measurements — height, weight, age, sex, and activity level. Results include not just the calculated value but an interpretation: what the number means for your health and what the normal range is for your age and demographic.`,
    faqItems: [
      { q: 'Are BMI calculations accurate for South Asian populations?', a: 'Standard BMI thresholds (18.5–24.9 normal, 25–29.9 overweight, 30+ obese) were developed primarily on European population data. Research published since the 1990s has consistently shown that South Asian populations (Pakistani, Indian, Bangladeshi) face significantly higher risk of type 2 diabetes and cardiovascular disease at lower BMI values than the standard thresholds suggest. The WHO and International Obesity Task Force recommend lower BMI cut-off points for Asian adults: overweight at BMI 23–27.4 and obese at BMI 27.5+. Our BMI Calculator notes this South Asian adjustment alongside the standard WHO classification. If your BMI is 22–24 but you have risk factors for metabolic disease, consult a doctor regardless of the "normal" classification.' },
      { q: 'How much water should I drink per day — is 8 glasses the right target?', a: 'The "8 glasses a day" rule is a popular simplification with limited scientific backing. Actual water requirements vary significantly based on body weight, activity level, climate, diet, and health status. The calculator uses the evidence-based formula: approximately 35ml per kg of body weight per day as a baseline, with adjustments for exercise (add 500ml per hour of moderate exercise), hot climate (add 500ml per day in temperatures above 35°C), and high-fibre diet. For a 70kg moderately active adult in Pakistan\'s summer, a target of 2.8–3.5 litres of total fluid (including food moisture) per day is typical. The key indicator of adequate hydration is pale yellow urine — not the clock.' },
      { q: 'What is the difference between Hamwi and Devine formula for ideal body weight?', a: 'Both formulas estimate ideal body weight based on height and sex, but they use slightly different baseline values. The Hamwi formula (1964) is the most widely used in clinical settings: for men, it starts at 48 kg for 5 feet and adds 2.7 kg per inch above 5 feet; for women, 45.5 kg at 5 feet adding 2.3 kg per inch. The Devine formula (1974) is similar but calibrated slightly differently. Both formulas produce similar results for most heights but diverge somewhat for very tall or very short individuals. Neither formula is a precision target — they represent a range associated with healthy weight for a given height, not a single number. The healthiest weight for an individual depends on muscle mass, bone density, age, and metabolic profile, which these formulas cannot capture.' },
    ]
  },
  'tools/islamic.html': {
    title: 'Islamic Tools — Prayer Times, Zakat, Hijri Calendar, and More',
    intro: 'The HashmiTools Islamic section provides a collection of free tools designed for the practical needs of Muslim users worldwide, with particular relevance for Pakistani, Indian, and Gulf-based communities: accurate prayer times using multiple calculation methods, Hijri/Gregorian calendar conversion, Zakat calculation, Qurbani planning, and Umrah preparation.',
    body: `<strong>How Prayer Times Are Calculated:</strong> Accurate prayer times depend on your geographical location (latitude and longitude) and the calculation method used by your local religious authority. Different methods use different solar angle definitions for Fajr and Isha — the two prayers calculated by the sun's position below the horizon rather than its direct visibility. The Karachi method (18° Fajr, 18° Isha) is standard for Pakistani and South Asian users; the Muslim World League method (18° Fajr, 17° Isha) is used in Europe and North America; the Egyptian General Authority method (19.5° Fajr, 17.5° Isha) is used in Egypt and the Gulf. The Prayer Times tool uses the Aladhan API to deliver precise, location-based times using your chosen method.\n\nOther tools in this section: Hijri Converter (convert between Islamic and Gregorian calendar dates); Zakat Calculator (2.5% of zakatable assets above nisab, Hanafi methodology); Qurbani Calculator (per-share cost for Eid al-Adha sacrifice); Plan Umrah (10-step preparation wizard); and Inheritance Calculator (Islamic Fara'idh distribution).`,
    faqItems: [
      { q: 'Which prayer time calculation method should I use in Pakistan?', a: 'For Pakistan, the University of Islamic Sciences, Karachi method is the standard reference used by the majority of mosques and religious institutions. This method uses 18° for both Fajr and Isha angles, which produces prayer times consistent with traditional Pakistani religious practice. The Pakistan government\'s Ministry of Religious Affairs also publishes official prayer time tables using this method. If you find discrepancies between our calculated times and your local mosque\'s announced times, ensure you are using the Karachi method and have entered your precise city coordinates — Pakistan spans multiple time zones and latitude ranges, and even within one city, minor coordinate differences can shift prayer times by a few minutes.' },
      { q: 'Is the Hijri calendar conversion accurate?', a: 'The Hijri calendar is a lunar calendar of 354–355 days per year, approximately 11 days shorter than the Gregorian solar calendar. Conversion between the two calendars is algorithmic — the standard Tabular Islamic Calendar (used for historical and administrative purposes) is calculated mathematically and is precisely accurate. However, the actual beginning of each Hijri month (and therefore exact dates for Ramadan, Eid, etc.) in traditional Islamic practice depends on physical sighting of the new moon (hilal), which varies by location and religious authority. The Converter uses the standard astronomical calculation, which aligns with most countries\' officially announced dates but may differ by 1 day from moon-sighting-based rulings in some regions or communities.' },
      { q: 'How do I calculate Zakat on investments, gold, and business inventory?', a: 'Zakat is due on specific categories of zakatable assets: gold and silver (at their current market value); cash and bank balances; trade goods and business inventory (at their current market value, not cost price); receivables (money owed to you that you expect to recover); and shares in companies (typically calculated on the per-share market value, with some scholars calculating only on the zakatable assets of the underlying company). Assets excluded from Zakat include: personal residence, personal vehicle, household goods, and business equipment used in production (not for sale). The Zakat Calculator guides you through each category with clear prompts, then applies the 2.5% rate to your net zakatable assets above the nisab threshold.' },
    ]
  },
};

// Process each hub
for (const [file, content] of Object.entries(hubContent)) {
  if (!fs.existsSync(file)) { console.log(`SKIP: ${file}`); continue; }
  let html = fs.readFileSync(file, 'utf8');
  
  // Fix duplicate "About | About |" footer issue from previous script
  html = html.replace(/(<a href="\.\.\/about\.html">About<\/a>)+(<a href="\.\.\/contact\.html">Contact<\/a>)+(<a href="\.\.\/about\.html">About<\/a>)+/g, 
    '<a href="../about.html">About</a><a href="../contact.html">Contact</a>');
  html = html.replace(/(<a href="\.\.\/about\.html">About<\/a>)+/g, '<a href="../about.html">About</a>');
  html = html.replace(/(<a href="\.\.\/contact\.html">Contact<\/a>)+/g, '<a href="../contact.html">Contact</a>');

  // Build article block
  const faqHtml = content.faqItems.map(f => `
<div style="border:1px solid #e2e8f0;border-radius:10px;margin-bottom:1rem;padding:1rem 1.25rem">
<h3 style="font-size:1rem;font-weight:600;margin-bottom:.4rem">${f.q}</h3>
<p style="margin:0">${f.a}</p>
</div>`).join('');

  const article = `
<!-- ═══════════════════ CONTENT ARTICLE ═══════════════════ -->
<article class="ht-content-article" style="max-width:860px;margin:2rem auto 60px;padding:0 20px;font-family:'Inter',sans-serif;color:#1e293b;line-height:1.75">
<h2 style="font-size:1.55rem;font-weight:700;margin:2rem 0 .75rem;color:#0f172a">How This Works — ${content.title}</h2>
<p>${content.intro}</p>
<p>${content.body}</p>
<h2 style="font-size:1.55rem;font-weight:700;margin:2.5rem 0 .75rem;color:#0f172a">Frequently Asked Questions</h2>
${faqHtml}
</article>
`;

  // Find the <footer> tag and inject article before it
  const footerMatch = html.match(/<footer[\s\S]{0,100}?>/);
  if (footerMatch) {
    const idx = html.indexOf(footerMatch[0]);
    html = html.slice(0, idx) + article + html.slice(idx);
    fs.writeFileSync(file, html);
    console.log(`✓ Injected content + fixed footer: ${file}`);
  } else {
    console.log(`✗ No footer found: ${file}`);
  }
}

// Fix duplicate links in all hub pages
const allHubs = [
  'tools/developer.html','tools/finance.html','tools/health.html',
  'tools/image-tools.html','tools/islamic.html','tools/pakistan.html',
  'tools/pdf.html','tools/productivity.html','tools/ai.html'
];
for (const f of allHubs) {
  if (!fs.existsSync(f)) continue;
  let html = fs.readFileSync(f, 'utf8');
  let changed = false;
  // Remove duplicate About and Contact links in footer area
  if ((html.match(/href="\.\.\/about\.html"/g)||[]).length > 3) {
    html = html.replace(/(<a href="\.\.\/about\.html"[^>]*>About<\/a>\s*)+(<a href="\.\.\/contact\.html"[^>]*>Contact<\/a>\s*)+(<a href="\.\.\/about\.html"[^>]*>About<\/a>\s*)+/g,
      '$1$2');
    changed = true;
  }
  if (changed) { fs.writeFileSync(f, html); console.log(`✓ Deduped: ${f}`); }
}

console.log('\nAll done.');
