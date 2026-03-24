import type { AngleType, Platform, PostType, XPostMode } from '../config/types.js';

/**
 * 8 角度の訴求テンプレート
 * 役立つ情報配信 (60%) + 自社PR (40%) のバランス
 *
 * X アルゴリズム最適化:
 * - ハッシュタグなし（リーチ低下を防ぐ）
 * - 本文にURL含めない（インプレッション激減を防ぐ）
 * - 会話を生むような投稿（リプライ・引用RTを促進）
 * - 長文ポスト推奨（滞在時間↑ → エンゲージメント評価↑）
 * - 問いかけ・意見表明で反応を誘発
 */
export const ANGLE_TEMPLATES: Record<AngleType, {
  label: string;
  postType: PostType;
  instruction: string;
  exampleStructure: string;
  includeServiceMention: boolean;
}> = {
  // === 役立つ情報系 (60%) ===
  educational: {
    label: '教育コンテンツ型',
    postType: 'educational',
    instruction: `SNS運用やマーケティングに関する有益な知見を発信する。
サービスの直接的な宣伝はしない。純粋に「この人の投稿は勉強になる」と思わせる内容。
データや具体例を含めて説得力を持たせる。
最後に問いかけを入れてリプライを促すのが理想。`,
    exampleStructure: `[知見やデータ] → [なぜそうなるか] → [実践アドバイス] → [問いかけ]`,
    includeServiceMention: false,
  },

  trend: {
    label: 'トレンド・業界分析型',
    postType: 'educational',
    instruction: `SNS業界の動向やアルゴリズムの変化について考察する。
「〜が変わった」「〜の傾向が出てきた」など、業界の動きをキャッチアップしている印象を与える。
自分なりの見解を述べることで、単なるニュースシェアではなく「考えている人」として見せる。
サービスの宣伝は一切しない。`,
    exampleStructure: `[業界の動き / 変化の指摘] → [それが意味すること] → [自分の見解] → [みなさんはどう思いますか？]`,
    includeServiceMention: false,
  },

  platform_tips: {
    label: 'プラットフォーム攻略型',
    postType: 'educational',
    instruction: `Instagram / TikTok / YouTube / X のどれかに特化した運用テクニックを投稿。
ガイド記事の内容をベースに、すぐ使える具体的なテクニックを1つだけ切り出す。
「これ知らない人多いけど」「やってる人少ないけど」等の切り口で注目を集める。
サービスの宣伝はしない。`,
    exampleStructure: `[具体的なテクニック1つ] → [なぜ効くのか] → [どうやるか] → [試したことある人いますか？]`,
    includeServiceMention: false,
  },

  // === 自社PR系 (40%) ===
  pain_point: {
    label: '課題提起型',
    postType: 'problem_awareness',
    instruction: `SNS運用者が日ごろ感じている課題を言語化して共感を得る。
「わかる」「それな」と思わせる投稿。
解決策はサービスを直接示すのではなく「プロフに解決策を載せてます」と自然に導線を引く。
嘘臭さゼロ。リアルな悩みとして書くこと。`,
    exampleStructure: `[リアルな悩みの提示] → [悩みの深掘り・共感] → [自分はこう解決してきた（示唆）]`,
    includeServiceMention: false,
  },

  benefit: {
    label: '価値提案型',
    postType: 'soft_promo',
    instruction: `フォロワーが増えることの具体的なメリットを語る。
「フォロワーが〇人になったら何が変わるか」という視点で書く。
自然にサービスの存在を匂わせるが、直接的なセールスは避ける。
信頼性のある数字や事実を含める。`,
    exampleStructure: `[ビフォーアフターの提示] → [具体的なメリット] → [興味があればプロフから]`,
    includeServiceMention: true,
  },

  case_study: {
    label: '実体験・事例型',
    postType: 'soft_promo',
    instruction: `口コミや事例をベースに「こういう結果が出た」という投稿を作る。
第三者的な視点で語ることで信頼感を持たせる。
実際の数字や変化を具体的に述べる。
過度な誇張は絶対に避ける。`,
    exampleStructure: `[事例の紹介] → [具体的な変化・数字] → [こういう方法もありという示唆]`,
    includeServiceMention: true,
  },

  comparison: {
    label: '比較検証型',
    postType: 'soft_promo',
    instruction: `「自力で増やす場合」と「専門サービスを使う場合」を客観的に対比する。
または「よくある失敗パターン」と「うまくいくパターン」の比較。
フェアで客観的なトーンを保つこと。どちらかに肩入れしすぎない。
読者が自分で判断できる材料を提示する。`,
    exampleStructure: `[一般的なアプローチの問題点] → [別のアプローチとの比較] → [客観的な結論]`,
    includeServiceMention: true,
  },

  direct_cta: {
    label: 'サービス紹介型',
    postType: 'direct_cta',
    instruction: `サービスを紹介する。ただし「広告感」を極力排除する。
「最近使ってるサービスが良い感じ」「これ地味にすごいと思った」のような
友人に薦めるトーンで書く。
スペックではなく体験を語ること。`,
    exampleStructure: `[自然な導入] → [使ってみての感想（体験ベース）] → [気になったらプロフから]`,
    includeServiceMention: true,
  },
};

