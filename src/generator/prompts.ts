import type { AngleType, Platform, PostType, XPostMode } from '../config/types.js';

/**
 * 8 角度の訴求テンプレート
 * 「見栄」「初速」「時短」「コスパ」を強烈にプッシュするダイレクトマーケティング特化
 * 
 * 全体の方針:
 * - 綺麗事は捨てる。「SNSは結局、最初の見栄え（フォロワー数）が9割」という本音を突く。
 * - 短く、パンチが効いていて、煽りすぎないが刺さる文章。長文は不要。
 * - 「ボットじゃなくプロモーションで増やすから安全」「30日減少保証つき」「安い」を適宜盛り込む。
 */
export const ANGLE_TEMPLATES: Record<AngleType, {
  label: string;
  postType: PostType;
  instruction: string;
  exampleStructure: string;
  includeServiceMention: boolean;
}> = {
  educational: {
    label: '現実突きつけ型',
    postType: 'educational',
    instruction: `「いい投稿を作れば伸びる」という綺麗事を否定する。
現実問題として、フォロワー数が少ないアカウントの投稿は誰も読まないというシビアな事実を突きつける。
解決策として「まずは外見（数字）をサクッと整えること」の重要性を説く。宣伝は露骨にせず匂わせる程度。`,
    exampleStructure: `[綺麗事の否定] → [SNSの残酷な現実（数字がないとスルーされる）] → [だから最初はショートカット（数字を買う・初速を作る）が賢いという結論]`,
    includeServiceMention: true,
  },

  trend: {
    label: '効率化・時短型',
    postType: 'educational',
    instruction: `フォロワーを自力で1000人増やすための「膨大な時間と労力（時給換算）」の無駄を指摘する。
数ヶ月〜数年かけるくらいなら、数千円払って一瞬で土台を作った方が圧倒的にコスパが良いというロジック。`,
    exampleStructure: `[自力運用のしんどさと時間の無駄] → [「時間はお金で買える」という発想の転換] → [ショートカットして空いた時間でコンテンツに集中しようという提案]`,
    includeServiceMention: true,
  },

  platform_tips: {
    label: '権威性・見栄え型',
    postType: 'educational',
    instruction: `人間は「他人が支持しているものを支持する（バンドワゴン効果）」という心理学的な事実を語る。
フォロワー数＝お店の行列と同じ。行列があるから人が並ぶ。だから、最初は人工的にでも行列を作るべきだという主張。`,
    exampleStructure: `[人間は中身より「見た目の数字」で判断するという真理] → [フォロワー数＝店前の行列の法則] → [最初にハクをつける賢い戦略の提案]`,
    includeServiceMention: true,
  },

  pain_point: {
    label: 'リスク排除・安全性型',
    postType: 'problem_awareness',
    instruction: `「フォロワーを買うと凍結される」という読者の不安（ペイン）に先回りして答える。
粗悪な海外Botを買えば当然凍結されるが、正規のプロモーションで「リアルなアクティブユーザー」を誘導する仕組みなら安全であることを説明する。`,
    exampleStructure: `[よくある不安の代弁（凍結怖いよね）] → [粗悪なBotと、安全なプロモーション増加の違い] → [リスクゼロでスタートダッシュを切る方法]`,
    includeServiceMention: true,
  },

  benefit: {
    label: '保証・安心感型',
    postType: 'soft_promo',
    instruction: `「買ってもすぐ減るんでしょ？」という疑念を潰す。
30日間の減少保証がついていること、パスワード提供が一切不要であることなど、サービスのストロングポイント（安心感）を端的に伝える。`,
    exampleStructure: `[すぐ減る・乗っ取られるという業界の闇] → [パスワード不要・30日保証の強み] → [安心してお金で解決できるなら、それに越したことはないというスタンス]`,
    includeServiceMention: true,
  },

  case_study: {
    label: 'コスパ強調型',
    postType: 'soft_promo',
    instruction: `飲み代1回分、またはちょっとした外食を我慢する程度の金額で、SNSの「見栄え」が買えるという圧倒的なコストパフォーマンスをアピールする。
金額的なハードルの低さを強調する。`,
    exampleStructure: `[たった〇〇円（飲み会1回分など）という提示] → [それで得られるSNS上の圧倒的なハク（権威性）] → [費用対効果の良さの強調]`,
    includeServiceMention: true,
  },

  comparison: {
    label: '比較検証型',
    postType: 'soft_promo',
    instruction: `「1日3時間の運用を毎日続けて月間90時間消費するルート」vs「数千円払って1日で土台を終わらせるルート」を露骨に比較する。
賢い経営者やクリエイターは皆、後者を選んで裏でこっそり数字を整えているというニュアンス。`,
    exampleStructure: `[泥臭い運用vs賢い課金運用の比較] → [時給換算での圧倒的な敗北（自力運用）] → [賢い人は見えないところでショートカットしているという事実]`,
    includeServiceMention: true,
  },

  direct_cta: {
    label: '直球ダイレクト・セールス型',
    postType: 'direct_cta',
    instruction: `ストレートにサービスを売る。
「フォロワー数が伸び悩んでいるなら、さっさと数字を整えて次のフェーズに行こう」と背中を押す。
「Bot不使用」「30日保証」「即日開始」の3拍子を揃えて、迷う理由をなくす。`,
    exampleStructure: `[現状打破のストレートな提案] → [GlobeSNSの3つの強み（Botなし/保証/パスワード不要）] → [プロフへの強い誘導]`,
    includeServiceMention: true,
  },
};

