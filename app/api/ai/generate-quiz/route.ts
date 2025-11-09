import { NextRequest, NextResponse } from "next/server";

type GenerateBody = {
  topic?: string;
  grade?: string;
  difficulty?: string;
  count?: number;
  lang?: string;
};

type QuizQuestion = {
  id: string;
  prompt: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
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
    const questions: QuizQuestion[] = rawList
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
          correctIndex: ([0, 1, 2, 3].includes(q?.correctIndex) ? q.correctIndex : 0) as 0 | 1 | 2 | 3
        };
      })
      .filter((q: QuizQuestion) => q.prompt && q.options.every((o) => o));

    if (questions.length === 0) {
      return NextResponse.json({ error: "AI 題目解析失敗，請再試一次" }, { status: 500 });
    }

    return NextResponse.json({ questions }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "未知錯誤" }, { status: 500 });
  }
}


