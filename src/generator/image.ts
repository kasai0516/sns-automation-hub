import OpenAI from 'openai';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { GeneratedPost } from '../config/types.js';
import { logger } from '../utils/logger.js';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');
const PROJECT_ROOT = resolve(__dirname, '..', '..');
const IMAGES_DIR = join(PROJECT_ROOT, 'data', 'images');

/**
 * Generate a promotional image for a post using DALL-E 3
 * Returns the local file path to the generated image
 */
export async function generatePostImage(post: GeneratedPost): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    logger.warn('OPENAI_API_KEY is not set. Skipping image generation.');
    return null;
  }

  // Ensure images directory exists
  if (!existsSync(IMAGES_DIR)) {
    mkdirSync(IMAGES_DIR, { recursive: true });
  }

  const imagePrompt = buildImagePrompt(post);
  logger.info('Generating image with DALL-E 3...');
  logger.debug(`Image prompt: ${imagePrompt}`);

  try {
    const client = new OpenAI({ apiKey });

    const response = await client.images.generate({
      model: 'dall-e-3',
      prompt: imagePrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      response_format: 'b64_json',
    });

    const imageData = response.data?.[0];
    const b64Data = imageData?.b64_json;
    if (!b64Data) {
      throw new Error('DALL-E returned no image data');
    }

    // Save image locally
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${post.account_profile_id}_${timestamp}.png`;
    const filepath = join(IMAGES_DIR, filename);

    const buffer = Buffer.from(b64Data, 'base64');
    writeFileSync(filepath, buffer);

    logger.success(`Image generated: ${filename} (${Math.round(buffer.length / 1024)}KB)`);
    return filepath;
  } catch (error) {
    logger.warn(`Image generation failed: ${error instanceof Error ? error.message : String(error)}`);
    logger.warn('Proceeding without image.');
    return null;
  }
}

/**
 * Build a DALL-E prompt from the post content
 */
function buildImagePrompt(post: GeneratedPost): string {
  const serviceLabels: Record<string, string> = {
    'globesns': 'SNS follower growth and social media marketing',
    'ai-seo-writer': 'AI-powered SEO article writing',
  };

  const serviceContext = serviceLabels[post.service_name] || post.service_name;

  // Map angle types to visual styles
  const angleStyles: Record<string, string> = {
    pain_point: 'frustrated person at computer, problem visualization, warm empathetic colors',
    comparison: 'before/after split screen, transformation, contrast visuals',
    benefit: 'successful person, growth charts, bright optimistic colors',
    educational: 'clean infographic style, knowledge sharing, structured layout',
    case_study: 'case study results, data visualization, professional style',
    direct_cta: 'call to action, bold design, engaging promotional style',
  };

  const visualStyle = angleStyles[post.angle] || 'modern professional marketing';

  return `Create a clean, modern social media promotional image for a ${serviceContext} service.

Style: ${visualStyle}
Theme: Professional Japanese digital marketing
Requirements:
- Modern, minimalist design with gradients and geometric shapes
- Use blue, purple, and white color palette
- NO text, NO words, NO letters, NO characters in the image
- Abstract representation of social media growth and success
- Clean background suitable for social media posts
- High quality, professional look
- Aspect ratio: square (1:1)

Important: The image must contain ZERO text or written characters of any kind.`;
}
