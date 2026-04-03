import { TwitterApi } from 'twitter-api-v2';
import { readFileSync } from 'node:fs';
import type { SnsAdapter } from './base.js';
import type { AccountProfile, GeneratedPost } from '../config/types.js';
import { getCredential, validateAccountCredentials } from '../utils/env.js';
import { logger } from '../utils/logger.js';

export class XAdapter implements SnsAdapter {
  readonly platform = 'x';

  validateCredentials(account: AccountProfile): void {
    validateAccountCredentials(account);
  }

  async publish(post: GeneratedPost, account: AccountProfile, imagePath?: string): Promise<string> {
    this.validateCredentials(account);

    const client = new TwitterApi({
      appKey: getCredential(account, 'API_KEY'),
      appSecret: getCredential(account, 'API_SECRET'),
      accessToken: getCredential(account, 'ACCESS_TOKEN'),
      accessSecret: getCredential(account, 'ACCESS_SECRET'),
    });

    const mode = post.post_mode || 'single';
    logger.info(`Publishing to X via @${account.account_name} [mode: ${mode}]...`);

    try {
      // Upload image if provided (attaches to first tweet only)
      let mediaId: string | undefined;
      if (imagePath) {
        logger.info('Uploading image to X...');
        const imageBuffer = readFileSync(imagePath);
        mediaId = await client.v1.uploadMedia(imageBuffer, {
          mimeType: 'image/png',
        });
        logger.success(`Image uploaded: ${mediaId}`);
      }

      let lastTweetId: string;

      switch (mode) {
        case 'thread':
          lastTweetId = await this.publishThread(client, post, mediaId);
          break;

        case 'longform_experimental':
          lastTweetId = await this.publishLongform(client, post, mediaId);
          break;

        case 'single':
        default:
          lastTweetId = await this.publishSingle(client, post.generated_text, mediaId);
          break;
      }

      // Post CTA link as reply after the last tweet
      if (post.should_reply_with_link && post.utm_url) {
        await this.postCtaReply(client, lastTweetId, post);
      }

      return lastTweetId;
    } catch (error: unknown) {
      // Retry once on 403 — strip hashtags from text and try again
      const is403 = error && typeof error === 'object' && 'code' in error && (error as any).code === 403;
      if (is403) {
        logger.warn('X API 403 Forbidden. Retrying with cleaned text in 3s...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        try {
          // Remove hashtags from text for retry
          const cleanedText = post.generated_text.replace(/#\S+/g, '').replace(/\s{2,}/g, ' ').trim();
          const retryId = await this.publishSingle(client, cleanedText);
          logger.success(`Retry succeeded (hashtags removed): ${retryId}`);
          return retryId;
        } catch (retryError) {
          logger.error('Retry also failed.');
          this.handlePublishError(retryError, post);
          throw new Error(
            `X API error (retry failed): ${retryError instanceof Error ? retryError.message : String(retryError)}`
          );
        }
      }

      this.handlePublishError(error, post);
      throw new Error(
        `X API error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Publish a single tweet
   */
  private async publishSingle(
    client: TwitterApi,
    text: string,
    mediaId?: string,
  ): Promise<string> {
    logger.info(`Tweet text length: ${text.length} chars`);

    // NOTE: X Free tier only supports string form for v2.tweet()
    const result = mediaId
      ? await client.v2.tweet({ text, media: { media_ids: [mediaId] as [string] } })
      : await client.v2.tweet(text);

    if (!result.data?.id) {
      throw new Error('X API returned no post ID');
    }

    logger.success(`Published single tweet: ${result.data.id}${mediaId ? ' (with image)' : ''}`);
    return result.data.id;
  }

  /**
   * Publish a thread (reply chain)
   */
  private async publishThread(
    client: TwitterApi,
    post: GeneratedPost,
    mediaId?: string,
  ): Promise<string> {
    const threadTexts = post.thread_texts;
    if (!threadTexts || threadTexts.length === 0) {
      // Fallback to single if no thread texts
      logger.warn('No thread_texts found, falling back to single mode');
      return this.publishSingle(client, post.generated_text, mediaId);
    }

    logger.info(`Publishing thread: ${threadTexts.length} tweets`);
    let previousTweetId: string | undefined;

    for (let i = 0; i < threadTexts.length; i++) {
      const tweetText = threadTexts[i];
      logger.info(`  Tweet ${i + 1}/${threadTexts.length}: ${tweetText.length} chars`);

      // First tweet gets the image
      const tweetMediaId = i === 0 ? mediaId : undefined;

      let result;
      if (previousTweetId) {
        // Reply to previous tweet in chain
        result = tweetMediaId
          ? await client.v2.tweet({
              text: tweetText,
              reply: { in_reply_to_tweet_id: previousTweetId },
              media: { media_ids: [tweetMediaId] as [string] },
            })
          : await client.v2.tweet({
              text: tweetText,
              reply: { in_reply_to_tweet_id: previousTweetId },
            });
      } else {
        // First tweet in thread
        result = tweetMediaId
          ? await client.v2.tweet({ text: tweetText, media: { media_ids: [tweetMediaId] as [string] } })
          : await client.v2.tweet(tweetText);
      }

      if (!result.data?.id) {
        throw new Error(`X API returned no post ID for tweet ${i + 1}`);
      }

      previousTweetId = result.data.id;
      logger.success(`  Thread tweet ${i + 1} published: ${previousTweetId}`);

      // Small delay between thread tweets to avoid rate limits
      if (i < threadTexts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    return previousTweetId!;
  }

  /**
   * Publish longform (experimental): try single >280 tweet, fallback to thread
   */
  private async publishLongform(
    client: TwitterApi,
    post: GeneratedPost,
    mediaId?: string,
  ): Promise<string> {
    logger.info('Attempting longform_experimental (single >280 char tweet)...');

    try {
      const tweetId = await this.publishSingle(client, post.generated_text, mediaId);
      logger.success('Longform single tweet succeeded!');
      return tweetId;
    } catch (error) {
      logger.warn(`Longform single tweet failed: ${error instanceof Error ? error.message : String(error)}`);
      logger.info('Falling back to thread mode...');
      return this.publishThread(client, post, mediaId);
    }
  }

  /**
   * Write error details to file and log for debugging
   */
  private async handlePublishError(error: unknown, post: GeneratedPost): Promise<void> {
    const errInfo: any = { timestamp: new Date().toISOString(), postMode: post.post_mode };
    if (error && typeof error === 'object') {
      const e = error as any;
      errInfo.code = e.code;
      errInfo.data = e.data;
      errInfo.errors = e.errors;
      errInfo.message = e.message;
      errInfo.rateLimit = e.rateLimit;
      errInfo.type = e.constructor?.name;
      errInfo.tweetTextLength = post.generated_text.length;
      errInfo.tweetTextPreview = post.generated_text.slice(0, 200);
    }
    const { writeFileSync: wfs } = await import('node:fs');
    wfs('x_error_debug.json', JSON.stringify(errInfo, null, 2), 'utf-8');

    if (error && typeof error === 'object') {
      const errObj = error as any;
      if (errObj.data) logger.error(`X API error data: ${JSON.stringify(errObj.data)}`);
      if (errObj.errors) logger.error(`X API errors: ${JSON.stringify(errObj.errors)}`);
    }

    if (error && typeof error === 'object' && 'code' in error) {
      const apiError = error as { code: number; message?: string; data?: any; rateLimit?: any };
      if (apiError.code === 402) {
        const resetTime = apiError.rateLimit?.reset
          ? new Date(apiError.rateLimit.reset * 1000).toISOString()
          : 'unknown';
        throw new Error(
          `X API credits depleted (Free Tier monthly limit reached). Credits reset at: ${resetTime}. ` +
          `Consider upgrading to Basic tier or reducing post frequency.`
        );
      }
      if (apiError.code === 429) {
        throw new Error(`X API rate limit reached. Please wait before retrying.`);
      }
      if (apiError.code === 403) {
        throw new Error(`X API forbidden: ${apiError.message || 'Check API permissions'}`);
      }
    }
  }

  /**
   * Post a CTA reply with the UTM link under the main tweet
   */
  private async postCtaReply(
    rwClient: any,
    parentTweetId: string,
    post: GeneratedPost
  ): Promise<void> {
    try {
      // Small delay to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 1500));

      const replyText = `📩 購入はこちら👇\n${post.utm_url}`;

      await rwClient.v2.tweet({
        text: replyText,
        reply: { in_reply_to_tweet_id: parentTweetId },
      });

      logger.success(`CTA reply posted under tweet ${parentTweetId}`);
    } catch (error) {
      // Don't fail the whole post if the reply fails
      logger.warn(`Failed to post CTA reply: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
