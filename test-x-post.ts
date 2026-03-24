import 'dotenv/config';
import { TwitterApi } from 'twitter-api-v2';

async function test() {
  const client = new TwitterApi({
    appKey: process.env.GLOBESNS_X_API_KEY!,
    appSecret: process.env.GLOBESNS_X_API_SECRET!,
    accessToken: process.env.GLOBESNS_X_ACCESS_TOKEN!,
    accessSecret: process.env.GLOBESNS_X_ACCESS_SECRET!
  });

  // Test with unique texts at higher character counts
  const timestamp = Date.now();

  const tests = [
    { label: '160文字', text: `テスト${timestamp}_160: ${'あ'.repeat(145)}` },
    { label: '200文字', text: `テスト${timestamp}_200: ${'い'.repeat(185)}` },
    { label: '250文字', text: `テスト${timestamp}_250: ${'う'.repeat(235)}` },
    { label: '280文字', text: `テスト${timestamp}_280: ${'え'.repeat(265)}` },
  ];

  for (const { label, text } of tests) {
    console.log(`\n=== ${label} (actual: ${text.length}) ===`);
    try {
      const r = await client.v2.tweet(text);
      console.log(`✅ OK (ID: ${r.data.id})`);
      await client.v2.deleteTweet(r.data.id);
    } catch (e: any) {
      console.log(`❌ FAIL: code=${e.code} detail=${e.data?.detail || e.message}`);
    }
    await new Promise(r => setTimeout(r, 2000));
  }
}

test();
