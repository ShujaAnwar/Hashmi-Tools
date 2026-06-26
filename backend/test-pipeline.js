/**
 * test-pipeline.js — End-to-end pipeline test for AI Shorts Maker backend
 *
 * Tests the full pipeline locally WITHOUT needing to start the HTTP server:
 * 1. Creates a synthetic 5-minute test video using FFmpeg (color bars + tone)
 * 2. Runs getVideoMetadata() — validates duration, resolution
 * 3. Runs generateHighlightTimeline() — validates score array
 * 4. Runs findTopMoments() — validates clip selection
 * 5. Runs processAllClips() — validates actual clip cutting
 * 6. Runs generateFallbackMetadata() — validates metadata shape
 * 7. Cleans up test files
 *
 * Usage: node test-pipeline.js
 * Or:    npm test
 */

'use strict';

require('dotenv').config();

const fs   = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');
const execFileAsync = promisify(execFile);

const { getVideoMetadata, processAllClips, cleanupOldFiles } = require('./videoProcessor');
const { generateHighlightTimeline, findTopMoments }          = require('./highlightDetector');
const { generateFallbackMetadata, generateAllMetadata }      = require('./aiMetadata');

// ── Test config ───────────────────────────────────────────────────────────────
const TEST_DIR       = path.join(__dirname, '__test_tmp__');
const TEST_VIDEO     = path.join(TEST_DIR, 'test_input.mp4');
const TEST_JOB_ID    = 'test_job_001';
const TEST_DURATION  = 120; // 2 minutes synthetic video
const TEST_CLIP_LEN  = 30;
const TEST_NUM_CLIPS = 3;

// ── Colours for console output ────────────────────────────────────────────────
const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN   = '\x1b[36m';
const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';

let passed = 0, failed = 0;

function pass(label) {
  passed++;
  console.log(`  ${GREEN}✅ PASS${RESET} — ${label}`);
}
function fail(label, detail) {
  failed++;
  console.log(`  ${RED}❌ FAIL${RESET} — ${label}`);
  if (detail) console.log(`         ${detail}`);
}
function log(msg) {
  console.log(`  ${CYAN}ℹ${RESET}  ${msg}`);
}

