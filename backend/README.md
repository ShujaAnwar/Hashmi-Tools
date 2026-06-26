# AI Shorts Maker — Backend

Node.js + Express backend for [HashmiTools AI Shorts Maker](https://hashmitools.com/tools/shorts-maker.html).

Processes user-uploaded long videos into multiple short clips (20–60s) with AI-generated titles, descriptions, and hashtags. Uses FFmpeg for video analysis and cutting, and Claude API for metadata generation.

> **⚠️ IMPORTANT LEGAL NOTE:** This tool only processes videos uploaded by the user from their own device. It does NOT download YouTube videos (which would violate YouTube's Terms of Service). The YouTube URL field only fetches metadata (title/description) via the official YouTube Data API.

---

## Requirements

- **Node.js** 18+ 
- **FFmpeg** installed on the system (`ffmpeg` and `ffprobe` must be in PATH)
- **Anthropic API key** (optional but recommended — fallback metadata generated without it)
- **YouTube Data API v3 key** (optional — enables fetching video titles from YouTube URLs)

---

## Local Development

```bash
# 1. Clone / navigate to backend folder
cd backend

# 2. Install dependencies
npm install

# 3. Copy environment file and fill in your API keys
cp .env.example .env
# Edit .env with your ANTHROPIC_API_KEY and optionally YOUTUBE_API_KEY

# 4. Verify FFmpeg is installed
ffmpeg -version
ffprobe -version

# 5. Start the dev server
npm run dev
# Server runs on http://localhost:3001

# 6. Test the pipeline
npm test
```

---

## Deployment — Railway.app (Recommended)

Railway supports long-running Node.js processes and has FFmpeg available.

### Step 1: Create Railway project
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project in backend folder
cd backend
railway init
```

### Step 2: Set environment variables in Railway dashboard
Go to your Railway project → Variables tab:
```
ANTHROPIC_API_KEY    = sk-ant-api03-your-key-here
YOUTUBE_API_KEY      = AIza-your-key-here  (optional)
MAX_FILE_SIZE_MB     = 500
ALLOWED_ORIGINS      = https://hashmitools.com,https://hashmitools.vercel.app
PORT                 = 3001
```

### Step 3: Deploy
```bash
railway up
```

Railway will auto-detect Node.js, run `npm install`, and start with `npm start`.

### Step 4: Get your backend URL
In Railway dashboard → your service → Settings → Domain. Copy the URL (e.g. `https://hashmitools-shorts-api.up.railway.app`).

### Step 5: Update the frontend
In `tools/shorts-maker.html`, the `API_BASE` variable defaults to `http://localhost:3001`.

For production, set it via the browser console on your deployed site:
```javascript
localStorage.setItem('ht_shorts_api_url', 'https://your-backend.up.railway.app');
```

Or hardcode it in the frontend `<script>` block if you prefer:
```javascript
const API_BASE = 'https://hashmitools-shorts-api.up.railway.app';
```

---

## Deployment — Render.com (Alternative)

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub repo
3. Set **Root Directory** to `backend`
4. Set **Build Command** to `npm install`
5. Set **Start Command** to `npm start`
6. Add environment variables in Render dashboard (same as Railway above)
7. Select a plan with at least 512MB RAM (video processing needs memory)

> **Note:** Render free tier spins down after 15 min of inactivity. For a tool that processes large files, the paid **Starter** plan ($7/mo) is recommended.

---

## API Reference

### POST `/api/upload`
Upload a video file. Returns jobId for subsequent requests.

**Request:** `multipart/form-data`
- `video` — Video file (MP4/MOV/AVI, max 500MB, max 60min)

**Response:**
```json
{
  "jobId": "uuid-string",
  "duration": 1440,
  "resolution": "1920x1080",
  "fps": 30,
  "hasAudio": true,
  "fileSize": 157286400,
  "originalName": "my-podcast.mp4"
}
```

---

### POST `/api/yt-metadata`
Fetch YouTube video title/description via YouTube Data API (metadata ONLY — no download).

**Request:** `application/json`
```json
{ "youtubeUrl": "https://youtube.com/watch?v=VIDEO_ID" }
```

**Response:**
```json
{ "title": "Video Title", "description": "First 500 chars...", "tags": ["tag1", "tag2"] }
```

---

### POST `/api/process`
Start async processing pipeline. Returns immediately; poll `/api/status/:jobId` for updates.

**Request:** `application/json`
```json
{
  "jobId": "uuid-string",
  "clipLength": 30,
  "numClips": 5,
  "cutMode": "viral",
  "vertical": true,
  "youtubeTitle": "My Podcast Episode 42"
}
```

- `clipLength` — seconds: `20 | 30 | 45 | 60`
- `numClips` — integer 1–15
- `cutMode` — `"viral"` (AI highlight detection) | `"sequential"` (evenly spaced)
- `vertical` — `true` for 9:16 Shorts format | `false` for original aspect ratio

**Response:** `{ "jobId": "...", "status": "processing" }`

---

### GET `/api/status/:jobId`
Poll job status. Call every 2 seconds during processing.

**Response:**
```json
{
  "id": "uuid",
  "status": "processing",
  "progress": 65,
  "stage": "Cutting clip 3 of 5...",
  "duration": 1440,
  "resolution": "1920x1080",
  "clips": [],
  "error": null,
  "createdAt": 1719400000000
}
```

When `status === "complete"`, `clips` array contains:
```json
[
  {
    "index": 1,
    "filename": "job123_clip1.mp4",
    "startTime": 142,
    "duration": 30,
    "score": 24.5,
    "viralityLabel": { "label": "🔥 Ultra High", "score": "9.2" },
    "title": "This moment changed everything 🔥",
    "description": "One of the most viral moments from this episode...",
    "hashtags": ["#Shorts", "#Viral", "#Podcast", "..."],
    "downloadUrl": "/api/download/job123/1",
    "thumbUrl": "/api/thumb/job123/1"
  }
]
```

---

### GET `/api/download/:jobId/:clipIndex`
Download a single clip. Returns MP4 file.

### GET `/api/thumb/:jobId/:clipIndex`
Serve thumbnail JPEG for a clip.

### GET `/api/download-all/:jobId`
Download all clips as a ZIP file.

### GET `/api/health`
Health check endpoint.
```json
{ "status": "ok", "uptime": 3600, "activeJobs": 2, "timestamp": "2025-06-26T..." }
```

---

## Architecture

```
tools/shorts-maker.html     ← Frontend (served from HashmiTools Vercel)
        │
        │ fetch()
        ▼
backend/server.js           ← Express API (deploy on Railway/Render)
    ├── POST /api/upload    → multer → ffprobe validation → create job
    ├── POST /api/process   → spawn async pipeline → respond immediately
    │       │
    │       ├── highlightDetector.js  → ffmpeg audio + scene analysis
    │       ├── videoProcessor.js     → ffmpeg clip cutting + thumbnails
    │       └── aiMetadata.js         → Claude API title/desc/hashtag
    │
    ├── GET /api/status/:id → return job.toPublic()
    ├── GET /api/download/  → stream clip file
    └── GET /api/download-all → archiver ZIP stream
    
jobs.js                     ← In-memory job store (Map)
uploads/                    ← Temp storage (auto-cleaned after 1hr)
outputs/                    ← Processed clips + thumbnails (auto-cleaned after 1hr)
```

---

## File Cleanup Policy

- **Uploads:** Deleted 1 hour after upload
- **Outputs:** Deleted 1 hour after processing completes  
- **Jobs:** Purged from memory 2 hours after last update
- Cleanup runs every 15 minutes via `setInterval`

For production with high traffic, replace the in-memory job store (`jobs.js`) with Redis and use object storage (S3/R2) for files instead of local disk.

---

## FFmpeg Notes

The backend uses the system `ffmpeg` binary. Make sure it's installed:

```bash
# Ubuntu/Debian
sudo apt install ffmpeg

# macOS (Homebrew)
brew install ffmpeg

# Railway/Render — FFmpeg is pre-installed on most Docker-based runtimes
# If not, add to your Dockerfile or use nixpacks.toml:
```

**nixpacks.toml** (for Railway):
```toml
[phases.setup]
nixPkgs = ["ffmpeg"]
```

---

## Security Considerations

- File type validated via mimetype AND extension (double check)
- File size limited server-side (multer limit)
- Video duration validated with ffprobe after upload
- Rate limiting: 10 uploads/15min, 5 processes/hour per IP
- CORS restricted to allowed origins only
- API keys stored in environment variables only (never in code)
- Files auto-deleted after 1 hour
- No user data persisted beyond job lifetime
