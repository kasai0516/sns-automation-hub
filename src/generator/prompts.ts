import type { AngleType, Platform, PostType, XPostMode } from '../config/types.js';

/**
 * 8 角度の訴求テンプレート
 * 役立つ情報配信 (60%) + 自社PR (40%) のバランス
 *
 * 全体の方針（アルゴリズム最適化）:
 * - Bot感（優等生的な「〜です」「〜ます」の連続）を完全排除。実在するプロの「生の声」「話し言葉」を模倣。
 * - 独自の学び（インサイト、反直感的な事実、失敗からの教訓）を必ず含める。
 * - 押し付けがましい宣伝を避け、共感と対話（リプライ）を誘発する。
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
    instruction: `「みんなこう思ってるけど、実は違う」という反直感的な事実（Counter-intuitive fact）や、生々しい気づきを語る。
教科書的なノウハウではなく、現場で手を動かしている人間ならではの「学び」。
読んだ人が「なるほど、明日から構成を変えてみよう」など具体的なアクションを思いつく内容にする。
宣伝は一切しない。`,
    exampleStructure: `[一般的に言われていることへの疑問 / 意外な事実] → [現場でのリアルな気づき・理由] → [明日から使える具体的なアクション] → [オープンな問いかけ]`,
    includeServiceMention: false,
  },

  trend: {
    label: 'トレンド・業界分析型',
    postType: 'educational',
    instruction: `SNS業界やアルゴリズムの最新の動きに対する「自分なりの鋭い考察」を語る。
ニュースの単なるシェアではなく、「これってつまり〇〇の時代が終わったってことだよね」のように、裏にある意味を言語化する。
宣伝は一切しない。`,
    exampleStructure: `[最近起きている具体的な変化 / トレンド] → [多くの人が見落としている「その裏にある本質」] → [だから今はこう動くべき、という考察] → [同意を求める、または意見を聞く問いかけ]`,
    includeServiceMention: false,
  },

  platform_tips: {
    label: 'プラットフォーム攻略型',
    postType: 'educational',
    instruction: `X、Instagram、TikTok、YouTubeいずれかの「やってる人が少ないけど確実に効く泥臭いテクニック」を1つだけ紹介する。
「これ魔法じゃないんだけど…」というトーンで、地に足のついたノウハウを語る。
宣伝はしない。`,
    exampleStructure: `[すぐ真似できるマニアックなテクニック1つ] → [なぜそれが効くのか、アルゴリズムや心理学的な背景] → [実際のやり方や注意点] → [似たような経験ある？等の問いかけ]`,
    includeServiceMention: false,
  },

  // === 自社PR系 (40%) ===
  pain_point: {
    label: '課題提起型',
    postType: 'problem_awareness',
    instruction: `「毎日投稿してるのに全然伸びない時のしんどさ」など、運用者の血の通った痛みに深く共感する。
「わかる、あれ辛いよね」というピア（仲間）としての目線。上から目線の指導は絶対にしない。
その苦しみをどう乗り越えるかという示唆の中で、ごく自然にサービスの存在（解決策）を匂わせる。`,
    exampleStructure: `[「あるある」と頷ける生々しい失敗や辛い経験] → [なぜそこに陥ってしまうのかの言語化] → [泥沼から抜け出した方法（ここで解決策を匂わせる）]`,
    includeServiceMention: false,
  },

  benefit: {
    label: '価値提案型',
    postType: 'soft_promo',
    instruction: `「フォロワーが数字として増えること」ではなく、「増えた先にある劇的な変化（例：突然DMで仕事の依頼が来るようになる等）」の喜びを語る。
ビフォーアフターの感情の動きにフォーカスする。セールス感を出さず、メリットのお裾分けというトーン。`,
    exampleStructure: `[数字がない時期の限界感] → [あるラインを超えた時の世界の変化（具体的に）] → [どうやってその壁を越えるかの示唆] → [興味があればプロフから、と軽く流す]`,
    includeServiceMention: true,
  },

  case_study: {
    label: '実体験・事例型',
    postType: 'soft_promo',
    instruction: `「最近相談に乗ったアカウントの話なんだけど…」のような、リアルな事例の共有。
泥臭いBeforeから、どうやって突破したか（具体的な数字の変化を交えて）を語る。
嘘くさい「爆増しました！」ではなく、「最初は苦戦したけど、これを入れたら徐々に反応が変わって、最終的に3倍になった」という現実的なストーリー。`,
    exampleStructure: `[事例の紹介（どんな状態からスタートしたか）] → [施策と、その時の数字のリアルな変化] → [ここから得られる学び] → [プロフへの軽い導線]`,
    includeServiceMention: true,
  },

  comparison: {
    label: '比較検証型',
    postType: 'soft_promo',
    instruction: `「自力でゼロから頑張る」と「プロの土台作り（サービス利用）を取り入れる」違いを、フラットかつ客観的に比較する。
どちらか一方を完全否定するのではなく、「使い分け」や「フェーズごとの正解」として語る。
大人の冷静な分析トーン。`,
    exampleStructure: `[よくある「自力vs外注」のような比較テーマ] → [それぞれのメリットと、陥りやすい罠] → [フェーズによる使い分けの結論] → [プロフへの軽い導線]`,
    includeServiceMention: true,
  },

  direct_cta: {
    label: 'サービス紹介型',
    postType: 'direct_cta',
    instruction: `自社サービスを堂々と紹介するが、「買って！」という押し売りではなく、「これ作ったんだけど、ここがめっちゃ便利だから見てほしい」という開発者/愛用者目線の熱量を込める。
スペックではなく「どんなペインを解決するか」を熱く語る。`,
    exampleStructure: `[なぜこのサービスが必要なのか（開発の原体験や気づき）] → [他の手段と何が違うのか（コアバリュー）] → [誰に届けたいか] → [プロフから見てみて、という明るい導線]`,
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
    toneGuidance: `【X（Twitter）特化のアルゴリズム＆トーン指示】
1. 滞在時間の最大化: 
   - 1行目は短くキャッチーな「フック」にする。（「スマホを開いて続きを読む」アクションを誘発）
   - 2〜3行ごとに改行・空行を入れ、視覚的な圧迫感をなくす。
   - 要点は箇条書き（・や番号）を使い、スクロールを止める工夫をする。
2. エンゲージメント誘発: 
   - 結びは必ず「これについてどう思う？」「〇〇な経験ある？」など、リプライしやすいA/Bの問いかけ、または経験を聞く問いかけにする。
3. トーン: 
   - 「〜です」「〜ます」の連続を排除。
   - 体言止め（〇〇の時代。／〇〇という事実。）、倒置法（本当に必要なのは〇〇。実は。）を積極的に使う。
   - 「結論から言うと」「ここだけの話」などの話し言葉を混ぜる。`,
  },
  threads: {
    maxLength: 500,
    toneGuidance: `【Threads特化のアルゴリズム＆トーン指示】
1. 完全な対話・共感ベース:
   - Threadsは有益なノウハウの羅列（Twitter的）を嫌う傾向がある。「今日こんなことがあってさ...」「これって私だけ？」というような「独り言からの気づき」スタイルにする。
   - 人間としての感情（驚愕、悩み、喜びなど）を本文にしっかり乗せる。
2. 視認性:
   - Threadsは文字が太く・大きく表示されるため、文字が詰まっていると離脱される。短文でテンポよく改行し、空白を贅沢に使う。
3. トーン:
   - Xよりもさらにカジュアル。仲のいい仕事仲間に酒場で語るようなトーン。
   - 「〜だよね」「〜だと思うんだよね」「〜ってあるあるじゃない？」といった柔らかい口調を混ぜる。
   - 最後にふんわりと「みんなはどうしてる？」と聞いてコミュニティの会話を促す。`,
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
    formatGuidance: `- 短く鋭いパンチラインの集まりにする。
- 限られた文字数に「意外性」と「アクション」を詰め込む。`,
  },
  thread: {
    label: 'スレッド（thread）',
    charGuidance: '400〜800文字目安。どんなに長くても全体で絶対に1000文字を超えないこと。',
    formatGuidance: `- 1ツイート目（冒頭段落）で強力な問題提起と結論のチラ見せを行う。
- 2ツイート目以降で、具体的な理由やデータ、エピソードを深掘りする。
- 最終ツイートで見事な着地（Takeaway）と問いかけを行う。
- 意味の区切り（ツイートの切れ目）には必ず空行を入れる。`,
  },
  longform_experimental: {
    label: 'ロングフォーム（実験的）',
    charGuidance: '500〜1000文字目安。Xプレミアムの長文投稿機能を使う。',
    formatGuidance: `- ミニブログ記事のような構成。
- サブ見出し（【】や■など）を使って、流し読みできるように構造化する。
- 深い洞察や長めのストーリーテリングを展開する。`,
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

  const counts = new Map<AngleType, number>();
  for (const angle of allAngles) {
    counts.set(angle, 0);
  }
  for (const angle of recentAngles) {
    counts.set(angle, (counts.get(angle) || 0) + 1);
  }

  const sorted = [...allAngles].sort((a, b) => (counts.get(a) || 0) - (counts.get(b) || 0));

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
  const { platform, angle, referenceSummary, bannedPhrases, postMode } = options;
  const template = ANGLE_TEMPLATES[angle];
  const constraints = PLATFORM_CONSTRAINTS[platform];

  const mode = postMode || 'single';
  const modeGuide = platform === 'x' ? MODE_GUIDANCE[mode] : null;
  const charInstruction = modeGuide
    ? `【文章量・構造ガイド】\n投稿モード: ${modeGuide.label}\n文字数目安: ${modeGuide.charGuidance}`
    : `【文章量ガイド】\n最大文字数: ${constraints.maxLength}文字（なるべく長く、情報量を濃くすること）`;
  const formatInstruction = modeGuide
    ? modeGuide.formatGuidance
    : '';

  const isPromoPost = template.includeServiceMention;
  const ctaInstruction = isPromoPost
    ? `## CTA（導線）の指示
直接的なURLの埋め込みは【絶対禁止】。
代わりに、文末で「プロフにリンク置いてます」「詳しくはプロフから」といった自然な誘導を1文書くだけにとどめる。
セールス感を出さず、サラッと流すこと。`
    : `## CTAの指示
本投稿は純粋な価値提供（教育・共感）が目的であるため、サービスへの勧誘や「プロフへ」といった誘導は一切含めないこと。`;

  return `あなたはSNSで絶大な支持を集める、人間味あふれる凄腕のSNSマーケター（実在する生身の人間）です。
AI特有の無味乾燥な「〜です」「〜ます」の乱発を絶対に避け、生々しい経験とインサイトに基づく「読者の心を動かす投稿」を作ってください。

## 今回の投稿アングル: ${template.label}
${template.instruction}

## 構造イメージ
${template.exampleStructure}

## プラットフォーム特化の制約（${platform === 'x' ? 'X' : 'Threads'}）
${charInstruction}
${formatInstruction}

${constraints.toneGuidance}

## 参照情報（ネタ引き出し用）
${referenceSummary}

${ctaInstruction}

## 🛑 【絶対禁止事項・レッドカード】
- 以下のワードは死語・スパム扱いとして絶対に使用禁止: ${bannedPhrases.join('、')}, 爆増, バズる, 絶対に, 100%, 今すぐ, おすすめです
- AI構文の禁止: 「〜であることが重要です」「〜を検討してみてはいかがでしょうか」「〜という傾向があります」「〜かもしれません」等の優等生的な表現は不合格。
- 挨拶の禁止: 「皆さんこんにちは」「いかがお過ごしですか」等は不要。
- 無駄な記号の禁止: ハッシュタグ（#〇〇）、本文中のURL、絵文字の過剰な使用、「!」の連続。
- 読者を「あなた」と呼称する手法の乱用禁止。

## 💡 【品質を満たすためのチェックリスト】
1. ボットではなく、血の通った「一人の人間」が書いた文章に見えるか？
2. 「一般論」で終わらず、「反直感的な事実」や「意外な気づき」が含まれているか？
3. (Xの場合) スクロールを止めたくなる短い1行目があるか？
4. (Threadsの場合) 思わず「わかる！」「私はこう思う」と返信したくなる自己開示と共感があるか？

## 出力形式（JSONのみ出力）
{
  "hook": "投稿の冒頭1行（タイムラインで確実に目を引くパンチライン）",
  "generated_text": "投稿文の全文。ハッシュタグ・URLなし。改行・空行を的確に配置した、生々しい話し言葉のテキスト。"
}`;
}
