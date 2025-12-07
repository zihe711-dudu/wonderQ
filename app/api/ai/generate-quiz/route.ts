import { NextRequest, NextResponse } from "next/server";

type GenerateBody = {
  topic?: string;
  grade?: string;
  difficulty?: string;
  count?: number;
  lang?: string;
  withImages?: boolean;
};

type QuizQuestion = {
  id: string;
  prompt: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  imageUrl?: string | null;
  imagePrompt?: string;
};

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "未設定 OPENAI_API_KEY" }, { status: 400 });
    }
    const body = (await req.json()) as GenerateBody;
    const count = Math.min(Math.max(Number(body.count) || 20, 1), 30);
    const topic = body.topic?.trim() || "台灣自然科學";
    const grade = body.grade?.trim() || "G4";
    const difficulty = body.difficulty?.trim() || "easy";
    const withImages = Boolean(body.withImages);

    // 指令：要求只回 JSON，符合我們的型別
    const systemPrompt = `你是一位台灣國小老師，請以繁體中文、台灣用語，為 ${grade} 學生設計 ${count} 題 ${topic} 四選一題目。`;
    const userPrompt = `
規範：
- 每題物件為：{ id, prompt, options[4], correctIndex }
- options 必須 4 個且彼此不重複、不可含「以上皆是」「以上皆非」
- correctIndex 為 0~3 的整數，對應 options 正確答案的位置
- 提問友善、簡潔、避免專業術語；不涉及敏感/個資
- 只回傳 JSON 格式：{ "questions": QuizQuestion[] }
參數：年級=${grade}、主題=${topic}、數量=${count}、難度=${difficulty}
    `.trim();

    // 使用 OpenAI Chat Completions（JSON 模式）
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7
      })
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return NextResponse.json({ error: "AI 產生失敗", detail: errText }, { status: 500 });
    }

    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content;
    let parsed: any = null;
    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json({ error: "AI 輸出非 JSON" }, { status: 500 });
    }

    const rawList = Array.isArray(parsed?.questions) ? parsed.questions : [];
    let questions: QuizQuestion[] = rawList
      .slice(0, count)
      .map((q: any, idx: number) => {
        const opts = Array.isArray(q?.options) ? q.options.slice(0, 4) : [];
        while (opts.length < 4) opts.push("（空）");
        return {
          id: q?.id || `ai-q-${idx}-${Date.now()}`,
          prompt: String(q?.prompt || "").trim() || `題目 ${idx + 1}`,
          options: [String(opts[0] || ""), String(opts[1] || ""), String(opts[2] || ""), String(opts[3] || "")] as [
            string,
            string,
            string,
            string
          ],
          correctIndex: ([0, 1, 2, 3].includes(q?.correctIndex) ? q.correctIndex : 0) as 0 | 1 | 2 | 3,
          imageUrl: null,
          imagePrompt: undefined
        };
      })
      .filter((q: QuizQuestion) => q.prompt && q.options.every((o) => o));

    if (questions.length === 0) {
      return NextResponse.json({ error: "AI 題目解析失敗，請再試一次" }, { status: 500 });
    }

    // 後處理：打散正解位置，避免正解都集中在同一個選項
    questions = questions.map((q, idx) => {
      const targetIndex = idx % 4; // 0,1,2,3 輪替，平均分布
      if (q.correctIndex !== targetIndex) {
        const opts = [...q.options] as [string, string, string, string];
        const tmp = opts[targetIndex];
        opts[targetIndex] = opts[q.correctIndex];
        opts[q.correctIndex] = tmp;
        q.options = opts;
        q.correctIndex = targetIndex as 0 | 1 | 2 | 3;
      }
      q.imagePrompt = [
        "以兒童友善、明亮活潑、簡潔教學插畫風，與題目情境相符，避免畫面上出現任何文字或字母。",
        `題目：「${q.prompt}」`,
        "構圖：3:2（寬 > 高），主體清楚、對比溫和、不可過度擁擠。"
      ].join("\n");
      return q;
    });

    // 選用：替每題生成一張情境圖片（之後可由老師替換）
    if (withImages) {
      // 直接全量生成圖片可能造成回應過大；保守生成前 4 張，其餘由前端按需請求
      const limit = Math.min(4, questions.length);
      for (let i = 0; i < limit; i++) {
        const q = questions[i];
        try {
          const imagePrompt = [
            "兒童友善、明亮活潑、教學插畫風格。",
            "情境需要與下面的題目相符，避免文字與字母出現在畫面上。",
            "主題重點清晰、容易理解，顏色柔和，視覺不複雜。",
            `題目內容：「${q.prompt}」`,
            "請產生單一畫面，3:2 構圖（寬大於高），適合國小生。"
          ].join("\n");
          const imgResp = await fetch("https://api.openai.com/v1/images/generations", {
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
          if (imgResp.ok) {
            const imgData = await imgResp.json();
            const b64 = imgData?.data?.[0]?.b64_json;
            if (b64) {
              q.imageUrl = `data:image/png;base64,${b64}`;
            }
          }
          q.imagePrompt = imagePrompt;
        } catch {
          // 忽略單題失敗，繼續其他題
        }
      }
    }

    return NextResponse.json({ questions }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "未知錯誤" }, { status: 500 });
  }
}


