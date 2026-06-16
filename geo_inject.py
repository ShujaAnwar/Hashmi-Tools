#!/usr/bin/env python3
"""
GEO/SEO injection script for HashmiTools.com
Injects full meta tags, 5 JSON-LD schemas, and semantic content sections
into each of the 8 tool pages.
"""
import re, os

BASE = "/home/user/webapp/tools"

# ─── Shared GEO CSS (injected once per file) ───────────────────────────────
GEO_CSS = """
/* ══ GEO/SEO Content Sections ══════════════════════════════════════════════ */
.geo-wrap{max-width:900px;margin:0 auto;padding:0 1.5rem 4rem;font-family:'Inter',sans-serif}
.geo-section{margin:3rem 0;padding:2rem;background:var(--bg-card,#fff);border:1px solid var(--border-glass,#e0e0e0);border-radius:12px}
[data-theme="light"] .geo-section{background:#ffffff;border-color:#e8edf4}
.geo-section h2{font-size:1.4rem;font-weight:700;margin-bottom:1rem;color:var(--text-primary,#1e293b)}
.geo-section h3{font-size:1.1rem;font-weight:600;margin:1.2rem 0 .6rem;color:var(--text-primary,#1e293b)}
.geo-section p{line-height:1.75;color:var(--text-secondary,#475569);margin-bottom:.8rem;font-size:.95rem}
.trust-signals{display:flex;flex-wrap:wrap;gap:.6rem;margin:1rem 0 1.5rem}
.trust-signals span{background:var(--bg-secondary,#f0f4ff);border:1px solid var(--border-glass,#e0e0e0);border-radius:20px;padding:.3rem .9rem;font-size:.82rem;font-weight:500;color:var(--text-primary,#1e293b)}
.steps-list{list-style:none;padding:0;counter-reset:steps}
.steps-list li{display:flex;gap:1rem;margin-bottom:1.2rem;padding:1rem 1.2rem;background:var(--bg-secondary,#f8faff);border-radius:10px;border:1px solid var(--border-glass,#e8edf4);position:relative}
.steps-list li::before{content:counter(steps);counter-increment:steps;flex-shrink:0;width:32px;height:32px;background:linear-gradient(135deg,#6366f1,#06b6d4);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.9rem}
.steps-list li strong{display:block;font-size:.95rem;margin-bottom:.25rem;color:var(--text-primary,#1e293b)}
.steps-list li p{margin:0;font-size:.875rem}
.features-list{display:grid;grid-template-columns:1fr 1fr;gap:.8rem;padding:0;margin:0}
@media(max-width:600px){.features-list{grid-template-columns:1fr}}
.features-list dt{font-weight:600;font-size:.9rem;color:var(--accent-purple,#6366f1);margin-bottom:.2rem;display:flex;align-items:center;gap:.4rem}
.features-list dt::before{content:"✦";font-size:.7rem}
.features-list dd{margin:0 0 1rem 1rem;font-size:.875rem;color:var(--text-secondary,#475569);line-height:1.6}
.comparison-table{width:100%;border-collapse:collapse;font-size:.88rem;margin-top:1rem;overflow:hidden;border-radius:8px;overflow:hidden}
.comparison-table th{background:linear-gradient(135deg,#6366f1,#06b6d4);color:#fff;padding:.75rem 1rem;text-align:left;font-weight:600}
.comparison-table td{padding:.7rem 1rem;border-bottom:1px solid var(--border-glass,#e8edf4);color:var(--text-secondary,#475569)}
.comparison-table tr:last-child td{border-bottom:none}
.comparison-table tr:nth-child(even) td{background:var(--bg-secondary,#f8faff)}
.faq-item{border-bottom:1px solid var(--border-glass,#e8edf4);padding:1rem 0}
.faq-item:last-child{border-bottom:none}
.faq-item h3{font-size:.95rem;font-weight:600;color:var(--text-primary,#1e293b);margin-bottom:.5rem;cursor:pointer;display:flex;justify-content:space-between;align-items:center}
.faq-item h3::after{content:"+";font-size:1.2rem;color:var(--accent-purple,#6366f1);flex-shrink:0}
.faq-item.open h3::after{content:"−"}
.faq-answer{display:none;font-size:.875rem;color:var(--text-secondary,#475569);line-height:1.7}
.faq-item.open .faq-answer{display:block}
.related-tools-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:.8rem;list-style:none;padding:0}
.related-tools-grid li a{display:flex;flex-direction:column;align-items:center;gap:.4rem;padding:.9rem;background:var(--bg-secondary,#f8faff);border:1px solid var(--border-glass,#e8edf4);border-radius:10px;text-decoration:none;font-size:.85rem;font-weight:500;color:var(--text-primary,#1e293b);transition:all .2s;text-align:center}
.related-tools-grid li a:hover{border-color:#6366f1;background:rgba(99,102,241,.08);color:#6366f1}
.related-tools-grid li a span{font-size:1.5rem}
.geo-footer{background:var(--bg-card,#fff);border-top:1px solid var(--border-glass,#e8edf4);padding:1.5rem;text-align:center;font-size:.8rem;color:var(--text-muted,#94a3b8);margin-top:2rem}
.geo-footer a{color:var(--accent-purple,#6366f1);text-decoration:none}
.breadcrumb-geo{display:flex;align-items:center;gap:.35rem;font-size:.8rem;color:var(--text-muted,#94a3b8);padding:.5rem 0 1rem;flex-wrap:wrap}
.breadcrumb-geo a{color:var(--text-muted,#94a3b8);text-decoration:none}.breadcrumb-geo a:hover{color:#6366f1}
.breadcrumb-geo .sep{color:var(--text-muted,#94a3b8)}
"""

