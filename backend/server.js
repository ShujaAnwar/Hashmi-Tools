/**
 * server.js — AI Shorts Maker Backend
 * HashmiTools.com | https://hashmitools.com/tools/shorts-maker.html
 *
 * Stack: Node.js + Express + FFmpeg + Claude API
 * Deploy on: Railway.app or Render.com (NOT Vercel — needs long-running process)
 *
 * Endpoints:
 *   POST /api/upload              — Upload video, get jobId
 *   POST /api/yt-metadata         — Fetch YouTube video metadata (title only, no download)
 *   POST /api/process             — Kick off async processing pipeline
 *   GET  /api/status/:jobId       — Poll job status (frontend polls every 2s)
 *   GET  /api/download/:jid/:idx  — Download individual clip
 *   GET  /api/thumb/:jid/:idx     — Serve clip thumbnail
 *   GET  /api/download-all/:jobId — Download all clips as ZIP
 *   GET  /api/health              — Health check (uptime, jobs count)
 */

'use strict';

require('dotenv').config();

const express     = require('express');
const cors        = require('cors');
const multer      = require('multer');
const path        = require('path');
const fs          = require('fs');
const { v4: uuidv4 } = require('uuid');
const rateLimit   = require('express-rate-limit');
const archiver    = require('archiver');

const jobs            = require('./jobs');
const { getVideoMetadata, processAllClips, cleanupOldFiles } = require('./videoProcessor');
const { generateHighlightTimeline, findTopMoments }          = require('./highlightDetector');
const { generateAllMetadata, fetchYouTubeMetadata }          = require('./aiMetadata');

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── Directory setup ──────────────────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const OUTPUTS_DIR = path.join(__dirname, 'outputs');
[UPLOADS_DIR, OUTPUTS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ─── Middleware ───────────────────────────────────────────────────────────────
// CORS — allow requests from HashmiTools frontend + localhost for development
// ROOT CAUSE FIX: Use permissive CORS that accepts any origin for this public
// media-processing API. The backend has no user auth — CORS isn't a security
// layer here. Strict CORS was causing silent "spinner then fail" errors.
app.use(cors({
  origin: true,   // Reflect any origin — fixes CORS failures from all frontends
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
}));

// Handle CORS preflight for all routes
app.options('*', cors({ origin: true }));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting — generous for polling but stricter for uploads/processing
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 min
  max: 10,                     // 10 uploads per 15 min per IP
  message: { error: 'Too many uploads. Please wait 15 minutes before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const processLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 5,                      // 5 processing jobs per hour per IP
  message: { error: 'Processing limit reached. Please try again in an hour.' },
});

const statusLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,   // 1 min
  max: 120,                    // 2 polls/second max
  skip: () => false,
});

// ─── Multer file upload config ────────────────────────────────────────────────
const ALLOWED_MIMETYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/avi', 'video/mov', 'video/x-matroska'];
const MAX_FILE_SIZE_MB  = parseInt(process.env.MAX_FILE_SIZE_MB || '500');

