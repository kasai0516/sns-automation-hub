import type { Platform, AngleType, UtmParams } from '../config/types.js';

/**
 * Build UTM parameters for a given platform and context
 */
export function buildUtmParams(options: {
  platform: Platform;
  serviceName: string;
  angle?: AngleType;
  hook?: string;
  accountProfileId?: string;
  campaign?: string;
}): UtmParams {
  const {
    platform,
    serviceName,
    angle,
    hook,
    accountProfileId,
    campaign = 'auto_bot',
  } = options;

  const contentParts: string[] = [];
  if (serviceName) contentParts.push(serviceName);
  if (angle) contentParts.push(angle);
  if (accountProfileId) contentParts.push(accountProfileId);

  const params: UtmParams = {
    utm_source: platform,
    utm_medium: 'social',
    utm_campaign: campaign,
  };

  if (contentParts.length > 0) {
    params.utm_content = contentParts.join('_');
  }

  return params;
}

/**
 * Append UTM parameters to a URL
 */
export function appendUtm(baseUrl: string, params: UtmParams): string {
  const url = new URL(baseUrl);

  // Preserve existing params, overwrite UTM ones
  url.searchParams.set('utm_source', params.utm_source);
  url.searchParams.set('utm_medium', params.utm_medium);
  url.searchParams.set('utm_campaign', params.utm_campaign);
  if (params.utm_content) {
    url.searchParams.set('utm_content', params.utm_content);
  }

  return url.toString();
}

/**
 * Convenience: build and append UTM in one step
 */
export function buildUtmUrl(baseUrl: string, options: {
  platform: Platform;
  serviceName: string;
  angle?: AngleType;
  hook?: string;
  accountProfileId?: string;
  campaign?: string;
}): string {
  const params = buildUtmParams(options);
  return appendUtm(baseUrl, params);
}
