/**
 * fix-remaining-hubs.js — Fix image-tools, pakistan, pdf, productivity hub pages
 */
const fs = require('fs');

const pages = [
  {
    file: 'tools/image-tools.html',
    footerSearch: `  <!-- FOOTER -->
  <footer class="footer">
    <p>© 2026 <a href="../index.html">HashmiTools.com</a> — Free Online Tools | 
       <a href="../about.html">About</a><a href="../contact.html">Contact</a><a href="../privacy.html">Privacy</a> | 
       <a href="../about.html">About</a> | 
       <a href="../sitemap.html">Sitemap</a></p>`,
    footerFix: `  <!-- FOOTER -->
  <footer class="footer">
    <p>© 2026 <a href="../index.html">HashmiTools.com</a> — Free Online Tools | 
       <a href="../about.html">About</a> | 
       <a href="../contact.html">Contact</a> | 
       <a href="../privacy.html">Privacy</a> | 
       <a href="../terms.html">Terms</a> | 
       <a href="../sitemap.html">Sitemap</a></p>`,
    contentBefore: `</main>\n\n  <!-- FOOTER -->`,
    content: `</main>

<!-- ═══ CONTENT ARTICLE ═══ -->
<article style="max-width:860px;margin:2rem auto 60px;padding:0 20px;font-family:'Inter',sans-serif;color:#1e293b;line-height:1.75">
<h2 style="font-size:1.45rem;font-weight:700;margin:2rem 0 .75rem;color:#0f172a">How HashmiTools Image Tools Work — Browser-Based, No Upload Required</h2>
<p>The HashmiTools Image section provides a suite of browser-based image processing tools that run entirely on your device using modern JavaScript APIs. Your images are never uploaded to external servers — all processing happens locally in your browser using the HTML5 Canvas API and, for AI-powered tasks, WebAssembly models downloaded once and cached. This means full privacy, no file size limits imposed by server restrictions, and faster processing because files don't travel over the internet.</p>
<p>The collection includes: <strong>Image Compressor</strong> — reduce JPEG/PNG file size by 40–90% while preserving visual quality for faster website loading; <strong>Image Editor</strong> — crop, resize, rotate, adjust brightness/contrast, and add filters with a canvas-based editor; <strong>Background Remover</strong> — AI-powered background removal using the RMBG-1.4 model from BRIA AI, running entirely in-browser with no API key required; <strong>JPG to PDF</strong> — batch convert multiple images into a single PDF document; and <strong>Image Tools hub</strong> for accessing all image utilities in one place.</p>
<p><strong>Ideal users:</strong> bloggers and website owners reducing image sizes for page speed; e-commerce sellers needing clean product photos without backgrounds; students submitting image assignments with file size limits; social media managers batch-resizing images for different platforms; and anyone who needs quick image adjustments without installing Photoshop or GIMP.</p>
<h2 style="font-size:1.45rem;font-weight:700;margin:2rem 0 .75rem;color:#0f172a">Frequently Asked Questions</h2>
<div style="border:1px solid #e2e8f0;border-radius:10px;margin-bottom:1rem;padding:1rem 1.25rem">
<h3 style="font-size:1rem;font-weight:600;margin-bottom:.4rem">How does the Background Remover work without an API key?</h3>
<p style="margin:0">The Background Remover uses BRIA AI's RMBG-1.4 model implemented in ONNX format, loaded directly in your browser using the @huggingface/transformers.js library. On first use, the model (~170MB) is downloaded from Hugging Face's CDN and cached in your browser's IndexedDB. Subsequent uses are near-instant. The model runs on your CPU (or GPU if WebGL acceleration is available). No image data leaves your device — everything is processed locally. This approach makes background removal genuinely free, private, and unlimited, unlike API-based services that charge per image or require registration.</p>
</div>
<div style="border:1px solid #e2e8f0;border-radius:10px;margin-bottom:1rem;padding:1rem 1.25rem">
<h3 style="font-size:1rem;font-weight:600;margin-bottom:.4rem">What image formats are supported?</h3>
<p style="margin:0">Most tools support JPEG, PNG, and WebP for input. The Image Compressor outputs JPEG (best compression) or PNG (lossless). Background Remover outputs PNG (to preserve the transparent background). Image Editor supports JPEG, PNG, and WebP both as input and output. For PDF conversion (JPG to PDF), JPEG and PNG images are both supported. HEIC/HEIF format (used by iPhones) is not directly supported by browser Canvas APIs — convert HEIC to JPEG on your device first using the native Files app before using these tools.</p>
</div>
<div style="border:1px solid #e2e8f0;border-radius:10px;margin-bottom:1rem;padding:1rem 1.25rem">
<h3 style="font-size:1rem;font-weight:600;margin-bottom:.4rem">Is there a maximum file size for image processing?</h3>
<p style="margin:0">Since processing is client-side, the effective limit is your device's available RAM rather than a server-imposed restriction. Practically: images up to 20MB process reliably on most modern phones and laptops. Very large RAW photography files (50MB+) may cause the browser to slow or crash on devices with less than 4GB RAM — use photo editing software for those. For the Background Remover specifically, the AI model processes images more slowly on larger files; images above 2000×2000 pixels are automatically downscaled before processing and the result is upscaled back, which maintains quality while keeping processing time under 30 seconds on most devices.</p>
</div>
</article>

  <!-- FOOTER -->`
  },
  {
    file: 'tools/pdf.html',
    footerSearch: `  <!-- FOOTER -->
  <footer class="footer">
    <p>© 2026 <a href="../index.html">HashmiTools.com</a> — Free Online Tools | 
       <a href="../about.html">About</a><a href="../contact.html">Contact</a><a href="../privacy.html">Privacy</a> | 
       <a href="../about.html">About</a> | 
       <a href="../sitemap.html">Sitemap</a></p>`,
    footerFix: `  <!-- FOOTER -->
  <footer class="footer">
    <p>© 2026 <a href="../index.html">HashmiTools.com</a> — Free Online Tools | 
       <a href="../about.html">About</a> | 
       <a href="../contact.html">Contact</a> | 
       <a href="../privacy.html">Privacy</a> | 
       <a href="../terms.html">Terms</a> | 
       <a href="../sitemap.html">Sitemap</a></p>`,
    contentBefore: `</main>\n\n  <!-- FOOTER -->`,
    content: `</main>

<!-- ═══ CONTENT ARTICLE ═══ -->
<article style="max-width:860px;margin:2rem auto 60px;padding:0 20px;font-family:'Inter',sans-serif;color:#1e293b;line-height:1.75">
<h2 style="font-size:1.45rem;font-weight:700;margin:2rem 0 .75rem;color:#0f172a">How HashmiTools PDF Tools Work — Private, Fast, Browser-Based</h2>
<p>HashmiTools provides six PDF utilities that run in your browser using PDF.js, PDF-lib, and jsPDF — all open-source libraries that process PDF files entirely on your device. Unlike web services that upload your files to remote servers, HashmiTools PDF tools never send your documents anywhere. This is critical for the types of documents people typically process as PDFs: contracts, bank statements, ID documents, medical records, and confidential business files.</p>
<p>The suite includes: <strong>PDF Editor</strong> — open a PDF, add text annotations, signatures, shapes, and images using the Fabric.js canvas overlay; extract text content from PDFs; <strong>PDF Merge</strong> — combine multiple PDFs into one ordered document; <strong>PDF Split</strong> — extract specific pages from a PDF into a new file; <strong>PDF Compress</strong> — reduce PDF file size for email attachment limits; and <strong>JPG to PDF</strong> — convert multiple images into a single PDF with custom page sizing.</p>
<p><strong>Ideal users:</strong> professionals who need to annotate contracts or reports without Acrobat; students combining multiple assignment documents into one submission; HR and legal teams splitting large documents into individual sections; anyone who needs to reduce a PDF below an email attachment limit (typically 10–25MB); and individuals adding digital signatures to forms.</p>
<h2 style="font-size:1.45rem;font-weight:700;margin:2rem 0 .75rem;color:#0f172a">Frequently Asked Questions</h2>
<div style="border:1px solid #e2e8f0;border-radius:10px;margin-bottom:1rem;padding:1rem 1.25rem">
<h3 style="font-size:1rem;font-weight:600;margin-bottom:.4rem">Are password-protected PDFs supported?</h3>
<p style="margin:0">PDFs with owner-level protection (restrictions on printing, copying, editing) can be opened by the editor but the restrictions are typically respected by PDF-lib's implementation. PDFs with user-level password protection (requiring a password to open) need to be unlocked by entering the correct password — the tools do not break or bypass encryption. If you have legitimate access to a password-protected PDF (i.e., you own it or have been given the password by the document owner), the editor will accept the password and allow editing. Always ensure you have legal rights to edit or modify any PDF before using these tools.</p>
</div>
<div style="border:1px solid #e2e8f0;border-radius:10px;margin-bottom:1rem;padding:1rem 1.25rem">
<h3 style="font-size:1rem;font-weight:600;margin-bottom:.4rem">How much can PDF Compress reduce file size?</h3>
<p style="margin:0">Compression results depend heavily on what's in the PDF. Text-heavy PDFs (legal documents, reports) typically compress 10–30% because text is already efficiently encoded. Image-heavy PDFs (scanned documents, photo collages) can compress 40–80% by recompressing the embedded images at lower quality. PDFs that are already maximally compressed (some generated by design software) may see minimal size reduction. For the best results on scanned documents, use the PDF Compress tool with the "Aggressive" quality setting, which resamples embedded images to screen resolution (72–96 DPI) — sufficient for digital sharing but not for high-quality printing.</p>
</div>
<div style="border:1px solid #e2e8f0;border-radius:10px;margin-bottom:1rem;padding:1rem 1.25rem">
<h3 style="font-size:1rem;font-weight:600;margin-bottom:.4rem">Does the PDF Editor support digital signatures?</h3>
<p style="margin:0">The PDF Editor supports adding signature images — you can draw your signature in the editor's signature panel, save it as a PNG, and place it on any page of the PDF. This creates a visual signature that is legally sufficient for most informal document signing in Pakistan (scanned ink signatures have been broadly accepted in commercial contexts). It does not create a cryptographically verified digital signature (the kind that creates a tamper-evident record verifiable by a certificate authority) — for those, you need a dedicated digital signature service with PKI infrastructure. For most business, academic, and personal document signing needs, the visual signature approach is adequate and widely accepted.</p>
</div>
</article>

  <!-- FOOTER -->`
  },
];

