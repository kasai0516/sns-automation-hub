import type { AngleType, ContentCategory, Platform, PostType, XPostMode } from '../config/types.js';

// ===== 5カテゴリ テンプレート =====

export interface AngleTemplate {
  label: string;
  category: ContentCategory;
  postType: PostType;
  /** 重み: 出現確率の相対値 */
  weight: number;
  /** プロンプトへの投稿指示 */
  instruction: string;
  /** 構造の例 */
  exampleStructure: string;
  /** CTA強度: 0=なし, 1=軽い案内, 2=サービス紹介, 3=直球訴求 */
  ctaStrength: number;
  /** リプ欄にリンクを自動投稿するか */
  includeServiceMention: boolean;
  /** エンゲージメント質問を末尾に付けるか: 'required' | 'optional' | 'none' */
  engagementQuestion: 'required' | 'optional' | 'none';
}

export const ANGLE_TEMPLATES: Record<AngleType, AngleTemplate> = {
  // ===== 価値提供: 30% =====
  tips_practical: {
    label: '実践SNS運用テクニック',
    category: 'value',
    postType: 'educational',
    weight: 30,
    instruction: `SNS運用の具体的で実践的なテクニックを共有する。
以下のいずれかのテーマを扱う：
- 投稿時間の考え方（ゴールデンタイム、曜日別の傾向）
- 伸びる投稿の型（冒頭の引き、改行の使い方、ストーリー構成）
- 初期アカウント運用の注意点（プロフィール、初投稿、最初の100人）
- 継続しやすい運用方法（テンプレ化、バッチ投稿、ネタ帳の作り方）
- ありがちな失敗例（ハッシュタグ乱用、投稿頻度ミス、自己満投稿）

保存したくなる、人に教えたくなる内容にすること。
サービスの宣伝は一切しない。純粋な価値提供。`,
    exampleStructure: `[具体的なテクニック紹介] → [なぜ効くのか] → [すぐ試せるアクション]`,
    ctaStrength: 0,
    includeServiceMention: false,
    engagementQuestion: 'optional',
  },

  // ===== 価値提供: 20% =====
  algorithm_insight: {
    label: 'アルゴリズム解説・分析',
    category: 'value',
    postType: 'educational',
    weight: 20,
    instruction: `X / Threads / Instagram / TikTok などのアルゴリズムや表示ロジックについて語る。
以下のいずれかのテーマを扱う：
- アルゴリズムが評価する指標（滞在時間、保存率、返信率）
- 反応が増える投稿構造（冒頭3行、質問で終わる、対比構成）
- スパム判定されやすいパターン（同一文面の連投、ハッシュタグ乱用）
- 返信・リプライの重要性
- フォロワー数と初速の関係

断定しすぎず「〜の傾向がある」「〜しやすい」という柔らかい表現を使う。
サービスの宣伝は一切しない。純粋な分析・解説。`,
    exampleStructure: `[最近のアルゴリズム傾向] → [具体的な仕組みの解説] → [運用への示唆]`,
    ctaStrength: 0,
    includeServiceMention: false,
    engagementQuestion: 'optional',
  },

  // ===== エンゲージメント: 20% =====
  question_engage: {
    label: '対話・質問型',
    category: 'engage',
    postType: 'engagement',
    weight: 20,
    instruction: `フォロワーや読者に経験・意見を聞く対話型の投稿。
以下のような問いかけを中心に構成する：
- SNS運用で一番苦労したことは？
- XとThreads、どちらが伸ばしやすいと感じる？
- 投稿を継続するコツを教えてほしい
- フォロワーが増え始めたきっかけは何だった？
- 最近試して効果があった運用方法は？

必ず文末に返信したくなる質問を入れること。
二択形式や体験ベースの問いかけが特に効果的。
宣伝は一切しない。対話を生み出すことだけに集中。`,
    exampleStructure: `[共感できる状況設定] → [自分の経験や考え] → [読者への質問]`,
    ctaStrength: 0,
    includeServiceMention: false,
    engagementQuestion: 'required',
  },

  // ===== 柔らか宣伝: 20% =====
  soft_promo: {
    label: '初速設計・柔らか訴求',
    category: 'promo',
    postType: 'soft_promo',
    weight: 20,
    instruction: `SNS運用における「初速」や「土台づくり」の重要性を語りながら、
自然にフォロワー購入サービスの存在を示唆する。

先に価値ある情報を提供してから、最後に軽くサービスに触れる構造。
例：「初速がないと良い投稿も埋もれる」→「だから最初の数字を整えるのは戦略としてアリ」→「リプ欄にリンク」

直接的に「買いましょう」とは言わない。
「こういう選択肢もある」「賢い人はこうしてる」程度のトーン。`,
    exampleStructure: `[初速・土台の重要性] → [自力だけでは時間がかかる現実] → [フォロワー購入という選択肢の提示] → [リプ欄にリンク案内]`,
    ctaStrength: 2,
    includeServiceMention: true,
    engagementQuestion: 'optional',
  },

  // ===== 直球宣伝: 10% =====
  direct_cta: {
    label: 'ダイレクト・セールス',
    category: 'promo',
    postType: 'direct_cta',
    weight: 10,
    instruction: `フォロワー購入サービスをストレートに訴求する。
ただし押し売り感は出さない。

伝えるポイント：
- 安全性（Bot不使用、段階的増加、凍結リスク最小）
- コスパ（数千円から始められる）
- 保証（30日間減少保証、パスワード不要）
- 対応範囲（Instagram, X, TikTok, YouTube）

毎回同じ文面にならないよう、切り口を変えること。`,
    exampleStructure: `[フォロワー購入の提案] → [安全・安い・保証の強み] → [リプ欄にリンク案内]`,
    ctaStrength: 3,
    includeServiceMention: true,
    engagementQuestion: 'none',
  },
};

