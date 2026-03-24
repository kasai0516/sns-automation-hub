import { readFileSync } from 'node:fs';
import type { SnsAdapter } from './base.js';
import type { AccountProfile, GeneratedPost } from '../config/types.js';
import { getCredential, validateAccountCredentials } from '../utils/env.js';
import { logger } from '../utils/logger.js';

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

    const accessToken = getCredential(account, 'ACCESS_TOKEN');
    const userId = getCredential(account, 'USER_ID');

    logger.info(`Publishing to Threads via ${account.account_name}...`);

    try {
      let containerId: string;

      if (imagePath) {
        // For image posts, we need to host the image publicly
        // Threads API requires a public URL for images
        // For now, post as text with image URL noted in logs
        logger.warn('Threads image upload requires a public image URL. Posting as text only.');
        containerId = await this.createTextContainer(userId, accessToken, post.generated_text);
      } else {
        containerId = await this.createTextContainer(userId, accessToken, post.generated_text);
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
    text: string
  ): Promise<string> {
    const url = `${this.baseUrl}/${userId}/threads`;
    const params = new URLSearchParams({
      media_type: 'TEXT',
      text,
      access_token: accessToken,
    });

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
}