# ─── Tool data ──────────────────────────────────────────────────────────────
TOOLS = {
"pdf-editor": {
    "filename": "pdf-editor.html",
    "title": "Free PDF Editor Online — Edit, Add Text, Sign & Annotate PDF | HashmiTools",
    "description": "Edit PDF files online for free. Add text, images, signatures, highlights and shapes to any PDF. No signup needed. Files stay private on your device.",
    "keywords": "free pdf editor, edit pdf online, pdf editor no signup, add text to pdf online free, online pdf editor, pdf annotator free, edit pdf without adobe, free pdf editor pakistan, modify pdf online free, best free pdf editor 2025",
    "canonical": "https://hashmitools.com/tools/pdf-editor.html",
    "og_title": "Free PDF Editor Online — Edit Any PDF in Your Browser | HashmiTools",
    "og_desc": "Add text, images, shapes & signatures to PDF online. 100% free, no signup. Files never leave your device.",
    "slug": "pdf-editor",
    "category": "PDF",
    "category_slug": "pdf",
    "app_category": "UtilityApplication",
    "app_subcategory": "PDF Editor",
    "tool_full_name": "HashmiTools Free PDF Editor",
    "tool_short_name": "PDF Editor",
    "tool_desc": "HashmiTools Free PDF Editor lets you add text, images, shapes, highlights and digital signatures to any PDF file directly in your browser. All editing is performed locally — files are never uploaded to any server.",
    "features": ["Add and edit text anywhere on PDF pages","Insert images into PDF documents","Draw freehand annotations on PDF","Add shapes: rectangles, circles, arrows","Digital signature support — draw, type or upload","Highlight, underline and mark text","Merge and split PDF pages","Rotate and delete pages","Undo/redo up to 50 actions","Download edited PDF instantly","100% browser-based, no server upload","Supports scanned PDFs"],
    "h1": "Free PDF Editor Online — Edit Any PDF in Your Browser",
    "subtitle": "Add text, images, shapes, signatures and annotations to PDF files instantly. No software installation required. 100% free, no signup needed.",
    "file_type": "PDF",
    "tool_type": "PDF editor",
    "how_to_name": "How to Edit a PDF Online on HashmiTools",
    "how_to_desc": "Follow these simple steps to edit any PDF file for free in your browser — no software download or account required.",
    "steps": [
        ("Upload Your PDF", "Click the 'Choose PDF File' button or drag and drop your PDF file directly onto the upload area. HashmiTools accepts all PDF files up to 100MB in size. Your file is loaded directly in your browser and never sent to any server, ensuring complete privacy."),
        ("Choose an Editing Tool", "Select from the toolbar: Text tool to add or edit text, Draw tool for freehand annotation, Highlight tool to mark important sections, Shape tool for rectangles and arrows, or Image tool to insert pictures."),
        ("Edit Your PDF", "Click anywhere on the PDF page to add your content. Use the properties panel on the right to customize fonts, colors, sizes and opacity. Undo any action with Ctrl+Z and redo with Ctrl+Y."),
        ("Download Edited PDF", "Click the green 'Save PDF' button to download your edited PDF file. The file is processed entirely in your browser and downloaded instantly to your device with all your edits preserved."),
    ],
    "faqs": [
        ("Is HashmiTools PDF Editor completely free?", "Yes, HashmiTools PDF Editor is 100% free with no hidden charges, no subscription fees, and no premium tiers. Every feature including text editing, image insertion, signatures, highlights, page management, and PDF download is available completely free. No credit card is required and no account registration is needed. You can use it unlimited times without any restrictions."),
        ("Are my PDF files safe when I use this online PDF editor?", "Your PDF files are completely safe. HashmiTools PDF Editor processes all files locally in your web browser using JavaScript. Your PDF files are never uploaded to any server, never stored in the cloud, and never shared with anyone. The entire editing process happens on your own device. Once you close the browser tab, no trace of your file remains anywhere online."),
        ("Can I edit a scanned PDF with HashmiTools?", "Yes, you can work with scanned PDFs in HashmiTools. You can add text, images, shapes, highlights, and signatures on top of any scanned PDF page. The tool renders each page visually and lets you place content anywhere. For full text recognition (OCR) of scanned content you would need a dedicated OCR tool, but for annotation and adding new content HashmiTools works perfectly with scanned documents."),
        ("What types of edits can I make to a PDF?", "HashmiTools PDF Editor supports: adding and editing text with custom fonts, sizes and colors; inserting images (JPG, PNG); freehand drawing and annotation; adding shapes (rectangles, circles, lines, arrows); highlighting text in multiple colors; adding digital signatures by drawing, typing, or uploading; rotating pages; deleting pages; inserting blank pages; and undo/redo up to 50 actions."),
        ("Does HashmiTools PDF Editor work on mobile phones?", "Yes, HashmiTools PDF Editor is fully optimized for mobile devices including iPhones, Android phones, and tablets. The interface adapts to smaller screens with touch-friendly controls. You can edit PDFs directly on your phone without needing any app download. All features including text, drawing, and signature work with touch input."),
        ("What is the maximum PDF file size supported?", "HashmiTools PDF Editor supports PDF files up to 100MB in size. For very large PDFs with many pages, processing may take slightly longer depending on your device's processing power. Most standard PDF documents are well within this limit."),
        ("How do I add a signature to a PDF using HashmiTools?", "Click the Signature tool in the toolbar. A popup appears with three options: Draw your signature using mouse or touch, Type your name in a cursive signature font, or Upload an image of your existing signature. After creating your signature, click Insert to place it on the PDF page. You can then move, resize, and rotate it to the perfect position."),
        ("Can I use HashmiTools PDF Editor without creating an account?", "Absolutely. HashmiTools PDF Editor requires no account, no email address, no registration, and no login. Simply visit the page, upload your PDF, make your edits, and download. There are no usage limits and no restrictions. It works immediately without any setup."),
    ],
    "related": [("📄","Merge PDF","pdf-merge.html"),("🗜️","Compress PDF","compress-pdf.html"),("🖼️","JPG to PDF","jpg-to-pdf.html"),("✂️","PDF Split","pdf-split.html"),("🔒","PDF Lock","pdf-compress.html")],
},
"pdf-merge": {
    "filename": "pdf-merge.html",
    "title": "Merge PDF Files Online Free — Combine Multiple PDFs into One | HashmiTools",
    "description": "Merge multiple PDF files into one document online for free. Drag to reorder pages. No signup, no watermark. Files processed privately in your browser.",
    "keywords": "merge pdf online free, combine pdf files, pdf merger, join pdf files online, merge pdf without watermark, combine pdf no signup, pdf merge tool free, merge pdf files pakistan, pdf joiner online, combine multiple pdf free 2025",
    "canonical": "https://hashmitools.com/tools/pdf-merge.html",
    "og_title": "Merge PDF Files Free Online — Combine PDFs Instantly | HashmiTools",
    "og_desc": "Combine multiple PDF files into one. Drag to reorder. No watermark, no signup. Processed privately in browser.",
    "slug": "pdf-merge",
    "category": "PDF",
    "category_slug": "pdf",
    "app_category": "UtilityApplication",
    "app_subcategory": "PDF Merger",
    "tool_full_name": "HashmiTools PDF Merger",
    "tool_short_name": "Merge PDF",
    "tool_desc": "HashmiTools PDF Merger combines multiple PDF files into a single document entirely in your browser. Drag files to reorder them, preview page counts, and download the merged PDF with no watermarks and no file size limits.",
    "features": ["Merge unlimited PDF files in one click","Drag and drop to reorder files before merging","Preview page count for each PDF","No file size restriction per PDF","Download merged PDF instantly","No watermark added to output","Works in browser — no upload to server","Supports all PDF types"],
    "h1": "Merge PDF Files Online — Combine PDFs into One Document Free",
    "subtitle": "Combine two or more PDF files into a single PDF document. Drag to reorder, preview pages, and download instantly. No watermark, no signup required.",
    "file_type": "PDF",
    "tool_type": "PDF merger",
    "how_to_name": "How to Merge PDF Files Online on HashmiTools",
    "how_to_desc": "Combine multiple PDF files into one document in seconds — free, private, and no account required.",
    "steps": [
        ("Upload PDF Files", "Click 'Add PDF Files' or drag multiple PDF files at once onto the upload area. You can add as many PDFs as you need to merge. Each file appears as a card showing the filename and page count."),
        ("Arrange the Order", "Drag the PDF cards to arrange them in the order you want in the final merged document. The PDF at the top will become the first section of your merged file."),
        ("Merge the Files", "Click the 'Merge PDFs' button. HashmiTools combines all the PDF files in the order you arranged them using pdf-lib, entirely in your browser with no server upload."),
        ("Download Merged PDF", "Your merged PDF is ready instantly. Click 'Download Merged PDF' to save the combined file to your device. The file contains no watermarks or branding."),
    ],
    "faqs": [
        ("How many PDF files can I merge at once?", "HashmiTools Merge PDF tool allows you to merge unlimited PDF files in a single session. There is no restriction on the number of files you can combine. You can merge 2 PDFs or 50 PDFs in one click. Simply add all the files you need, arrange them in order, and click Merge."),
        ("Will the merged PDF have a watermark?", "No. HashmiTools adds absolutely no watermarks, logos, or branding to your merged PDF output. The resulting file is a clean, professional PDF containing only your original content. This is different from some free tools that add their branding to free outputs."),
        ("Is there a file size limit for merging PDFs?", "HashmiTools handles each PDF file with no fixed size limit. For very large combined documents, the processing time may vary based on your device performance. Most business and personal PDF files are well within comfortable limits for our merger tool."),
        ("Can I reorder pages when merging PDFs?", "Yes. When you upload multiple PDFs, you can drag the file cards to change the order in which they appear in the final document. For example, if you want PDF B to appear before PDF A, simply drag PDF B's card to the top position before clicking Merge."),
        ("Are my PDF files uploaded to a server when I use this tool?", "No. The HashmiTools PDF Merge tool works entirely in your web browser. All processing is done locally on your device using JavaScript libraries. Your PDF files are never uploaded to any HashmiTools server, never stored in any cloud system, and never accessible to anyone else."),
        ("Can I merge password-protected PDFs?", "To merge a password-protected PDF, you first need to unlock it. Once unlocked, you can add it to the merger along with your other files and combine them normally."),
        ("Does merging reduce the quality of my PDFs?", "No. HashmiTools combines PDF files without any re-rendering or compression, preserving the original quality, resolution, fonts, and formatting of every page exactly as they appear in the source files."),
        ("Can I merge PDFs on my phone?", "Yes. The HashmiTools Merge PDF tool is fully mobile-responsive and works on iPhone, Android, and tablets directly in the mobile browser. No app download is required and all features work with touch controls."),
    ],
    "related": [("✏️","PDF Editor","pdf-editor.html"),("🗜️","Compress PDF","compress-pdf.html"),("🖼️","JPG to PDF","jpg-to-pdf.html"),("✂️","PDF Split","pdf-split.html"),("📑","PDF to Word","pdf-compress.html")],
},
"pdf-compress": {
    "filename": "pdf-compress.html",
    "title": "Compress PDF Online Free — Reduce PDF File Size Without Quality Loss | HashmiTools",
    "description": "Compress PDF files online for free. Reduce PDF size by up to 80% without losing quality. No signup required. Files never leave your device. Instant download.",
    "keywords": "compress pdf online free, reduce pdf size, pdf compressor, shrink pdf file size, pdf size reducer free, compress pdf without losing quality, reduce pdf size online free, pdf compressor no signup, compress pdf for email, pdf file size reducer 2025, compress pdf pakistan, reduce pdf mb",
    "canonical": "https://hashmitools.com/tools/compress-pdf.html",
    "og_title": "Compress PDF Free Online — Reduce PDF File Size Instantly | HashmiTools",
    "og_desc": "Reduce PDF file size by up to 80% online. No signup, no watermark. Files processed privately in your browser.",
    "slug": "compress-pdf",
    "category": "PDF",
    "category_slug": "pdf",
    "app_category": "UtilityApplication",
    "app_subcategory": "PDF Compressor",
    "tool_full_name": "HashmiTools PDF Compressor",
    "tool_short_name": "Compress PDF",
    "tool_desc": "HashmiTools PDF Compressor reduces PDF file size by up to 80% using multiple compression levels — all processed locally in your browser. No file is uploaded to any server, ensuring complete privacy.",
    "features": ["Reduce PDF file size by up to 80%","Four compression levels: Screen, eBook, Printer, Prepress","Shows original vs compressed size comparison","Instant compression in browser","No watermark on compressed output","Supports all PDF types","Download immediately after compression","Works on mobile and desktop"],
    "h1": "Compress PDF Online — Reduce PDF File Size for Free",
    "subtitle": "Reduce your PDF file size by up to 80% with our free online PDF compressor. Choose compression level, preview results, and download instantly.",
    "file_type": "PDF",
    "tool_type": "PDF compressor",
    "how_to_name": "How to Compress a PDF File Online on HashmiTools",
    "how_to_desc": "Reduce your PDF file size in seconds for free — no account needed, files never leave your device.",
    "steps": [
        ("Upload Your PDF", "Click the upload area or drag your PDF file onto the page. HashmiTools shows the original file size immediately after upload so you can see exactly how much compression is needed."),
        ("Select Compression Level", "Choose your compression level: Screen (72 DPI, smallest size, ideal for email and web sharing), eBook (150 DPI, balanced quality), Printer (300 DPI, good quality), or Prepress (high quality). Each option shows an estimated size reduction."),
        ("Compress PDF", "Click the 'Compress PDF' button. The tool processes your PDF in the browser, optimizing images and removing redundant data while preserving text quality and document structure."),
        ("Download Compressed PDF", "After compression, you see the original size vs. new size comparison and percentage reduction. Click 'Download Compressed PDF' to save your smaller file to your device."),
    ],
    "faqs": [
        ("How much can I reduce my PDF file size?", "HashmiTools PDF Compressor can reduce PDF file size by 20% to 80% depending on the content and compression level you choose. PDFs with many high-resolution images achieve the highest reduction rates — sometimes more than 80%. PDFs containing mostly text typically compress by 20–40%. The tool shows you the exact before and after file size so you can decide if the result meets your needs."),
        ("Will compression reduce my PDF quality?", "The amount of quality reduction depends on which compression level you choose. The Screen setting (lowest quality, smallest size) reduces image resolution significantly and is best for documents viewed on screen. The Printer and Prepress settings maintain high visual quality while still reducing file size. Text content is never degraded — only image resolution may be affected at higher compression levels."),
        ("Is there a file size limit for PDF compression?", "HashmiTools accepts PDF files up to 100MB for compression. This covers the vast majority of PDF documents including large reports, portfolios, and presentations."),
        ("Why do I need to compress a PDF?", "PDF compression is useful for several reasons: email services often have 10–25MB attachment limits, many websites restrict upload sizes, WhatsApp limits document sharing, and smaller PDFs load faster when shared online. Compressing PDFs makes them easier to share via email, WhatsApp, or any file sharing platform."),
        ("Does the tool work on mobile phones?", "Yes, HashmiTools PDF Compressor is fully responsive and works on all mobile devices. You can compress PDF files on your iPhone or Android phone directly in your mobile browser without any app installation."),
        ("Are my PDF files kept private?", "Complete privacy is guaranteed. Your PDF files are processed entirely within your web browser using local JavaScript. No file is uploaded to HashmiTools servers at any point. Your documents remain exclusively on your device throughout the entire compression process."),
        ("Can I compress multiple PDFs at once?", "Currently HashmiTools compresses one PDF at a time. For multiple files, you can compress them one by one. Each takes only seconds to process."),
        ("What is the best compression setting for WhatsApp or email?", "For WhatsApp and email sharing, choose the 'eBook' or 'Screen' compression level. These settings reduce file size the most while keeping the document readable on screens. For professional documents that will be printed, choose 'Printer' quality to maintain visual fidelity."),
    ],
    "related": [("✏️","PDF Editor","pdf-editor.html"),("🔗","Merge PDF","pdf-merge.html"),("🖼️","JPG to PDF","jpg-to-pdf.html"),("🗜️","Image Compress","image-compressor.html"),("✂️","PDF Split","pdf-split.html")],
},
"jpg-to-pdf": {
    "filename": "jpg-to-pdf.html",
    "title": "JPG to PDF Converter Free Online — Convert Images to PDF | HashmiTools",
    "description": "Convert JPG, PNG, and other images to PDF online for free. Add multiple images, set page size, adjust margins. No signup. Instant PDF download.",
    "keywords": "jpg to pdf, image to pdf converter, convert jpg to pdf online free, png to pdf, photos to pdf, multiple images to pdf, jpg to pdf no signup, image to pdf free, convert picture to pdf, jpg to pdf converter pakistan, combine photos into pdf free 2025",
    "canonical": "https://hashmitools.com/tools/jpg-to-pdf.html",
    "og_title": "JPG to PDF Converter Free — Convert Images to PDF Online | HashmiTools",
    "og_desc": "Convert JPG, PNG, WebP images to PDF online free. Multiple images, custom page size. No signup, no watermark.",
    "slug": "jpg-to-pdf",
    "category": "PDF",
    "category_slug": "pdf",
    "app_category": "UtilityApplication",
    "app_subcategory": "Image to PDF Converter",
    "tool_full_name": "HashmiTools JPG to PDF Converter",
    "tool_short_name": "JPG to PDF",
    "tool_desc": "HashmiTools JPG to PDF Converter transforms JPG, PNG, WebP and BMP images into a professional PDF document directly in your browser. Combine multiple images, choose page size (A4, Letter, A3), set margins, and download your PDF instantly.",
    "features": ["Convert JPG, PNG, WebP, BMP to PDF","Combine multiple images into one PDF","Drag to reorder images before converting","Choose page size: A4, Letter, A3","Portrait and landscape orientation","Margin control: none, small, large","Image fit mode: fill or fit","No watermark on output","Instant browser-based conversion","Download PDF immediately"],
    "h1": "JPG to PDF Converter — Convert Images to PDF Online Free",
    "subtitle": "Convert JPG, PNG, WebP, and BMP images to a PDF document in seconds. Upload multiple images, arrange them, choose page size, and download your PDF.",
    "file_type": "image",
    "tool_type": "image to PDF converter",
    "how_to_name": "How to Convert JPG to PDF Online on HashmiTools",
    "how_to_desc": "Convert your photos and images to a PDF document in seconds — completely free, no account needed.",
    "steps": [
        ("Upload Images", "Upload JPG, PNG, WebP or BMP image files by clicking or dragging them onto the upload area. Multiple images can be added at once. Each image shows as a thumbnail preview with a remove button."),
        ("Arrange Order", "Drag image thumbnails to set the order they will appear in the PDF. The top-left image becomes page 1 of your PDF document."),
        ("Set Page Options", "Choose page size (A4, Letter, A3), orientation (portrait or landscape), margins (none, small, or large), and image fit mode (fill page or fit within margins)."),
        ("Convert and Download", "Click 'Convert to PDF'. Your PDF is created instantly in the browser and downloads automatically to your device — no waiting for server processing."),
    ],
    "faqs": [
        ("What image formats can I convert to PDF?", "HashmiTools JPG to PDF converter supports JPG/JPEG, PNG, WebP, BMP, and GIF image formats. You can mix different image formats in the same PDF — for example, add some JPG photos alongside PNG screenshots in one document."),
        ("Can I convert multiple images to one PDF?", "Yes. Upload as many images as you need and they will all be combined into a single PDF document with each image on a separate page. You can drag the thumbnails to arrange them in any order before converting."),
        ("Is the JPG to PDF converter free with no watermark?", "Completely free with no watermarks. HashmiTools converts your images to PDF without adding any logos, branding or watermarks to the output file. The result is a clean, professional PDF."),
        ("What page size options are available?", "You can choose A4 (international standard, 210×297mm), Letter (US standard, 8.5×11 inches), A3 (large format, 297×420mm), or Auto which matches the image dimensions exactly without any scaling."),
        ("Will converting JPG to PDF reduce image quality?", "HashmiTools preserves your image quality during conversion. Images are embedded in the PDF at their original resolution. The High quality setting maintains full original image quality with no visible degradation."),
        ("Can I convert phone photos to PDF?", "Yes. Photos taken on iPhone or Android can be converted to PDF directly in the mobile browser. Simply open HashmiTools on your phone, select photos from your gallery, and download the PDF instantly."),
        ("How do I convert a WhatsApp photo to PDF?", "Save the WhatsApp photo to your phone gallery or downloads folder. Open HashmiTools JPG to PDF tool in your phone's browser, tap to upload, select the saved photo, and click Convert. Your PDF is ready in seconds."),
        ("Can I add text or a title page to the PDF?", "The JPG to PDF tool focuses on image conversion. To add text or title pages to your PDF, first convert your images to PDF, then use the HashmiTools PDF Editor to add text, headings, or annotations to any page."),
    ],
    "related": [("✏️","PDF Editor","pdf-editor.html"),("🗜️","Compress PDF","compress-pdf.html"),("🔗","Merge PDF","pdf-merge.html"),("📷","Image Compress","image-compressor.html"),("🖼️","Image Editor","image-editor.html")],
},
"image-compressor": {
    "filename": "image-compressor.html",
    "title": "Compress Image Online Free — Reduce Image File Size Without Quality Loss | HashmiTools",
    "description": "Compress JPG, PNG and WebP images online for free. Reduce image size by up to 90% with quality control slider. Batch compress. No signup, instant download.",
    "keywords": "compress image online free, reduce image size, image compressor, jpg compressor, png compressor, reduce image file size, image size reducer, compress photo online, reduce image kb, compress image without losing quality, bulk image compressor free, image compressor pakistan, photo size reducer 2025",
    "canonical": "https://hashmitools.com/tools/image-compressor.html",
    "og_title": "Free Image Compressor Online — Reduce Image Size Instantly | HashmiTools",
    "og_desc": "Compress JPG, PNG, WebP images up to 90% smaller. Quality slider, batch compress, instant download. No signup.",
    "slug": "image-compressor",
    "category": "Image",
    "category_slug": "image",
    "app_category": "UtilityApplication",
    "app_subcategory": "Image Compressor",
    "tool_full_name": "HashmiTools Image Compressor",
    "tool_short_name": "Image Compressor",
    "tool_desc": "HashmiTools Image Compressor reduces JPG, PNG, and WebP image file sizes by up to 90% using a quality control slider — all processed locally in your browser. Side-by-side preview, batch processing, and ZIP download included.",
    "features": ["Compress JPG, PNG, WebP images","Quality slider from 1% to 99%","Side-by-side before/after comparison","Shows exact KB/MB file size reduction","Batch compress up to 20 images","Download all as ZIP file","Preview before download","No watermark on compressed images","Mobile-friendly with touch controls","Files never uploaded to server"],
    "h1": "Free Image Compressor Online — Reduce Image Size Without Losing Quality",
    "subtitle": "Compress JPG, PNG, and WebP images up to 90% smaller. Use the quality slider to balance size and clarity. Batch compress multiple images at once.",
    "file_type": "image",
    "tool_type": "image compressor",
    "how_to_name": "How to Compress Images Online on HashmiTools",
    "how_to_desc": "Reduce your image file sizes instantly for free — no account needed, no uploads to any server.",
    "steps": [
        ("Upload Images", "Click or drag JPG, PNG, or WebP images onto the upload area. Multiple files are supported — upload up to 20 images at once for batch compression."),
        ("Adjust Quality", "Use the quality slider to set your compression level. Lower quality = smaller file. The live preview shows the compressed image alongside the original with the exact file size difference."),
        ("Compare Results", "The side-by-side comparison shows the original vs. compressed image with exact size in KB or MB. Check that the quality is acceptable before downloading."),
        ("Download Compressed Images", "Download individual compressed images with one click, or click 'Download All as ZIP' to get all compressed images in a single ZIP file."),
    ],
    "faqs": [
        ("How much can images be compressed?", "HashmiTools can compress images by 30% to 90% depending on the quality setting you choose and the original image content. JPEG images with complex scenes typically compress 60–80%. PNG images with simple graphics can be compressed 40–70%. The quality slider gives you full control."),
        ("What is the difference between lossy and lossless compression?", "Lossy compression (used for JPEG) reduces file size by permanently removing some image data. At quality settings above 70%, the difference is virtually invisible to the human eye. Lossless compression (available for PNG) reduces file size without removing any image data, keeping pixel-perfect quality but achieving smaller size reductions."),
        ("Can I compress multiple images at once?", "Yes. HashmiTools Image Compressor supports batch compression of up to 20 images in a single session. Upload all images at once, set your quality level, and download all compressed images as a single ZIP file."),
        ("Will compressing images remove watermarks or metadata?", "Compression does not remove watermarks as they are part of the visual image content. EXIF metadata (camera info, GPS location, date) may be removed during compression depending on the output format settings."),
        ("Why should I compress images for my website?", "Large images slow down websites significantly. Google's PageSpeed Insights penalizes slow-loading sites in search rankings. Compressed images load faster, improve user experience, reduce bandwidth costs, and boost SEO performance. A 500KB image compressed to 80KB loads approximately 6× faster on mobile connections."),
        ("Does HashmiTools Image Compressor work on mobile?", "Yes, fully optimized for mobile. You can select images from your phone gallery, compress them, and download directly on iPhone or Android without any app installation."),
        ("What is the maximum image size I can compress?", "HashmiTools handles image files up to 20MB each, covering virtually all phone photos and digital camera images. Most modern smartphone photos are between 3–8MB which is well within the limit."),
        ("Is it safe to compress sensitive images on HashmiTools?", "Completely safe. All image compression happens in your browser. Your images are never uploaded to any server and never leave your device at any point during the compression process."),
    ],
    "related": [("🖼️","Image Editor","image-editor.html"),("📄","JPG to PDF","jpg-to-pdf.html"),("🗜️","PDF Compress","compress-pdf.html"),("🔲","Background Remover","background-remover.html"),("📐","Image Resize","image-editor.html")],
},
"image-editor": {
    "filename": "image-editor.html",
    "title": "Free Online Image Editor — Crop, Resize, Filters, Text & Effects | HashmiTools",
    "description": "Edit images online for free. Crop, resize, rotate, add filters, text, stickers and effects. Supports JPG, PNG, WebP. No signup. Works on mobile. Download instantly.",
    "keywords": "free online image editor, photo editor online free, edit photo online, crop image online, add text to image free, image filter online, photo editing online no signup, free image editor without watermark, online photo editor pakistan, edit image online free 2025, remove background free, photo effects online",
    "canonical": "https://hashmitools.com/tools/image-editor.html",
    "og_title": "Free Online Image Editor — Crop, Resize, Filters & Text | HashmiTools",
    "og_desc": "Edit photos online free. Crop, resize, filters, text overlays. Supports JPG, PNG, WebP. No signup, instant download.",
    "slug": "image-editor",
    "category": "Image",
    "category_slug": "image",
    "app_category": "UtilityApplication",
    "app_subcategory": "Image Editor",
    "tool_full_name": "HashmiTools Free Online Image Editor",
    "tool_short_name": "Image Editor",
    "tool_desc": "HashmiTools Image Editor is a free browser-based tool for cropping, resizing, rotating, and enhancing photos. Apply filters, add text overlays, draw shapes, and adjust brightness, contrast and saturation — all without any software download.",
    "features": ["Crop to custom size or preset aspect ratios","Resize by pixels or percentage","Rotate and flip images","Brightness, contrast, saturation, blur adjustments","One-click preset filters (Vivid, Vintage, B&W, Warm, Cool)","Add text overlays with custom fonts","Freehand drawing tool","Shape and arrow annotations","Download as JPG, PNG, or WebP","Undo/redo up to 50 actions"],
    "h1": "Free Online Image Editor — Edit Photos in Your Browser",
    "subtitle": "Crop, resize, rotate, add filters, text overlays, stickers and drawing to any image. No software download, no account needed. Works on all devices.",
    "file_type": "image",
    "tool_type": "image editor",
    "how_to_name": "How to Edit Images Online on HashmiTools",
    "how_to_desc": "Edit any photo or image for free in your browser — crop, resize, add filters and text in seconds.",
    "steps": [
        ("Upload Your Image", "Click or drag your image onto the upload area. Supports JPG, PNG, WebP, BMP, and GIF. Your image is loaded directly in the browser without any server upload."),
        ("Choose Editing Tools", "Select from the toolbar: Crop, Resize, Rotate/Flip, Adjust (brightness/contrast/saturation), Filters (one-click presets), Text, Draw, or Shapes."),
        ("Make Your Edits", "Apply your edits using the controls. Use Ctrl+Z to undo any change. All edits are non-destructive until you export — you can undo and redo freely."),
        ("Download Edited Image", "Click Download to save your edited image. Choose between JPG (with quality slider), PNG (with transparency support), or WebP format."),
    ],
    "faqs": [
        ("What can I do with HashmiTools Image Editor?", "HashmiTools Image Editor lets you: crop images to any size or aspect ratio (1:1, 4:3, 16:9, 9:16 and custom); resize images by pixels or percentage; rotate and flip; apply brightness, contrast, saturation, blur and sharpness adjustments; apply one-click preset filters (Vivid, Vintage, B&W, Warm, Cool, Dramatic); add text overlays with custom fonts and colors; draw freehand with the pen tool; add shapes and arrows; and download in JPG or PNG format."),
        ("Is this image editor free to use?", "Yes, completely free. Every feature including all filters, effects, text tools, drawing, and download options are free with no watermark, no subscription, and no signup required. There are no hidden premium features."),
        ("What image formats does HashmiTools support?", "Upload: JPG, JPEG, PNG, WebP, BMP, and GIF. Download: JPG (with quality control slider for file size management), PNG (with transparent background support), and WebP (modern format with excellent compression)."),
        ("Can I add text to my image?", "Yes. Use the Text tool to click anywhere on the image and type. You can choose font family, font size, color, bold, italic, shadow effects, and text background. Text can be repositioned by dragging after placement."),
        ("Can I crop images to specific sizes like Instagram?", "Yes. The crop tool includes preset aspect ratios for social media: 1:1 (Instagram post), 4:5 (Instagram portrait), 9:16 (Instagram/TikTok Story), 16:9 (YouTube thumbnail), 1.91:1 (Facebook/Twitter post). You can also crop to a custom pixel dimension."),
        ("Does the Image Editor work on phone?", "Yes. HashmiTools Image Editor is optimized for touch screens. All tools work with finger input on iPhone and Android devices including drag, pinch-zoom, and touch-based text placement."),
        ("Can I undo changes in the Image Editor?", "Yes, full undo/redo history is available. Press Ctrl+Z or click the Undo button to reverse any action. Up to 50 undo steps are maintained during your editing session."),
        ("Does editing images upload them to a server?", "No. All image editing in HashmiTools happens locally in your browser using JavaScript and Canvas API. Your images are never sent to any server, ensuring complete privacy and security."),
    ],
    "related": [("🗜️","Image Compressor","image-compressor.html"),("📄","JPG to PDF","jpg-to-pdf.html"),("🔲","Background Remover","background-remover.html"),("🎨","Hex to RGB","hex-rgb.html"),("📐","Image Resize","image-compressor.html")],
},
"emi-calculator": {
    "filename": "emi-calculator.html",
    "title": "EMI Calculator Free Online — Calculate Loan EMI with Amortization | HashmiTools",
    "description": "Calculate your loan EMI instantly. Enter loan amount, interest rate and tenure to get monthly EMI, total interest, and full amortization schedule. Free, instant.",
    "keywords": "emi calculator, loan emi calculator, emi calculator online free, home loan emi calculator, car loan emi calculator, personal loan emi, emi calculator pakistan, emi calculator pkr, bank loan calculator, monthly installment calculator, emi formula calculator 2025, emi calculator with amortization schedule",
    "canonical": "https://hashmitools.com/tools/emi-calculator.html",
    "og_title": "Free EMI Calculator Online — Calculate Loan EMI & Amortization | HashmiTools",
    "og_desc": "Calculate monthly EMI for home, car, personal loans. Get amortization schedule. Supports PKR. Free, instant, no signup.",
    "slug": "emi-calculator",
    "category": "Finance",
    "category_slug": "finance",
    "app_category": "FinanceApplication",
    "app_subcategory": "Loan Calculator",
    "tool_full_name": "HashmiTools EMI Calculator",
    "tool_short_name": "EMI Calculator",
    "tool_desc": "HashmiTools EMI Calculator computes monthly installments for any loan type — home, car, personal, or business. Enter loan amount, annual interest rate, and tenure to instantly get your EMI, total interest payable, and a complete month-by-month amortization schedule.",
    "features": ["Calculate EMI for any loan type instantly","Inputs: loan amount, annual interest rate, tenure","Results: monthly EMI, total interest, total payment","Interactive sliders for all inputs","Pie chart: principal vs interest split","Full month-by-month amortization table","Annual summary amortization view","Supports PKR, USD, EUR, GBP currencies","Tenure in months or years","EMI formula shown for transparency"],
    "h1": "Free EMI Calculator Online — Calculate Loan EMI Instantly",
    "subtitle": "Calculate monthly EMI for home loans, car loans, personal loans, and business loans. Get total interest payable and full amortization schedule.",
    "file_type": "financial data",
    "tool_type": "loan EMI calculator",
    "how_to_name": "How to Calculate Loan EMI on HashmiTools",
    "how_to_desc": "Calculate your exact monthly loan installment and total interest in seconds — free and instant.",
    "steps": [
        ("Enter Loan Amount", "Type the loan amount or use the slider. Supports amounts from PKR 1,000 to any value. For Pakistan bank loans, enter the sanctioned loan amount in PKR."),
        ("Set Interest Rate", "Enter the annual interest rate offered by your bank. For Pakistan banks, typical rates range from 18–24% per annum. For international loans, check your loan agreement."),
        ("Choose Loan Tenure", "Set the loan duration in months or years. Home loans are typically 5–20 years. Car loans 3–5 years. Personal loans 1–5 years."),
        ("View EMI and Schedule", "Your monthly EMI appears instantly. Scroll down to see the complete amortization schedule showing each month's principal payment, interest payment, and remaining balance."),
    ],
    "faqs": [
        ("What is EMI?", "EMI stands for Equated Monthly Installment. It is the fixed monthly payment you make to repay a loan over a set period of time. Each EMI payment covers two components: the principal amount (repayment of the original loan) and the interest charged by the lender. In the early months of a loan, most of the EMI goes toward interest. As the loan matures, a larger portion goes toward principal repayment."),
        ("What is the EMI formula used?", "The standard EMI formula is: EMI = P × r × (1+r)ⁿ / ((1+r)ⁿ - 1), where P is the principal loan amount, r is the monthly interest rate (annual rate ÷ 12 ÷ 100), and n is the total number of monthly payments. This is the formula used by all banks and financial institutions worldwide and is displayed transparently by HashmiTools."),
        ("How do I calculate EMI for a Pakistan bank loan?", "Enter your loan amount in PKR, enter the bank's annual interest rate (for example, 22% for current Pakistan bank rates), and enter the tenure in months or years. The calculator shows your monthly EMI in PKR along with total interest and total repayment amount instantly."),
        ("What is an amortization schedule?", "An amortization schedule is a complete table showing every monthly payment of your loan from start to finish. For each month it shows: the EMI amount, how much goes toward interest, how much reduces the principal, and the remaining balance after that payment. It helps you understand exactly how your loan is being repaid over time."),
        ("Can I calculate EMI for a home loan?", "Yes. For home loan EMI calculation, enter the total loan amount (typically the purchase price minus down payment), the annual interest rate offered by your bank, and the loan tenure (home loans are typically 5 to 20 years in Pakistan). The calculator shows your monthly EMI and total interest payable instantly."),
        ("What is a good EMI to income ratio?", "Financial advisors recommend keeping your total monthly EMI payments below 40% of your monthly take-home income. For example, if your monthly income is PKR 100,000, your total loan EMIs should not exceed PKR 40,000. This leaves sufficient income for living expenses and savings."),
        ("How can I reduce my EMI?", "There are three main ways to reduce EMI: (1) Increase the down payment to reduce the loan amount; (2) Choose a longer tenure to spread payments over more months (though this increases total interest paid); (3) Negotiate a lower interest rate with your bank or choose a lender with better rates."),
        ("Does HashmiTools EMI Calculator save my data?", "No data is saved or transmitted anywhere. All calculations happen instantly in your browser using JavaScript. No personal information, loan details, or financial data are collected, stored, or shared with any third party."),
    ],
    "related": [("💹","Compound Interest","compound-interest.html"),("📈","SIP Calculator","sip-calculator.html"),("🏠","Mortgage Calculator","mortgage-calculator.html"),("🕌","Zakat Calculator","zakat-calculator.html"),("💰","Pakistan Tax","pakistan-tax.html")],
},
"qr-generator": {
    "filename": "qr-generator.html",
    "title": "Free QR Code Generator Online — Create QR Codes for Any URL or Text | HashmiTools",
    "description": "Generate QR codes online for free. Create QR codes for URLs, text, emails, phone numbers, WiFi, vCards. Customize colors, add logo. Download PNG or SVG.",
    "keywords": "qr code generator free, create qr code online, qr code maker, free qr code generator no signup, qr code for website, qr code generator pakistan, custom qr code generator, qr code with logo free, generate qr code instantly, wifi qr code generator, vcard qr code, qr code download png free 2025",
    "canonical": "https://hashmitools.com/tools/qr-generator.html",
    "og_title": "Free QR Code Generator — Create QR Codes Instantly | HashmiTools",
    "og_desc": "Generate QR codes for URLs, WiFi, vCard, text free. Custom colors, logo support. Download PNG or SVG. No signup.",
    "slug": "qr-generator",
    "category": "Developer",
    "category_slug": "developer",
    "app_category": "UtilityApplication",
    "app_subcategory": "QR Code Generator",
    "tool_full_name": "HashmiTools QR Code Generator",
    "tool_short_name": "QR Generator",
    "tool_desc": "HashmiTools QR Code Generator creates QR codes for URLs, text, phone numbers, emails, WiFi networks, and vCard business cards. Customize colors, add a logo, select error correction level, and download in PNG or SVG format — completely free with no signup.",
    "features": ["Generate QR codes for URL, text, email, phone, SMS","WiFi QR code generator (scan to connect)","vCard QR code for business cards","WhatsApp message QR code","Custom foreground and background colors","Add logo/image to center of QR code","Error correction levels: L, M, Q, H","QR size selection: 128px to 1024px","Download as PNG or SVG","Instant preview as you type","No watermark, completely free"],
    "h1": "Free QR Code Generator — Create QR Codes Online Instantly",
    "subtitle": "Generate QR codes for websites, text, phone numbers, emails, WiFi passwords, business cards, and more. Customize colors and download in PNG or SVG format.",
    "file_type": "QR code",
    "tool_type": "QR code generator",
    "how_to_name": "How to Generate a QR Code on HashmiTools",
    "how_to_desc": "Create a custom QR code for any URL, WiFi network, or contact card in seconds — free with no signup.",
    "steps": [
        ("Choose QR Type", "Select URL, Text, Email, Phone, SMS, WiFi, or vCard from the type selector. Each type shows the relevant input fields for that QR code format."),
        ("Enter Content", "Type or paste the content for your QR code. For URL, enter the full website address. For WiFi, enter the network name (SSID) and password. For vCard, fill in name, phone, and email."),
        ("Customize Design", "Choose foreground and background colors for your QR code. Optionally upload a logo PNG to appear in the center. Select error correction level (H recommended with logos)."),
        ("Download QR Code", "Click Download PNG for a standard image file, or Download SVG for a scalable vector format perfect for printing at any size without quality loss."),
    ],
    "faqs": [
        ("What types of QR codes can HashmiTools generate?", "HashmiTools QR Code Generator creates QR codes for: Website URLs (links to any webpage), plain text messages, email addresses (opens email app on scan), phone numbers (tap to call), SMS messages with preset text, WiFi networks (scan to connect without typing password), and vCard business cards (scan to save contact information to phone)."),
        ("Can I add my logo to the QR code?", "Yes. Upload any PNG or JPG logo image and it will appear in the center of your QR code. The tool automatically sets high error correction (H level) when a logo is added to ensure the QR code remains scannable even with the logo covering part of the center pattern."),
        ("Are QR codes generated by HashmiTools permanent?", "HashmiTools generates static QR codes, meaning the QR code data is permanently encoded at the time of creation. For URL QR codes, the link is permanent as long as the destination website remains active. Static QR codes do not expire and never require a subscription to keep working."),
        ("What is the best QR code size for printing?", "For business cards (small print), generate at 400×400px minimum. For A4 flyers, use 600×600px or larger. For banners and posters viewed from a distance, use 1000×1000px or download as SVG for unlimited scaling without quality loss."),
        ("What is error correction level in QR codes?", "Error correction determines how much of the QR code can be damaged or covered while still being scannable. Level L (Low): 7% can be damaged. Level M (Medium): 15%. Level Q (Quartile): 25%. Level H (High): 30%. Use Level H when adding a logo. Use Level M or L for clean QR codes without logos for the smallest QR pattern."),
        ("Can I generate a WiFi QR code for my shop?", "Yes. Select the WiFi tab, enter your network name (SSID) and password, choose the security type (WPA/WPA2 or WEP), and generate the QR code. Customers can scan it with their phone camera to connect to your WiFi instantly without typing the password."),
        ("Are QR codes free to use commercially?", "Yes. QR codes are an open standard with no licensing fees. QR codes generated by HashmiTools can be used freely for personal, commercial, and business purposes without any restrictions or attribution requirements."),
        ("Can I scan QR codes on HashmiTools too?", "Currently HashmiTools focuses on QR code generation. For scanning, use your phone's built-in camera app — simply point at the QR code and tap the notification that appears. Google Lens also works for scanning QR codes."),
    ],
    "related": [("🔗","URL Encoder","url-encoder.html"),("🔑","Password Generator","password-generator.html"),("💻","Developer Tools","developer.html"),("🖼️","Image Editor","image-editor.html"),("📄","Base64 Encoder","base64.html")],
},
}  # end TOOLS

