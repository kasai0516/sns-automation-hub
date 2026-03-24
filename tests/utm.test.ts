import { describe, it, expect } from 'vitest';
import { buildUtmParams, appendUtm, buildUtmUrl } from '../src/utm/builder.js';

describe('UTM Builder', () => {
  it('should build basic UTM params', () => {
    const params = buildUtmParams({
      platform: 'x',
      serviceName: 'ai-seo-writer',
    });

    expect(params.utm_source).toBe('x');
    expect(params.utm_medium).toBe('social');
    expect(params.utm_campaign).toBe('auto_bot');
    expect(params.utm_content).toBe('ai-seo-writer');
  });

  it('should include angle and accountProfileId in utm_content', () => {
    const params = buildUtmParams({
      platform: 'threads',
      serviceName: 'globesns',
      angle: 'pain_point',
      accountProfileId: 'globesns-threads',
    });

    expect(params.utm_source).toBe('threads');
    expect(params.utm_content).toBe('globesns_pain_point_globesns-threads');
  });

  it('should append UTM params to URL', () => {
    const result = appendUtm('https://example.com/page', {
      utm_source: 'x',
      utm_medium: 'social',
      utm_campaign: 'auto_bot',
    });

    expect(result).toContain('utm_source=x');
    expect(result).toContain('utm_medium=social');
    expect(result).toContain('utm_campaign=auto_bot');
  });

  it('should preserve existing URL params', () => {
    const result = appendUtm('https://example.com/page?ref=test', {
      utm_source: 'x',
      utm_medium: 'social',
      utm_campaign: 'auto_bot',
    });

    expect(result).toContain('ref=test');
    expect(result).toContain('utm_source=x');
  });

  it('should build full UTM URL in one step', () => {
    const result = buildUtmUrl('https://example.com', {
      platform: 'x',
      serviceName: 'ai-seo-writer',
      angle: 'benefit',
      accountProfileId: 'ai-seo-x',
    });

    expect(result).toContain('utm_source=x');
    expect(result).toContain('utm_medium=social');
    expect(result).toContain('utm_campaign=auto_bot');
    expect(result).toContain('utm_content=ai-seo-writer_benefit_ai-seo-x');
  });

  it('should use custom campaign', () => {
    const params = buildUtmParams({
      platform: 'x',
      serviceName: 'test',
      campaign: 'launch_2024',
    });

    expect(params.utm_campaign).toBe('launch_2024');
  });
});
