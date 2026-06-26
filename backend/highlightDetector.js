/**
 * highlightDetector.js — Heuristic highlight/scene detection using FFmpeg
 *
 * NOTE: This is signal-based heuristic detection, NOT deep AI understanding
 * of "virality". It correlates audio energy peaks + scene visual changes
 * to find likely-engaging moments. Results improve with well-produced content.
 *
 * Three detection signals:
 *  1. Audio RMS energy peaks (excitement, laughter, shouts, music swells)
 *  2. Scene change detection (visual cuts, dynamic action, fast movement)
 *  3. Spoken-word density estimation (more speech = more info density)
 */

'use strict';

const { execFile } = require('child_process');
const { promisify } = require('util');
const execFileAsync = promisify(execFile);
const path = require('path');

// ─── Signal 1: Audio energy peaks ────────────────────────────────────────────
/**
 * Run FFmpeg's astats filter to measure RMS audio level per second.
 * High RMS = loud/excited moment (applause, punchline, music drop).
 *
 * @param {string} videoPath
 * @returns {Promise<Array<{time: number, rms: number}>>}
 */
async function detectAudioPeaks(videoPath) {
  try {
    // Extract audio and measure RMS every 0.5s using volumedetect-style astats
    const { stderr } = await execFileAsync('ffmpeg', [
      '-i', videoPath,
      '-af', 'astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level',
      '-f', 'null',
      '-'
    ], { maxBuffer: 50 * 1024 * 1024 });

    const peaks = [];
    // Parse lines like: frame:N pts:M pts_time:T lavfi.astats.Overall.RMS_level=VALUE
    const lines = stderr.split('\n');
    let currentTime = 0;

    for (const line of lines) {
      const timeMatch = line.match(/pts_time:([\d.]+)/);
      if (timeMatch) currentTime = parseFloat(timeMatch[1]);

      const rmsMatch = line.match(/RMS_level=([-\d.]+)/);
      if (rmsMatch) {
        const rms = parseFloat(rmsMatch[1]);
        // RMS in dBFS — anything above -20 dBFS is "loud" for most content
        if (!isNaN(rms) && rms > -40) {
          peaks.push({ time: currentTime, rms });
        }
      }
    }

    // Normalize and return top peaks (above mean + 1 stddev)
    if (peaks.length === 0) return [];
    const values = peaks.map(p => p.rms);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stddev = Math.sqrt(values.map(v => Math.pow(v - mean, 2)).reduce((a, b) => a + b, 0) / values.length);
    const threshold = mean + (stddev * 0.5);

    return peaks.filter(p => p.rms > threshold).map(p => p.time);
  } catch (err) {
    console.warn('[highlightDetector] Audio peak detection failed:', err.message);
    return [];
  }
}

// ─── Signal 2: Scene change detection ────────────────────────────────────────
/**
 * Use FFmpeg's scene detection filter to find timestamps where visual
 * content changes dramatically (scene cuts, action, rapid movement).
 *
 * @param {string} videoPath
 * @param {number} threshold  0.0–1.0 — higher = detect only major changes (default 0.35)
 * @returns {Promise<Array<{time: number, score: number}>>}
 */
async function detectSceneChanges(videoPath, threshold = 0.35) {
  try {
    const { stderr } = await execFileAsync('ffmpeg', [
      '-i', videoPath,
      '-vf', `select='gt(scene,${threshold})',metadata=print`,
      '-an',
      '-f', 'null',
      '-'
    ], { maxBuffer: 50 * 1024 * 1024 });

    const scenes = [];
    const lines = stderr.split('\n');
    let currentTime = 0;

    for (const line of lines) {
      const timeMatch = line.match(/pts_time:([\d.]+)/);
      if (timeMatch) currentTime = parseFloat(timeMatch[1]);

      const sceneMatch = line.match(/scene_score=([\d.]+)/);
      if (sceneMatch) {
        scenes.push({ time: currentTime, score: parseFloat(sceneMatch[1]) });
      }
    }

    return scenes;
  } catch (err) {
    // Fallback: try simpler select filter
    try {
      const { stderr } = await execFileAsync('ffmpeg', [
        '-i', videoPath,
        '-vf', `select='gt(scene,${threshold})',showinfo`,
        '-an', '-f', 'null', '-'
      ], { maxBuffer: 50 * 1024 * 1024 });

      const scenes = [];
      const regex = /pts_time:([\d.]+)/g;
      let m;
      while ((m = regex.exec(stderr)) !== null) {
        scenes.push({ time: parseFloat(m[1]), score: 0.5 });
      }
      return scenes;
    } catch (err2) {
      console.warn('[highlightDetector] Scene detection failed:', err2.message);
      return [];
    }
  }
}