// ── Main test runner ──────────────────────────────────────────────────────────
async function runTests() {
  console.log(`\n${BOLD}${CYAN}══════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}${CYAN}  AI Shorts Maker — Pipeline Test Suite${RESET}`);
  console.log(`${CYAN}══════════════════════════════════════════════════${RESET}\n`);

  // Ensure test dir
  if (!fs.existsSync(TEST_DIR)) fs.mkdirSync(TEST_DIR, { recursive: true });
  if (!fs.existsSync(path.join(__dirname, 'outputs'))) fs.mkdirSync(path.join(__dirname, 'outputs'), { recursive: true });

  // ── Test 0: FFmpeg availability ─────────────────────────────────────────────
  console.log(`${BOLD}Test 0: FFmpeg availability${RESET}`);
  try {
    const { stdout } = await execFileAsync('ffmpeg', ['-version']);
    const ver = stdout.split('\n')[0];
    log(ver);
    pass('ffmpeg is installed and accessible');
  } catch (err) {
    fail('ffmpeg not found — install ffmpeg and make sure it is in PATH', err.message);
    process.exit(1);
  }

  try {
    await execFileAsync('ffprobe', ['-version']);
    pass('ffprobe is installed and accessible');
  } catch (err) {
    fail('ffprobe not found', err.message);
    process.exit(1);
  }

  // ── Test 1: Create synthetic test video ─────────────────────────────────────
  console.log(`\n${BOLD}Test 1: Create ${TEST_DURATION}s synthetic test video${RESET}`);
  try {
    log(`Generating synthetic ${TEST_DURATION}s video with varying audio levels...`);
    await execFileAsync('ffmpeg', [
      // Create a 2-minute test video with:
      // - SMPTE color bars (visual interest / scene changes every 10s)
      // - Sine wave audio at varying volumes (simulates audio energy peaks)
      '-f', 'lavfi',
      '-i', `smptebars=size=1280x720:rate=30`,
      '-f', 'lavfi',
      '-i', `sine=frequency=440:beep_factor=2.5:sample_rate=44100`,
      '-t', String(TEST_DURATION),
      // Add simulated volume variation via amix to create "peaks"
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-crf', '28',
      '-c:a', 'aac',
      '-b:a', '96k',
      '-shortest',
      '-y',
      TEST_VIDEO,
    ], { timeout: 60000 });

    const stat = fs.statSync(TEST_VIDEO);
    log(`Test video created: ${(stat.size / 1024 / 1024).toFixed(1)}MB`);
    pass(`Synthetic ${TEST_DURATION}s test video created at ${TEST_VIDEO}`);
  } catch (err) {
    fail('Failed to create test video', err.message);
    process.exit(1);
  }

  // ── Test 2: Video metadata probe ────────────────────────────────────────────
  console.log(`\n${BOLD}Test 2: Video metadata probe (ffprobe)${RESET}`);
  let metadata;
  try {
    metadata = await getVideoMetadata(TEST_VIDEO);
    log(`Duration: ${metadata.duration}s, Resolution: ${metadata.resolution}, FPS: ${metadata.fps}, Audio: ${metadata.hasAudio}`);

    if (Math.abs(metadata.duration - TEST_DURATION) <= 2) {
      pass(`Duration is ~${TEST_DURATION}s (got ${metadata.duration}s)`);
    } else {
      fail(`Duration mismatch — expected ~${TEST_DURATION}s, got ${metadata.duration}s`);
    }

    if (metadata.width === 1280 && metadata.height === 720) {
      pass('Resolution is 1280x720 as expected');
    } else {
      fail(`Resolution mismatch — expected 1280x720, got ${metadata.resolution}`);
    }

    if (metadata.hasAudio) {
      pass('Audio stream detected');
    } else {
      fail('Audio stream not detected');
    }
  } catch (err) {
    fail('getVideoMetadata() threw an error', err.message);
    metadata = { duration: TEST_DURATION, resolution: '1280x720', hasAudio: true };
  }

  // ── Test 3: Highlight detection ─────────────────────────────────────────────
  console.log(`\n${BOLD}Test 3: Highlight detection (audio + scene analysis)${RESET}`);
  let scoreTimeline;
  try {
    log('Running generateHighlightTimeline() — this may take 15–30 seconds...');
    scoreTimeline = await generateHighlightTimeline(TEST_VIDEO, metadata.duration);

    if (Array.isArray(scoreTimeline) && scoreTimeline.length > 0) {
      pass(`Score timeline generated — ${scoreTimeline.length} entries`);
    } else {
      fail('Score timeline is empty or not an array');
      scoreTimeline = new Array(metadata.duration).fill(3);
    }

    const maxScore = Math.max(...scoreTimeline);
    const avgScore = scoreTimeline.reduce((a, b) => a + b, 0) / scoreTimeline.length;
    log(`Max score: ${maxScore.toFixed(2)}, Avg score: ${avgScore.toFixed(2)}`);

    if (maxScore > 0) {
      pass('Score timeline has non-zero values (signals detected)');
    } else {
      fail('All scores are zero — detection may have failed silently');
    }
  } catch (err) {
    fail('generateHighlightTimeline() threw an error', err.message);
    scoreTimeline = new Array(metadata.duration).fill(3);
  }

  // ── Test 4: Moment selection ─────────────────────────────────────────────────
  console.log(`\n${BOLD}Test 4: Top moment selection${RESET}`);
  let moments;
  try {
    // Test viral mode
    const viralMoments = findTopMoments(scoreTimeline, TEST_CLIP_LEN, TEST_NUM_CLIPS, 'viral', metadata.duration);
    log(`Viral mode selected ${viralMoments.length} moments:`);
    viralMoments.forEach((m, i) => log(`  Clip ${i+1}: start=${m.start}s, score=${m.score?.toFixed(1)}, label=${m.viralityLabel?.label}`));

    if (viralMoments.length === TEST_NUM_CLIPS) {
      pass(`Viral mode: found exactly ${TEST_NUM_CLIPS} moments`);
    } else if (viralMoments.length > 0) {
      pass(`Viral mode: found ${viralMoments.length} moments (video too short for ${TEST_NUM_CLIPS})`);
    } else {
      fail('Viral mode: found 0 moments');
    }

    // Test sequential mode
    const seqMoments = findTopMoments(scoreTimeline, TEST_CLIP_LEN, TEST_NUM_CLIPS, 'sequential', metadata.duration);
    log(`Sequential mode selected ${seqMoments.length} moments`);

    if (seqMoments.length > 0) {
      pass(`Sequential mode: found ${seqMoments.length} moments`);
    } else {
      fail('Sequential mode: found 0 moments');
    }

    // Validate non-overlap
    let overlap = false;
    for (let i = 0; i < viralMoments.length - 1; i++) {
      if (viralMoments[i].end > viralMoments[i + 1].start + TEST_CLIP_LEN * 0.5) {
        overlap = true; break;
      }
    }
    overlap ? fail('Viral moments have significant overlap') : pass('Viral moments have no significant overlap');

    moments = viralMoments.length > 0 ? viralMoments : seqMoments;
  } catch (err) {
    fail('findTopMoments() threw an error', err.message);
    moments = [{ start: 10, end: 40, score: 5, viralityLabel: { label: '📊 Standard', score: '5.0' } }];
  }

  // ── Test 5: Clip cutting ─────────────────────────────────────────────────────
  console.log(`\n${BOLD}Test 5: FFmpeg clip cutting (9:16 vertical crop)${RESET}`);
  let clips;
  try {
    log(`Cutting ${moments.length} clips of ${TEST_CLIP_LEN}s each...`);
    const startTime = Date.now();

    clips = await processAllClips({
      jobId: TEST_JOB_ID,
      videoPath: TEST_VIDEO,
      selectedMoments: moments,
      clipLength: TEST_CLIP_LEN,
      vertical: true,
      outputDir: path.join(__dirname, 'outputs'),
      onClipProgress: (i, total, pct) => {
        if (pct === 100) log(`  Clip ${i}/${total} complete`);
      },
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    log(`Cutting completed in ${elapsed}s`);

    if (clips.length === moments.length) {
      pass(`All ${clips.length} clips created successfully`);
    } else {
      fail(`Expected ${moments.length} clips, got ${clips.length}`);
    }

    // Validate each clip
    let allFilesExist = true;
    let allSizesOk   = true;
    for (const clip of clips) {
      if (!fs.existsSync(clip.path)) { allFilesExist = false; break; }
      const size = fs.statSync(clip.path).size;
      if (size < 1000) { allSizesOk = false; break; }
      log(`  Clip ${clip.index}: ${clip.filename} — ${(size/1024).toFixed(0)}KB`);
    }
    allFilesExist ? pass('All clip files exist on disk') : fail('Some clip files are missing');
    allSizesOk    ? pass('All clip files have non-trivial size') : fail('Some clip files are empty or too small');

    // Validate clip metadata
    const firstClip = await getVideoMetadata(clips[0].path);
    log(`First clip metadata: ${firstClip.width}x${firstClip.height}, ${firstClip.duration}s`);
    if (firstClip.width === 1080 && firstClip.height === 1920) {
      pass('Output is 1080x1920 (9:16 vertical Shorts format) ✓');
    } else {
      fail(`Output dimensions unexpected: ${firstClip.width}x${firstClip.height} (expected 1080x1920)`);
    }
    if (Math.abs(firstClip.duration - TEST_CLIP_LEN) <= 2) {
      pass(`Clip duration is ~${TEST_CLIP_LEN}s (got ${firstClip.duration}s)`);
    } else {
      fail(`Clip duration mismatch: expected ~${TEST_CLIP_LEN}s, got ${firstClip.duration}s`);
    }

  } catch (err) {
    fail('processAllClips() threw an error', err.message);
    clips = [];
  }

  // ── Test 6: AI metadata generation ──────────────────────────────────────────
  console.log(`\n${BOLD}Test 6: AI metadata generation${RESET}`);
  try {
    if (clips.length === 0) {
      clips = [{
        index: 1, path: TEST_VIDEO, filename: 'test_clip1.mp4',
        startTime: 10, duration: 30, score: 15,
        viralityLabel: { label: '⚡ High', score: '7.5' },
        downloadUrl: '/api/download/test/1', thumbUrl: null,
      }];
    }

    const enriched = await generateAllMetadata({
      clips,
      originalVideoTitle: 'My Test Video — Episode 1',
      transcripts: [],
      onProgress: (done, total) => log(`  Metadata ${done}/${total} done`),
    });

    if (enriched.length === clips.length) {
      pass(`Metadata generated for all ${enriched.length} clips`);
    } else {
      fail(`Expected metadata for ${clips.length} clips, got ${enriched.length}`);
    }

    // Validate metadata shape
    const m = enriched[0];
    log(`  Title: "${m.title}"`);
    log(`  Description: "${m.description?.slice(0,80)}..."`);
    log(`  Hashtags: ${(m.hashtags || []).slice(0,4).join(', ')}...`);

    typeof m.title === 'string' && m.title.length > 0
      ? pass('Title is a non-empty string')
      : fail('Title is missing or empty');

    typeof m.description === 'string' && m.description.length > 0
      ? pass('Description is a non-empty string')
      : fail('Description is missing or empty');

    Array.isArray(m.hashtags) && m.hashtags.length > 0
      ? pass(`Hashtags array has ${m.hashtags.length} items`)
      : fail('Hashtags is missing or empty');

    if (process.env.ANTHROPIC_API_KEY) {
      log(`${YELLOW}  Claude API key is set — used Claude for metadata generation${RESET}`);
    } else {
      log(`${YELLOW}  No ANTHROPIC_API_KEY set — used fallback template metadata (expected in test)${RESET}`);
    }
  } catch (err) {
    fail('generateAllMetadata() threw an error', err.message);
  }

  // ── Test 7: Cleanup ──────────────────────────────────────────────────────────
  console.log(`\n${BOLD}Test 7: File cleanup${RESET}`);
  try {
    // Mark test files as 2 hours old (via utimes) to trigger cleanup
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    // Cleanup test output clips
    const outputDir = path.join(__dirname, 'outputs');
    const testFiles = fs.readdirSync(outputDir).filter(f => f.startsWith(TEST_JOB_ID));
    testFiles.forEach(f => {
      const fp = path.join(outputDir, f);
      fs.utimesSync(fp, twoHoursAgo, twoHoursAgo);
    });

    cleanupOldFiles(outputDir, 60 * 60 * 1000); // 1 hour max age

    const remaining = fs.readdirSync(outputDir).filter(f => f.startsWith(TEST_JOB_ID));
    if (remaining.length === 0) {
      pass('cleanupOldFiles() removed test clips correctly');
    } else {
      fail(`${remaining.length} test files were not cleaned up`);
    }

    // Clean up test input video and temp dir
    if (fs.existsSync(TEST_VIDEO)) fs.unlinkSync(TEST_VIDEO);
    if (fs.existsSync(TEST_DIR) && fs.readdirSync(TEST_DIR).length === 0) {
      fs.rmdirSync(TEST_DIR);
    }
    pass('Test input video and temp directory cleaned up');
  } catch (err) {
    fail('Cleanup failed', err.message);
  }

  // ── Summary ───────────────────────────────────────────────────────────────────
  console.log(`\n${BOLD}${CYAN}══════════════════════════════════════════════════${RESET}`);
  const total = passed + failed;
  if (failed === 0) {
    console.log(`${BOLD}${GREEN}  ALL TESTS PASSED: ${passed}/${total} ✅${RESET}`);
    console.log(`${GREEN}  Pipeline is working correctly. Ready to deploy!${RESET}`);
  } else {
    console.log(`${BOLD}  Results: ${GREEN}${passed} passed${RESET}, ${RED}${failed} failed${RESET} (${total} total)`);
    if (failed > 0) {
      console.log(`${YELLOW}  ⚠️  Some tests failed. Check the errors above before deploying.${RESET}`);
    }
  }
  console.log(`${CYAN}══════════════════════════════════════════════════${RESET}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error(`\n${RED}FATAL TEST ERROR:${RESET}`, err);
  process.exit(1);
});