// ===== プラットフォーム制約 =====

export const PLATFORM_CONSTRAINTS: Record<Platform, {
  maxLength: number;
  toneGuidance: string;
}> = {
  x: {
    maxLength: 280,
    toneGuidance: `トーン:
- 1〜2文ごとに改行を入れて読みやすくする
- 空行で段落を分ける
- 短文リズムで書く（1文が長すぎないようにする）
- 自然な日本語で、ビジネスカジュアルなトーン
- 「。」で終わる文と体言止めをバランスよく使う`,
  },
  threads: {
    maxLength: 500,
    toneGuidance: `トーン:
- Threads はカジュアル寄り、会話的なトーン推奨
- 長めの文章もOK
- 適度に改行を入れて読みやすく`,
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
    charGuidance: '220〜280文字目安。280文字をフルに使い切ること。',
    formatGuidance: `フォーマット:
- 1〜2文ごとに改行
- 空行で段落を分ける
- 最後に問いかけがあると理想的`,
  },
  thread: {
    label: 'スレッド（thread）',
    charGuidance: '400〜800文字目安。生成後にスレッド分割される。',
    formatGuidance: `フォーマット:
- 深い考察や解説を展開する
- 「。」「！」「？」で文を区切る（分割の目印になる）
- 段落の切れ目がスレッド分割ポイントになるので、意味の区切りで空行を入れる
- 冒頭のツイートが一番重要（タイムラインに表示される）`,
  },
  longform_experimental: {
    label: 'ロングフォーム（実験的）',
    charGuidance: '500〜1000文字目安。Xプレミアムの長文投稿機能を使う。',
    formatGuidance: `フォーマット:
- 長文を活かした詳細な考察
- 段落ごとに空行で区切る
- 読みやすいリズムを意識
- 見出し的な文から始める段落構成`,
  },
};

// ===== PostType 理想分布 =====

