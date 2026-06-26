/**
 * videoProcessor.js — FFmpeg video cutting and metadata extraction
 *
 * Handles:
 *  - Probing video for duration, resolution, codec info (ffprobe)
 *  - Cutting individual clips with 9:16 vertical crop for Shorts/Reels
 *  - Optional: keeping original aspect ratio (landscape mode)
 *  - Generating thumbnail previews for each clip
 */

'use strict';

const ffmpeg = require('fluent-ffmpeg');
const { execFile } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const execFileAsync = promisify(execFile);

// ─── Video metadata probe ─────────────────────────────────────────────────────
/**
 * Probe a video file with ffprobe and return key metadata.
 *
 * @param {string} filePath
 * @returns {Promise<{duration: number, width: number, height: number, resolution: string, fps: number, codec: string, hasAudio: boolean}>}
 */
async function getVideoMetadata(filePath) {
  try {
    const { stdout } = await execFileAsync('ffprobe', [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_streams',
      '-show_format',
      filePath
    ], { maxBuffer: 10 * 1024 * 1024 });

    const info = JSON.parse(stdout);
    const videoStream = info.streams.find(s => s.codec_type === 'video');
    const audioStream = info.streams.find(s => s.codec_type === 'audio');
    const format = info.format;

    const duration = parseFloat(format.duration || videoStream?.duration || 0);
    const width = videoStream?.width || 0;
    const height = videoStream?.height || 0;

    // Parse FPS from avg_frame_rate (e.g. "30000/1001" → ~29.97)
    let fps = 30;
    if (videoStream?.avg_frame_rate) {
      const parts = videoStream.avg_frame_rate.split('/');
      fps = parts.length === 2 ? parseFloat(parts[0]) / parseFloat(parts[1]) : parseFloat(parts[0]);
    }

    return {
      duration: Math.round(duration),
      width,
      height,
      resolution: `${width}x${height}`,
      fps: Math.round(fps),
      codec: videoStream?.codec_name || 'unknown',
      hasAudio: !!audioStream,
      fileSize: parseInt(format.size || 0),
      bitrate: parseInt(format.bit_rate || 0),
    };
  } catch (err) {
    throw new Error(`Failed to probe video: ${err.message}`);
  }
}

// ─── Single clip cutter ───────────────────────────────────────────────────────
/**
 * Cut a clip from a source video, convert to 9:16 (Shorts format) or
 * keep original aspect ratio.
 *
 * @param {Object} opts
 * @param {string} opts.inputPath     Source video path
 * @param {string} opts.outputPath    Output clip path
 * @param {number} opts.startSec      Start time in seconds
 * @param {number} opts.durationSec   Clip length in seconds
 * @param {boolean} opts.vertical     If true, crop to 9:16 (default true)
 * @param {Function} opts.onProgress  Progress callback (0-100)
 * @returns {Promise<void>}
 */
function cutClip({ inputPath, outputPath, startSec, durationSec, vertical = true, onProgress }) {
  return new Promise((resolve, reject) => {
    const videoFilters = vertical
      ? [
          // Smart vertical crop: take center 9:16 portion from the original
          // Works for both landscape (crop sides) and portrait (no-op) source
          'crop=min(iw\\,ih*9/16):min(ih\\,iw*16/9):iw/2-min(iw\\,ih*9/16)/2:ih/2-min(ih\\,iw*16/9)/2',
          'scale=1080:1920:force_original_aspect_ratio=decrease',
          'pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black',
        ]
      : [
          'scale=1280:720:force_original_aspect_ratio=decrease',
          'pad=1280:720:(ow-iw)/2:(oh-ih)/2:black',
        ];

    const cmd = ffmpeg(inputPath)
      .setStartTime(startSec)
      .setDuration(durationSec)
      .videoFilters(videoFilters)
      .videoCodec('libx264')
      .audioCodec('aac')
      .audioBitrate('128k')
      .outputOptions([
        '-preset fast',       // fast encode, good quality
        '-crf 23',            // constant rate factor — visually lossless
        '-pix_fmt yuv420p',   // max browser/device compatibility
        '-movflags +faststart', // web-optimized: moov atom at front
        '-avoid_negative_ts make_zero',
      ]);

    if (onProgress) {
      cmd.on('progress', (info) => {
        const pct = Math.min(99, info.percent || 0);
        onProgress(pct);
      });
    }

    cmd
      .output(outputPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(new Error(`FFmpeg error: ${err.message}`)))
      .run();
  });
}

// ─── Thumbnail generator ──────────────────────────────────────────────────────
/**
 * Extract a thumbnail frame from a clip (at 1 second mark or midpoint).
 *
 * @param {string} clipPath
 * @param {string} thumbPath  Output JPEG path
 * @param {number} durationSec
 * @returns {Promise<boolean>}  true if successful
 */
