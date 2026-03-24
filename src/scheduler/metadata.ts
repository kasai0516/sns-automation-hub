import type { AccountProfile } from '../config/types.js';
import { loadAccountProfiles } from '../config/loader.js';

/**
 * Get all accounts that should be posted to based on schedule
 * For now, returns all active accounts. Future: check cron against current time.
 */
export function getScheduledAccounts(): AccountProfile[] {
  const profiles = loadAccountProfiles();
  return [...profiles.values()].filter(p => p.is_active);
}

/**
 * Get schedule info for display
 */
export function getScheduleInfo(): Array<{
  accountProfileId: string;
  platform: string;
  serviceName: string;
  cron: string;
  description: string;
  timezone: string;
  isActive: boolean;
}> {
  const profiles = loadAccountProfiles();
  return [...profiles.values()].map(p => ({
    accountProfileId: p.account_profile_id,
    platform: p.platform,
    serviceName: p.service_name,
    cron: p.posting_schedule.cron,
    description: p.posting_schedule.description,
    timezone: p.timezone,
    isActive: p.is_active,
  }));
}
