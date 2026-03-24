/**
 * One-time script to generate stock images for rotation.
 * Run: npx tsx scripts/generate-stock-images.ts
 */
import OpenAI from 'openai';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');
const PROJECT_ROOT = resolve(__dirname, '..');
const STOCK_DIR = join(PROJECT_ROOT, 'data', 'images', 'stock');

const IMAGE_VARIANTS = [
  {
    name: 'growth_chart',
    prompt: 'Abstract modern illustration of social media growth analytics, rising graphs and charts in blue and purple gradients, geometric shapes, clean minimalist design, NO text NO words NO letters NO characters, professional digital marketing theme, square 1:1',
  },
  {
    name: 'social_network',
    prompt: 'Abstract visualization of social media connections and network nodes, interconnected circles with glowing edges, blue purple white color palette, modern minimalist style, NO text NO words NO letters NO characters, clean background, square 1:1',
  },
  {
    name: 'engagement',
    prompt: 'Modern abstract illustration of social media engagement, hearts likes comments floating upward, vibrant gradient blue to purple, geometric minimalist style, NO text NO words NO letters NO characters, professional look, square 1:1',
  },
  {
    name: 'followers',
    prompt: 'Abstract modern illustration of follower growth, stylized people silhouettes multiplying, blue and purple gradient background, clean geometric shapes, NO text NO words NO letters NO characters, professional social media marketing theme, square 1:1',
  },
  {
    name: 'strategy',
    prompt: 'Abstract modern illustration of digital marketing strategy, chess pieces or puzzle pieces on gradient blue purple background, geometric minimalist design, NO text NO words NO letters NO characters, professional and clean, square 1:1',
  },
  {
    name: 'mobile_social',
    prompt: 'Abstract illustration of smartphone with social media icons floating around it, modern minimalist design, blue purple white gradient, geometric shapes, NO text NO words NO letters NO characters, clean professional style, square 1:1',
  },
  {
    name: 'content_creation',
    prompt: 'Abstract modern illustration of content creation workflow, creative tools and media elements, flowing gradient blue to purple, geometric minimalist style, NO text NO words NO letters NO characters, professional digital art, square 1:1',
  },
  {
    name: 'analytics_dashboard',
    prompt: 'Abstract visualization of data analytics dashboard, pie charts bar graphs in blue purple gradient, modern minimalist geometric design, NO text NO words NO letters NO characters, clean professional background, square 1:1',
  },
  {
    name: 'brand_building',
    prompt: 'Abstract modern illustration of brand building and identity, shield or badge shapes with radiating lines, blue purple white color scheme, geometric minimalist, NO text NO words NO letters NO characters, premium professional look, square 1:1',
  },
  {
    name: 'viral_spread',
    prompt: 'Abstract visualization of viral content spreading, ripple effect emanating from center, particles dispersing outward, blue purple gradient, modern minimalist geometric, NO text NO words NO letters NO characters, clean professional design, square 1:1',
  },
];

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY is not set');
    process.exit(1);
  }

  if (!existsSync(STOCK_DIR)) {
    mkdirSync(STOCK_DIR, { recursive: true });
  }

  const client = new OpenAI({ apiKey });
  let generated = 0;

  for (const variant of IMAGE_VARIANTS) {
    const filepath = join(STOCK_DIR, `${variant.name}.png`);

    if (existsSync(filepath)) {
      console.log(`⏭ Skip (exists): ${variant.name}`);
      continue;
    }

    console.log(`🎨 Generating: ${variant.name}...`);

    try {
      const response = await client.images.generate({
        model: 'dall-e-3',
        prompt: variant.prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        response_format: 'b64_json',
      });

      const b64 = response.data?.[0]?.b64_json;
      if (!b64) throw new Error('No image data returned');

      const buffer = Buffer.from(b64, 'base64');
      writeFileSync(filepath, buffer);
      generated++;

      console.log(`✅ Saved: ${variant.name}.png (${Math.round(buffer.length / 1024)}KB)`);

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 2000));
    } catch (error) {
      console.error(`❌ Failed: ${variant.name} - ${error instanceof Error ? error.message : error}`);
    }
  }

  console.log(`\n🎉 Done! Generated ${generated} new images in ${STOCK_DIR}`);
  console.log(`Total cost: ~$${(generated * 0.04).toFixed(2)}`);
}

main();
