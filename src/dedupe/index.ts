import type { GeneratedPost, PostHistory, DedupeResult, AngleType } from '../config/types.js';
import { jaccardSimilarity, hookSimilarity, hashtagOverlap } from './similarity.js';
import { readHistory, getHistoryByAccount } from '../storage/history.js';
import { logger } from '../utils/logger.js';

/** Similarity thresholds */
const THRESHOLDS = {
  /** Full text similarity threshold */
  TEXT_SIMILARITY: 0.6,
  /** Hook similarity threshold */
  HOOK_SIMILARITY: 0.7,
  /** Hashtag overlap threshold */
  HASHTAG_OVERLAP: 0.8,
  /** How many recent entries to check per account */
  RECENT_COUNT: 50,
  /** Cross-account text similarity (stricter for X policy) */
  CROSS_ACCOUNT_TEXT: 0.5,
};

/**
 * Check if a generated post is too similar to existing history
 */
export function checkDuplicate(post: GeneratedPost): DedupeResult {
  const allHistory = readHistory();

  if (allHistory.length === 0) {
    return { isDuplicate: false, score: 0, reason: null, matchedHistoryId: null };
  }

  // 1. Check same-account history
  const sameAccountHistory = allHistory
    .filter(h => h.account_profile_id === post.account_profile_id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, THRESHOLDS.RECENT_COUNT);

  for (const entry of sameAccountHistory) {
    const result = compareWithEntry(post, entry, false);
    if (result.isDuplicate) return result;
  }

  // 2. Check cross-account history (stricter for X duplicate policy)
  const crossAccountHistory = allHistory
    .filter(h => h.account_profile_id !== post.account_profile_id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, THRESHOLDS.RECENT_COUNT);

  for (const entry of crossAccountHistory) {
    const result = compareWithEntry(post, entry, true);
    if (result.isDuplicate) return result;
  }

  return { isDuplicate: false, score: 0, reason: null, matchedHistoryId: null };
}

/**
 * Compare a generated post with a history entry
 */
function compareWithEntry(
  post: GeneratedPost,
  entry: PostHistory,
  isCrossAccount: boolean
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

  // Same URL + same angle (within same account)
  if (!isCrossAccount && post.original_url === entry.original_url && post.angle === entry.angle) {
    return {
      isDuplicate: true,
      score: 1,
      reason: `同じURLと同じ訴求角度の組み合わせは重複です: ${post.original_url} × ${post.angle}`,
      matchedHistoryId: entry.id,
    };
  }

  // Hook similarity
  const hookScore = hookSimilarity(post.hook, entry.hook);
  if (hookScore >= THRESHOLDS.HOOK_SIMILARITY) {
    return {
      isDuplicate: true,
      score: hookScore,
      reason: `冒頭フックが類似しています (${(hookScore * 100).toFixed(1)}%)`,
      matchedHistoryId: entry.id,
    };
  }

  // Hashtag overlap
  const tagScore = hashtagOverlap(post.hashtags, entry.hashtags);
  if (tagScore >= THRESHOLDS.HASHTAG_OVERLAP && textScore > 0.3) {
    return {
      isDuplicate: true,
      score: tagScore,
      reason: `ハッシュタグの重複が多く、テキストも類似しています`,
      matchedHistoryId: entry.id,
    };
  }

  return { isDuplicate: false, score: Math.max(textScore, hookScore), reason: null, matchedHistoryId: null };
}

/**
 * Get recently used angles for an account to help with distribution
 */
export function getRecentAngles(accountProfileId: string, count: number = 10): AngleType[] {
  const history = getHistoryByAccount(accountProfileId, count);
  return history.map(h => h.angle);
}
