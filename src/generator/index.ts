import type {
  AccountProfile, ServiceProfile, GeneratedPost,
  AngleType, Platform, DedupeResult, XPostMode,
} from '../config/types.js';
import { getServiceForAccount } from '../config/loader.js';
import { fetchMultipleSources } from '../source/fetcher.js';
import { summarizeSources } from '../source/summarizer.js';
import { buildGenerationPrompt, selectAngle, selectHashtags, ANGLE_TEMPLATES } from './prompts.js';
import { callLlm } from './llm-client.js';
import { buildUtmUrl } from '../utm/builder.js';
import { checkDuplicate, getRecentAngles } from '../dedupe/index.js';
import { getLlmProvider } from '../utils/env.js';
import { logger } from '../utils/logger.js';
import { countXLength, splitThread, selectPostMode } from '../utils/x-text.js';

const MAX_RETRY = 5;

interface GenerateResult {
  post: GeneratedPost;
  dedupeResult: DedupeResult;
}

/**
 * Main generation orchestrator
 * 1. Load service profile
 * 2. Fetch & summarize reference URLs
 * 3. Select angle
 * 4. Generate via LLM
 * 5. Deduplicate
 * 6. Return result
 */
export async function generatePost(
  account: AccountProfile,
  overrideAngle?: AngleType
): Promise<GenerateResult> {
  const service = getServiceForAccount(account);

  logger.header(`Generating post for ${account.account_profile_id}`);
  logger.info(`Service: ${service.service_name} | Platform: ${account.platform}`);

  // 1. Fetch reference URLs
  const urls = service.reference_urls
    .filter(r => r.url.startsWith('http'))
    .map(r => r.url);

  let sources = await fetchMultipleSources(urls);

  // Even if fetching fails, we can generate from service profile alone
  if (sources.every(s => !s.title && !s.bodySnippet)) {
    logger.warn('All URL fetches returned empty. Generating from service profile only.');
  }

  // 2. Summarize sources + service info
  const referenceSummary = summarizeSources(sources, service);

  // 3. Select angle (weighted + consecutive suppression)
  const recentAngles = getRecentAngles(account.account_profile_id);
  const angle = overrideAngle || selectAngle(recentAngles);
  const template = ANGLE_TEMPLATES[angle];

  logger.info(`Selected angle: ${template.label} (${angle}) [category: ${template.category}, cta: ${template.ctaStrength}]`);

  // 4. Pick a reference URL for the link
  const targetRefUrl = pickTargetUrl(service);

  // 5. Build UTM URL
  const utmUrl = buildUtmUrl(targetRefUrl, {
    platform: account.platform,
    serviceName: service.service_name,
    angle,
    accountProfileId: account.account_profile_id,
  });

  // 6. Generate with retry (for deduplication)
  const provider = getLlmProvider();
  let lastDedupeResult: DedupeResult = { isDuplicate: false, score: 0, reason: null, matchedHistoryId: null };

  for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
    logger.info(`Generation attempt ${attempt}/${MAX_RETRY}`);

    const prompt = buildGenerationPrompt({
      platform: account.platform,
      angle,
      serviceName: service.service_name,
      referenceSummary,
      bannedPhrases: service.banned_phrases,
      ctaPatterns: service.cta_patterns,
      targetUrl: utmUrl,
      postMode: account.platform === 'x' ? 'thread' : undefined,
    });

    const llmResult = await callLlm(provider, prompt);

    // Validate generated text
    const validationError = validateGeneratedText(llmResult.generated_text, account.platform, service);
    if (validationError) {
      logger.warn(`Validation failed: ${validationError}. Retrying...`);
      continue;
    }

    // Determine post mode based on X-weighted length
    const generatedText = llmResult.generated_text;
    const xLength = account.platform === 'x' ? countXLength(generatedText) : generatedText.length;
    const postMode: XPostMode = account.platform === 'x'
      ? selectPostMode(xLength, account.enable_longform ?? false)
      : 'single';

    // Split into thread if needed
    const threadTexts = postMode === 'thread'
      ? splitThread(generatedText, 280)
      : undefined;

    logger.info(`Post mode: ${postMode} | X-length: ${xLength}${threadTexts ? ` | Thread: ${threadTexts.length} tweets` : ''}`);

    // Select hashtags based on platform & angle
    const hashtags = llmResult.hashtags && llmResult.hashtags.length > 0
      ? llmResult.hashtags
      : selectHashtags(account.platform, angle);

    const post: GeneratedPost = {
      platform: account.platform,
      service_name: service.service_name,
      account_profile_id: account.account_profile_id,
      original_url: targetRefUrl,
      utm_url: utmUrl,
      angle,
      post_type: template.postType,
      hook: llmResult.hook,
      hashtags,
      generated_text: generatedText,
      reference_summary: referenceSummary.slice(0, 500),
      should_reply_with_link: template.includeServiceMention,
      post_mode: postMode,
      thread_texts: threadTexts,
    };

    // 7. Deduplication check
    const dedupeResult = checkDuplicate(post);
    lastDedupeResult = dedupeResult;

    if (!dedupeResult.isDuplicate) {
      logger.success(`Post generated successfully (attempt ${attempt})`);
      return { post, dedupeResult };
    }

    logger.warn(`Duplicate detected: ${dedupeResult.reason}. Retrying...`);
  }

  // If all retries exhausted, return last generated post instead of failing
  // It's better to post something slightly similar than to post nothing
  logger.warn(`Max retries reached (${MAX_RETRY}). Posting anyway — slight similarity is OK.`);
  logger.warn(`Last dedup reason: ${lastDedupeResult.reason}`);

  // Re-generate one final time and force-return it
  const finalPrompt = buildGenerationPrompt({
    platform: account.platform,
    angle,
    serviceName: service.service_name,
    referenceSummary,
    bannedPhrases: service.banned_phrases,
    ctaPatterns: service.cta_patterns,
    targetUrl: utmUrl,
    postMode: account.platform === 'x' ? 'thread' : undefined,
  });

  const finalResult = await callLlm(provider, finalPrompt);
  const finalText = finalResult.generated_text;
  const finalXLen = account.platform === 'x' ? countXLength(finalText) : finalText.length;
  const finalPostMode: XPostMode = account.platform === 'x'
    ? selectPostMode(finalXLen, account.enable_longform ?? false)
    : 'single';
  const finalThreadTexts = finalPostMode === 'thread'
    ? splitThread(finalText, 280)
    : undefined;
  const finalHashtags = finalResult.hashtags && finalResult.hashtags.length > 0
    ? finalResult.hashtags
    : selectHashtags(account.platform, angle);

  const finalPost: GeneratedPost = {
    platform: account.platform,
    service_name: service.service_name,
    account_profile_id: account.account_profile_id,
    original_url: targetRefUrl,
    utm_url: utmUrl,
    angle,
    post_type: template.postType,
    hook: finalResult.hook,
    hashtags: finalHashtags,
    generated_text: finalText,
    reference_summary: referenceSummary.slice(0, 500),
    should_reply_with_link: template.includeServiceMention,
    post_mode: finalPostMode,
    thread_texts: finalThreadTexts,
  };

  logger.success(`Fallback post generated (bypassing dedup). Will post anyway.`);
  return { post: finalPost, dedupeResult: lastDedupeResult };
}