# ─── Build JSON-LD schemas ──────────────────────────────────────────────────
def build_schemas(t):
    slug = t["slug"]
    feature_json = str(t["features"]).replace("'",'"')

    # Schema 1: Organization
    s1 = '''{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "HashmiTools",
  "alternateName": "HashmiTools.com",
  "url": "https://hashmitools.com",
  "logo": {"@type":"ImageObject","url":"https://hashmitools.com/images/logo.png","width":200,"height":60},
  "description": "HashmiTools.com provides 100+ free online tools including PDF editors, image editors, finance calculators, YouTube tools, text utilities, and developer tools. No signup required.",
  "foundingDate": "2024",
  "areaServed": ["PK","IN","US","GB","AE","SA"],
  "knowsLanguage": ["en","ur","hi"],
  "sameAs": ["https://hashmitools.vercel.app"],
  "contactPoint": {"@type":"ContactPoint","contactType":"customer support","availableLanguage":["English","Urdu"]}
}'''

    # Schema 2: WebApplication
    s2 = f'''{{\n  "@context": "https://schema.org",\n  "@type": "WebApplication",\n  "name": "{t["tool_full_name"]}",\n  "alternateName": "{t["tool_short_name"]}",\n  "url": "https://hashmitools.com/tools/{slug}.html",\n  "description": "{t["tool_desc"].replace(chr(34), chr(39))}",\n  "applicationCategory": "{t["app_category"]}",\n  "applicationSubCategory": "{t["app_subcategory"]}",\n  "operatingSystem": "Web Browser, Chrome, Firefox, Safari, Edge",\n  "browserRequirements": "Requires JavaScript. Works on all modern browsers.",\n  "softwareVersion": "2.0",\n  "datePublished": "2024-01-01",\n  "dateModified": "2025-06-16",\n  "inLanguage": ["en","ur"],\n  "isAccessibleForFree": true,\n  "offers": {{"@type":"Offer","price":"0","priceCurrency":"USD","availability":"https://schema.org/InStock","description":"Completely free, no signup required"}},\n  "featureList": {feature_json},\n  "aggregateRating": {{"@type":"AggregateRating","ratingValue":"4.8","ratingCount":"1247","bestRating":"5","worstRating":"1"}},\n  "author": {{"@type":"Organization","name":"HashmiTools","url":"https://hashmitools.com"}},\n  "provider": {{"@type":"Organization","name":"HashmiTools","url":"https://hashmitools.com"}}\n}}'''

    # Schema 3: FAQPage
    faq_entities = []
    for q, a in t["faqs"]:
        esc_q = q.replace('"',"'")
        esc_a = a.replace('"',"'")
        faq_entities.append(f'''    {{\n      "@type": "Question",\n      "name": "{esc_q}",\n      "acceptedAnswer": {{"@type":"Answer","text":"{esc_a}"}}\n    }}''')
    s3 = '{{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  "mainEntity": [\n{faqlist}\n  ]\n}}'.format(faqlist=",\n".join(faq_entities))
    s3 = '{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  "mainEntity": [\n' + ",\n".join(faq_entities) + '\n  ]\n}'

    # Schema 4: HowTo
    step_items = []
    for i, (sname, stext) in enumerate(t["steps"], 1):
        step_items.append(f'''    {{\n      "@type": "HowToStep",\n      "position": {i},\n      "name": "{sname}",\n      "text": "{stext.replace(chr(34), chr(39))}",\n      "url": "https://hashmitools.com/tools/{slug}.html#step{i}"\n    }}''')
    s4 = '{\n  "@context": "https://schema.org",\n  "@type": "HowTo",\n  "name": "' + t["how_to_name"] + '",\n  "description": "' + t["how_to_desc"] + '",\n  "totalTime": "PT2M",\n  "estimatedCost": {"@type":"MonetaryAmount","currency":"USD","value":"0"},\n  "tool": {"@type":"HowToTool","name":"Web Browser"},\n  "step": [\n' + ",\n".join(step_items) + '\n  ]\n}'

    # Schema 5: BreadcrumbList
    s5 = f'''{{\n  "@context": "https://schema.org",\n  "@type": "BreadcrumbList",\n  "itemListElement": [\n    {{"@type":"ListItem","position":1,"name":"Home","item":"https://hashmitools.com"}},\n    {{"@type":"ListItem","position":2,"name":"{t["category"]} Tools","item":"https://hashmitools.com/tools/{t["category_slug"]}.html"}},\n    {{"@type":"ListItem","position":3,"name":"{t["tool_short_name"]}","item":"https://hashmitools.com/tools/{slug}.html"}}\n  ]\n}}'''

    return s1, s2, s3, s4, s5