// ===== プラットフォーム制約 =====

export const PLATFORM_CONSTRAINTS: Record<Platform, {
  maxLength: number;
  toneGuidance: string;
}> = {
  x: {
    maxLength: 140, // 短文推しに変更
    toneGuidance: `【X（Twitter）特化のトーン指示】
- 長文は不要。スクロールの手を止める短いパンチラインで勝負する。
- 綺麗事は言わず、人間の「見栄」「怠惰」「欲」に直接刺さる言葉選び。
- 1投稿あたり2〜3文程度、ズバッと言い切る形でOK。
- 「。」を省いたり、体言止めを使ったりしてテンポ良く。`,
  },
  threads: {
    maxLength: 200, // 短文推しに変更
    toneGuidance: `【Threads特化のトーン指示】
- Threads特有の「ポツリとつぶやく」リアリティを残す。
- 広告っぽさを消し、「ぶっちゃけた話さ…」というトーンで、SNSのリアルな裏側を語るような文脈。
- 行間を空けてサラッと読ませる。`,
  },
};

// ===== X投稿モード別ガイダンス =====

// 文章は短くするという要望のため、基本はsingleのみ。
// 仕組み上必須の変数のため残すが、すべて短文志向に書き換える。
export const MODE_GUIDANCE: Record<XPostMode, {
  label: string;
  charGuidance: string;
  formatGuidance: string;
}> = {
  single: {
    label: '通常（single）',
    charGuidance: '80〜140文字目安。無駄を削ぎ落として鋭く短く。',
    formatGuidance: `- スマホでパッと読める短さ。
- 結論・本音だけをズバッと書く。`,
  },
  thread: {
    label: 'スレッド（thread）※原則短文',
    charGuidance: '全体で150〜300文字程度。2〜3ツイートで終わる短いスレッド。',
    formatGuidance: `- 1ツイート目で本音を暴露。
- 2ツイート目で理由と解決策（サービス匂わせ）。`,
  },
  longform_experimental: {
    label: 'ロングフォーム（不使用推奨）',
    charGuidance: '200〜400文字目安。読み疲れさせない長さ。',
    formatGuidance: `- 短く鋭い文章の塊にする。`,
  },
};

// ===== PostType 理想分布 =====
// セールスに直結する角度を増やす
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
    : `【文章量ガイド】\n目安文字数: 100〜200文字（無駄な長文は読まれないので、短く鋭く）`;
  const formatInstruction = modeGuide
    ? modeGuide.formatGuidance
    : '';

  // CTAの指示（サービス匂わせを強く、直接的にする）
  const isPromoPost = template.includeServiceMention;
  const ctaInstruction = isPromoPost
    ? `## サービス訴求の指示（重要）
本文の最後に「気になったらプロフ見て」「プロフに置いてます」など、プロフィールのリンクへの導線を必ず入れること。
【訴求に含めるべき要素（以下のうち1〜2個を自然に文に混ぜる）】
- 粗悪なBOTではなくプロモーションによる安全な増加
- 30日間減少保証
- パスワード不要
- 飲み代1回分の安さ`
    : `## CTAの指示
本投稿は宣伝色を少し抑えますが、最後には自然に「気になればプロフから」程度の誘導は入れても構いません。`;

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

## 参照情報（ネタ引き出し・サービス情報用）
${referenceSummary}

${ctaInstruction}

## 🛑 【絶対禁止事項・レッドカード】
- 以下のワードは死語・スパム扱いとして絶対に使用禁止: ${bannedPhrases.join('、')}, 爆増, バズる, 絶対に, 100%, 今すぐ, おすすめです
- AI構文の禁止: 「〜であることが重要です」「〜を検討してみてはいかがでしょうか」「〜という傾向があります」「〜かもしれません」等の優等生的な表現は即却下されます。
- お節介・説教くさいトーンの禁止: 「〜しましょう」「〜してください」など。あくまで「俺はこう思う」「賢い人はこうしてる」という客観的事実ベースで語る。
- 挨拶の禁止: 「皆さんこんにちは」「いかがお過ごしですか」等は不要。
- 無駄な記号の禁止: ハッシュタグ（#〇〇）、本文中のURLの直書き、絵文字の過剰な使用、「!」の連続。

## 💡 【品質を満たすためのチェックリスト】
1. ボットではなく、リアリストな「一人の人間」が、本音・ぶっちゃけ話をしているように見えるか？
2. 読者の「楽をしたい」「ショートカットしたい」「見栄を張りたい」という本音を肯定し、背中を押す内容か？
3. 無駄に長い文章になっていないか？短く鋭いパンチラインになっているか？

## 出力形式（JSONのみ出力）
{
  "hook": "投稿の冒頭1行（綺麗事をぶち壊す、本音のパンチライン）",
  "generated_text": "投稿文の全文。ハッシュタグ・URLなし。短く、鋭く、本音を突き刺すテキスト。"
}`;
}
