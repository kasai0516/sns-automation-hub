import { readFileSync } from 'node:fs';
import type { SnsAdapter } from './base.js';
import type { AccountProfile, GeneratedPost } from '../config/types.js';
import { getCredential, validateAccountCredentials } from '../utils/env.js';
import { logger } from '../utils/logger.js';
import { refreshThreadsToken, checkThreadsTokenValidity } from '../utils/threads-token.js';

/**
 * Threads API adapter
 * Uses Instagram's Threads Publishing API (Content Publishing API)
 */
export class ThreadsAdapter implements SnsAdapter {
  readonly platform = 'threads';

  private readonly baseUrl = 'https://graph.threads.net/v1.0';

  validateCredentials(account: AccountProfile): void {
    validateAccountCredentials(account);
  }

  async publish(post: GeneratedPost, account: AccountProfile, imagePath?: string): Promise<string> {
    this.validateCredentials(account);

    let accessToken = getCredential(account, 'ACCESS_TOKEN');
    const userId = getCredential(account, 'USER_ID');

    // Check token validity and attempt refresh if needed
    const tokenCheck = await checkThreadsTokenValidity(accessToken, userId);
    if (!tokenCheck.valid) {
      logger.warn('Threads token appears invalid or expired. Attempting refresh...');
      try {
        accessToken = await refreshThreadsToken(accessToken);
        // Update the env var for this process so subsequent calls use the refreshed token
        const envKey = `${account.credential_env_prefix}_ACCESS_TOKEN`;
        process.env[envKey] = accessToken;
        logger.success('Token refreshed successfully for this session.');
        logger.warn('⚠️ Remember to update GLOBESNS_THREADS_ACCESS_TOKEN in GitHub Secrets with the new token.');
      } catch (refreshError) {
        logger.error(`Token refresh failed: ${refreshError instanceof Error ? refreshError.message : String(refreshError)}`);
        throw new Error(
          'Threads access token has expired and could not be refreshed. ' +
          'Please generate a new token in the Meta Developer Portal and update GitHub Secrets.'
        );
      }
    }

    logger.info(`Publishing to Threads via ${account.account_name}...`);

    try {
      // For Threads, append the CTA link directly to the post text
      // (Threads API lacks reply permission, so we embed it in the main post)
      let postText = post.generated_text;
      if (post.should_reply_with_link && post.utm_url) {
        postText += `\n\n📩 購入はこちら👇\n${post.utm_url}`;
      }

      let containerId: string;

      if (imagePath) {
        logger.warn('Threads image upload requires a public image URL. Posting as text only.');
        containerId = await this.createTextContainer(userId, accessToken, postText);
      } else {
        containerId = await this.createTextContainer(userId, accessToken, postText);
      }

      // Wait for container to be ready (Threads API requirement)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Publish the container
      const postId = await this.publishContainer(userId, accessToken, containerId);

      logger.success(`Published to Threads: ${postId}`);

      return postId;
    } catch (error) {
      throw new Error(
        `Threads API error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Create a text-only media container
   */
  private async createTextContainer(
    userId: string,
    accessToken: string,
    text: string,
    replyToId?: string
  ): Promise<string> {
    const url = `${this.baseUrl}/${userId}/threads`;
    const bodyParams: Record<string, string> = {
      media_type: 'TEXT',
      text,
      access_token: accessToken,
    };

    if (replyToId) {
      bodyParams.reply_to_id = replyToId;
    }

    const params = new URLSearchParams(bodyParams);

    const response = await fetch(url, {
      method: 'POST',
      body: params,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Failed to create container: ${response.status} ${body}`);
    }

    const data = await response.json() as { id: string };
    return data.id;
  }

  /**
   * Publish the container
   */
  private async publishContainer(
    userId: string,
    accessToken: string,
    containerId: string
  ): Promise<string> {
    const url = `${this.baseUrl}/${userId}/threads_publish`;
    const params = new URLSearchParams({
      creation_id: containerId,
      access_token: accessToken,
    });

    const response = await fetch(url, {
      method: 'POST',
      body: params,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Failed to publish: ${response.status} ${body}`);
    }

    const data = await response.json() as { id: string };
    return data.id;
  }

  /**
   * Post a CTA reply with link under the main Threads post
   */
  private async postCtaReply(
    userId: string,
    accessToken: string,
    parentPostId: string,
    post: GeneratedPost
  ): Promise<void> {
    try {
      // Small delay before reply
      await new Promise(resolve => setTimeout(resolve, 2000));

      const replyText = `📩 購入はこちら👇\n${post.utm_url}`;

      // Create reply container
      const containerId = await this.createTextContainer(
        userId,
        accessToken,
        replyText,
        parentPostId
      );

      // Wait for container to be ready
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Publish the reply
      const replyId = await this.publishContainer(userId, accessToken, containerId);
      logger.success(`CTA reply posted under Threads post ${parentPostId}: ${replyId}`);
    } catch (error) {
      // Don't fail the whole post if the reply fails
      logger.warn(`Failed to post CTA reply on Threads: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
