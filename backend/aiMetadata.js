/**
 * aiMetadata.js — Claude-powered title/description/hashtag generation
 *
 * For each video clip, generates:
 *  - A punchy, curiosity-driven title optimized for YouTube Shorts (≤ 60 chars)
 *  - A short description with relevant keywords (2-3 sentences)
 *  - 8-10 relevant hashtags
 *
 * Falls back gracefully if the Claude API is unavailable or not configured.
 */

'use strict';

// ─── Claude API caller ────────────────────────────────────────────────────────
/**
 * Call the Anthropic Claude API with a prompt.
 *
 * @param {string} prompt
 * @param {number} maxTokens
 * @returns {Promise<string>} Raw text response
 */
async function callClaude(prompt, maxTokens = 600) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable not set');
  }

  // Dynamically import node-fetch (ESM module)
  const { default: fetch } = await import('node-fetch');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
}

// ─── Metadata generator for a single clip ────────────────────────────────────
/**
 * Generate SEO-optimized YouTube Shorts metadata for a clip.
 *
 * @param {Object} opts
 * @param {number} opts.clipIndex          1-based clip number
 * @param {number} opts.totalClips         Total clips in the job
 * @param {string} opts.originalVideoTitle Title of the source video (may be empty)
 * @param {string} opts.transcript         Transcript snippet for this clip (may be empty)
 * @param {number} opts.startTimeSec       Clip start time in source video
 * @param {number} opts.durationSec        Clip duration
 * @param {Object} opts.viralityLabel      { label, score }
 * @returns {Promise<{title: string, description: string, hashtags: string[]}>}
 */
async function generateClipMetadata({ clipIndex, totalClips, originalVideoTitle, transcript, startTimeSec, durationSec, viralityLabel }) {
  // Format start time as MM:SS for context
  const mins = Math.floor(startTimeSec / 60);
  const secs = startTimeSec % 60;
  const timestamp = `${mins}:${secs.toString().padStart(2, '0')}`;

  const videoContext = originalVideoTitle
    ? `Original video: "${originalVideoTitle}"`
    : 'Original video title: unknown';

  const transcriptContext = transcript?.trim()
    ? `Clip transcript:\n"${transcript.trim()}"`
    : `(No transcript available — clip starts at ${timestamp} in the source video)`;

  const prompt = `You are a YouTube Shorts SEO expert who specializes in creating viral, high-CTR content.

${videoContext}
Clip ${clipIndex} of ${totalClips} — starts at ${timestamp}, duration: ${durationSec} seconds
${transcriptContext}

Generate YouTube Shorts metadata that maximizes click-through rate and discoverability.

Rules:
- Title: MUST be under 60 characters. Make it punchy, curiosity-driven, use power words. No clickbait that misleads.
- Description: 2-3 sentences, natural keyword integration, include a call-to-action. Under 200 characters.
- Hashtags: 8-10 hashtags. Mix of: 2 broad (#Shorts, #Viral), 3-4 topic-specific, 2-3 niche. No spaces in tags.

Return ONLY valid JSON, no markdown, no explanation:
{
  "title": "...",
  "description": "...",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5", "#tag6", "#tag7", "#tag8"]
}`;

  try {
    const responseText = await callClaude(prompt, 500);

    // Extract JSON from response (handle any surrounding text/markdown)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in Claude response');

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate and sanitize
    const title = String(parsed.title || '').slice(0, 100).trim();
    const description = String(parsed.description || '').slice(0, 500).trim();
    const hashtags = Array.isArray(parsed.hashtags)
      ? parsed.hashtags
          .map(h => String(h).trim())
          .filter(h => h.startsWith('#') && h.length > 1)
          .slice(0, 12)
      : ['#Shorts', '#Viral'];

    return { title, description, hashtags };
  } catch (err) {
    console.warn(`[aiMetadata] Clip ${clipIndex} metadata generation failed: ${err.message}`);
    // Return intelligent fallback
    return generateFallbackMetadata({ clipIndex, originalVideoTitle, startTimeSec, durationSec });
  }
}

// ─── Fallback metadata (no API key or API failure) ────────────────────────────
/**
 * Generate generic-but-useful metadata without calling any API.
 */