for (const page of pages) {
  if (!fs.existsSync(page.file)) { console.log(`SKIP: ${page.file}`); continue; }
  let html = fs.readFileSync(page.file, 'utf8');
  
  // Fix footer links
  if (html.includes(page.footerSearch)) {
    html = html.replace(page.footerSearch, page.footerFix);
  }
  // Inject content
  if (html.includes(page.contentBefore)) {
    html = html.replace(page.contentBefore, page.content);
    console.log(`✓ Done: ${page.file}`);
  } else {
    console.log(`✗ Pattern not found: ${page.file}`);
  }
  
  fs.writeFileSync(page.file, html);
}

// Fix pakistan.html and productivity.html footers (different format)
const simpleFixPages = ['tools/pakistan.html', 'tools/productivity.html'];
for (const f of simpleFixPages) {
  if (!fs.existsSync(f)) continue;
  let html = fs.readFileSync(f, 'utf8');
  // Add About link if not present
  if (!html.includes('href="../about.html"')) {
    html = html.replace(/href="\.\.\/privacy\.html"/g, 'href="../about.html" style="color:var(--text-muted);font-size:0.9rem">About</a>\n        <a href="../privacy.html"');
  }
  // Update year
  html = html.replace(/© 2025/g, '© 2026');
  fs.writeFileSync(f, html);
  console.log(`✓ Fixed: ${f}`);
}

console.log('Done.');
