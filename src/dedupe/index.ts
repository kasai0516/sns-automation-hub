import type { GeneratedPost, PostHistory, DedupeResult, AngleType } from '../config/types.js';
import { jaccardSimilarity, hookSimilarity, hashtagOverlap } from './similarity.js';
import { readHistory, getHistoryByAccount } from '../storage/history.js';
import { logger } from '../utils/logger.js';

/** Similarity thresholds — relaxed to prevent false positives */
const THRESHOLDS = {
  /** Full text similarity threshold (raised to allow more variation) */
  TEXT_SIMILARITY: 0.65,
  /** Hook similarity threshold */
  HOOK_SIMILARITY: 0.75,
  /** Hashtag overlap threshold */
  HASHTAG_OVERLAP: 0.9,
  /** How many recent entries to check per account (reduced from 50) */
  RECENT_COUNT: 15,
  /** Cross-account text similarity */
  CROSS_ACCOUNT_TEXT: 0.55,
  /** URL+angle combo only blocked if within this many recent posts */
  URL_ANGLE_LOOKBACK: 5,
};

/**
 * Check if a generated post is too similar to existing history.
 * Designed to be permissive — it's better to post something slightly similar
 * than to post nothing at all.
 */
export function checkDuplicate(post: GeneratedPost): DedupeResult {
  const allHistory = readHistory();

  if (allHistory.length === 0) {
    return { isDuplicate: false, score: 0, reason: null, matchedHistoryId: null };
  }

  // 1. Check same-account history (recent only)
  const sameAccountHistory = allHistory
    .filter(h => h.account_profile_id === post.account_profile_id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, THRESHOLDS.RECENT_COUNT);

  for (let i = 0; i < sameAccountHistory.length; i++) {
    const entry = sameAccountHistory[i];
    const result = compareWithEntry(post, entry, false, i);
    if (result.isDuplicate) return result;
  }

  // 2. Check cross-account history (stricter for X duplicate policy)
  const crossAccountHistory = allHistory
    .filter(h => h.account_profile_id !== post.account_profile_id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, THRESHOLDS.RECENT_COUNT);

  for (const entry of crossAccountHistory) {
    const result = compareWithEntry(post, entry, true, 999);
    if (result.isDuplicate) return result;
  }

  return { isDuplicate: false, score: 0, reason: null, matchedHistoryId: null };
}

/**
 * Compare a generated post with a history entry.
 * @param recencyIndex How recently this entry was posted (0 = most recent)
 */
function compareWithEntry(
  post: GeneratedPost,
  entry: PostHistory,
  isCrossAccount: boolean,
  recencyIndex: number
): DedupeResult {
  const textThreshold = isCrossAccount
    ? THRESHOLDS.CROSS_ACCOUNT_TEXT
    : THRESHOLDS.TEXT_SIMILARITY;

  // Text similarity
  const textScore = jaccardSimilarity(post.generated_text, entry.generated_text);
  if (textScore >= textThreshold) {
    return {
      isDuplicate: true,
      score: textScore,
      reason: `テキスト類似度が高すぎます (${(textScore * 100).toFixed(1)}% ≥ ${(textThreshold * 100).toFixed(1)}%)${isCrossAccount ? ' [クロスアカウント]' : ''}`,
      matchedHistoryId: entry.id,
    };
  }

  // Same URL + same angle — ONLY block if within the last N posts (not entire history)
  if (
    !isCrossAccount &&
    recencyIndex < THRESHOLDS.URL_ANGLE_LOOKBACK &&
    post.original_url === entry.original_url &&
    post.angle === entry.angle
  ) {
    return {
      isDuplicate: true,
      score: 0.9,
      reason: `直近${THRESHOLDS.URL_ANGLE_LOOKBACK}件内で同じURL×角度の組み合わせ: ${post.angle}`,
      matchedHistoryId: entry.id,
    };
  }

  // Hook similarity — only check very recent posts
  if (recencyIndex < 8) {
    const hookScore = hookSimilarity(post.hook, entry.hook);
    if (hookScore >= THRESHOLDS.HOOK_SIMILARITY) {
      return {
        isDuplicate: true,
        score: hookScore,
        reason: `冒頭フックが類似しています (${(hookScore * 100).toFixed(1)}%)`,
        matchedHistoryId: entry.id,
      };
    }
  }

  return { isDuplicate: false, score: textScore, reason: null, matchedHistoryId: null };
}

/**
 * Get recently used angles for an account to help with distribution
 */
export function getRecentAngles(accountProfileId: string, count: number = 10): AngleType[] {
  const history = getHistoryByAccount(accountProfileId, count);
  return history.map(h => h.angle);
}