function generateFallbackMetadata({ clipIndex, originalVideoTitle, startTimeSec, durationSec }) {
  const mins = Math.floor(startTimeSec / 60);
  const secs = startTimeSec % 60;
  const timestamp = `${mins}:${secs.toString().padStart(2, '0')}`;

  const videoName = originalVideoTitle
    ? originalVideoTitle.slice(0, 40).trim()
    : 'This Video';

  const titleTemplates = [
    `You won't believe this moment! 🔥`,
    `This changed everything... ⚡`,
    `Wait for it... 😱`,
    `The best part of ${videoName}`,
    `This moment is everything 💯`,
    `Couldn't stop watching this part`,
    `This is absolutely incredible 🤯`,
    `The moment that went viral 🚀`,
  ];

  const title = titleTemplates[(clipIndex - 1) % titleTemplates.length];

  const description = originalVideoTitle
    ? `Clip ${clipIndex} from "${originalVideoTitle}" — starting at ${timestamp}. Watch the full video for more amazing content!`
    : `Amazing clip ${clipIndex} — starting at ${timestamp}. Don't miss this incredible moment!`;

  const hashtags = [
    '#Shorts', '#YouTubeShorts', '#Viral', '#Trending',
    '#MustWatch', '#Amazing', '#Incredible', '#FYP',
  ];

  return { title, description, hashtags };
}

// ─── Batch metadata for all clips ────────────────────────────────────────────
/**
 * Generate metadata for all clips in a job.
 * Runs sequentially to avoid rate-limiting.
 *
 * @param {Object} opts
 * @param {Array} opts.clips                Clip objects from videoProcessor
 * @param {string} opts.originalVideoTitle
 * @param {string[]} opts.transcripts       Per-clip transcript strings (may be empty)
 * @param {Function} opts.onProgress        Called with (clipIndex, totalClips)
 * @returns {Promise<Array>}               Clips with title/description/hashtags filled
 */
async function generateAllMetadata({ clips, originalVideoTitle, transcripts = [], onProgress }) {
  const enriched = [];

  for (let i = 0; i < clips.length; i++) {
    const clip = clips[i];
    const transcript = transcripts[i] || '';

    console.log(`[aiMetadata] Generating metadata for clip ${i + 1}/${clips.length}...`);

    const metadata = await generateClipMetadata({
      clipIndex: clip.index,
      totalClips: clips.length,
      originalVideoTitle,
      transcript,
      startTimeSec: clip.startTime,
      durationSec: clip.duration,
      viralityLabel: clip.viralityLabel,
    });

    enriched.push({
      ...clip,
      title: metadata.title,
      description: metadata.description,
      hashtags: metadata.hashtags,
    });

    if (onProgress) onProgress(i + 1, clips.length);

    // Small delay between API calls to respect rate limits
    if (i < clips.length - 1 && process.env.ANTHROPIC_API_KEY) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return enriched;
}

// ─── YouTube metadata fetch (URL reference only — no download) ────────────────
/**
 * Fetch YouTube video metadata (title, description, tags) using the
 * YouTube Data API v3. This is used ONLY to improve AI metadata generation —
 * the actual video is NEVER downloaded.
 *
 * @param {string} youtubeUrl
 * @returns {Promise<{title: string, description: string, tags: string[]}|null>}
 */
async function fetchYouTubeMetadata(youtubeUrl) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.log('[aiMetadata] YOUTUBE_API_KEY not set — skipping YouTube metadata fetch');
    return null;
  }

  // Extract video ID from URL
  const idMatch = youtubeUrl.match(/(?:v=|youtu\.be\/|\/v\/|\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (!idMatch) return null;
  const videoId = idMatch[1];

  try {
    const { default: fetch } = await import('node-fetch');
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;
    const response = await fetch(apiUrl, { timeout: 10000 });
    if (!response.ok) return null;

    const data = await response.json();
    const item = data.items?.[0]?.snippet;
    if (!item) return null;

    return {
      title: item.title || '',
      description: (item.description || '').slice(0, 500),
      tags: item.tags || [],
    };
  } catch (err) {
    console.warn('[aiMetadata] YouTube metadata fetch failed:', err.message);
    return null;
  }
}

module.exports = {
  generateClipMetadata,
  generateAllMetadata,
  generateFallbackMetadata,
  fetchYouTubeMetadata,
};
