// ===== Service Profile =====

export interface ServiceProfile {
  service_name: string;
  base_url: string;
  category: string;
  description: string;
  target_audience: string[];
  core_benefits: string[];
  differentiators: string[];
  pain_points: string[];
  proof_points: string[];
  cta_patterns: string[];
  banned_phrases: string[];
  reference_urls: ReferenceUrl[];
  is_active: boolean;
  priority: number;
}

export interface ReferenceUrl {
  url: string;
  label: string;
  type: 'lp' | 'feature' | 'faq' | 'article' | 'pricing' | 'other';
}

// ===== Account Profile =====

export interface AccountProfile {
  account_profile_id: string;
  platform: Platform;
  account_name: string;
  service_name: string;
  credential_env_prefix: string;
  posting_schedule: PostingSchedule;
  timezone: string;
  is_active: boolean;
  /** Feature flag: allow longform_experimental mode (280+ chars single tweet) */
  enable_longform?: boolean;
}

export type Platform = 'x' | 'threads';

export interface PostingSchedule {
  cron: string;
  description: string;
}

// ===== Post Generation =====

/** X posting mode */
export type XPostMode = 'single' | 'thread' | 'longform_experimental';

export type AngleType =
  | 'tips_practical'       // 価値提供: 実用的SNS運用テクニック
  | 'algorithm_insight'    // 価値提供: アルゴリズム解説
  | 'question_engage'      // エンゲージメント: 質問・対話
  | 'soft_promo'           // 柔らか宣伝: 初速設計→サービス接続
  | 'direct_cta';          // 直球宣伝: サービス訴求

/** Content category for impression optimization */
export type ContentCategory = 'value' | 'engage' | 'promo';

export type PostType = 'educational' | 'engagement' | 'soft_promo' | 'direct_cta';

export interface GeneratedPost {
  platform: Platform;
  service_name: string;
  account_profile_id: string;
  original_url: string;
  utm_url: string;
  angle: AngleType;
  post_type: PostType;
  hook: string;
  hashtags: string[];
  generated_text: string;
  reference_summary: string;
  /** Whether this post type should have a reply with CTA link */
  should_reply_with_link: boolean;
  /** X posting mode: single / thread / longform_experimental */
  post_mode: XPostMode;
  /** Thread texts when post_mode is 'thread' */
  thread_texts?: string[];
}

/** Individual tweet within a thread */
export interface ThreadPost {
  index: number;
  text: string;
  x_length: number;
}

// ===== Post History =====

export interface PostHistory {
  id: string;
  platform: Platform;
  account_profile_id: string;
  service_name: string;
  original_url: string;
  utm_url: string;
  angle: AngleType;
  post_type: PostType;
  hook: string;
  hashtags: string[];
  generated_text: string;
  reference_summary: string;
  status: PostStatus;
  scheduled_for: string | null;
  published_at: string | null;
  created_at: string;
  platform_post_id: string | null;
}

export type PostStatus = 'draft' | 'published' | 'failed' | 'skipped';

// ===== Source Extraction =====

export interface ExtractedSource {
  url: string;
  title: string;
  headings: string[];
  bodySnippet: string;
  benefits: string[];
  faqItems: string[];
}

// ===== Deduplication =====

export interface DedupeResult {
  isDuplicate: boolean;
  score: number;
  reason: string | null;
  matchedHistoryId: string | null;
}

// ===== UTM =====

export interface UtmParams {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content?: string;
}

// ===== CLI =====

export interface PostCommandOptions {
  account?: string;
  platform?: string;
  service?: string;
  mode: 'dry-run' | 'publish';
  angle?: AngleType;
}

// ===== LLM =====

export type LlmProvider = 'openai' | 'gemini';

export interface LlmConfig {
  provider: LlmProvider;
  apiKey: string;
  model?: string;
}
