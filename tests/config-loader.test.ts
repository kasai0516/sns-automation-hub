import { describe, it, expect } from 'vitest';
import { loadServiceProfiles, loadAccountProfiles, getAccountProfile, getServiceForAccount, getActiveAccounts } from '../src/config/loader.js';

describe('Config Loader', () => {
  it('should load service profiles', () => {
    const services = loadServiceProfiles();
    expect(services.size).toBeGreaterThanOrEqual(2);
    expect(services.has('ai-seo-writer')).toBe(true);
    expect(services.has('globesns')).toBe(true);
  });

  it('should have required fields in service profiles', () => {
    const services = loadServiceProfiles();
    const aiSeo = services.get('ai-seo-writer')!;

    expect(aiSeo.service_name).toBe('ai-seo-writer');
    expect(aiSeo.base_url).toBeTruthy();
    expect(aiSeo.target_audience.length).toBeGreaterThan(0);
    expect(aiSeo.core_benefits.length).toBeGreaterThan(0);
    expect(aiSeo.pain_points.length).toBeGreaterThan(0);
    expect(aiSeo.banned_phrases.length).toBeGreaterThan(0);
    expect(aiSeo.reference_urls.length).toBeGreaterThan(0);
  });

  it('should load account profiles', () => {
    const accounts = loadAccountProfiles();
    expect(accounts.size).toBeGreaterThanOrEqual(4);
    expect(accounts.has('ai-seo-x')).toBe(true);
    expect(accounts.has('ai-seo-threads')).toBe(true);
    expect(accounts.has('globesns-x')).toBe(true);
    expect(accounts.has('globesns-threads')).toBe(true);
  });

  it('should get a specific account profile', () => {
    const account = getAccountProfile('ai-seo-x');
    expect(account.platform).toBe('x');
    expect(account.service_name).toBe('ai-seo-writer');
    expect(account.credential_env_prefix).toBe('AI_SEO_X');
  });

  it('should throw for unknown account profile', () => {
    expect(() => getAccountProfile('nonexistent')).toThrow();
  });

  it('should resolve service for account', () => {
    const account = getAccountProfile('globesns-threads');
    const service = getServiceForAccount(account);
    expect(service.service_name).toBe('globesns');
  });

  it('should filter active accounts by platform', () => {
    const xAccounts = getActiveAccounts('x');
    expect(xAccounts.every(a => a.platform === 'x')).toBe(true);

    const threadsAccounts = getActiveAccounts('threads');
    expect(threadsAccounts.every(a => a.platform === 'threads')).toBe(true);
  });
});
