import type { AngleType, Platform, PostType, XPostMode } from '../config/types.js';

/**
 * SEO/検索流入キーワード一覧
 * 毎投稿でこの中から1〜3個を自然に文中に盛り込む
 */
const SEO_KEYWORDS = [
  // メインキーワード
  'フォロワー購入', 'フォロワー 増やす', 'フォロワー 買う',
  // プラットフォーム別
  'インスタ フォロワー', 'Instagram フォロワー',
  'X フォロワー', 'Twitter フォロワー',
  'TikTok フォロワー', 'TikTok いいね',
  'YouTube 登録者', 'YouTube 収益化', 'YouTube チャンネル登録',
  // アクション系
  'いいね 増やす', 'いいね 購入', '再生回数 増やす',
  'フォロワー 増やし方', 'フォロワー 増加',
  // ニーズ系
  'SNS 集客', 'SNS 初速', 'SNS マーケティング',
  'アカウント 育てる', 'インフルエンサー なりたい',
  // コスパ・安全系
  'フォロワー 安い', 'フォロワー 安全', 'フォロワー 凍結されない',
  'フォロワー 減少保証',
];

/**
 * 8 角度の訴求テンプレート
 * 全投稿で「リプ欄にリンクを貼る」ため、本文中にCTAは不要。
 * 代わりにSEOキーワードを自然に含めることに集中する。
 */
export const ANGLE_TEMPLATES: Record<AngleType, {
  label: string;
  postType: PostType;
  instruction: string;
  exampleStructure: string;
  includeServiceMention: boolean;  // true = リプ欄にリンクを自動投稿
}> = {
  educational: {
    label: '現実突きつけ型',
    postType: 'educational',
    instruction: `「いい投稿を作ればフォロワーは増える」という綺麗事を否定する。
現実として数字（フォロワー数）がないアカウントの投稿は誰も読まない。
だから「フォロワー購入」や「フォロワーを買う」という選択肢は戦略としてアリだと主張する。`,
    exampleStructure: `[綺麗事の否定] → [SNSの残酷な現実] → [だからフォロワーを買って初速を作るのが賢い]`,
    includeServiceMention: true,
  },

  trend: {
    label: '効率化・時短型',
    postType: 'educational',
    instruction: `フォロワーを自力で増やすための膨大な時間（数ヶ月〜年単位）を指摘。
「フォロワー購入」なら数千円で一瞬。時給換算で圧倒的にコスパが良い。
空いた時間で中身を磨けという提案。`,
    exampleStructure: `[自力でフォロワーを増やす地獄] → [「フォロワーを買う」という時短術] → [浮いた時間でコンテンツに集中]`,
    includeServiceMention: true,
  },

  platform_tips: {
    label: '権威性・バンドワゴン型',
    postType: 'educational',
    instruction: `人間はフォロワー数が多いアカウントを信用するという心理学（バンドワゴン効果）を語る。
店の行列と同じ理屈。だからInstagramでもXでもTikTokでも、最初に見栄えの数字を揃えるのが正解。
「フォロワー 増やす」手段として購入はアリだという結論。`,
    exampleStructure: `[人は数字で判断するという真理] → [フォロワー数＝店前の行列] → [フォロワーを増やすならまずハクをつけろ]`,
    includeServiceMention: true,
  },

  pain_point: {
    label: 'リスク排除・安全性型',
    postType: 'problem_awareness',
    instruction: `「フォロワーを買うと凍結される」という不安に先回りして答える。
粗悪なBotと正規プロモーションの違いを説明。
「フォロワー 安全」「フォロワー 凍結されない」方法があることを伝える。`,
    exampleStructure: `[フォロワー購入の不安（凍結怖い）] → [Botと安全なプロモーションの違い] → [安全にフォロワーを増やす方法がある]`,
    includeServiceMention: true,
  },

  benefit: {
    label: '保証・安心感型',
    postType: 'soft_promo',
    instruction: `「買ってもすぐ減るんでしょ？」という疑念を潰す。
30日間の減少保証つき、パスワード不要。
「フォロワー 減少保証」で安心してフォロワーを増やせることを伝える。`,
    exampleStructure: `[フォロワー購入の「すぐ減る」問題] → [30日保証＋パスワード不要の安心設計] → [これならリスクなくフォロワーを増やせる]`,
    includeServiceMention: true,
  },

  case_study: {
    label: 'コスパ・収益化型',
    postType: 'soft_promo',
    instruction: `飲み代1回分でSNSのハクが買えるコスパの良さをアピール。
YouTube収益化の条件（登録者1000人）を達成したい層には特に刺さる。
「YouTube 収益化」「YouTube 登録者」を絡めつつ、フォロワー購入の安さを強調。`,
    exampleStructure: `[たった数千円でフォロワーが買える事実] → [YouTube収益化条件をクリアする近道] → [コスパの圧倒的な良さ]`,
    includeServiceMention: true,
  },

  comparison: {
    label: '自力vs課金 比較型',
    postType: 'soft_promo',
    instruction: `「毎日3時間SNS運用して月90時間消費」vs「数千円でフォロワーを買って1日で土台完成」を露骨に比較。
賢い人は裏でフォロワーを買って初速を作っているという事実。
「フォロワー 増やし方」は自力だけじゃないと主張。`,
    exampleStructure: `[泥臭い自力運用の時間コスト] → [フォロワーを買うという賢い選択肢] → [時間をお金で買える人が勝つ]`,
    includeServiceMention: true,
  },

  direct_cta: {
    label: '直球ダイレクト・セールス型',
    postType: 'direct_cta',
    instruction: `ストレートに「フォロワー購入」をすすめる。
Bot不使用、30日保証、パスワード不要、即日開始の強みを端的に。
Instagram、X、TikTok、YouTube全対応であることも伝える。`,
    exampleStructure: `[フォロワーを買おう、という直球提案] → [安全・安い・保証つきの3拍子] → [リプ欄にリンクあり]`,
    includeServiceMention: true,
  },
};