const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.mp4';
    cb(null, `upload_${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const isVideo = ALLOWED_MIMETYPES.includes(file.mimetype) ||
                    /\.(mp4|mov|avi|mkv)$/i.test(file.originalname);
    if (!isVideo) {
      return cb(new Error('Invalid file type. Please upload MP4, MOV, or AVI files only.'));
    }
    cb(null, true);
  },
});

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    activeJobs: jobs.size(),
    timestamp: new Date().toISOString(),
  });
});

// ── POST /api/upload ──────────────────────────────────────────────────────────
app.post('/api/upload', uploadLimiter, (req, res, next) => {
  upload.single('video')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          error: `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB. Try compressing your video first.`,
        });
      }
      return res.status(400).json({ error: err.message });
    }
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'No video file received. Please select a video to upload.' });
  }

  try {
    // Validate with ffprobe
    const metadata = await getVideoMetadata(file.path);

    const MAX_DURATION = parseInt(process.env.MAX_VIDEO_DURATION_SECS || '3600'); // 60 min
    if (metadata.duration > MAX_DURATION) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        error: `Video is too long (${Math.round(metadata.duration / 60)} min). Maximum is ${MAX_DURATION / 60} minutes.`,
      });
    }

    if (metadata.duration < 30) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        error: 'Video is too short. Please upload a video at least 30 seconds long.',
      });
    }

    const jobId = uuidv4();
    jobs.create(jobId, {
      filePath: file.path,
      duration: metadata.duration,
      resolution: metadata.resolution,
      originalName: file.originalname,
    });

    console.log(`[upload] Job ${jobId} created — ${metadata.duration}s, ${metadata.resolution}, ${(file.size / 1024 / 1024).toFixed(1)}MB`);

    res.json({
      jobId,
      duration: metadata.duration,
      resolution: metadata.resolution,
      fps: metadata.fps,
      hasAudio: metadata.hasAudio,
      fileSize: file.size,
      originalName: file.originalname,
    });
  } catch (err) {
    console.error('[upload] Error:', err.message);
    if (file?.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
    res.status(500).json({ error: `Could not read video file: ${err.message}` });
  }
});

// ── POST /api/yt-metadata ─────────────────────────────────────────────────────
// IMPORTANT: This endpoint ONLY fetches YouTube video metadata (title, description)
// via the YouTube Data API. It does NOT download the video. Downloading YouTube
// videos violates YouTube ToS.
app.post('/api/yt-metadata', async (req, res) => {
  const { youtubeUrl } = req.body;
  if (!youtubeUrl || typeof youtubeUrl !== 'string') {
    return res.status(400).json({ error: 'youtubeUrl is required' });
  }

  // Validate it's actually a YouTube URL
  if (!/youtube\.com|youtu\.be/i.test(youtubeUrl)) {
    return res.status(400).json({ error: 'Please provide a valid YouTube URL' });
  }

  try {
    const metadata = await fetchYouTubeMetadata(youtubeUrl);
    if (!metadata) {
      return res.json({ title: '', description: '', tags: [], note: 'Metadata unavailable' });
    }
    res.json(metadata);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch YouTube metadata', detail: err.message });
  }
});

// ── POST /api/process ─────────────────────────────────────────────────────────
app.post('/api/process', processLimiter, async (req, res) => {
  const { jobId, clipLength, numClips, cutMode, vertical, videoTitle } = req.body;

  // Input validation
  if (!jobId) return res.status(400).json({ error: 'jobId is required' });

  const job = jobs.get(jobId);
  if (!job) return res.status(404).json({ error: 'Job not found. Please upload your video first.' });
  if (job.status !== 'uploaded') {
    return res.status(409).json({ error: `Job is already ${job.status}. Cannot reprocess.` });
  }

  const validClipLengths = [20, 30, 45, 60];
  const parsedClipLength = parseInt(clipLength);
  if (!validClipLengths.includes(parsedClipLength)) {
    return res.status(400).json({ error: `Invalid clip length. Choose from: ${validClipLengths.join(', ')} seconds.` });
  }

  const parsedNumClips = Math.min(15, Math.max(1, parseInt(numClips) || 5));
  const parsedCutMode  = cutMode === 'sequential' ? 'sequential' : 'viral';
  const makeVertical   = vertical !== false; // default true (9:16)

  // Max clips possible for this video length
  const maxPossible = Math.floor(job.duration / parsedClipLength);
  if (parsedNumClips > maxPossible) {
    return res.status(400).json({
      error: `Video is ${Math.round(job.duration)}s long — you can create at most ${maxPossible} clips of ${parsedClipLength}s each.`,
    });
  }

  // Respond immediately — processing happens async
  jobs.updateStatus(jobId, 'processing');
  res.json({ jobId, status: 'processing', message: 'Processing started. Poll /api/status/:jobId for updates.' });

  // ── Async processing pipeline ──
  processVideoJob(job, jobId, parsedClipLength, parsedNumClips, parsedCutMode, makeVertical, videoTitle || job.originalName)
    .catch(err => {
      console.error(`[process] Job ${jobId} failed:`, err);
      jobs.updateStatus(jobId, 'failed', err.message);
    });
});

/**
 * Full async processing pipeline — runs after the HTTP response is sent.
 */
async function processVideoJob(job, jobId, clipLength, numClips, cutMode, vertical, videoTitle) {
  try {
    // ── Stage 1: Highlight detection ──
    jobs.updateProgress(jobId, 5, 'Analyzing audio for highlights...');
    console.log(`[process] ${jobId} — Starting highlight detection...`);

    let selectedMoments;

    if (cutMode === 'viral') {
      jobs.updateProgress(jobId, 10, 'Detecting scene changes and audio peaks...');
      const scoreTimeline = await generateHighlightTimeline(job.filePath, job.duration);

      jobs.updateProgress(jobId, 30, 'Selecting best viral moments...');
      selectedMoments = findTopMoments(scoreTimeline, clipLength, numClips, 'viral', job.duration);
    } else {
      jobs.updateProgress(jobId, 30, 'Calculating evenly-spaced clip positions...');
      selectedMoments = findTopMoments([], clipLength, numClips, 'sequential', job.duration);
    }

    if (!selectedMoments.length) {
      throw new Error('Could not find valid clip positions. The video may be too short for the selected settings.');
    }

    console.log(`[process] ${jobId} — Found ${selectedMoments.length} moments`);

    // ── Stage 2: Cut clips ──
    jobs.updateProgress(jobId, 35, `Cutting clip 1 of ${selectedMoments.length}...`);

    const clips = await processAllClips({
      jobId,
      videoPath: job.filePath,
      selectedMoments,
      clipLength,
      vertical,
      outputDir: OUTPUTS_DIR,
      onClipProgress: (clipIdx, totalClips, pct) => {
        const base = 35;
        const range = 55; // 35% → 90%
        const overall = base + ((clipIdx / totalClips) * range) + ((pct / 100) * (range / totalClips));
        jobs.updateProgress(jobId, Math.round(overall),
          `Cutting clip ${clipIdx + 1} of ${totalClips}...`);
      },
    });

    // ── Stage 3: AI metadata ──
    jobs.updateProgress(jobId, 90, 'Generating titles, descriptions & hashtags with AI...');

    const enrichedClips = await generateAllMetadata({
      clips,
      originalVideoTitle: videoTitle,
      transcripts: [],
      onProgress: (done, total) => {
        const pct = 90 + (done / total) * 8;
        jobs.updateProgress(jobId, Math.round(pct), `Generating metadata for clip ${done} of ${total}...`);
      },
    });

    // ── Done ──
    jobs.setClips(jobId, enrichedClips);
    console.log(`[process] ${jobId} — Complete! ${enrichedClips.length} clips ready.`);

  } catch (err) {
    console.error(`[process] ${jobId} error:`, err.message);
    jobs.updateStatus(jobId, 'failed', err.message);
    throw err;
  }
}

// ── GET /api/status/:jobId ────────────────────────────────────────────────────
app.get('/api/status/:jobId', statusLimiter, (req, res) => {
  const publicJob = jobs.toPublic(req.params.jobId);
  if (!publicJob) return res.status(404).json({ error: 'Job not found or expired' });
  res.json(publicJob);
});

// ── GET /api/download/:jobId/:clipIndex ───────────────────────────────────────
app.get('/api/download/:jobId/:clipIndex', (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job || job.status !== 'complete') {
    return res.status(404).json({ error: 'Clips not ready or job not found' });
  }

  const idx = parseInt(req.params.clipIndex) - 1;
  const clip = job.clips[idx];
  if (!clip) return res.status(404).json({ error: 'Clip not found' });
  if (!fs.existsSync(clip.path)) return res.status(410).json({ error: 'Clip file has expired. Please reprocess.' });

  const downloadName = `hashmitools-short-clip-${req.params.clipIndex}.mp4`;
  res.download(clip.path, downloadName);
});

// ── GET /api/thumb/:jobId/:clipIndex ─────────────────────────────────────────
app.get('/api/thumb/:jobId/:clipIndex', (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job || job.status !== 'complete') return res.status(404).send('Not found');

  const idx = parseInt(req.params.clipIndex) - 1;
  const clip = job.clips[idx];
  if (!clip?.thumbPath || !fs.existsSync(clip.thumbPath)) {
    return res.status(404).send('Thumbnail not available');
  }

  res.setHeader('Content-Type', 'image/jpeg');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  fs.createReadStream(clip.thumbPath).pipe(res);
});

// ── GET /api/download-all/:jobId ─────────────────────────────────────────────
app.get('/api/download-all/:jobId', async (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job || job.status !== 'complete') {
    return res.status(404).json({ error: 'Clips not ready or job not found' });
  }

  const validClips = job.clips.filter(c => c.path && fs.existsSync(c.path));
  if (!validClips.length) {
    return res.status(410).json({ error: 'Clip files have expired. Please reprocess.' });
  }

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="hashmitools-shorts-${req.params.jobId.slice(0, 8)}.zip"`);

  const archive = archiver('zip', { zlib: { level: 0 } }); // no compression for videos (already compressed)
  archive.on('error', err => { console.error('[download-all] Archive error:', err); });
  archive.pipe(res);

  validClips.forEach((clip, i) => {
    archive.file(clip.path, { name: `short-clip-${i + 1}.mp4` });
  });

  await archive.finalize();
});