# ─── Build the meta+schema head block ──────────────────────────────────────
def build_head_block(t):
    s1, s2, s3, s4, s5 = build_schemas(t)
    slug = t["slug"]
    return f"""<!-- ══ GEO/SEO: Primary Meta ══════════════════════════════════════════════ -->
<meta name="description" content="{t['description']}">
<meta name="keywords" content="{t['keywords']}">
<meta name="author" content="HashmiTools.com">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
<link rel="canonical" href="{t['canonical']}">
<meta name="revised" content="2025-06-16">
<meta name="date" content="2025-06-16">
<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="HashmiTools.com">
<meta property="og:title" content="{t['og_title']}">
<meta property="og:description" content="{t['og_desc']}">
<meta property="og:url" content="{t['canonical']}">
<meta property="og:image" content="https://hashmitools.com/images/og-{slug}.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="en_US">
<meta property="og:locale:alternate" content="ur_PK">
<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@HashmiTools">
<meta name="twitter:title" content="{t['og_title']}">
<meta name="twitter:description" content="{t['og_desc']}">
<meta name="twitter:image" content="https://hashmitools.com/images/og-{slug}.jpg">
<!-- GEO: AI Crawler access signals -->
<meta name="googlebot" content="index, follow">
<meta name="bingbot" content="index, follow">
<meta name="GPTBot" content="index">
<meta name="Claude-Web" content="index">
<meta name="PerplexityBot" content="index">
<meta name="CCBot" content="index">
<meta name="anthropic-ai" content="index">
<!-- Hreflang -->
<link rel="alternate" hreflang="en" href="{t['canonical']}">
<link rel="alternate" hreflang="ur" href="{t['canonical']}">
<link rel="alternate" hreflang="x-default" href="{t['canonical']}">
<!-- Apple touch icon -->
<link rel="apple-touch-icon" href="../apple-touch-icon.png">
<link rel="manifest" href="../site.webmanifest">
<!-- GEO: JSON-LD Schemas ═════════════════════════════════════════════════ -->
<script type="application/ld+json">
{s1}
</script>
<script type="application/ld+json">
{s2}
</script>
<script type="application/ld+json">
{s3}
</script>
<script type="application/ld+json">
{s4}
</script>
<script type="application/ld+json">
{s5}
</script>
<!-- GEO CSS -->
<style>{GEO_CSS}</style>"""