// ===== プラットフォーム制約 =====

export const PLATFORM_CONSTRAINTS: Record<Platform, {
  maxLength: number;
  toneGuidance: string;
  hashtagGuidance: string;
}> = {
  x: {
    maxLength: 200,
    toneGuidance: `【X特化のトーン】
- 短文でパンチを効かせる
- 「カジュアルな です/ます」口調。友達に教える感じ
- 命令形は禁止。「〜するのがいいですよ」「〜した方が早いです」
- 改行を多めに使い、視認性を上げる`,
    hashtagGuidance: `【Xのハッシュタグルール】
- ハッシュタグは0〜1個（多くても2個まで）
- 投稿内容に自然に合う場合のみ付ける
- 毎回付ける必要はない
- 候補: #SNS運用, #マーケティング, #インスタ運用, #X運用
- 宣伝色の強い投稿（direct_cta）ではハッシュタグを付けない`,
  },
  threads: {
    maxLength: 300,
    toneGuidance: `【Threads特化のトーン】
- 会話的で柔らかいトーン。ぶっちゃけた本音ベース
- 「カジュアルな です/ます」口調。親しみある話し方
- 共感・問いかけを入れやすく
- 改行を多めに使い、テンポよく
- 人間が話している感を強める`,
    hashtagGuidance: `【Threadsのハッシュタグルール】
- 関連性の高いトピックタグを0〜2個
- 毎回付ける必要はない。投稿テーマと整合するものだけ
- 候補: #SNS運用, #フォロワー増やす, #インスタ運用, #Threads運用, #TikTok攻略
- 不自然な羅列はNG。付けないほうがマシ`,
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

// ===== エンゲージメント質問候補 =====

const ENGAGEMENT_QUESTIONS = [
  'みなさんはどう思いますか？',
  'これ試したことありますか？',
  '同じ経験ある人いますか？',
  '一番効果があった方法を教えてください！',
  'みなさんはどのやり方が反応ありましたか？',
  '最初の運用で一番難しかったのは何ですか？',
  'XとThreads、どちらが伸ばしやすいですか？',
  '投稿を続ける上で一番の悩みは何ですか？',
  '逆にこれはやめた方がいいってことありますか？',
  'みなさんの運用歴、どれくらいですか？',
  '最近試して良かった方法ってありますか？',
  '他にもコツがあれば教えてください！',
];

function pickEngagementQuestion(): string {
  return ENGAGEMENT_QUESTIONS[Math.floor(Math.random() * ENGAGEMENT_QUESTIONS.length)];
}

// ===== 重み付き角度選択 =====

/**
 * 重み付きランダム選択 + 連続類似投稿の抑制
 */
export function selectAngle(recentAngles: AngleType[]): AngleType {
  const allAngles: AngleType[] = [
    'tips_practical', 'algorithm_insight', 'question_engage',
    'soft_promo', 'direct_cta',
  ];

  // 連続投稿の抑制: 直近3件で使ったカテゴリの角度は重みを半減
  const recentCategories = recentAngles.slice(0, 3).map(a => ANGLE_TEMPLATES[a]?.category);
  // direct_cta が直近2件にあれば除外
  const recentHasDirectCta = recentAngles.slice(0, 2).includes('direct_cta');

  // 重み付き選択
  const weighted: Array<{ angle: AngleType; weight: number }> = allAngles.map(angle => {
    const template = ANGLE_TEMPLATES[angle];
    let weight = template.weight;

    // 直近で同じ角度を使っていたら重みを大幅に下げる
    if (recentAngles.slice(0, 3).includes(angle)) {
      weight *= 0.1;
    }
    // 直近で同じカテゴリが多い場合は重みを下げる
    const categoryCount = recentCategories.filter(c => c === template.category).length;
    if (categoryCount >= 2) {
      weight *= 0.3;
    }
    // direct_cta は連続させない
    if (angle === 'direct_cta' && recentHasDirectCta) {
      weight *= 0.05;
    }

    return { angle, weight };
  });

  // 重み付きランダム選択
  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
  let random = Math.random() * totalWeight;

  for (const { angle, weight } of weighted) {
    random -= weight;
    if (random <= 0) return angle;
  }

  return weighted[weighted.length - 1].angle;
}

// ===== ハッシュタグ候補 =====

const HASHTAG_CANDIDATES: Record<Platform, string[]> = {
  x: ['#SNS運用', '#マーケティング', '#インスタ運用', '#X運用', '#フォロワー'],
  threads: ['#SNS運用', '#フォロワー増やす', '#インスタ運用', '#Threads運用', '#TikTok攻略', '#SNSマーケティング'],
};

/**
 * プラットフォームと角度に応じてハッシュタグを選択
 */
export function selectHashtags(platform: Platform, angle: AngleType): string[] {
  const template = ANGLE_TEMPLATES[angle];

  // direct_cta では基本ハッシュタグなし
  if (angle === 'direct_cta') return [];

  const candidates = HASHTAG_CANDIDATES[platform];

  if (platform === 'x') {
    // X: 50%の確率で0個、50%で1個
    if (Math.random() < 0.5) return [];
    return [candidates[Math.floor(Math.random() * candidates.length)]];
  }

  // Threads: 60%の確率で1個、30%で2個、10%で0個
  const roll = Math.random();
  if (roll < 0.1) return [];
  if (roll < 0.7) {
    return [candidates[Math.floor(Math.random() * candidates.length)]];
  }
  // 2個（重複なし）
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2);
}

// ===== SEOキーワード（soft_promo / direct_cta のみ使用） =====

const SEO_KEYWORDS = [
  'フォロワー購入', 'フォロワー 増やす', 'フォロワー 買う',
  'インスタ フォロワー', 'X フォロワー',
  'TikTok フォロワー', 'YouTube 登録者', 'YouTube 収益化',
  'いいね 増やす', 'SNS 集客', 'SNS 初速',
  'フォロワー 安全', 'フォロワー 凍結されない',
];

function pickSeoKeywords(count: number = 2): string[] {
  const shuffled = [...SEO_KEYWORDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ===== プロンプト構築 =====

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
  const formatInstruction = modeGuide ? modeGuide.formatGuidance : '';

  // エンゲージメント質問の指示
  let engagementInstruction = '';
  if (template.engagementQuestion === 'required') {
    const q = pickEngagementQuestion();
    engagementInstruction = `## 🗣 エンゲージメント質問（必須）
投稿の末尾に、読者が返信したくなる質問を入れること。
参考例: 「${q}」
ただし毎回同じ質問にならないよう、自分で考えた質問でもOK。`;
  } else if (template.engagementQuestion === 'optional') {
    engagementInstruction = `## 🗣 エンゲージメント質問（任意）
可能であれば投稿の末尾に、読者に問いかける一文を入れる。
ただし無理に付けなくてもよい。付ける場合は自然な形で。`;
  }

  // SEOキーワード指示（宣伝系のみ）
  let seoInstruction = '';
  if (template.category === 'promo') {
    const keywords = pickSeoKeywords(2);
    seoInstruction = `## 📌 SEOキーワード（宣伝投稿のみ）
以下のキーワードのうち1〜2個を文中に自然に含める：
- ${keywords.join('\n- ')}`;
  }

  // CTA指示
  let ctaInstruction = '';
  if (template.ctaStrength === 0) {
    ctaInstruction = `## CTA
この投稿にCTAは不要。純粋な価値提供 or 対話に集中すること。
リプ欄へのリンク案内も不要。`;
  } else if (template.ctaStrength <= 2) {
    ctaInstruction = `## CTA（控えめ）
投稿の最後に軽く「リプ欄にリンクあり」程度の案内を入れてもよい。
ただしメインは価値提供。押し売り感を出さないこと。`;
  } else {
    ctaInstruction = `## CTA（あり）
本文の最後に「リプ欄にリンク置いた」「リプ欄にURL貼ってある」等の短い案内を入れる。
ただし本文中にURLは入れない。`;
  }

  // ハッシュタグ指示
  const hashtagInstruction = constraints.hashtagGuidance;

  // ペルソナの切り替え
  const persona = template.category === 'promo'
    ? `あなたはSNS運用の「裏側」を知り尽くしたマーケター。効率重視でスマートな戦略を語る。
「良い発信をすれば伸びる」という綺麗事は否定し、「初速設計」や「時間をお金で買う」考え方を自然に語る。`
    : `あなたは実践派のSNSマーケター。自分自身もSNSを運用しており、リアルな経験に基づいたアドバイスをする。
押し売りは一切しない。フォロワーにとって有益な情報を共有することだけに集中する。普通のSNSユーザーとして自然に発信する。`;

  return `${persona}

【口調ルール】
- 「カジュアルな です/ます」口調。友達に教える感じ
- 命令形は絶対禁止（「〜しろ」「〜やれ」→「〜ですよ」「〜した方がいいです」）
- 堅すぎるビジネス敬語もNG
- 新規アカウントでも違和感のない、普通の運用アカウントっぽいトーン
- 同じ構文の繰り返しを避けて、自然な文体にする

## 今回の投稿カテゴリ: ${template.label}
${template.instruction}

## 構造イメージ
${template.exampleStructure}

## プラットフォーム（${platform === 'x' ? 'X' : 'Threads'}）
${charInstruction}
${formatInstruction}

${constraints.toneGuidance}

${hashtagInstruction}

${seoInstruction}

${engagementInstruction}

${ctaInstruction}

## 参照情報
${referenceSummary}

## 🛑 禁止事項
- 禁止ワード: ${bannedPhrases.join('、')}, 爆増, バズる, 絶対に, 100%, 今すぐ, おすすめです
- AI構文禁止: 「〜であることが重要です」「〜を検討してみてはいかがでしょうか」
- 命令口調禁止
- コピペ感を出さない。毎回異なる切り口・構成にする
- ハッシュタグ乱用禁止（ルールに従う）
- URLは本文に入れない
- 絵文字の過剰使用禁止
- 挨拶禁止（「こんにちは」など）

## 出力形式（JSONのみ）
{
  "hook": "投稿の冒頭1行（短いパンチライン）",
  "generated_text": "投稿文の全文",
  "hashtags": ["ハッシュタグ（ルールに従って0〜2個）"]
}`;
}
