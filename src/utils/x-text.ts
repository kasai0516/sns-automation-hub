/**
 * X互換を目指した軽量文字カウンター
 *
 * Xの公式 twitter-text ライブラリとの完全一致は保証しないが、
 * CJK・絵文字・URLの加重カウントでX表示上の文字数に近似する。
 *
 * 加重ルール:
 * - CJK文字（日本語・中国語・韓国語）: 重み2
 * - 絵文字: 重み2
 * - URL（http/https）: 一律23文字（t.co短縮換算）
 * - 改行・ASCII・その他: 重み1
 */

// URL pattern (simplified)
const URL_PATTERN = /https?:\/\/[^\s)}\]]+/g;

// CJK Unified Ideographs + common ranges
const CJK_PATTERN = /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uF900-\uFAFF\uFF00-\uFF9F\uFF65-\uFFDC]/;

// Emoji pattern using Unicode property escapes
const EMOJI_PATTERN = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u;

/** X URL weight constant (t.co shortener) */
const URL_WEIGHT = 23;

/**
 * Count weighted character length for X posting.
 * This is an approximation of X's display character count.
 */
export function countXLength(text: string): number {
  // 1. Extract and replace URLs first
  let processed = text;
  const urls = text.match(URL_PATTERN) || [];
  for (const url of urls) {
    processed = processed.replace(url, '\x00'.repeat(url.length));
  }

  // 2. Count URL weight
  let weight = urls.length * URL_WEIGHT;

  // 3. Count remaining characters
  const chars = [...processed]; // spread to handle multi-byte correctly
  for (const char of chars) {
    if (char === '\x00') continue; // URL placeholder
    if (CJK_PATTERN.test(char)) {
      weight += 2;
    } else if (EMOJI_PATTERN.test(char)) {
      weight += 2;
    } else {
      weight += 1;
    }
  }

  return weight;
}

/**
 * Check if a character position is inside a special sequence
 * that should not be split (URL, @mention, emoji sequence).
 */
interface ProtectedRange {
  start: number;
  end: number;
}

function getProtectedRanges(text: string): ProtectedRange[] {
  const ranges: ProtectedRange[] = [];

  // URLs
  let match: RegExpExecArray | null;
  const urlRegex = /https?:\/\/[^\s)}\]]+/g;
  while ((match = urlRegex.exec(text)) !== null) {
    ranges.push({ start: match.index, end: match.index + match[0].length });
  }

  // @mentions
  const mentionRegex = /@[\w]+/g;
  while ((match = mentionRegex.exec(text)) !== null) {
    ranges.push({ start: match.index, end: match.index + match[0].length });
  }

  // #hashtags
  const hashtagRegex = /#[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+/g;
  while ((match = hashtagRegex.exec(text)) !== null) {
    ranges.push({ start: match.index, end: match.index + match[0].length });
  }

  return ranges;
}

function isInProtectedRange(pos: number, ranges: ProtectedRange[]): boolean {
  return ranges.some(r => pos >= r.start && pos < r.end);
}

/**
 * Split text into thread-safe chunks.
 *
 * Rules:
 * - Split at sentence boundaries (。、！、？、\n\n)
 * - Never split inside a URL, @mention, #hashtag, or emoji sequence
 * - Each chunk must be ≤ maxPerTweet X-weighted characters
 * - Preserves line breaks within chunks
 */
export function splitThread(text: string, maxPerTweet: number = 280): string[] {
  const totalLength = countXLength(text);

  // No splitting needed
  if (totalLength <= maxPerTweet) {
    return [text.trim()];
  }

  const protectedRanges = getProtectedRanges(text);

  // Split into sentences first
  // Match sentence-ending punctuation followed by whitespace/newline, or double newlines
  const sentences = splitIntoSentences(text, protectedRanges);

  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    const combined = currentChunk
      ? currentChunk + sentence
      : sentence;

    if (countXLength(combined) <= maxPerTweet) {
      currentChunk = combined;
    } else {
      // Current chunk is full, push it
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }

      // If single sentence exceeds max, we must include it anyway (best effort)
      if (countXLength(sentence) > maxPerTweet) {
        chunks.push(sentence.trim());
        currentChunk = '';
      } else {
        currentChunk = sentence;
      }
    }
  }

  // Push remaining
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [text.trim()];
}

/**
 * Split text into sentence-level fragments.
 * Respects protected ranges (URLs, mentions, hashtags).
 */
function splitIntoSentences(text: string, protectedRanges: ProtectedRange[]): string[] {
  const sentences: string[] = [];
  let current = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    current += char;

    // Check if we're at a sentence boundary
    const isSentenceEnd =
      (char === '。' || char === '！' || char === '？' || char === '!' || char === '?') &&
      !isInProtectedRange(i, protectedRanges);

    const isDoubleNewline =
      char === '\n' && i + 1 < text.length && text[i + 1] === '\n' &&
      !isInProtectedRange(i, protectedRanges);

    if (isSentenceEnd || isDoubleNewline) {
      if (isDoubleNewline) {
        current += text[i + 1]; // consume second newline
        i++;
      }
      sentences.push(current);
      current = '';
    }
  }

  // Push remaining text
  if (current) {
    sentences.push(current);
  }

  return sentences;
}

/**
 * Determine the appropriate X posting mode based on text length.
 */
export function selectPostMode(
  xLength: number,
  enableLongform: boolean = false
): 'single' | 'thread' | 'longform_experimental' {
  if (xLength <= 280) {
    return 'single';
  }
  if (enableLongform) {
    return 'longform_experimental';
  }
  return 'thread';
}