// ─── Error handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[express] Unhandled error:', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ─── Scheduled cleanup ────────────────────────────────────────────────────────
const CLEANUP_INTERVAL_MS = 15 * 60 * 1000; // every 15 minutes
const FILE_MAX_AGE_MS     = 60 * 60 * 1000; // delete files older than 1 hour

setInterval(() => {
  cleanupOldFiles(UPLOADS_DIR, FILE_MAX_AGE_MS);
  cleanupOldFiles(OUTPUTS_DIR, FILE_MAX_AGE_MS);
  jobs.purgeExpired();
}, CLEANUP_INTERVAL_MS);

// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎬 HashmiTools AI Shorts Maker Backend`);
  console.log(`   Running on http://0.0.0.0:${PORT}`);
  console.log(`   Max upload size: ${process.env.MAX_FILE_SIZE_MB || 500}MB`);
  console.log(`   Claude API: ${process.env.ANTHROPIC_API_KEY ? '✅ configured' : '⚠️  not set (using fallback metadata)'}`);
  console.log(`   YouTube API: ${process.env.YOUTUBE_API_KEY ? '✅ configured' : '⚠️  not set (title fetch disabled)'}`);
  console.log(`   Allowed origins: ${allowedOrigins.join(', ')}\n`);
});

module.exports = app; // for testing
