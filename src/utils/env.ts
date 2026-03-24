import type { AccountProfile, LlmProvider } from '../config/types.js';
import { logger } from './logger.js';

interface EnvRequirement {
  key: string;
  required: boolean;
  description: string;
}

/**
 * Validate that all required environment variables are set
 */
export function validateEnv(provider: LlmProvider): void {
  const missing: string[] = [];

  // LLM requirements
  if (provider === 'openai') {
    if (!process.env.OPENAI_API_KEY) missing.push('OPENAI_API_KEY');
  } else if (provider === 'gemini') {
    if (!process.env.GEMINI_API_KEY) missing.push('GEMINI_API_KEY');
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map(k => `  - ${k}`).join('\n')}\n\nCopy .env.example to .env and fill in the values.`
    );
  }
}

/**
 * Validate credentials for a specific account profile
 */
export function validateAccountCredentials(account: AccountProfile): void {
  const prefix = account.credential_env_prefix;
  const missing: string[] = [];

  if (account.platform === 'x') {
    const required = ['API_KEY', 'API_SECRET', 'ACCESS_TOKEN', 'ACCESS_SECRET'];
    for (const suffix of required) {
      const key = `${prefix}_${suffix}`;
      if (!process.env[key]) missing.push(key);
    }
  } else if (account.platform === 'threads') {
    const required = ['ACCESS_TOKEN', 'USER_ID'];
    for (const suffix of required) {
      const key = `${prefix}_${suffix}`;
      if (!process.env[key]) missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing credentials for account "${account.account_profile_id}":\n${missing.map(k => `  - ${k}`).join('\n')}`
    );
  }
}

/**
 * Get credential value for an account
 */
export function getCredential(account: AccountProfile, suffix: string): string {
  const key = `${account.credential_env_prefix}_${suffix}`;
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

/**
 * Get the LLM provider from env
 */
export function getLlmProvider(): LlmProvider {
  const provider = process.env.LLM_PROVIDER as LlmProvider | undefined;
  if (!provider || !['openai', 'gemini'].includes(provider)) {
    throw new Error('LLM_PROVIDER must be set to "openai" or "gemini"');
  }
  return provider;
}

/**
 * Print all env status for diagnostics
 */
export function printEnvStatus(): void {
  logger.header('Environment Variables Status');

  const checks: EnvRequirement[] = [
    { key: 'LLM_PROVIDER', required: true, description: 'LLM Provider (openai/gemini)' },
    { key: 'OPENAI_API_KEY', required: false, description: 'OpenAI API Key' },
    { key: 'GEMINI_API_KEY', required: false, description: 'Gemini API Key' },
    { key: 'AI_SEO_X_API_KEY', required: false, description: 'AI SEO Writer × X API Key' },
    { key: 'AI_SEO_X_API_SECRET', required: false, description: 'AI SEO Writer × X API Secret' },
    { key: 'AI_SEO_X_ACCESS_TOKEN', required: false, description: 'AI SEO Writer × X Access Token' },
    { key: 'AI_SEO_X_ACCESS_SECRET', required: false, description: 'AI SEO Writer × X Access Secret' },
    { key: 'AI_SEO_THREADS_ACCESS_TOKEN', required: false, description: 'AI SEO Writer × Threads Token' },
    { key: 'AI_SEO_THREADS_USER_ID', required: false, description: 'AI SEO Writer × Threads User ID' },
    { key: 'GLOBESNS_X_API_KEY', required: false, description: 'GlobeSNS × X API Key' },
    { key: 'GLOBESNS_X_API_SECRET', required: false, description: 'GlobeSNS × X API Secret' },
    { key: 'GLOBESNS_X_ACCESS_TOKEN', required: false, description: 'GlobeSNS × X Access Token' },
    { key: 'GLOBESNS_X_ACCESS_SECRET', required: false, description: 'GlobeSNS × X Access Secret' },
    { key: 'GLOBESNS_THREADS_ACCESS_TOKEN', required: false, description: 'GlobeSNS × Threads Token' },
    { key: 'GLOBESNS_THREADS_USER_ID', required: false, description: 'GlobeSNS × Threads User ID' },
  ];

  for (const check of checks) {
    const value = process.env[check.key];
    const status = value ? '✓ SET' : '✗ NOT SET';
    const color = value ? '\x1b[32m' : '\x1b[31m';
    console.log(`  ${color}${status}\x1b[0m  ${check.key} — ${check.description}`);
  }
}
