import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ServiceProfile, AccountProfile, Platform } from './types.js';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');
const PROJECT_ROOT = resolve(__dirname, '..', '..');
const CONFIG_DIR = join(PROJECT_ROOT, 'config');

/**
 * Load all service profiles from config/services/
 */
export function loadServiceProfiles(): Map<string, ServiceProfile> {
  const dir = join(CONFIG_DIR, 'services');
  const map = new Map<string, ServiceProfile>();

  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.json')) continue;
    const raw = readFileSync(join(dir, file), 'utf-8');
    const profile: ServiceProfile = JSON.parse(raw);
    map.set(profile.service_name, profile);
  }

  return map;
}

/**
 * Load all account profiles from config/accounts/
 */
export function loadAccountProfiles(): Map<string, AccountProfile> {
  const dir = join(CONFIG_DIR, 'accounts');
  const map = new Map<string, AccountProfile>();

  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.json')) continue;
    const raw = readFileSync(join(dir, file), 'utf-8');
    const profile: AccountProfile = JSON.parse(raw);
    map.set(profile.account_profile_id, profile);
  }

  return map;
}

/**
 * Get a specific account profile by ID
 */
export function getAccountProfile(id: string): AccountProfile {
  const profiles = loadAccountProfiles();
  const profile = profiles.get(id);
  if (!profile) {
    throw new Error(`Account profile "${id}" not found. Available: ${[...profiles.keys()].join(', ')}`);
  }
  return profile;
}

/**
 * Get the service profile linked to an account profile
 */
export function getServiceForAccount(account: AccountProfile): ServiceProfile {
  const services = loadServiceProfiles();
  const service = services.get(account.service_name);
  if (!service) {
    throw new Error(`Service "${account.service_name}" not found for account "${account.account_profile_id}"`);
  }
  return service;
}

/**
 * Get all active account profiles, optionally filtered by platform
 */
export function getActiveAccounts(platform?: Platform): AccountProfile[] {
  const profiles = loadAccountProfiles();
  let accounts = [...profiles.values()].filter(a => a.is_active);

  if (platform) {
    accounts = accounts.filter(a => a.platform === platform);
  }

  return accounts;
}

/**
 * Get all active services
 */
export function getActiveServices(): ServiceProfile[] {
  const profiles = loadServiceProfiles();
  return [...profiles.values()].filter(s => s.is_active);
}

export { PROJECT_ROOT, CONFIG_DIR };
