import { describe, it, expect } from 'vitest';
import { selectAngle, ANGLE_TEMPLATES, PLATFORM_CONSTRAINTS, MODE_GUIDANCE, buildGenerationPrompt } from '../src/generator/prompts.js';
import type { AngleType } from '../src/config/types.js';

describe('Angle Selection', () => {
  it('should return educational for empty history', () => {
    const angle = selectAngle([]);
    expect(angle).toBe('educational');
  });

  it('should avoid recently used angles', () => {
    const recentAngles: AngleType[] = ['educational', 'educational', 'educational'];
    const angle = selectAngle(recentAngles);
    expect(angle).not.toBe('educational');
  });

  it('should return a valid angle type', () => {
    const validAngles: AngleType[] = [
      'pain_point', 'comparison', 'benefit', 'educational',
      'trend', 'platform_tips', 'case_study', 'direct_cta',
    ];
    const angle = selectAngle(['pain_point', 'comparison']);
    expect(validAngles).toContain(angle);
  });
});

describe('Angle Templates', () => {
  it('should have all 8 angle types defined', () => {
    const angles: AngleType[] = [
      'pain_point', 'comparison', 'benefit', 'educational',
      'trend', 'platform_tips', 'case_study', 'direct_cta',
    ];
    for (const angle of angles) {
      expect(ANGLE_TEMPLATES[angle]).toBeDefined();
      expect(ANGLE_TEMPLATES[angle].label).toBeTruthy();
      expect(ANGLE_TEMPLATES[angle].instruction).toBeTruthy();
      expect(ANGLE_TEMPLATES[angle].postType).toBeTruthy();
    }
  });
});

describe('Platform Constraints', () => {
  it('should have X constraints with maxLength 280', () => {
    expect(PLATFORM_CONSTRAINTS.x.maxLength).toBe(280);
    expect(PLATFORM_CONSTRAINTS.x.toneGuidance).toBeTruthy();
  });

  it('should have Threads constraints with maxLength 500', () => {
    expect(PLATFORM_CONSTRAINTS.threads.maxLength).toBe(500);
    expect(PLATFORM_CONSTRAINTS.threads.toneGuidance).toBeTruthy();
  });
});

describe('Mode Guidance', () => {
  it('should have single mode guidance', () => {
    expect(MODE_GUIDANCE.single.label).toBeTruthy();
    expect(MODE_GUIDANCE.single.charGuidance).toContain('280');
  });

  it('should have thread mode guidance', () => {
    expect(MODE_GUIDANCE.thread.label).toBeTruthy();
    expect(MODE_GUIDANCE.thread.charGuidance).toContain('800');
  });

  it('should have longform_experimental mode guidance', () => {
    expect(MODE_GUIDANCE.longform_experimental.label).toBeTruthy();
    expect(MODE_GUIDANCE.longform_experimental.charGuidance).toContain('1000');
  });
});

describe('Prompt Generation', () => {
  it('should build a complete prompt for X', () => {
    const prompt = buildGenerationPrompt({
      platform: 'x',
      angle: 'pain_point',
      serviceName: 'ai-seo-writer',
      referenceSummary: 'テスト参照情報',
      bannedPhrases: ['絶対に', '100%'],
      ctaPatterns: ['詳しくはこちら'],
      targetUrl: 'https://example.com?utm_source=x',
    });

    expect(prompt).toContain('課題提起型');
    expect(prompt).toContain('テスト参照情報');
    expect(prompt).toContain('絶対に');
    expect(prompt).toContain('JSON');
  });

  it('should build Threads prompt with different constraints', () => {
    const prompt = buildGenerationPrompt({
      platform: 'threads',
      angle: 'benefit',
      serviceName: 'globesns',
      referenceSummary: 'テスト',
      bannedPhrases: [],
      ctaPatterns: [],
      targetUrl: 'https://example.com',
    });

    expect(prompt).toContain('Threads');
    expect(prompt).toContain('500');
    expect(prompt).toContain('価値提案型');
  });

  it('should include mode-specific guidance when postMode is set', () => {
    const prompt = buildGenerationPrompt({
      platform: 'x',
      angle: 'educational',
      serviceName: 'test',
      referenceSummary: 'テスト',
      bannedPhrases: [],
      ctaPatterns: [],
      targetUrl: 'https://example.com',
      postMode: 'thread',
    });

    expect(prompt).toContain('スレッド');
    expect(prompt).toContain('800');
  });

  it('should default to single mode for X when no postMode specified', () => {
    const prompt = buildGenerationPrompt({
      platform: 'x',
      angle: 'educational',
      serviceName: 'test',
      referenceSummary: 'テスト',
      bannedPhrases: [],
      ctaPatterns: [],
      targetUrl: 'https://example.com',
    });

    expect(prompt).toContain('single');
    expect(prompt).toContain('280');
  });
});
