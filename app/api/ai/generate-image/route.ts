import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "未設定 OPENAI_API_KEY" }, { status: 400 });
    }
    const { prompt } = await req.json();
    const imagePrompt = String(prompt || "").trim();
    if (!imagePrompt) {
      return NextResponse.json({ error: "缺少 prompt" }, { status: 400 });
    }
    const resp = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        // 使用 DALL-E 2（默认），支持 b64_json；DALL-E 3 只支持 url
        prompt: imagePrompt,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json"
      })
    });
    if (!resp.ok) {
      const detail = await resp.text();
      return NextResponse.json({ error: "AI 產圖失敗", detail }, { status: 500 });
    }
    const data = await resp.json();
    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) {
      return NextResponse.json({ error: "AI 產圖回傳空白" }, { status: 500 });
    }
    return NextResponse.json({ image: `data:image/png;base64,${b64}` }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "未知錯誤" }, { status: 500 });
  }
}


