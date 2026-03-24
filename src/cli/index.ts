#!/usr/bin/env node

import 'dotenv/config';
import { Command } from 'commander';
import { getAccountProfile, getActiveAccounts, loadAccountProfiles } from '../config/loader.js';
import { generatePost } from '../generator/index.js';
import { generatePostImage } from '../generator/image.js';
import { saveToHistory, getRecentHistory, getAllHistory, printHistory } from '../storage/history.js';
import { XAdapter } from '../adapters/x.js';
import { ThreadsAdapter } from '../adapters/threads.js';
import type { SnsAdapter } from '../adapters/base.js';
import { validateEnv, validateAccountCredentials, getLlmProvider, printEnvStatus } from '../utils/env.js';
import { logger } from '../utils/logger.js';
import type { AngleType, Platform } from '../config/types.js';

const program = new Command();

program
  .name('sns-hub')
  .description('SNS Automation Hub — 宣伝投稿の自動生成・投稿CLI')
  .version('0.1.0');

// ===== post command =====
program
  .command('post')
  .description('Generate and optionally publish a post')
  .option('--account <id>', 'Account profile ID (e.g. ai-seo-x)')
  .option('--platform <platform>', 'Platform filter: x, threads, or all')
  .option('--mode <mode>', 'Mode: dry-run or publish', 'dry-run')
  .option('--angle <angle>', 'Override angle type')
  .option('--no-image', 'Skip image generation')
  .action(async (options) => {
    try {
      const mode = options.mode as 'dry-run' | 'publish';

      // Get accounts to process
      const accounts = resolveAccounts(options.account, options.platform);

      if (accounts.length === 0) {
        logger.error('No matching active accounts found.');
        process.exit(1);
      }

      logger.header(`Mode: ${mode} | Accounts: ${accounts.map(a => a.account_profile_id).join(', ')}`);

      // Validate LLM env
      const provider = getLlmProvider();
      validateEnv(provider);

      const failedAccounts: string[] = [];
      let successCount = 0;

      for (const account of accounts) {
        logger.divider();

        try {
          // Validate account credentials for publish mode
          if (mode === 'publish') {
            validateAccountCredentials(account);
          }

          // Generate post
          const { post, dedupeResult } = await generatePost(
            account,
            options.angle as AngleType | undefined
          );

          // Generate image (unless --no-image)
          let imagePath: string | null = null;
          if (options.image !== false) {
            imagePath = await generatePostImage(post);
          }

          if (mode === 'dry-run') {
            // Display dry-run result
            logger.dryRunBox({
              account_profile_id: post.account_profile_id,
              service_name: post.service_name,
              platform: post.platform,
              angle: post.angle,
              post_type: post.post_type,
              hook: post.hook,
              hashtags: post.hashtags,
              generated_text: post.generated_text,
              original_url: post.original_url,
              utm_url: post.utm_url,
              reference_summary: post.reference_summary.slice(0, 300) + '...',
              dedupe_score: dedupeResult.score,
              dedupe_duplicate: dedupeResult.isDuplicate,
              char_count: post.generated_text.length,
              image: imagePath || 'none',
            });
            successCount++;
          } else {
            // Publish
            const adapter = getAdapter(account.platform);
            const platformPostId = await adapter.publish(post, account, imagePath ?? undefined);
            saveToHistory(post, 'published', platformPostId);
            logger.success(`✓ Published: ${account.account_profile_id} → ${platformPostId}`);
            successCount++;
          }
        } catch (error) {
          logger.error(
            `Failed for ${account.account_profile_id}: ${error instanceof Error ? error.message : String(error)}`
          );
          failedAccounts.push(account.account_profile_id);
        }
      }

      logger.divider();

      if (failedAccounts.length > 0) {
        logger.warn(`Failed accounts (${failedAccounts.length}): ${failedAccounts.join(', ')}`);
      }

      if (successCount > 0) {
        logger.success(`Done. ${successCount} succeeded, ${failedAccounts.length} failed.`);
      } else {
        logger.error('All accounts failed.');
        process.exit(1);
      }
    } catch (error) {
      logger.error(`Fatal: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

// ===== validate-env command =====
program
  .command('validate-env')
  .description('Check environment variable status')
  .action(() => {
    printEnvStatus();
  });

// ===== history commands =====
const historyCmd = program
  .command('history')
  .description('View posting history');

historyCmd
  .command('list')
  .description('List all history entries')
  .action(() => {
    const entries = getAllHistory();
    printHistory(entries);
  });

historyCmd
  .command('recent')
  .description('Show recent history entries')
  .option('-n, --count <count>', 'Number of entries', '10')
  .action((options) => {
    const count = parseInt(options.count, 10) || 10;
    const entries = getRecentHistory(count);
    printHistory(entries);
  });

// ===== Helper functions =====

function resolveAccounts(accountId?: string, platform?: string) {
  if (accountId) {
    const account = getAccountProfile(accountId);
    return [account];
  }

  if (platform && platform !== 'all') {
    return getActiveAccounts(platform as Platform);
  }

  return getActiveAccounts();
}

function getAdapter(platform: Platform): SnsAdapter {
  switch (platform) {
    case 'x':
      return new XAdapter();
    case 'threads':
      return new ThreadsAdapter();
    default:
      throw new Error(`Unknown platform: ${platform}`);
  }
}

// Parse and execute
program.parse();