// ===== プラットフォーム制約 =====

export const PLATFORM_CONSTRAINTS: Record<Platform, {
  maxLength: number;
  toneGuidance: string;
}> = {
  x: {
    maxLength: 200,
    toneGuidance: `【X（Twitter）特化のトーン指示】
- 短文でパンチを効かせる。長文は不要。
- 「フォロワー購入」「フォロワー 増やす」「フォロワー 買う」等のSEOキーワードを自然に含める。
- 体言止めや話し言葉で、人間味を出す。
- リンクは本文に入れない（リプ欄に別途貼るため）。`,
  },
  threads: {
    maxLength: 300,
    toneGuidance: `【Threads特化のトーン指示】
- ぶっちゃけトーンで本音を語る。
- 「フォロワー購入」「フォロワー 増やす」等のSEOキーワードを自然に含める。
- 短めでテンポよく改行する。
- リンクは本文に入れない（リプ欄に別途貼るため）。`,
  },
};

// ===== X投稿モード別ガイダンス =====

export const MODE_GUIDANCE: Record<XPostMode, {
  label: string;
  charGuidance: string;
  formatGuidance: string;
}> = {
  single: {
    label: '通常（single）',
    charGuidance: '80〜200文字。短く鋭く。',
    formatGuidance: `- スマホでパッと読める短さ。結論だけをズバッと書く。`,
  },
  thread: {
    label: 'スレッド（thread）※短め推奨',
    charGuidance: '全体で150〜350文字程度。2〜3ツイートで完結。',
    formatGuidance: `- 1ツイート目で本音をぶちまける。2ツイート目で理由。`,
  },
  longform_experimental: {
    label: 'ロングフォーム（不使用推奨）',
    charGuidance: '200〜400文字目安。',
    formatGuidance: `- 短く鋭い文章の塊にする。`,
  },
};

// ===== PostType 理想分布 =====

const POST_TYPE_IDEAL_RATIO: Record<PostType, number> = {
  educational: 0.2,
  problem_awareness: 0.2,
  soft_promo: 0.4,
  direct_cta: 0.2,
};

/**
 * 過去履歴に基づく角度選択
 */
