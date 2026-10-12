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
            // Display dry-run result with category info
            const angleTemplate = (await import('../generator/prompts.js')).ANGLE_TEMPLATES[post.angle];
            logger.dryRunBox({
              account_profile_id: post.account_profile_id,
              service_name: post.service_name,
              platform: post.platform,
              category: `${angleTemplate?.category || 'unknown'} (${post.angle})`,
              post_type: post.post_type,
              cta_strength: angleTemplate?.ctaStrength ?? 'N/A',
              hook: post.hook,
              hashtags: post.hashtags.length > 0 ? post.hashtags.join(', ') : '(none)',
              hashtag_count: post.hashtags.length,
              generated_text: post.generated_text,
              char_count: post.generated_text.length,
              dedupe_score: dedupeResult.score,
              dedupe_duplicate: dedupeResult.isDuplicate,
              should_reply_with_link: post.should_reply_with_link,
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

// ===== post-text command (hand-written text, no LLM) =====
// Publishes exactly the text given, as a single post, through the account's adapter.
// Added 2026-10-13 for the blog.pentra.jp announcements: the text is written by a person,
// so no generation, no image, no dedupe; history is still recorded.
program
  .command('post-text')
  .description('Publish a hand-written text as-is (single post, no LLM)')
  .requiredOption('--account <id>', 'Account profile ID (e.g. ai-seo-x)')
  .requiredOption('--file <path>', 'UTF-8 text file with the post body')
  .option('--url <url>', 'Link the post is about (recorded in history)', '')
  .option('--mode <mode>', 'Mode: dry-run or publish', 'dry-run')
  .action(async (options) => {
    try {
      const mode = options.mode as string;
      if (mode !== 'dry-run' && mode !== 'publish') {
        logger.error('--mode must be dry-run or publish');
        process.exit(1);
      }
      loadAccountProfiles();
      const account = getAccountProfile(options.account);
      if (!account) {
        logger.error(`Account not found: ${options.account}`);
        process.exit(1);
      }
      const fs = await import('node:fs');
      const text = fs.readFileSync(options.file, 'utf8').replace(/\r\n/g, '\n').trim();
      if (!text) {
        logger.error('The text file is empty');
        process.exit(1);
      }
      const post = {
        platform: account.platform,
        service_name: account.service_name,
        account_profile_id: account.account_profile_id,
        original_url: options.url,
        utm_url: options.url,
        angle: 'soft_promo' as AngleType,
        post_type: 'soft_promo' as const,
        hook: text.split('\n')[0],
        hashtags: [],
        generated_text: text,
        reference_summary: 'hand-written (post-text)',
        should_reply_with_link: false,
        post_mode: 'single' as const,
      };
      if (mode === 'dry-run') {
        logger.header(`post-text dry-run | ${account.account_profile_id} (${account.platform})`);
        logger.info(`chars: ${text.length}`);
        logger.info(text);
        return;
      }
      validateAccountCredentials(account);
      const adapter = getAdapter(account.platform);
      const platformPostId = await adapter.publish(post, account);
      saveToHistory(post, 'published', platformPostId);
      logger.success(`✓ Published: ${account.account_profile_id} → ${platformPostId}`);
    } catch (error) {
      logger.error(`Fatal: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

// Parse and execute
program.parse();
