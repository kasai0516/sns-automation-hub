import 'dotenv/config';
import { TwitterApi } from 'twitter-api-v2';

async function testXAuth() {
  const apiKey = process.env.GLOBESNS_X_API_KEY;
  const apiSecret = process.env.GLOBESNS_X_API_SECRET;
  const accessToken = process.env.GLOBESNS_X_ACCESS_TOKEN;
  const accessSecret = process.env.GLOBESNS_X_ACCESS_SECRET;

  console.log('=== X API認証テスト ===');
  console.log(`API Key: ${apiKey?.slice(0, 6)}...${apiKey?.slice(-4)}`);
  console.log(`API Secret: ${apiSecret?.slice(0, 6)}...${apiSecret?.slice(-4)}`);
  console.log(`Access Token: ${accessToken?.slice(0, 6)}...${accessToken?.slice(-4)}`);
  console.log(`Access Secret: ${accessSecret?.slice(0, 6)}...${accessSecret?.slice(-4)}`);

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    console.error('❌ 環境変数が不足しています');
    return;
  }

  const client = new TwitterApi({
    appKey: apiKey,
    appSecret: apiSecret,
    accessToken: accessToken,
    accessSecret: accessSecret,
  });

  try {
    // まず認証確認（自分のユーザー情報取得）
    console.log('\n1. ユーザー情報を取得中...');
    const me = await client.v2.me();
    console.log(`✅ ログイン成功: @${me.data.username} (${me.data.name})`);

    // 投稿テスト
    console.log('\n2. テスト投稿を試行中...');
    const result = await client.v2.tweet('テスト投稿 from SNS Automation Hub 🚀 (このポストは自動削除されます)');
    console.log(`✅ 投稿成功: ID=${result.data.id}`);
    console.log(`   URL: https://x.com/i/status/${result.data.id}`);

    // 投稿を削除
    console.log('\n3. テスト投稿を削除中...');
    await client.v2.deleteTweet(result.data.id);
    console.log('✅ 削除完了');

  } catch (error: any) {
    console.error('\n❌ エラー:');
    console.error(`  code: ${error.code}`);
    console.error(`  message: ${error.message}`);
    if (error.data) {
      console.error(`  data: ${JSON.stringify(error.data, null, 2)}`);
    }
    if (error.errors) {
      console.error(`  errors: ${JSON.stringify(error.errors, null, 2)}`);
    }
    // Show full error for debugging
    console.error(`  full: ${JSON.stringify(error, null, 2)}`);
  }
}

testXAuth();
