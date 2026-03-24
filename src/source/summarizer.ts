import type { ExtractedSource, ServiceProfile } from '../config/types.js';
import { logger } from '../utils/logger.js';

/**
 * Summarize extracted sources into a concise reference for LLM prompts
 */
export function summarizeSources(
  sources: ExtractedSource[],
  service: ServiceProfile
): string {
  const parts: string[] = [];

  // Service context
  parts.push(`【サービス概要】${service.description}`);
  parts.push(`【ターゲット】${service.target_audience.join('、')}`);

  // Source-derived info
  for (const source of sources) {
    if (!source.title && !source.bodySnippet) continue;

    const sectionParts: string[] = [];
    if (source.title) {
      sectionParts.push(`タイトル: ${source.title}`);
    }
    if (source.headings.length > 0) {
      sectionParts.push(`見出し: ${source.headings.slice(0, 5).join(' / ')}`);
    }
    if (source.bodySnippet) {
      sectionParts.push(`概要: ${source.bodySnippet.slice(0, 300)}`);
    }
    if (source.benefits.length > 0) {
      sectionParts.push(`ベネフィット: ${source.benefits.slice(0, 5).join(' / ')}`);
    }
    if (source.faqItems.length > 0) {
      sectionParts.push(`FAQ: ${source.faqItems.slice(0, 3).join(' / ')}`);
    }

    parts.push(`\n【参照: ${source.url}】\n${sectionParts.join('\n')}`);
  }

  // Service-defined pain points and differentiators
  if (service.pain_points.length > 0) {
    parts.push(`\n【ターゲットの悩み】${service.pain_points.join(' / ')}`);
  }
  if (service.differentiators.length > 0) {
    parts.push(`【差別化ポイント】${service.differentiators.join(' / ')}`);
  }
  if (service.proof_points.length > 0) {
    parts.push(`【実績】${service.proof_points.join(' / ')}`);
  }

  const summary = parts.join('\n');
  logger.debug(`Summary generated: ${summary.length} chars`);

  return summary;
}

/**
 * Build a compact reference for a single source
 */
export function summarizeSingleSource(source: ExtractedSource): string {
  const parts: string[] = [];

  if (source.title) parts.push(`「${source.title}」`);
  if (source.headings.length > 0) {
    parts.push(`主な見出し: ${source.headings.slice(0, 3).join('、')}`);
  }
  if (source.bodySnippet) {
    parts.push(source.bodySnippet.slice(0, 200));
  }

  return parts.join(' — ');
}