const POST_TYPE_IDEAL_RATIO: Record<PostType, number> = {
  educational: 0.4,
  problem_awareness: 0.2,
  soft_promo: 0.2,
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
    return 'educational';
  }

  // 使用回数カウント
  const counts = new Map<AngleType, number>();
  for (const angle of allAngles) {
    counts.set(angle, 0);
  }
  for (const angle of recentAngles) {
    counts.set(angle, (counts.get(angle) || 0) + 1);
  }

  const sorted = [...allAngles].sort((a, b) => (counts.get(a) || 0) - (counts.get(b) || 0));

  // PostType の分布バランスをチェック
  const postTypeCounts: Record<PostType, number> = {
    educational: 0,
    soft_promo: 0,
    problem_awareness: 0,
    direct_cta: 0,
  };
  for (const angle of recentAngles) {
    const template = ANGLE_TEMPLATES[angle];
    if (template) {
      postTypeCounts[template.postType]++;
    }
  }

  const total = recentAngles.length || 1;
  const eduRatio = postTypeCounts.educational / total;
  const promoRatio = postTypeCounts.soft_promo / total;
  const probRatio = postTypeCounts.problem_awareness / total;

  // 教育系が少なければ優先
  if (eduRatio < 0.3) {
    const eduAngles = sorted.filter(a => ANGLE_TEMPLATES[a].postType === 'educational');
    if (eduAngles.length > 0) return eduAngles[0];
  }
  if (promoRatio < 0.1) {
    const promoAngles = sorted.filter(a => ANGLE_TEMPLATES[a].postType === 'soft_promo');
    if (promoAngles.length > 0) return promoAngles[0];
  }
  if (probRatio < 0.1) {
    const probAngles = sorted.filter(a => ANGLE_TEMPLATES[a].postType === 'problem_awareness');
    if (probAngles.length > 0) return probAngles[0];
  }

  return sorted[0];
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
  const { platform, angle, serviceName, referenceSummary, bannedPhrases, ctaPatterns, targetUrl, postMode } = options;
  const template = ANGLE_TEMPLATES[angle];
  const constraints = PLATFORM_CONSTRAINTS[platform];

  // Mode-specific guidance (X only)
  const mode = postMode || 'single';
  const modeGuide = platform === 'x' ? MODE_GUIDANCE[mode] : null;
  const charInstruction = modeGuide
    ? `投稿モード: ${modeGuide.label}\n文字数ガイド: ${modeGuide.charGuidance}`
    : `最大文字数: ${constraints.maxLength}文字（長めに使い切ること）`;
  const formatInstruction = modeGuide
    ? modeGuide.formatGuidance
    : '';

  const isPromoPost = template.includeServiceMention;

  const ctaInstruction = isPromoPost
    ? `## CTA（控えめに）
サービスのURLは本文中に絶対入れない。
代わりに「気になったらプロフから」「プロフにリンク置いてます」等の自然な一言に留める。
全体の文脈に溶け込むように。浮いた感じの宣伝は絶対NG。`
    : `## CTA
この投稿はCTAを一切含めない。サービス名も出さない。純粋に有益な情報配信。`;

  return `あなたはSNSマーケティングの専門家アカウントの運用者です。
信頼性と専門性が命。有料サービスを扱うアカウントなので、品格を保つこと。

## 投稿タイプ: ${template.label}
${template.instruction}

## 構成
${template.exampleStructure}

## プラットフォーム制約（${platform === 'x' ? 'X' : 'Threads'}）
${charInstruction}
${constraints.toneGuidance}
${formatInstruction}

## 参照情報（投稿のネタとして自由に使う）
${referenceSummary}

${ctaInstruction}

## 絶対禁止事項
- 以下の表現は禁止: ${bannedPhrases.join('、')}
- ハッシュタグを入れない（# で始まるタグは一切NG）
- URLやリンクを本文中に入れない
- 「!」の連発
- 絵文字の多用
- 「〜してみませんか？」等の安っぽい誘導
- 「今だけ」「限定」「残りわずか」「お見逃しなく」等の煽り
- 翻訳調・不自然な日本語
- ボット感のある定型文
- 「あなた」という呼びかけの多用

## 品格ガイドライン
- ビジネスパーソン向けの信頼あるアカウントのトーン
- 「この人はわかってるな」と思わせる知的な切り口
- 断定ではなく「〜という傾向がある」「〜だと考えてます」等
- データや具体例で説得力を持たせる
- 読む人の知性を尊重する（上から目線にしない）

## 出力形式
以下のJSON形式で出力。マークダウンのコードブロック不要。
{
  "hook": "投稿の冒頭1行（注意を引く部分）",
  "generated_text": "投稿文の全文。ハッシュタグなし。URLなし。改行を適切に含めること。"
}`;
}
