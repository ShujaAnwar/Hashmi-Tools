/**
 * jobs.js — In-memory job queue for AI Shorts Maker
 * Tracks upload → processing → complete lifecycle for each video job.
 * Jobs auto-expire after 2 hours to prevent memory leaks.
 */

'use strict';

const JOB_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

/** @type {Map<string, Job>} */
const jobStore = new Map();

/**
 * @typedef {Object} ClipResult
 * @property {number} index
 * @property {string} path
 * @property {string} filename
 * @property {number} startTime
 * @property {number} duration
 * @property {number} score
 * @property {string} title
 * @property {string} description
 * @property {string[]} hashtags
 * @property {string} downloadUrl
 */

/**
 * @typedef {Object} Job
 * @property {string} id
 * @property {'uploaded'|'processing'|'detecting'|'cutting'|'metadata'|'complete'|'failed'} status
 * @property {number} progress  0-100
 * @property {string} stage     Human-readable current stage
 * @property {string} filePath  Uploaded video path
 * @property {number} duration  Video duration in seconds
 * @property {string} resolution WxH
 * @property {string} originalName
 * @property {ClipResult[]} clips
 * @property {string|null} error
 * @property {number} createdAt Unix ms
 * @property {number} updatedAt Unix ms
 */

const jobs = {
  /**
   * Create a new job record
   */
  create(id, data) {
    const now = Date.now();
    jobStore.set(id, {
      id,
      status: 'uploaded',
      progress: 0,
      stage: 'Video uploaded — ready to process',
      filePath: data.filePath,
      duration: data.duration,
      resolution: data.resolution || 'unknown',
      originalName: data.originalName || 'video.mp4',
      clips: [],
      error: null,
      createdAt: now,
      updatedAt: now,
    });
  },

  /**
   * Retrieve a job by ID
   * @returns {Job|undefined}
   */
  get(id) {
    return jobStore.get(id);
  },

  /**
   * Update status + optional progress + stage message
   */
  updateStatus(id, status, error = null) {
    const job = jobStore.get(id);
    if (!job) return;
    job.status = status;
    if (error) job.error = error;
    job.updatedAt = Date.now();
    jobStore.set(id, job);
  },

  /**
   * Update progress (0-100) with a human-readable stage label
   */
  updateProgress(id, progress, stage = null) {
    const job = jobStore.get(id);
    if (!job) return;
    job.progress = Math.min(100, Math.max(0, Math.round(progress)));
    if (stage) job.stage = stage;
    job.updatedAt = Date.now();
    jobStore.set(id, job);
  },

  /**
   * Store completed clips on the job
   */
  setClips(id, clips) {
    const job = jobStore.get(id);
    if (!job) return;
    job.clips = clips;
    job.progress = 100;
    job.status = 'complete';
    job.stage = 'All clips ready for download!';
    job.updatedAt = Date.now();
    jobStore.set(id, job);
  },

  /**
   * Return a safe public representation (no internal paths)
   */
  toPublic(id) {
    const job = jobStore.get(id);
    if (!job) return null;
    return {
      id: job.id,
      status: job.status,
      progress: job.progress,
      stage: job.stage,
      duration: job.duration,
      resolution: job.resolution,
      originalName: job.originalName,
      clips: job.status === 'complete' ? job.clips.map(c => ({
        index: c.index,
        filename: c.filename,
        startTime: c.startTime,
        duration: c.duration,
        score: c.score,
        viralityLabel: c.viralityLabel,
        title: c.title,
        description: c.description,
        hashtags: c.hashtags,
        downloadUrl: c.downloadUrl,
      })) : [],
      error: job.error,
      createdAt: job.createdAt,
    };
  },

  /**
   * Purge jobs older than TTL — called by cleanup scheduler
   */
  purgeExpired() {
    const cutoff = Date.now() - JOB_TTL_MS;
    let purged = 0;
    for (const [id, job] of jobStore) {
      if (job.updatedAt < cutoff) {
        jobStore.delete(id);
        purged++;
      }
    }
    if (purged > 0) console.log(`[jobs] Purged ${purged} expired job(s)`);
  },

  size() {
    return jobStore.size;
  },
};

module.exports = jobs;
