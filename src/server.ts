import * as cheerio from "cheerio";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const BASE = "https://ai.google.dev";
const DOC_PATH = "/gemini-api/docs/image-generation";
const DEFAULT_LANG = "ja";

// ---- utils ----
function withLang(pathOrUrl: string, hl = DEFAULT_LANG) {
  const u = new URL(pathOrUrl, BASE);
  if (hl) u.searchParams.set("hl", hl);
  return u.toString();
}

async function fetchDoc(lang = DEFAULT_LANG) {
  const url = withLang(DOC_PATH, lang);
  const res = await fetch(url, { headers: { "User-Agent": "MCP-nanobanana-rules/0.1" } });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  const html = await res.text();
  return { url, html };
}

function extractCorePoints(html: string) {
  const $ = cheerio.load(html);
  const text = $("main").text() || $("article").text() || $.root().text();
  const hasSynthID = /SynthID/.test(text);
  const mentionsInlineData = /(inline[-_ ]?data|base64|MIME)/i.test(text);
  return { hasSynthID, mentionsInlineData };
}

// ---- MCP server ----
const server = new McpServer({
  name: "nanobanana-rules",
  version: "0.1.1"
});

// tool: get_rules
server.tool(
  "get_rules",
  {
    lang: z.string().optional().describe("ja / en など（省略時 ja）"),
    model: z
      .string()
      .optional()
      .describe("モデル名。省略時は gemini-2.5-flash-image-preview"),
  },
  async (args) => {
    const lang = args.lang ?? DEFAULT_LANG;
    const model = args.model ?? "gemini-2.5-flash-image-preview";

    // fetch docs
    const { url, html } = await fetchDoc(lang);
    const flags = extractCorePoints(html);

    const rules = {
      version: "2025-09-02",
      references: { image_generation_doc: url },
      policies: {
        content_rights_required: true,
        prohibited_use_policy_url: `https://policies.google.com/terms/generative-ai?hl=${lang}`,
        synthid_watermark_expected: flags.hasSynthID,
        notes: [
          "他者の権利を侵害する画像の生成は禁止。",
          "安全ポリシー・使用禁止ポリシーの順守が必要。"
        ]
      },
      modes_supported: [
        "text_to_image",
        "image_editing_with_text",
        "multi_image_to_image",
        "multi_turn_image_editing"
      ],
      input_format: {
        model,
        contents_schema: {
          type: "array",
          description:
            "ユーザーとシステムのパーツ列。画像は inlineData で base64+MIME を指定。",
          items: {
            oneOf: [
              { type: "string", description: "テキストパート" },
              {
                type: "object",
                description: "画像パート",
                properties: {
                  inlineData: {
                    type: "object",
                    properties: {
                      mimeType: { type: "string", description: "例: image/png, image/jpeg" },
                      data: { type: "string", description: "base64エンコード画像データ" }
                    },
                    required: ["mimeType", "data"]
                  }
                },
                required: ["inlineData"]
              }
            ]
          }
        },
        notes: flags.mentionsInlineData
          ? ["画像は inlineData.mimeType と base64(data) で渡す。"]
          : []
      },
      prompting_guidelines: {
        describe_subjects: [
          "被写体（年齢/性別/ポーズ/表情）",
          "構図（クローズアップ/全身/俯瞰/対角など）",
          "背景/環境（屋内/屋外/時刻/天候/質感）",
          "光（柔らかい/硬い/逆光/リムライト/色温度）",
          "スタイル（現実的/アニメ/イラスト/画家・写真家の流儀）",
          "色/ムード（鮮やか/パステル/モノトーン/神秘的）",
          "追加要素（粒子/発光/モーションの雰囲気）"
        ],
        keep_in_mind: [
          "要求は具体的かつ簡潔に。禁止事項や権利に配慮する。",
          "編集の場合：『何を』『どう変えるか』を明確に（追加/削除/色/質感/形）。",
          "複数画像の場合：『役割』を明記（構図参照/スタイル参照 など）。",
          "対話を重ねて徐々に調整する（マルチターン編集）。"
        ]
      },
      template: {
        text_to_image: {
          model,
          contents: [
            "A concise, vivid description of the desired image with key attributes (subject, setting, lighting, style, mood)."
          ]
        },
        image_editing_with_text: {
          model,
          contents: [
            "Describe precise edits to apply to the uploaded image (what-to-change and how).",
            { inlineData: { mimeType: "image/png", data: "<BASE64_IMAGE>" } }
          ]
        },
        multi_image_to_image: {
          model,
          contents: [
            "Compose a new scene blending the structure from image A and the style from image B. Keep faces natural.",
            { inlineData: { mimeType: "image/jpeg", data: "<BASE64_IMG_A>" } },
            { inlineData: { mimeType: "image/png",  data: "<BASE64_IMG_B>" } }
          ]
        }
      }
    };

    // SDK 1.x は {type:"json"} での返却がないので text でJSON文字列を返す
    return {
      content: [{ type: "text", text: JSON.stringify(rules, null, 2) }]
    };
  }
);

// stdio connect
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("nanobanana-rules MCP server running on stdio");
