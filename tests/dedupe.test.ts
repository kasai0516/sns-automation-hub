import { describe, it, expect } from 'vitest';
import { jaccardSimilarity, hookSimilarity, hashtagOverlap } from '../src/dedupe/similarity.js';

describe('Jaccard Similarity', () => {
  it('should return 1 for identical texts', () => {
    const score = jaccardSimilarity('こんにちは世界', 'こんにちは世界');
    expect(score).toBe(1);
  });

  it('should return 0 for completely different texts', () => {
    const score = jaccardSimilarity('あいうえお', 'かきくけこ');
    expect(score).toBeLessThan(0.1);
  });

  it('should return intermediate score for similar texts', () => {
    const score = jaccardSimilarity(
      'SEO記事の作成にお困りではないですか？',
      'SEO記事の作成で悩んでいませんか？'
    );
    expect(score).toBeGreaterThan(0.15);
    expect(score).toBeLessThan(1);
  });

  it('should handle empty strings', () => {
    expect(jaccardSimilarity('', '')).toBe(1);
    expect(jaccardSimilarity('abc', '')).toBe(0);
    expect(jaccardSimilarity('', 'abc')).toBe(0);
  });
});

describe('Hook Similarity', () => {
  it('should detect similar hooks', () => {
    const score = hookSimilarity(
      '記事作成の時間を90%削減',
      '記事作成の時間を大幅に削減'
    );
    expect(score).toBeGreaterThan(0.3);
  });

  it('should give low score for different hooks', () => {
    const score = hookSimilarity(
      'フォロワーが増えない悩み',
      'SEOスコアを改善する方法'
    );
    expect(score).toBeLessThan(0.3);
  });

  it('should boost score for matching prefixes', () => {
    const score = hookSimilarity(
      'SEO対策で最も重要なのは',
      'SEO対策で最も大切なのは'
    );
    expect(score).toBeGreaterThan(0.5);
  });
});

describe('Hashtag Overlap', () => {
  it('should return 1 for identical hashtags', () => {
    const score = hashtagOverlap(['#SEO', '#AI'], ['#SEO', '#AI']);
    expect(score).toBe(1);
  });

  it('should return 0 for no overlap', () => {
    const score = hashtagOverlap(['#SEO', '#AI'], ['#SNS', '#マーケティング']);
    expect(score).toBe(0);
  });

  it('should return partial score for partial overlap', () => {
    const score = hashtagOverlap(['#SEO', '#AI', '#ブログ'], ['#SEO', '#マーケティング']);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(1);
  });

  it('should handle empty arrays', () => {
    expect(hashtagOverlap([], [])).toBe(0);
    expect(hashtagOverlap(['#SEO'], [])).toBe(0);
    expect(hashtagOverlap([], ['#SEO'])).toBe(0);
  });

  it('should be case insensitive', () => {
    const score = hashtagOverlap(['#SEO'], ['#seo']);
    expect(score).toBe(1);
  });
});
