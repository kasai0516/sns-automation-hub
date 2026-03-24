import type { AccountProfile, GeneratedPost } from '../config/types.js';

/**
 * Base interface for SNS platform adapters
 */
export interface SnsAdapter {
  /** Platform name */
  readonly platform: string;

  /**
   * Publish a post to the platform
   * @param imagePath - Optional path to image file to attach
   * @returns Platform-specific post ID
   */
  publish(post: GeneratedPost, account: AccountProfile, imagePath?: string): Promise<string>;

  /**
   * Validate that credentials are available for this account
   */
  validateCredentials(account: AccountProfile): void;
}
