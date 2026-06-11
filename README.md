# SNS Automation Hub

CLI ベースの SNS 自動投稿ハブ。AI で宣伝投稿を自動生成・投稿・履歴管理します。

## セットアップ

```bash
npm install
cp .env.example .env
# .env を編集して API キーを設定
```

## 使い方

### 投稿生成（dry-run）

```bash
# 特定アカウントで dry-run
npm run post -- --account globesns-x --mode dry-run

# プラットフォーム指定
npm run post:x:test        # X 全アカウント
npm run post:threads:test  # Threads 全アカウント
npm run post:all:test      # 全アカウント
```

### 実投稿（publish）

```bash
npm run post -- --account spi-webtest-x --mode publish
npm run post:x             # X 全アカウント
```

### その他

```bash
npm run validate:env    # 環境変数チェック
npm run history:list    # 履歴一覧
npm run history:recent  # 直近の履歴
npm test                # テスト実行
```

## アカウント構成

| ID | Platform | Service | 投稿スケジュール (JST) |
|----|----------|---------|----------------------|
| `globesns-x` | X | GlobeSNS (フォロワー販売) | 08:00, 12:30, 20:00 |
| `globesns-threads` | Threads | GlobeSNS | 08:30, 13:00, 20:30 |
| `ai-seo-x` | X | AI SEO Writer | 毎時07分 |
| `ai-seo-threads` | Threads | AI SEO Writer | 毎時17分 |
| `spi-webtest-x` | X | Webテスト解答集 (@spi_webtesting) | 09:00, 14:00, 21:00 |
| `webtest-answer-x` | X | Webテスト解答集 (@webtest_Answer_) | 10:00, 15:30, 22:00 |

## サービス構成

| Service Name | 用途 |
|---|---|
| `globesns` | SNSフォロワー獲得サービス宣伝 |
| `ai-seo-writer` | AI SEOライター宣伝 |
| `webtest` | Webテスト解答集宣伝 (就活支援) |

## ディレクトリ構成

```
config/         # サービス・アカウント設定 (JSON)
data/           # 投稿履歴
src/
  cli/          # CLI エントリポイント
  config/       # 型定義・設定読み込み
  generator/    # LLM 投稿文生成
  source/       # URL コンテンツ取得・要約
  adapters/     # SNS API アダプター (X, Threads)
  dedupe/       # 重複判定
  utm/          # UTM パラメータ生成
  storage/      # 履歴保存
  scheduler/    # スケジュール管理
  utils/        # ロガー・環境変数
tests/          # テスト
.github/        # GitHub Actions ワークフロー
```

## 環境変数

`.env.example` を参照してください。最低限 `LLM_PROVIDER` と対応する API キーが必要です。

### 新アカウント追加時に必要な GitHub Secrets

```
SPI_WEBTEST_X_API_KEY
SPI_WEBTEST_X_API_SECRET
SPI_WEBTEST_X_ACCESS_TOKEN
SPI_WEBTEST_X_ACCESS_SECRET
WEBTEST_ANSWER_X_API_KEY
WEBTEST_ANSWER_X_API_SECRET
WEBTEST_ANSWER_X_ACCESS_TOKEN
WEBTEST_ANSWER_X_ACCESS_SECRET
```
