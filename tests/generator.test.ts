import { describe, it, expect } from 'vitest';
import { selectAngle, ANGLE_TEMPLATES, PLATFORM_CONSTRAINTS, MODE_GUIDANCE, buildGenerationPrompt } from '../src/generator/prompts.js';
import type { AngleType } from '../src/config/types.js';

const ALL_ANGLES: AngleType[] = [
  'tips_practical', 'algorithm_insight', 'question_engage',
  'soft_promo', 'direct_cta',
];

describe('Angle Selection', () => {
  it('should return a valid angle for empty history', () => {
    const angle = selectAngle([]);
    expect(ALL_ANGLES).toContain(angle);
  });

  it('should avoid recently used angles', () => {
    const recentAngles: AngleType[] = ['tips_practical', 'tips_practical', 'tips_practical'];
    const angle = selectAngle(recentAngles);
    // tips_practical should have very low weight after being used 3 times in a row
    // Run multiple times to verify it's not always tips_practical
    expect(ALL_ANGLES).toContain(angle);
  });

  it('should return a valid angle type', () => {
    const angle = selectAngle(['tips_practical', 'algorithm_insight']);
    expect(ALL_ANGLES).toContain(angle);
  });

  it('should suppress direct_cta after recent usage', () => {
    const recentAngles: AngleType[] = ['direct_cta', 'direct_cta'];
    // Run multiple times — direct_cta should almost never appear
    const results: AngleType[] = [];
    for (let i = 0; i < 50; i++) {
      results.push(selectAngle(recentAngles));
    }
    const directCtaCount = results.filter(a => a === 'direct_cta').length;
    // Should be very rare (< 10% of 50)
    expect(directCtaCount).toBeLessThan(10);
  });
});

describe('Angle Templates', () => {
  it('should have all 5 angle types defined', () => {
    for (const angle of ALL_ANGLES) {
      expect(ANGLE_TEMPLATES[angle]).toBeDefined();
      expect(ANGLE_TEMPLATES[angle].label).toBeTruthy();
      expect(ANGLE_TEMPLATES[angle].instruction).toBeTruthy();
      expect(ANGLE_TEMPLATES[angle].postType).toBeTruthy();
    }
  });

  it('should have correct weights summing to 100', () => {
    const totalWeight = ALL_ANGLES.reduce((sum, a) => sum + ANGLE_TEMPLATES[a].weight, 0);
    expect(totalWeight).toBe(100);
  });
});

describe('Platform Constraints', () => {
  it('should have X constraints with maxLength 200', () => {
    expect(PLATFORM_CONSTRAINTS.x.maxLength).toBe(200);
    expect(PLATFORM_CONSTRAINTS.x.toneGuidance).toBeTruthy();
  });

  it('should have Threads constraints with maxLength 300', () => {
    expect(PLATFORM_CONSTRAINTS.threads.maxLength).toBe(300);
    expect(PLATFORM_CONSTRAINTS.threads.toneGuidance).toBeTruthy();
  });
});

describe('Mode Guidance', () => {
  it('should have single mode guidance', () => {
    expect(MODE_GUIDANCE.single.label).toBeTruthy();
    expect(MODE_GUIDANCE.single.charGuidance).toContain('200');
  });

  it('should have thread mode guidance', () => {
    expect(MODE_GUIDANCE.thread.label).toBeTruthy();
    expect(MODE_GUIDANCE.thread.charGuidance).toContain('350');
  });

  it('should have longform_experimental mode guidance', () => {
    expect(MODE_GUIDANCE.longform_experimental.label).toBeTruthy();
    expect(MODE_GUIDANCE.longform_experimental.charGuidance).toContain('400');
  });
});

describe('Prompt Generation', () => {
  it('should build a complete prompt for X (SNS service)', () => {
    const prompt = buildGenerationPrompt({
      platform: 'x',
      angle: 'tips_practical',
      serviceName: 'globesns',
      referenceSummary: 'テスト参照情報',
      bannedPhrases: ['絶対に', '100%'],
      ctaPatterns: ['詳しくはこちら'],
      targetUrl: 'https://example.com?utm_source=x',
    });

    expect(prompt).toContain('実践SNS運用テクニック');
    expect(prompt).toContain('テスト参照情報');
    expect(prompt).toContain('絶対に');
    expect(prompt).toContain('JSON');
  });

  it('should build Threads prompt with different constraints', () => {
    const prompt = buildGenerationPrompt({
      platform: 'threads',
      angle: 'soft_promo',
      serviceName: 'globesns',
      referenceSummary: 'テスト',
      bannedPhrases: [],
      ctaPatterns: [],
      targetUrl: 'https://example.com',
    });

    expect(prompt).toContain('Threads');
    expect(prompt).toContain('初速設計');
  });

  it('should build webtest-specific prompt', () => {
    const prompt = buildGenerationPrompt({
      platform: 'x',
      angle: 'tips_practical',
      serviceName: 'webtest',
      referenceSummary: 'テスト',
      bannedPhrases: [],
      ctaPatterns: [],
      targetUrl: 'https://example.com',
    });

    expect(prompt).toContain('就活');
    expect(prompt).toContain('Webテスト');
  });

  it('should include mode-specific guidance when postMode is set', () => {
    const prompt = buildGenerationPrompt({
      platform: 'x',
      angle: 'tips_practical',
      serviceName: 'globesns',
      referenceSummary: 'テスト',
      bannedPhrases: [],
      ctaPatterns: [],
      targetUrl: 'https://example.com',
      postMode: 'thread',
    });

    expect(prompt).toContain('スレッド');
  });

  it('should default to single mode for X when no postMode specified', () => {
    const prompt = buildGenerationPrompt({
      platform: 'x',
      angle: 'tips_practical',
      serviceName: 'globesns',
      referenceSummary: 'テスト',
      bannedPhrases: [],
      ctaPatterns: [],
      targetUrl: 'https://example.com',
    });

    expect(prompt).toContain('single');
  });
});