// ─── Signal 3: Motion/activity estimation ────────────────────────────────────
/**
 * Estimate motion level per second using FFmpeg's blurdetect + idet filters.
 * High motion often correlates with action, reveals, or dynamic content.
 * This is a lightweight proxy for "visual interest".
 *
 * @param {string} videoPath
 * @param {number} durationSec
 * @returns {Promise<number[]>}  Per-second motion scores (0-10)
 */
async function estimateMotionActivity(videoPath, durationSec) {
  try {
    // Use mpdecimate (motion-adaptive frame dropping detector) as a motion proxy
    // More frames dropped = more motion/change = more activity
    const { stderr } = await execFileAsync('ffmpeg', [
      '-i', videoPath,
      '-vf', 'mpdecimate,showinfo',
      '-an', '-f', 'null', '-'
    ], { maxBuffer: 100 * 1024 * 1024, timeout: 120000 });

    // Parse pts_time from showinfo output — cluster by second
    const perSecond = new Array(Math.ceil(durationSec)).fill(0);
    const timeRegex = /pts_time:([\d.]+)/g;
    let m;
    while ((m = timeRegex.exec(stderr)) !== null) {
      const sec = Math.floor(parseFloat(m[1]));
      if (sec < perSecond.length) perSecond[sec]++;
    }

    // Normalize to 0-10 scale
    const maxVal = Math.max(...perSecond, 1);
    return perSecond.map(v => (v / maxVal) * 10);
  } catch (err) {
    console.warn('[highlightDetector] Motion estimation failed, using uniform:', err.message);
    return new Array(Math.ceil(durationSec)).fill(5);
  }
}

// ─── Combine all signals into a scoring timeline ──────────────────────────────
/**
 * Generate a per-second "highlight score" timeline for a video.
 * Weights:
 *   Audio peaks:   +4 pts per second containing a peak
 *   Scene changes: +3 pts per second containing a scene cut
 *   Motion score:  +0 to +3 pts based on motion level (normalized)
 *
 * @param {string} videoPath
 * @param {number} durationSec
 * @returns {Promise<number[]>}
 */
async function generateHighlightTimeline(videoPath, durationSec) {
  console.log('[highlightDetector] Running all detection signals in parallel...');

  const [audioPeakTimes, sceneData, motionScores] = await Promise.all([
    detectAudioPeaks(videoPath),
    detectSceneChanges(videoPath, 0.30),
    estimateMotionActivity(videoPath, durationSec),
  ]);

  console.log(`[highlightDetector] Audio peaks: ${audioPeakTimes.length}, Scene changes: ${sceneData.length}`);

  const scoreTimeline = new Array(Math.ceil(durationSec)).fill(0);

  // Apply audio peak scores
  audioPeakTimes.forEach(t => {
    const sec = Math.floor(t);
    if (sec < scoreTimeline.length) {
      scoreTimeline[sec] += 4;
      // Bleed into adjacent seconds (excitement carries over)
      if (sec > 0) scoreTimeline[sec - 1] += 1;
      if (sec + 1 < scoreTimeline.length) scoreTimeline[sec + 1] += 1;
    }
  });

  // Apply scene change scores
  sceneData.forEach(({ time, score }) => {
    const sec = Math.floor(time);
    if (sec < scoreTimeline.length) {
      scoreTimeline[sec] += Math.round(3 * (score || 0.5));
    }
  });

  // Apply motion scores (normalized to 0-3 additional points)
  motionScores.forEach((motionScore, sec) => {
    if (sec < scoreTimeline.length) {
      scoreTimeline[sec] += (motionScore / 10) * 3;
    }
  });

  // Apply a slight bias AWAY from the very start and end (often intro/outro)
  const biasZone = Math.min(30, Math.floor(durationSec * 0.05));
  for (let i = 0; i < biasZone; i++) {
    scoreTimeline[i] *= 0.4;
    const endIdx = scoreTimeline.length - 1 - i;
    if (endIdx >= 0) scoreTimeline[endIdx] *= 0.5;
  }

  return scoreTimeline;
}

