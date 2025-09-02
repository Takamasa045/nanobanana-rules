# ナノバナナルール (nanobanana-rules)

Gemini API の画像生成に関するガイドラインをライブ取得して抜粋し、JSON で返す Model Context Protocol (MCP) サーバーです。

## 概要 / 特徴 / 注意

- 特徴: ai.google.dev のドキュメントを都度取得し、要点を抽出してテンプレート付きで返します。
- 抜粋: SynthID 言及や inlineData 仕様など、実装に重要なキーワードを自動検出します。
- 出典URL: 返却 JSON にドキュメント URL を含めます。
- 非公式: Google/ai.google.dev 非公式の補助ツールです。内容の正確性や最新性は保証しません。

## セットアップ

- 前提: Node.js 18 以上
- 依存関係のインストール: `npm i`
- ビルド: `npm run build`
- 実行 (stdio): `npm start`

## Claude Code 連携

エディタやターミナルから Claude Code に MCP サーバーを登録できます。

```
claude mcp add nanobanana-rules --scope user -- node $PWD/dist/server.js
```

## ツール例

```
get_rules { "lang": "ja", "model": "gemini-2.5-flash-image-preview" }
```

## 免責

- 取得元は ai.google.dev。各種規約・robots.txt を遵守します。
- 永続キャッシュは行いません（短時間のメモリキャッシュのみ）。

## MCP Inspector（動作確認）

```
npx @modelcontextprotocol/inspector node dist/server.js
```

## プロジェクト構成

- `src/server.ts`: MCP サーバー本体
- `dist/`: ビルド成果物（git 追跡対象外）

## ライセンス

MIT License（`LICENSE` を参照）。