async function generateThumbnail(clipPath, thumbPath, durationSec) {
  try {
    await execFileAsync('ffmpeg', [
      '-i', clipPath,
      '-ss', String(Math.min(1, durationSec / 2)),
      '-vframes', '1',
      '-vf', 'scale=540:960:force_original_aspect_ratio=decrease,pad=540:960:(ow-iw)/2:(oh-ih)/2:black',
      '-q:v', '3',
      '-y',
      thumbPath
    ], { timeout: 30000 });
    return true;
  } catch (err) {
    console.warn('[videoProcessor] Thumbnail generation failed:', err.message);
    return false;
  }
}

// ─── Full clip processing pipeline ───────────────────────────────────────────
/**
 * Process all selected moments into clips, generating thumbnails too.
 *
 * @param {Object} opts
 * @param {string} opts.jobId
 * @param {string} opts.videoPath
 * @param {Array<{start: number, end: number, score: number, viralityLabel: Object}>} opts.selectedMoments
 * @param {number} opts.clipLength       Clip duration in seconds
 * @param {boolean} opts.vertical        9:16 format (default true)
 * @param {string} opts.outputDir        Directory for output files
 * @param {Function} opts.onClipProgress  Called with (clipIndex, totalClips, pct)
 * @returns {Promise<Array>}             Array of clip objects
 */
async function processAllClips({ jobId, videoPath, selectedMoments, clipLength, vertical = true, outputDir, onClipProgress }) {
  const clips = [];

  for (let i = 0; i < selectedMoments.length; i++) {
    const moment = selectedMoments[i];
    const clipFilename = `${jobId}_clip${i + 1}.mp4`;
    const thumbFilename = `${jobId}_thumb${i + 1}.jpg`;
    const outputPath = path.join(outputDir, clipFilename);
    const thumbPath  = path.join(outputDir, thumbFilename);

    console.log(`[videoProcessor] Cutting clip ${i + 1}/${selectedMoments.length} — start=${moment.start}s, duration=${clipLength}s`);

    await cutClip({
      inputPath: videoPath,
      outputPath,
      startSec: moment.start,
      durationSec: clipLength,
      vertical,
      onProgress: (pct) => {
        if (onClipProgress) onClipProgress(i, selectedMoments.length, pct);
      },
    });

    // Verify output exists and has reasonable size
    const stat = fs.existsSync(outputPath) ? fs.statSync(outputPath) : null;
    if (!stat || stat.size < 1000) {
      throw new Error(`Clip ${i + 1} output is empty or missing`);
    }

    // Generate thumbnail
    await generateThumbnail(outputPath, thumbPath, clipLength);
    const hasThumb = fs.existsSync(thumbPath);

    const perSecAvg = moment.score / clipLength;
    clips.push({
      index: i + 1,
      path: outputPath,
      thumbPath: hasThumb ? thumbPath : null,
      filename: clipFilename,
      thumbFilename: hasThumb ? thumbFilename : null,
      startTime: moment.start,
      duration: clipLength,
      score: moment.score,
      viralityLabel: moment.viralityLabel,
      downloadUrl: `/api/download/${jobId}/${i + 1}`,
      thumbUrl: hasThumb ? `/api/thumb/${jobId}/${i + 1}` : null,
      // Metadata filled in later by aiMetadata.js
      title: `Short Clip ${i + 1}`,
      description: '',
      hashtags: [],
    });

    if (onClipProgress) onClipProgress(i + 1, selectedMoments.length, 100);
  }

  return clips;
}

// ─── File cleanup helpers ─────────────────────────────────────────────────────
/**
 * Delete all files in a directory that are older than `maxAgeMs`.
 * Does NOT delete the directory itself.
 *
 * @param {string} dir
 * @param {number} maxAgeMs
 */
function cleanupOldFiles(dir, maxAgeMs) {
  if (!fs.existsSync(dir)) return;
  const now = Date.now();
  const files = fs.readdirSync(dir);
  let deleted = 0;

  for (const file of files) {
    const fp = path.join(dir, file);
    try {
      const stat = fs.statSync(fp);
      if (now - stat.mtimeMs > maxAgeMs) {
        fs.unlinkSync(fp);
        deleted++;
      }
    } catch (_) {
      // File may have been deleted concurrently — safe to ignore
    }
  }

  if (deleted > 0) console.log(`[videoProcessor] Cleaned ${deleted} old file(s) from ${dir}`);
}

module.exports = {
  getVideoMetadata,
  cutClip,
  processAllClips,
  generateThumbnail,
  cleanupOldFiles,
};