// ─── Select top non-overlapping clip windows ──────────────────────────────────
/**
 * Given a per-second score timeline, find the top N non-overlapping
 * windows of length `clipLength` seconds with the highest aggregate score.
 *
 * For 'sequential' mode, clips are evenly distributed through the video
 * regardless of score.
 *
 * @param {number[]} scoreTimeline
 * @param {number} clipLength  seconds
 * @param {number} numClips
 * @param {'viral'|'sequential'} cutMode
 * @param {number} durationSec  total video duration
 * @returns {Array<{start: number, end: number, score: number, viralityLabel: string}>}
 */
function findTopMoments(scoreTimeline, clipLength, numClips, cutMode, durationSec) {
  if (cutMode === 'sequential') {
    // Evenly spaced clips — ignore score, distribute through the video
    // Skip first 5% and last 5% to avoid intros/outros
    const safeStart = Math.floor(durationSec * 0.05);
    const safeEnd = Math.floor(durationSec * 0.95) - clipLength;
    const safeRange = safeEnd - safeStart;
    const interval = safeRange / Math.max(numClips, 1);

    const moments = [];
    for (let i = 0; i < numClips; i++) {
      const start = Math.floor(safeStart + interval * i);
      const end = start + clipLength;
      if (end <= durationSec) {
        const windowScore = scoreTimeline.slice(start, end).reduce((a, b) => a + b, 0) / clipLength;
        moments.push({ start, end, score: windowScore, viralityLabel: getViralityLabel(windowScore) });
      }
    }
    return moments;
  }

  // Viral mode: sliding window scoring
  const maxStart = Math.max(0, scoreTimeline.length - clipLength);
  const windows = [];

  for (let start = 0; start <= maxStart; start++) {
    const windowScore = scoreTimeline
      .slice(start, start + clipLength)
      .reduce((a, b) => a + b, 0);
    windows.push({ start, end: start + clipLength, score: windowScore });
  }

  // Sort by score descending
  windows.sort((a, b) => b.score - a.score);

  // Greedily pick top non-overlapping windows
  // Allow up to 25% overlap between clips for dense content
  const minGap = Math.floor(clipLength * 0.75);
  const selected = [];

  for (const w of windows) {
    const overlaps = selected.some(s =>
      Math.abs(w.start - s.start) < minGap
    );
    if (!overlaps) {
      selected.push({
        start: w.start,
        end: w.end,
        score: w.score,
        viralityLabel: getViralityLabel(w.score / clipLength), // per-second avg
      });
      if (selected.length >= numClips) break;
    }
  }

  // Return sorted chronologically
  return selected.sort((a, b) => a.start - b.start);
}

/**
 * Convert a per-second average score to a human-readable virality label
 */
function getViralityLabel(perSecondScore) {
  if (perSecondScore >= 8)  return { label: '🔥 Ultra High', score: Math.min(10, perSecondScore).toFixed(1) };
  if (perSecondScore >= 5)  return { label: '⚡ High',       score: Math.min(10, perSecondScore).toFixed(1) };
  if (perSecondScore >= 3)  return { label: '✨ Medium',     score: Math.min(10, perSecondScore).toFixed(1) };
  return                           { label: '📊 Standard',   score: Math.min(10, perSecondScore).toFixed(1) };
}

module.exports = {
  generateHighlightTimeline,
  findTopMoments,
  detectAudioPeaks,
  detectSceneChanges,
};
