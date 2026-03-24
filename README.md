# SNS Automation Hub

CLI ベースの SNS 自動投稿ハブ。AI SEO Writer / GlobeSNS の宣伝投稿を自動生成・投稿・履歴管理します。

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
npm run post -- --account ai-seo-x --mode dry-run

# プラットフォーム指定
npm run post:x:test        # X 全アカウント
npm run post:threads:test  # Threads 全アカウント
npm run post:all:test      # 全アカウント
```

### 実投稿（publish）

```bash
npm run post -- --account ai-seo-x --mode publish
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

| ID | Platform | Service |
|----|----------|---------|
| `ai-seo-x` | X | AI SEO Writer |
| `ai-seo-threads` | Threads | AI SEO Writer |
| `globesns-x` | X | GlobeSNS |
| `globesns-threads` | Threads | GlobeSNS |

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