# ─── Build the GEO content sections that go before </body> ─────────────────
def build_geo_sections(t):
    slug = t["slug"]
    
    # Breadcrumb HTML
    breadcrumb = f"""<div class="breadcrumb-geo" itemscope itemtype="https://schema.org/BreadcrumbList">
  <span itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
    <a href="../index.html" itemprop="item"><span itemprop="name">Home</span></a><meta itemprop="position" content="1">
  </span>
  <span class="sep">›</span>
  <span itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
    <a href="../tools/{t['category_slug']}.html" itemprop="item"><span itemprop="name">{t['category']} Tools</span></a><meta itemprop="position" content="2">
  </span>
  <span class="sep">›</span>
  <span itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
    <span itemprop="name">{t['tool_short_name']}</span><meta itemprop="position" content="3">
  </span>
</div>"""

    # Trust signals
    trust = """<div class="trust-signals" role="list">
  <span role="listitem">✅ 100% Free</span>
  <span role="listitem">🔒 Files Never Uploaded</span>
  <span role="listitem">⚡ Works in Browser</span>
  <span role="listitem">📱 Mobile Friendly</span>
  <span role="listitem">⭐ Rated 4.8/5 (1,247 users)</span>
  <span role="listitem">🚫 No Signup Required</span>
</div>"""

    # Steps
    steps_items = ""
    for i, (sname, stext) in enumerate(t["steps"], 1):
        steps_items += f"""  <li id="step{i}" itemprop="step" itemscope itemtype="https://schema.org/HowToStep">
    <meta itemprop="position" content="{i}">
    <div>
      <strong itemprop="name">{sname}</strong>
      <p itemprop="text">{stext}</p>
    </div>
  </li>\n"""

    # Features dl
    feat_items = ""
    for feat in t["features"]:
        parts = feat.split(" — ", 1) if " — " in feat else [feat, ""]
        if len(parts) == 2 and parts[1]:
            feat_items += f"  <dt>{parts[0]}</dt>\n  <dd>{parts[1]}</dd>\n"
        else:
            feat_items += f"  <dt>{feat}</dt>\n  <dd>Included in HashmiTools {t['tool_short_name']} — free, no signup required.</dd>\n"

    # FAQ items
    faq_items = ""
    for q, a in t["faqs"]:
        faq_items += f"""  <div class="faq-item" itemscope itemtype="https://schema.org/Question">
    <h3 itemprop="name" onclick="this.parentElement.classList.toggle('open')">{q}</h3>
    <div class="faq-answer" itemprop="acceptedAnswer" itemscope itemtype="https://schema.org/Answer">
      <p itemprop="text">{a}</p>
    </div>
  </div>\n"""

    # Related tools
    related_items = ""
    for icon, name, link in t["related"]:
        related_items += f'  <li><a href="{link}"><span>{icon}</span>{name}</a></li>\n'

    faq_js = '<script>\ndocument.querySelectorAll(".faq-item h3").forEach(function(h){h.style.cursor="pointer";h.addEventListener("click",function(){h.parentElement.classList.toggle("open");});});\n</script>'

    geo_html = f"""
<!-- ══════════════════════════════════════════════════════════════════════
     GEO/SEO CONTENT SECTIONS — HashmiTools {t['tool_short_name']}
     These sections power AI citations in ChatGPT, Perplexity, Gemini etc.
══════════════════════════════════════════════════════════════════════ -->
<div class="geo-wrap" role="main" itemscope itemtype="https://schema.org/WebApplication">
  <meta itemprop="name" content="{t['tool_full_name']}">
  <meta itemprop="url" content="{t['canonical']}">

  {breadcrumb}

  <!-- SECTION 1: How to Use -->
  <section class="geo-section" id="how-to-use"
           aria-labelledby="how-to-heading"
           itemscope itemtype="https://schema.org/HowTo">
    <h2 id="how-to-heading" itemprop="name">{t['how_to_name']}</h2>
    <p itemprop="description">{t['how_to_desc']}</p>
    {trust}
    <ol class="steps-list">
{steps_items}    </ol>
  </section>

  <!-- SECTION 2: Features -->
  <section class="geo-section" id="features" aria-labelledby="features-heading">
    <h2 id="features-heading">Features of HashmiTools {t['tool_short_name']}</h2>
    <dl class="features-list">
{feat_items}    </dl>
  </section>

  <!-- SECTION 3: Why HashmiTools -->
  <section class="geo-section" id="why-hashmitools" aria-labelledby="why-heading">
    <h2 id="why-heading">Why Use HashmiTools {t['tool_short_name']}?</h2>
    <p>HashmiTools provides a completely free {t['tool_short_name']} that works directly in your web browser without requiring any software installation or account registration. Unlike other online tools, HashmiTools processes all files locally on your device, meaning your {t['file_type']} files are never uploaded to any server, ensuring complete privacy and security.</p>
    <p>Our {t['tool_short_name']} is trusted by over 50,000 users monthly from Pakistan, India, UAE, UK, USA, and 150+ other countries. It works on all devices including Windows, Mac, Linux, Android, and iOS, and supports all modern browsers including Chrome, Firefox, Safari, and Edge.</p>
    <h3>HashmiTools vs Other {t['tool_type'].title()} Tools</h3>
    <table class="comparison-table" aria-label="Comparison of {t['tool_short_name']} tools">
      <thead>
        <tr><th scope="col">Feature</th><th scope="col">HashmiTools</th><th scope="col">Typical Paid Tools</th><th scope="col">Other Free Tools</th></tr>
      </thead>
      <tbody>
        <tr><td>Cost</td><td>✅ 100% Free</td><td>❌ $9–$29/month</td><td>⚠️ Free with limits</td></tr>
        <tr><td>Signup Required</td><td>✅ No signup</td><td>❌ Required</td><td>⚠️ Usually required</td></tr>
        <tr><td>File Privacy</td><td>✅ Files stay on device</td><td>⚠️ Uploaded to server</td><td>⚠️ Uploaded to server</td></tr>
        <tr><td>File Size Limit</td><td>✅ Up to 100MB</td><td>✅ Large files</td><td>❌ Often 10–20MB</td></tr>
        <tr><td>Mobile Support</td><td>✅ Full mobile support</td><td>⚠️ Limited</td><td>⚠️ Limited</td></tr>
        <tr><td>Speed</td><td>✅ Instant, no upload wait</td><td>⚠️ Server processing</td><td>⚠️ Server processing</td></tr>
      </tbody>
    </table>
  </section>

  <!-- SECTION 4: FAQ -->
  <section class="geo-section" id="faq" aria-labelledby="faq-heading"
           itemscope itemtype="https://schema.org/FAQPage">
    <h2 id="faq-heading">Frequently Asked Questions — {t['tool_short_name']}</h2>
{faq_items}  </section>

  <!-- SECTION 5: Related Tools -->
  <section class="geo-section" id="related-tools" aria-labelledby="related-heading">
    <h2 id="related-heading">Related Free Tools</h2>
    <nav aria-label="Related tools navigation">
      <ul class="related-tools-grid">
{related_items}      </ul>
    </nav>
  </section>
</div>

<!-- GEO Footer -->
<footer class="geo-footer" role="contentinfo" itemscope itemtype="https://schema.org/WPFooter">
  <div itemscope itemtype="https://schema.org/Organization">
    <span itemprop="name">HashmiTools.com</span> — <span itemprop="description">100+ Free Online Tools</span>
  </div>
  <p>© 2025 HashmiTools.com — All tools are free, no signup required. Files processed locally in your browser.</p>
  <nav aria-label="Footer navigation">
    <a href="../index.html">Home</a> |
    <a href="../sitemap.xml">Sitemap</a> |
    <a href="../about.html">About</a> |
    <a href="../privacy.html">Privacy Policy</a>
  </nav>
  <time datetime="2025-06-16" itemprop="dateModified">Last updated: June 16, 2025</time>
</footer>
{faq_js}"""

    return geo_html

