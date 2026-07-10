/**
 * inject-content.js
 * Injects rich content articles + footer links into FAIL pages
 * Run: node inject-content.js
 */
const fs = require('fs');

// Content blocks per page: [searchString, replacementString]
const injections = [

  // ── cv-builder.html ──────────────────────────────────────────────────────
  {
    file: 'tools/cv-builder.html',
    search: `</script>\n</body>\n</html>`,
    replacement: `</script>
<!-- ═══════════════════ CONTENT ARTICLE ═══════════════════ -->
<article class="ht-content-article" style="max-width:860px;margin:0 auto 60px;padding:0 20px;font-family:'Inter',sans-serif;color:#1e293b;line-height:1.75">
<h2 style="font-size:1.55rem;font-weight:700;margin:2rem 0 .75rem;color:#0f172a">How the AI CV Builder Works — From Blank Form to Professional Resume</h2>
<p>The HashmiTools AI CV Builder combines a structured data-entry form with the Claude AI language model to produce polished, professional CV content automatically. You fill in your factual details — work history, education, skills, contact information — and the AI rewrites your raw bullet points into action-verb-led, impact-quantified professional statements. For example, "handled customer complaints" becomes "Resolved an average of 35 daily customer inquiries with a 94% satisfaction rating, reducing escalations by 28%." This transformation — turning mundane job descriptions into compelling achievements — is precisely what recruiters and ATS (Applicant Tracking Systems) evaluate.</p>
<p>The builder supports multiple CV styles (modern, classic, minimal) with real-time preview. You can download the final CV as a formatted PDF ready to email or upload to job portals. Your draft is auto-saved to your browser's localStorage so you never lose work in progress.</p>

<h2 style="font-size:1.55rem;font-weight:700;margin:2.5rem 0 .75rem;color:#0f172a">Who Should Use This CV Builder</h2>
<ul style="margin:.5rem 0 1rem 1.5rem">
  <li style="margin-bottom:.5rem"><strong>Fresh graduates</strong> applying for their first job who struggle to present limited experience compellingly — the AI knows how to frame internships, university projects, and volunteer work as genuine professional strengths.</li>
  <li style="margin-bottom:.5rem"><strong>Mid-career professionals</strong> updating a CV they haven't touched in 5+ years and who need it modernised quickly for a sudden opportunity.</li>
  <li style="margin-bottom:.5rem"><strong>Job seekers applying to international roles</strong> — Gulf, UK, Canada — who need their CV formatted and phrased according to international professional standards rather than local conventions.</li>
  <li style="margin-bottom:.5rem"><strong>Anyone applying to multiple roles</strong> who wants to tailor their CV's professional summary and skills section for different job descriptions without rewriting from scratch each time.</li>
</ul>

<h2 style="font-size:1.55rem;font-weight:700;margin:2.5rem 0 .75rem;color:#0f172a">Worked Example: Before and After AI Enhancement</h2>
<p><strong>Raw input (what you type):</strong><br>Job title: Marketing Executive | Company: ABC Foods | Duties: Social media, content, ads, increased sales</p>
<p><strong>AI-enhanced output:</strong><br>"Managed all social media channels (Instagram 45K, Facebook 120K) and developed weekly content calendars aligned with brand strategy. Launched three paid digital campaigns on Meta Ads that drove a 34% increase in online sales over six months and reduced cost-per-acquisition by PKR 120."</p>
<p>The difference is not fabrication — it is structured articulation of the same experience, using specific metrics, action verbs (managed, developed, launched, drove), and cause-effect framing that modern recruiters expect. The AI asks you clarifying questions where it needs more detail before generating enhanced descriptions.</p>

<h2 style="font-size:1.55rem;font-weight:700;margin:2.5rem 0 .75rem;color:#0f172a">Tips for an ATS-Optimised CV in Pakistan</h2>
<ul style="margin:.5rem 0 1rem 1.5rem">
  <li style="margin-bottom:.5rem"><strong>Mirror the job description's exact keywords.</strong> ATS systems at major Pakistani employers (Unilever, HBL, Mobilink, government portals) filter CVs by keyword match before a human ever reads them. If the job description says "project management" and your CV says "project coordination," you may be filtered out.</li>
  <li style="margin-bottom:.5rem"><strong>One page for under 5 years' experience; two pages maximum.</strong> Pakistani hiring managers and Gulf recruiters consistently report that CVs beyond two pages are rarely read in full. Ruthlessly prioritise relevance over completeness.</li>
  <li style="margin-bottom:.5rem"><strong>Include a professional summary, not an "Objective Statement."</strong> "Seeking a challenging position to utilise my skills" tells a recruiter nothing. A professional summary — 3 sentences, your title, years of experience, and top two achievements — is the first thing read and the last thing remembered.</li>
  <li style="margin-bottom:.5rem"><strong>Quantify everything possible.</strong> Team size, revenue managed, users served, percentage improvements, time saved. Numbers make claims credible and memorable.</li>
</ul>

<h2 style="font-size:1.55rem;font-weight:700;margin:2.5rem 0 .75rem;color:#0f172a">Frequently Asked Questions</h2>
<div style="border:1px solid #e2e8f0;border-radius:10px;margin-bottom:1rem;padding:1rem 1.25rem">
<h3 style="font-size:1rem;font-weight:600;margin-bottom:.4rem">Is the CV Builder completely free?</h3>
<p style="margin:0">The CV form, templates, real-time preview, and PDF download are all completely free with no account required. The AI-enhancement feature requires a Claude API key from Anthropic, which has a generous free tier sufficient for generating multiple CVs. Once you have a free API key, enter it once and the tool stores it locally in your browser — you never need to re-enter it unless you clear your browser data.</p>
</div>
<div style="border:1px solid #e2e8f0;border-radius:10px;margin-bottom:1rem;padding:1rem 1.25rem">
<h3 style="font-size:1rem;font-weight:600;margin-bottom:.4rem">Will my CV look different on different devices or in email?</h3>
<p style="margin:0">The PDF download produces a consistent, fixed-layout document that looks identical regardless of the device used to view it. This is critical for professional use — a CV shared as a Word document may reformat when opened on a different version of Microsoft Word or on a Mac. Always share your HashmiTools CV as a PDF. The preview you see in the builder is a faithful representation of the final PDF output.</p>
</div>
<div style="border:1px solid #e2e8f0;border-radius:10px;margin-bottom:1rem;padding:1rem 1.25rem">
<h3 style="font-size:1rem;font-weight:600;margin-bottom:.4rem">Does HashmiTools store my CV data?</h3>
<p style="margin:0">No. All CV data is stored exclusively in your browser's localStorage on your own device. It is never transmitted to HashmiTools servers. When you use the AI enhancement feature, your CV content is sent directly from your browser to Anthropic's API using your own API key — it does not pass through HashmiTools infrastructure. If you clear your browser data or switch devices, your draft will not be available; download your PDF before closing the session.</p>
</div>
<div style="border:1px solid #e2e8f0;border-radius:10px;margin-bottom:1rem;padding:1rem 1.25rem">
<h3 style="font-size:1rem;font-weight:600;margin-bottom:.4rem">How do I tailor my CV for different jobs?</h3>
<p style="margin:0">Professional advice: maintain one "master CV" with all your experience in detail, then create tailored versions for specific applications by adjusting the professional summary, reordering skills to match the job description, and emphasising the most relevant experience. The AI builder helps with this — you can generate different professional summaries for the same CV by changing the "Target Role" prompt. Having three or four tailored CVs is far more effective than sending one generic CV to 50 applications.</p>
</div>
<div style="border:1px solid #e2e8f0;border-radius:10px;margin-bottom:1rem;padding:1rem 1.25rem">
<h3 style="font-size:1rem;font-weight:600;margin-bottom:.4rem">What makes a good CV for Gulf (UAE/Saudi/Qatar) job applications?</h3>
<p style="margin:0">Gulf employers have specific expectations that differ from South Asian conventions. Include a professional photo (this is standard and expected, unlike in the UK/US where it's discouraged). Include your nationality prominently. Ensure your contact information includes WhatsApp number, LinkedIn URL, and a professional email (not a nickname). Highlight any Arabic language skills, even basic conversational. Use the reverse-chronological format. Gulf HR managers from Pakistani and Indian backgrounds report that CVs with clear formatting, quantified achievements, and no spelling errors stand out significantly in a market where many applicants submit rushed, unformatted documents.</p>
</div>
<div style="border:1px solid #e2e8f0;border-radius:10px;margin-bottom:1rem;padding:1rem 1.25rem">
<h3 style="font-size:1rem;font-weight:600;margin-bottom:.4rem">Can I use this CV builder for creative jobs (design, media, content)?</h3>
<p style="margin:0">Yes, though for creative roles in design, advertising, and media, a portfolio link is more important than any CV format. The HashmiTools CV builder produces clean, professional CVs in multiple styles — the minimal template works particularly well for creative professionals who prefer a clean aesthetic over a corporate look. Include your portfolio URL prominently in the contact section. For highly visual roles, consider the CV as a door-opener that gets you to the portfolio review stage, not the final arbiter of your creative ability.</p>
</div>
</article>
<footer style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px;text-align:center;font-size:0.83rem;color:#64748b;margin-top:60px">
  <p>© 2026 <a href="../index.html" style="color:#6366f1;text-decoration:none">HashmiTools.com</a> — Free Online Tools. All rights reserved. |
  <a href="../about.html" style="color:#6366f1;text-decoration:none">About</a> |
  <a href="../contact.html" style="color:#6366f1;text-decoration:none">Contact</a> |
  <a href="../privacy.html" style="color:#6366f1;text-decoration:none">Privacy Policy</a> |
  <a href="../terms.html" style="color:#6366f1;text-decoration:none">Terms of Use</a></p>
</footer>
</body>
</html>`
  },

  // ── inheritance-calculator.html ──────────────────────────────────────────
  {
    file: 'tools/inheritance-calculator.html',
    search: `</body>\n</html>`,
    replacement: `<!-- ═══════════════════ CONTENT ARTICLE ═══════════════════ -->
<article class="ht-content-article" style="max-width:860px;margin:0 auto 60px;padding:0 20px;font-family:'Inter',sans-serif;color:#1e293b;line-height:1.75">
<h2 style="font-size:1.55rem;font-weight:700;margin:2rem 0 .75rem;color:#0f172a">Islamic Inheritance (Mirath): How the Calculator Works</h2>
<p>The Islamic Inheritance Calculator implements the rules of Fara'idh (فرائض) — the Quranic science of estate distribution — as codified in Surah An-Nisa (4:11-12, 4:176) and elaborated by centuries of Islamic jurisprudence. When a Muslim dies, their estate is distributed to eligible heirs in fixed fractional shares determined by their relationship to the deceased, their gender, and the presence or absence of other heirs. The calculator takes your inputs — estate value, surviving heirs — and computes each heir's entitlement according to these rules, including the Asabah (residuaries) calculation that distributes any remaining estate after fixed shares are assigned.</p>
<p>The calculation covers the four main fixed-share heirs (Ashab al-Furudh): the spouse (1/4 or 1/8 depending on children), daughters (1/2 sole, 2/3 if multiple), mother (1/6 or 1/3), father (1/6 or Asabah), and handles the Hajb (حجب — blocking) rules that determine when certain heirs are excluded by the presence of closer relatives.</p>

<h2 style="font-size:1.55rem;font-weight:700;margin:2.5rem 0 .75rem;color:#0f172a">Who Should Use This Tool</h2>
<ul style="margin:.5rem 0 1rem 1.5rem">
  <li style="margin-bottom:.5rem"><strong>Families managing an estate</strong> after the passing of a family member who want to understand the Islamic distribution before consulting a lawyer or Islamic scholar.</li>
  <li style="margin-bottom:.5rem"><strong>Islamic studies students</strong> learning Fara'idh who want to verify their manual calculations or work through practice scenarios.</li>
  <li style="margin-bottom:.5rem"><strong>Muslims planning ahead</strong> (wasiyyah) who want to understand how their estate would be distributed under Islamic law so they can make informed decisions about any permissible discretionary bequests (wasiyyah, limited to 1/3 of estate to non-heirs).</li>
  <li style="margin-bottom:.5rem"><strong>Legal professionals and Islamic finance practitioners</strong> in Pakistan, where the Muslim Family Laws Ordinance 1961 governs succession for Muslims, and where inheritance disputes are common in both family courts and Islamic arbitration.</li>
</ul>

<h2 style="font-size:1.55rem;font-weight:700;margin:2.5rem 0 .75rem;color:#0f172a">Worked Example: A Real Inheritance Calculation</h2>
<p><strong>Scenario:</strong> A Muslim man passes away in Pakistan. His estate totals PKR 12,000,000 (1.2 crore). He is survived by: his wife, one son, and two daughters. His parents predeceased him.</p>
<ul style="margin:.5rem 0 1rem 1.5rem">
  <li><strong>Wife's share:</strong> 1/8 (because there are children) = PKR 1,500,000</li>
  <li><strong>Remaining estate:</strong> PKR 10,500,000 — distributed among children as Asabah</li>
  <li><strong>Distribution ratio:</strong> Son receives 2 parts, each daughter receives 1 part (2:1:1 ratio per Quranic rule "for the male, the equivalent of the share of two females")</li>
  <li><strong>Total parts:</strong> 4 (son:2, daughter:1, daughter:1). Each part = PKR 10,500,000 ÷ 4 = PKR 2,625,000</li>
  <li><strong>Son:</strong> PKR 5,250,000 | <strong>Each daughter:</strong> PKR 2,625,000 | <strong>Wife:</strong> PKR 1,500,000</li>
  <li><strong>Verification:</strong> 5,250,000 + 2,625,000 + 2,625,000 + 1,500,000 = PKR 12,000,000 ✓</li>
</ul>

<h2 style="font-size:1.55rem;font-weight:700;margin:2.5rem 0 .75rem;color:#0f172a">Important Notes and Common Misconceptions</h2>
<ul style="margin:.5rem 0 1rem 1.5rem">
  <li style="margin-bottom:.5rem"><strong>Debts and funeral expenses come first.</strong> Before any inheritance distribution, all debts of the deceased (including any unpaid zakat, kaffarah, or hajj obligation) and reasonable funeral expenses must be settled from the estate. The calculator works on the net distributable estate after these deductions.</li>
  <li style="margin-bottom:.5rem"><strong>A wasiyyah (bequest) is capped at 1/3.</strong> A Muslim can leave up to 1/3 of their estate to non-heirs (e.g., a charity, a non-Muslim relative) through a will. Bequests to legal heirs are not valid without the consent of all other heirs.</li>
  <li style="margin-bottom:.5rem"><strong>Non-Muslim heirs do not inherit under Islamic law.</strong> A non-Muslim son, daughter, or spouse does not receive an Islamic inheritance share. However, Pakistani civil law may treat this differently — always consult a lawyer for estates involving mixed-religion families.</li>
  <li style="margin-bottom:.5rem"><strong>This calculator is for guidance only.</strong> Complex scenarios — grandchildren when children are present, half-siblings, adopted children, disputes between heirs — require consultation with a qualified Islamic scholar (Mufti) and/or a lawyer specialising in Muslim personal law.</li>
</ul>

<h2 style="font-size:1.55rem;font-weight:700;margin:2.5rem 0 .75rem;color:#0f172a">Frequently Asked Questions</h2>
<div style="border:1px solid #e2e8f0;border-radius:10px;margin-bottom:1rem;padding:1rem 1.25rem">
<h3 style="font-size:1rem;font-weight:600;margin-bottom:.4rem">Why do sons receive double the share of daughters in Islamic inheritance?</h3>
<p style="margin:0">This ruling (Quran 4:11) is frequently misunderstood without its economic context. In Islamic family law, financial obligations fall asymmetrically on men: a son is obligated to support his wife, children, and sometimes parents from his inheritance. A daughter's inheritance is entirely her own — her husband bears her financial support. When the full system of Islamic financial obligations is considered together (mahr, nafaqah, custody), women's total financial entitlement over a lifetime is often greater than or equal to men's, despite the 2:1 inheritance ratio. Many Islamic scholars and jurists have elaborated on this comprehensively — it reflects a system-level financial architecture, not a statement of lesser worth.</p>
</div>
<div style="border:1px solid #e2e8f0;border-radius:10px;margin-bottom:1rem;padding:1rem 1.25rem">
<h3 style="font-size:1rem;font-weight:600;margin-bottom:.4rem">What happens if there are no male heirs — only daughters?</h3>
<p style="margin:0">If a man dies leaving only daughters (no sons), the daughters collectively receive 2/3 of the estate (if two or more daughters) or 1/2 (if only one daughter). The remaining 1/3 or 1/2 then passes to the next eligible Asabah — typically the father's brothers (paternal uncles) or their descendants. If no Asabah exists, the matter of Radd (returning the residue to the fixed-share heirs proportionally) applies in some madhabs (Hanafi, which is the predominant school in Pakistan). This is one of the more complex scenarios in Fara'idh and benefits from scholarly consultation.</p>
</div>
<div style="border:1px solid #e2e8f0;border-radius:10px;margin-bottom:1rem;padding:1rem 1.25rem">
<h3 style="font-size:1rem;font-weight:600;margin-bottom:.4rem">Is Islamic inheritance law legally enforceable in Pakistan?</h3>
<p style="margin:0">Yes. Pakistan's Muslim Personal Law (Shariat) Application Act 1962 mandates that Muslim inheritance is governed by Islamic law. The Muslim Family Laws Ordinance 1961 contains additional provisions, including the controversial share of orphaned grandchildren. In practice, many Pakistani families distribute inheritance informally without court involvement, often leading to disputes later. Formally recording a distribution — even informally — with signed agreements between heirs is advisable. For significant estates, engaging a lawyer to draft a legal distribution deed prevents future disputes.</p>
</div>
<div style="border:1px solid #e2e8f0;border-radius:10px;margin-bottom:1rem;padding:1rem 1.25rem">
<h3 style="font-size:1rem;font-weight:600;margin-bottom:.4rem">What is the share of an orphaned grandchild under Pakistani law?</h3>
<p style="margin:0">Under the Muslim Family Laws Ordinance 1961, if a son predeceases the grandfather, the orphaned grandchildren (children of the predeceased son) inherit their father's share — up to a maximum of the share their father would have received. This is a statutory provision that differs from classical Hanafi Fara'idh, in which grandchildren are excluded by surviving sons. This specific scenario is one where Pakistani law explicitly modifies classical Islamic inheritance rules to protect orphaned grandchildren. The calculator accounts for this provision for Pakistani users.</p>
</div>
<div style="border:1px solid #e2e8f0;border-radius:10px;margin-bottom:1rem;padding:1rem 1.25rem">
<h3 style="font-size:1rem;font-weight:600;margin-bottom:.4rem">Can heirs agree to a different distribution than the Islamic calculation?</h3>
<p style="margin:0">Yes, with important conditions. Once the Islamic shares are calculated and formally established, adult heirs of full legal capacity may voluntarily gift or waive portions of their share to other heirs or to non-heirs. This is permissible and common in Pakistani families — for example, brothers choosing to give their full share to their sisters who need it more, or heirs agreeing to keep family property undivided. What is not permissible is the deceased dictating a non-Islamic distribution in their will — the will only has authority over the 1/3 wasiyyah portion. The remaining 2/3+ must follow Islamic law, and heirs can only voluntarily deviate after the shares have been formally determined.</p>
</div>
<div style="border:1px solid #e2e8f0;border-radius:10px;margin-bottom:1rem;padding:1rem 1.25rem">
<h3 style="font-size:1rem;font-weight:600;margin-bottom:.4rem">Does this calculator handle all madhab differences?</h3>
<p style="margin:0">The calculator primarily implements Hanafi Fara'idh rules, which are followed by the majority of Pakistani, Indian, Bangladeshi, Turkish, and Central Asian Muslims. It notes key differences where the Maliki, Shafi'i, and Hanbali schools diverge significantly — particularly on the Radd (return) and Umariyyatain (the two Umar scenarios for spouse and mother shares) issues. For Shia Muslims, inheritance rules differ substantially from Sunni schools — particularly in the role of paternal and maternal relatives — and the calculator is not designed for Shia inheritance calculations. Consulting a scholar of your specific tradition for complex scenarios is always recommended.</p>
</div>
</article>
<footer style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px;text-align:center;font-size:0.83rem;color:#64748b;margin-top:60px">
  <p>© 2026 <a href="../index.html" style="color:#6366f1;text-decoration:none">HashmiTools.com</a> — Free Online Tools. All rights reserved. |
  <a href="../about.html" style="color:#6366f1;text-decoration:none">About</a> |
  <a href="../contact.html" style="color:#6366f1;text-decoration:none">Contact</a> |
  <a href="../privacy.html" style="color:#6366f1;text-decoration:none">Privacy Policy</a> |
  <a href="../terms.html" style="color:#6366f1;text-decoration:none">Terms of Use</a></p>
</footer>
</body>
</html>`
  },

];

// Process each injection
let success = 0, fail = 0;
for (const inj of injections) {
  if (!fs.existsSync(inj.file)) { console.log(`SKIP (not found): ${inj.file}`); fail++; continue; }
  let html = fs.readFileSync(inj.file, 'utf8');
  if (html.includes(inj.search)) {
    html = html.replace(inj.search, inj.replacement);
    fs.writeFileSync(inj.file, html);
    console.log(`✓ Injected: ${inj.file}`);
    success++;
  } else {
    console.log(`✗ Pattern not found: ${inj.file}`);
    fail++;
  }
}
console.log(`\nDone: ${success} success, ${fail} fail`);
