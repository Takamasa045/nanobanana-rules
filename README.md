# ナノバナナルール (nanobanana-rules)

Gemini API の画像生成に関するガイドラインを取得できる MCP サーバーです。CLI やエディタから Model Context Protocol (MCP) 経由で呼び出し、最新のドキュメントを参照した要点とテンプレートを JSON で返します。

## セットアップ

- 前提: Node.js 18+ / npm
- 依存関係のインストール:

```
npm install
```

- TypeScript ビルド:

```
npm run build
```

- 実行 (stdio):

```
npm start
```

## MCP ツール

- `get_rules`:
  - 説明: Gemini API の画像生成に関するルール/ガイドラインを取得
  - 引数:
    - `lang` (任意): `ja` や `en` など。既定 `ja`
    - `model` (任意): 既定 `gemini-2.5-flash-image-preview`
  - 返り値: JSON を文字列化したテキスト

## プロジェクト構成

- `src/server.ts`: MCP サーバー本体
- `dist/`: ビルド成果物 (git 追跡対象外)

## Git 公開の手順

1. このフォルダで Git を初期化
2. 初回コミットを作成
3. GitHub/GitLab などで新規リポジトリを作成し、リモートを追加して push

例 (GitHub の場合):

```
# 初期化と初回コミット
git init
git add .
git commit -m "Initial commit: nanobanana-rules"

# GitHub で空のリポジトリを作成後、その URL を設定
# 例: https://github.com/<USER>/nanobanana-rules

git remote add origin https://github.com/<USER>/nanobanana-rules.git
git branch -M main
git push -u origin main
```

> 注意: push には GitHub アカウントとトークン設定が必要です。

## ライセンス

未設定。公開ポリシーに応じてライセンスを追加してください（例: MIT/Apache-2.0 等）。