/**
 * Pick a target URL from service reference URLs.
 * Uses weighted random selection to spread across all URL types,
 * reducing URL+angle collision in dedup.
 */
function pickTargetUrl(service: ServiceProfile): string {
  const refs = service.reference_urls;
  if (refs.length === 0) return service.base_url;

  // Weight by type: LP=3, feature=3, article=2, faq=1, pricing=1, other=1
  const typeWeights: Record<string, number> = {
    lp: 3, feature: 3, article: 2, faq: 1, pricing: 1, other: 1,
  };

  const weighted = refs.map(r => ({
    url: r.url,
    weight: typeWeights[r.type] || 1,
  }));

  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of weighted) {
    random -= item.weight;
    if (random <= 0) return item.url;
  }

  return refs[0].url;
}

/**
 * Validation of generated text.
 * Uses X-weighted character count for X platform.
 * Allows longer text for thread/longform modes (will be split later).
 * Returns error message string if invalid, or null if valid.
 */
function validateGeneratedText(
  text: string,
  platform: Platform,
  service: ServiceProfile
): string | null {
  if (!text || text.trim().length === 0) {
    return 'Generated text is empty';
  }

  if (platform === 'x') {
    // For X, use weighted character count
    const xLen = countXLength(text);
    // Allow up to 2000 chars for thread/longform (will be split or posted as longform)
    if (xLen > 2000) {
      return `X text too long even for thread mode (${xLen} X-weighted chars). Max 2000.`;
    }
  } else {
    // Threads max length
    if (text.length > 500) {
      return `Text exceeds 500 char limit (${text.length} chars). Must be shortened.`;
    }
  }

  // Check banned phrases
  for (const phrase of service.banned_phrases) {
    if (text.includes(phrase)) {
      return `Generated text contains banned phrase: "${phrase}"`;
    }
  }

  return null;
}