export function selectAngle(recentAngles: AngleType[]): AngleType {
  const allAngles: AngleType[] = [
    'educational', 'trend', 'platform_tips',
    'pain_point', 'benefit', 'case_study',
    'comparison', 'direct_cta',
  ];

  if (recentAngles.length === 0) {
    return 'direct_cta';
  }

  const counts = new Map<AngleType, number>();
  for (const angle of allAngles) {
    counts.set(angle, 0);
  }
  for (const angle of recentAngles) {
    counts.set(angle, (counts.get(angle) || 0) + 1);
  }

  const sorted = [...allAngles].sort((a, b) => (counts.get(a) || 0) - (counts.get(b) || 0));
  return sorted[0];
}

/**
 * SEOキーワードをランダムに3つ選んでプロンプトに含める
 */
function pickSeoKeywords(count: number = 3): string[] {
  const shuffled = [...SEO_KEYWORDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * 投稿生成プロンプト構築
 */
export function buildGenerationPrompt(options: {
  platform: Platform;
  angle: AngleType;
  serviceName: string;
  referenceSummary: string;
  bannedPhrases: string[];
  ctaPatterns: string[];
  targetUrl: string;
  postMode?: XPostMode;
}): string {
  const { platform, angle, referenceSummary, bannedPhrases, postMode } = options;
  const template = ANGLE_TEMPLATES[angle];
  const constraints = PLATFORM_CONSTRAINTS[platform];

  const mode = postMode || 'single';
  const modeGuide = platform === 'x' ? MODE_GUIDANCE[mode] : null;
  const charInstruction = modeGuide
    ? `【文章量ガイド】\n投稿モード: ${modeGuide.label}\n文字数目安: ${modeGuide.charGuidance}`
    : `【文章量ガイド】\n目安文字数: 100〜300文字（短く鋭く）`;
  const formatInstruction = modeGuide
    ? modeGuide.formatGuidance
    : '';

  // SEOキーワードの指示
  const seoKeywords = pickSeoKeywords(3);
  const seoInstruction = `## 📌 SEOキーワード指示（重要）
以下のキーワードのうち1〜2個を、文中に自然な形で含めること。
不自然にならない範囲で、検索されやすいワードを投稿文に練り込む。
- ${seoKeywords.join('\n- ')}

【全キーワードリスト（参考）】
フォロワー購入 / フォロワー 増やす / フォロワー 買う / インスタ フォロワー / X フォロワー / TikTok フォロワー / YouTube 登録者 / YouTube 収益化 / いいね 増やす / 再生回数 増やす / フォロワー 安い / フォロワー 安全 / フォロワー 凍結されない`;

  return `あなたはSNS運用における「綺麗事」を嫌い、効率重視でスマートな裏技や投資（フォロワー購入など）を肯定する、リアリストな凄腕SNSマーケターです。
「良い発信をすれば伸びる」という幻想をぶち壊し、「まずは見栄（数字）を揃えて初速を作れ」「時間をお金で買え」というスタンスで発信してください。

## 今回の投稿アングル: ${template.label}
${template.instruction}

## 構造イメージ
${template.exampleStructure}

## プラットフォーム特化の制約（${platform === 'x' ? 'X' : 'Threads'}）
${charInstruction}
${formatInstruction}

${constraints.toneGuidance}

${seoInstruction}

## 参照情報（ネタ引き出し・サービス情報用）
${referenceSummary}

## CTA（導線）の指示
リンクは投稿本文に入れないこと。リプ欄に別途「購入はこちら」とリンクを貼るため、本文中のCTAは不要。
本文の最後は「リプ欄にリンク置いた」「リプ欄にURL貼ってある」「↓にリンクあり」等の短い案内を入れるだけでOK。

## 🛑 【絶対禁止事項】
- 以下のワードは使用禁止: ${bannedPhrases.join('、')}, 爆増, バズる, 絶対に, 100%, 今すぐ, おすすめです
- AI構文の禁止: 「〜であることが重要です」「〜を検討してみてはいかがでしょうか」等の優等生的な表現
- お節介・説教トーンの禁止: あくまで「俺はこうしてる」「賢い人はこうやってる」という客観ベース
- 挨拶の禁止、ハッシュタグ禁止、URLの直書き禁止、絵文字の過剰使用禁止

## 出力形式（JSONのみ出力）
{
  "hook": "投稿の冒頭1行（短いパンチライン）",
  "generated_text": "投稿文の全文。ハッシュタグ・URLなし。短く鋭く、SEOキーワードを含む。"
}`;
}
