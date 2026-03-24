import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import type { PostHistory, GeneratedPost, PostStatus } from '../config/types.js';
import { logger } from '../utils/logger.js';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');
const PROJECT_ROOT = resolve(__dirname, '..', '..');
const HISTORY_FILE = join(PROJECT_ROOT, 'data', 'history.json');

/**
 * Read all history entries
 */
export function readHistory(): PostHistory[] {
  if (!existsSync(HISTORY_FILE)) {
    return [];
  }
  const raw = readFileSync(HISTORY_FILE, 'utf-8');
  try {
    return JSON.parse(raw) as PostHistory[];
  } catch {
    logger.warn('Failed to parse history file, returning empty array');
    return [];
  }
}

/**
 * Write history entries to file
 */
function writeHistory(entries: PostHistory[]): void {
  const dir = join(PROJECT_ROOT, 'data');
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(HISTORY_FILE, JSON.stringify(entries, null, 2), 'utf-8');
}

/**
 * Save a generated post as a new history entry
 */
export function saveToHistory(
  post: GeneratedPost,
  status: PostStatus,
  platformPostId?: string
): PostHistory {
  const entries = readHistory();

  const entry: PostHistory = {
    id: randomUUID(),
    platform: post.platform,
    account_profile_id: post.account_profile_id,
    service_name: post.service_name,
    original_url: post.original_url,
    utm_url: post.utm_url,
    angle: post.angle,
    post_type: post.post_type,
    hook: post.hook,
    hashtags: post.hashtags,
    generated_text: post.generated_text,
    reference_summary: post.reference_summary,
    status,
    scheduled_for: null,
    published_at: status === 'published' ? new Date().toISOString() : null,
    created_at: new Date().toISOString(),
    platform_post_id: platformPostId ?? null,
  };

  entries.push(entry);
  writeHistory(entries);

  logger.success(`History saved: ${entry.id} (${status})`);
  return entry;
}

/**
 * Get recent history entries
 */
export function getRecentHistory(count: number = 10): PostHistory[] {
  const entries = readHistory();
  return entries
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, count);
}

/**
 * Get history entries for a specific account
 */
export function getHistoryByAccount(accountProfileId: string, count?: number): PostHistory[] {
  const entries = readHistory();
  const filtered = entries
    .filter(e => e.account_profile_id === accountProfileId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return count ? filtered.slice(0, count) : filtered;
}

/**
 * Get all history entries (for listing)
 */
export function getAllHistory(): PostHistory[] {
  return readHistory().sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

/**
 * Print history entries in a formatted table
 */
export function printHistory(entries: PostHistory[]): void {
  if (entries.length === 0) {
    logger.info('No history entries found.');
    return;
  }

  console.log('\n' + '─'.repeat(100));
  console.log(
    'ID'.padEnd(10) +
    'Platform'.padEnd(10) +
    'Account'.padEnd(20) +
    'Angle'.padEnd(15) +
    'Status'.padEnd(12) +
    'Created At'
  );
  console.log('─'.repeat(100));

  for (const entry of entries) {
    console.log(
      entry.id.slice(0, 8).padEnd(10) +
      entry.platform.padEnd(10) +
      entry.account_profile_id.padEnd(20) +
      entry.angle.padEnd(15) +
      entry.status.padEnd(12) +
      entry.created_at.slice(0, 19)
    );
  }

  console.log('─'.repeat(100));
  console.log(`Total: ${entries.length} entries\n`);
}
