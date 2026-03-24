import * as cheerio from 'cheerio';
import type { ExtractedSource } from '../config/types.js';
import { logger } from '../utils/logger.js';

/**
 * Fetch and extract structured content from a URL
 */
export async function fetchSource(url: string): Promise<ExtractedSource> {
  logger.info(`Fetching source: ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SNSAutomationHub/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ja,en;q=0.9',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    return extractFromHtml(url, html);
  } catch (error) {
    logger.warn(`Failed to fetch ${url}: ${error instanceof Error ? error.message : String(error)}`);

    // Return minimal fallback so generation can still proceed
    return {
      url,
      title: '',
      headings: [],
      bodySnippet: '',
      benefits: [],
      faqItems: [],
    };
  }
}

/**
 * Extract structured data from HTML
 */
function extractFromHtml(url: string, html: string): ExtractedSource {
  const $ = cheerio.load(html);

  // Remove scripts and styles
  $('script, style, nav, footer, header').remove();

  // Title
  const title = $('title').text().trim() ||
    $('h1').first().text().trim() ||
    $('meta[property="og:title"]').attr('content')?.trim() ||
    '';

  // Headings (h1, h2, h3)
  const headings: string[] = [];
  $('h1, h2, h3').each((_, el) => {
    const text = $(el).text().trim();
    if (text && text.length < 200) {
      headings.push(text);
    }
  });

  // Body snippet (first 1000 chars of main content)
  const bodyText = $('main, article, .content, [role="main"], body')
    .first()
    .text()
    .replace(/\s+/g, ' ')
    .trim();
  const bodySnippet = bodyText.slice(0, 1000);

  // Look for benefit-like items (list items in certain sections)
  const benefits: string[] = [];
  $('li').each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 10 && text.length < 200) {
      benefits.push(text);
    }
  });

  // Look for FAQ items
  const faqItems: string[] = [];
  $('[itemtype*="FAQ"], .faq, #faq, [class*="faq"]').find('dt, summary, [itemprop="name"]').each((_, el) => {
    const text = $(el).text().trim();
    if (text) faqItems.push(text);
  });

  logger.debug(`Extracted: title="${title}", ${headings.length} headings, ${benefits.length} list items`);

  return {
    url,
    title,
    headings: headings.slice(0, 20),
    bodySnippet,
    benefits: benefits.slice(0, 15),
    faqItems: faqItems.slice(0, 10),
  };
}

/**
 * Fetch multiple sources and merge results
 */
export async function fetchMultipleSources(urls: string[]): Promise<ExtractedSource[]> {
  const results: ExtractedSource[] = [];

  for (const url of urls) {
    const source = await fetchSource(url);
    results.push(source);
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return results;
}