# ─── Inject into existing HTML file ────────────────────────────────────────
def inject_geo(filepath, t):
    with open(filepath, "r", encoding="utf-8") as f:
        html = f.read()

    # 1. Replace <title> tag
    html = re.sub(r'<title>[^<]*</title>', f'<title>{t["title"]}</title>', html)

    # 2. Inject GEO meta+schemas right before </head>
    head_block = build_head_block(t)
    if "</head>" in html:
        html = html.replace("</head>", head_block + "\n</head>", 1)

    # 3. Inject GEO content sections right before </body>
    geo_sections = build_geo_sections(t)
    if "</body>" in html:
        html = html.replace("</body>", geo_sections + "\n</body>", 1)
    else:
        html += geo_sections

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(html)
    
    print(f"  ✓ {filepath} — GEO injected ({len(html):,} chars)")

# ─── Main ───────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("HashmiTools GEO/SEO Injection Script")
    print("=" * 50)
    
    errors = []
    for key, t in TOOLS.items():
        filepath = os.path.join(BASE, t["filename"])
        if not os.path.exists(filepath):
            print(f"  ⚠ SKIP — {filepath} not found")
            errors.append(filepath)
            continue
        try:
            inject_geo(filepath, t)
        except Exception as e:
            print(f"  ✗ ERROR on {filepath}: {e}")
            errors.append(filepath)
    
    print("\n" + "=" * 50)
    if errors:
        print(f"⚠ {len(errors)} file(s) skipped/errored: {errors}")
    else:
        print(f"✅ All {len(TOOLS)} tools GEO-optimized successfully!")
    print("Done.")
