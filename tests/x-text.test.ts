import { describe, it, expect } from 'vitest';
import { countXLength, splitThread, selectPostMode } from '../src/utils/x-text.js';

describe('countXLength', () => {
  it('should count ASCII characters as weight 1', () => {
    expect(countXLength('hello')).toBe(5);
    expect(countXLength('abc123')).toBe(6);
  });

  it('should count CJK characters as weight 2', () => {
    expect(countXLength('日本語')).toBe(6); // 3 chars * 2
    expect(countXLength('テスト')).toBe(6); // 3 katakana * 2
    expect(countXLength('全角文字')).toBe(8); // 4 * 2
  });

  it('should count mixed text correctly', () => {
    // "Hello" = 5, "日本語" = 6
    expect(countXLength('Hello日本語')).toBe(11);
  });

  it('should count URLs as 23 characters', () => {
    expect(countXLength('https://example.com')).toBe(23);
    expect(countXLength('https://very-long-url.example.com/path/to/page?q=1&p=2')).toBe(23);
  });

  it('should count URL + text correctly', () => {
    // "Check: " = 7, URL = 23
    expect(countXLength('Check: https://example.com')).toBe(30);
  });

  it('should count newlines as weight 1', () => {
    expect(countXLength('a\nb')).toBe(3);
    expect(countXLength('a\n\nb')).toBe(4);
  });

  it('should handle emoji as weight 2', () => {
    const len = countXLength('🎉');
    expect(len).toBe(2);
  });

  it('should count an empty string as 0', () => {
    expect(countXLength('')).toBe(0);
  });

  it('should handle multiple URLs', () => {
    const text = 'Link1: https://a.com Link2: https://b.com';
    // "Link1: " = 7, URL = 23, " Link2: " = 8, URL = 23
    expect(countXLength(text)).toBe(61);
  });
});

describe('splitThread', () => {
  it('should not split text within 280 X-weighted chars', () => {
    // 50 ASCII chars = 50 X-weight, well under 280
    const text = 'This is a short text for testing purposes only.';
    const result = splitThread(text, 280);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(text);
  });

  it('should not split Japanese text within limit', () => {
    // 100 CJK chars = 200 X-weight, still under 280
    const text = 'あ'.repeat(100);
    const result = splitThread(text, 280);
    expect(result).toHaveLength(1);
  });

  it('should split long text into multiple tweets', () => {
    // Build a text >280 X-weighted chars with sentence boundaries
    const sentences = [];
    for (let i = 0; i < 10; i++) {
      sentences.push(`これはテスト文章の${i + 1}番目です。`);
    }
    const text = sentences.join('');
    const result = splitThread(text, 280);
    expect(result.length).toBeGreaterThanOrEqual(2);
  });

  it('should split at sentence boundaries', () => {
    const text = 'SNS運用は継続が大切です。毎日コツコツ投稿することで、フォロワーとの信頼関係が築けます。特に重要なのは、投稿の質と一貫性です。適当な投稿を量産するよりも、価値ある情報を丁寧に発信することが大切です。アルゴリズムの変化にも注目しておくべきです。最新のトレンドを把握して、効果的な運用を心がけましょう。結果は必ずついてきます。';
    const result = splitThread(text, 280);
    // Each chunk should end with a period or similar
    for (const chunk of result) {
      const trimmed = chunk.trim();
      const lastChar = trimmed[trimmed.length - 1];
      expect(['。', '！', '？', '!', '?', 'す']).toContain(lastChar);
    }
  });

  it('should handle very long single sentence gracefully', () => {
    // A single sentence that exceeds 280 X-weight (best effort)
    const text = 'これは非常に長い文章で一つのピリオドもなく続いていく文字列のテストケースとして使われるものであり分割ポイントが見つからない場合でもクラッシュせずに処理される必要がありますそうでないとシステムが停止してしまう可能性がありますから十分な文字数を確保しておきましょう';
    const result = splitThread(text, 280);
    expect(result.length).toBeGreaterThanOrEqual(1);
  });
});

describe('selectPostMode', () => {
  it('should return single for text <= 280', () => {
    expect(selectPostMode(100)).toBe('single');
    expect(selectPostMode(280)).toBe('single');
  });

  it('should return thread for text > 280 without longform flag', () => {
    expect(selectPostMode(281)).toBe('thread');
    expect(selectPostMode(500)).toBe('thread');
  });

  it('should return longform_experimental when enabled and > 280', () => {
    expect(selectPostMode(500, true)).toBe('longform_experimental');
  });

  it('should return single when longform enabled but text is short', () => {
    expect(selectPostMode(200, true)).toBe('single');
  });
});
