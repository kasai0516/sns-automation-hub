import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { GeneratedPost, PostHistory } from '../src/config/types.js';

// We test the history module by directly manipulating the history file
// since the module reads from a fixed path

const __dirname = resolve(fileURLToPath(import.meta.url), '..');
const PROJECT_ROOT = resolve(__dirname, '..');
const HISTORY_FILE = join(PROJECT_ROOT, 'data', 'history.json');
const BACKUP_FILE = join(PROJECT_ROOT, 'data', 'history.backup.json');

describe('History Storage', () => {
  beforeEach(() => {
    // Backup existing history
    if (existsSync(HISTORY_FILE)) {
      const content = readFileSync(HISTORY_FILE, 'utf-8');
      writeFileSync(BACKUP_FILE, content);
    }
    // Start with empty history
    writeFileSync(HISTORY_FILE, '[]');
  });

  afterEach(() => {
    // Restore backup
    if (existsSync(BACKUP_FILE)) {
      const content = readFileSync(BACKUP_FILE, 'utf-8');
      writeFileSync(HISTORY_FILE, content);
      rmSync(BACKUP_FILE);
    }
  });

  it('should start with empty history', async () => {
    const { readHistory } = await import('../src/storage/history.js');
    const entries = readHistory();
    expect(entries).toEqual([]);
  });

  it('should save and read history entry', async () => {
    const { saveToHistory, readHistory } = await import('../src/storage/history.js');

    const post: GeneratedPost = {
      platform: 'x',
      service_name: 'ai-seo-writer',
      account_profile_id: 'ai-seo-x',
      original_url: 'https://example.com',
      utm_url: 'https://example.com?utm_source=x',
      angle: 'benefit',
      post_type: 'educational',
      hook: 'テストフック',
      hashtags: ['#SEO'],
      generated_text: 'テスト投稿文',
      reference_summary: 'テスト要約',
    };

    const entry = saveToHistory(post, 'published', 'post_123');

    expect(entry.id).toBeTruthy();
    expect(entry.status).toBe('published');
    expect(entry.platform_post_id).toBe('post_123');
    expect(entry.published_at).toBeTruthy();

    const entries = readHistory();
    expect(entries.length).toBe(1);
    expect(entries[0].generated_text).toBe('テスト投稿文');
  });

  it('should get recent history', async () => {
    const { saveToHistory, getRecentHistory } = await import('../src/storage/history.js');

    const post: GeneratedPost = {
      platform: 'x',
      service_name: 'ai-seo-writer',
      account_profile_id: 'ai-seo-x',
      original_url: 'https://example.com',
      utm_url: 'https://example.com?utm_source=x',
      angle: 'pain_point',
      post_type: 'problem_awareness',
      hook: 'Hook 1',
      hashtags: [],
      generated_text: 'Text 1',
      reference_summary: 'Summary',
    };

    saveToHistory(post, 'published');
    saveToHistory({ ...post, hook: 'Hook 2', generated_text: 'Text 2' }, 'published');

    const recent = getRecentHistory(1);
    expect(recent.length).toBe(1);
  });
});
