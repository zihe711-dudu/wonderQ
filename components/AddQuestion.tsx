"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { STORAGE_KEY, type QuizQuestion } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listenUser, type SimpleUser } from "@/lib/auth";
import { isTeacher } from "@/lib/teachers";
import { publishPublicQuiz } from "@/lib/cloud";
import { fileToResizedDataUrl, resizeDataUrl } from "@/lib/images";

type OptionsArray = [string, string, string, string];

function loadExisting(): QuizQuestion[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as QuizQuestion[];
  } catch {
    return [];
  }
}

export default function AddQuestion() {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [isTeacherUser, setIsTeacherUser] = useState<boolean>(false);
  const [shareLink, setShareLink] = useState<string>("");
  useEffect(() => {
    const unsub = listenUser(async (u) => {
      setUser(u);
      if (u) {
        const ok = await isTeacher(u.uid);
        setIsTeacherUser(ok);
      } else {
        setIsTeacherUser(false);
      }
    });
    return () => unsub();
  }, []);
  const [prompt, setPrompt] = useState<string>("");
  const [options, setOptions] = useState<OptionsArray>(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState<0 | 1 | 2 | 3>(0);
  const [message, setMessage] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  const isValid = useMemo(() => {
    return (
      prompt.trim().length > 0 &&
      options.every((o) => o.trim().length > 0) &&
      correctIndex >= 0 &&
      correctIndex <= 3
    );
  }, [prompt, options, correctIndex]);

  const resetForm = useCallback(() => {
    setPrompt("");
    setOptions(["", "", "", ""]);
    setCorrectIndex(0);
    setImagePreview(null);
  }, []);

  const onChangeOption = useCallback(
    (idx: number, value: string) => {
      setOptions((prev) => {
        const next = [...prev] as OptionsArray;
        next[idx as 0 | 1 | 2 | 3] = value;
        return next;
      });
    },
    [setOptions]
  );

  const onSubmit = useCallback(() => {
    if (!isValid) {
      setMessage("請把題目與四個選項都填好喔！");
      return;
    }
    const newQ: QuizQuestion = {
      id: crypto.randomUUID(),
      prompt: prompt.trim(),
      options: [
        options[0].trim(),
        options[1].trim(),
        options[2].trim(),
        options[3].trim()
      ],
      correctIndex,
      imageUrl: imagePreview ?? null
    };
    const existing = loadExisting();
    const next = [...existing, newQ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setMessage("新增成功！已經把題目存到電腦裡囉！");
    resetForm();
  }, [isValid, prompt, options, correctIndex, imagePreview, resetForm]);

  const onClearAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setMessage("已清空所有本機題目！");
  }, []);

  if (!isTeacherUser) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>出題囉（老師）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl bg-yellow-100 px-4 py-2 text-sm text-gray-900">
            只有白名單老師可以在這裡發佈公共題庫。請向管理者申請加入白名單。
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>出題囉（公共題庫）</CardTitle>
        <CardDescription>老師可以自行輸入單題，或使用 AI 一次產生 20 題。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Button
            className="btn-cute btn-blue"
            onClick={async () => {
              const topic = window.prompt("請輸入主題（例如：四年級自然科：動物分類）", "四年級自然科：動物分類") ?? "";
              if (!topic.trim()) return;
              const title = window.prompt("請輸入題庫名稱：", topic.trim()) ?? topic.trim();
              try {
                setMessage("AI 出題中，請稍候…");
                const resp = await fetch("/api/ai/generate-quiz", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ topic, grade: "G4", difficulty: "easy", count: 20, withImages: true })
                });
                const data = await resp.json();
                if (!resp.ok) throw new Error(data?.error || "AI 產生失敗");
                let questions: QuizQuestion[] = data?.questions ?? [];
                // 若缺圖：改由後端逐題產圖，避免一次回傳過大；完成後壓縮至 3:2
                for (let i = 0; i < questions.length; i++) {
                  const q = questions[i] as any;
                  if (!q.imageUrl) {
                    try {
                      const p =
                        q.imagePrompt ||
                        [
                          "兒童友善、明亮活潑，與題目情境相符，避免畫面文字。",
                          `題目：「${q.prompt}」`,
                          "3:2 構圖（寬>高），主體清楚。"
                        ].join("\n");
                      const imgResp = await fetch("/api/ai/generate-image", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ prompt: p })
                      });
                      if (imgResp.ok) {
                        const imgData = await imgResp.json();
                        const resized = await resizeDataUrl(imgData.image, 900, 600, "image/webp", 0.82);
                        q.imageUrl = resized;
                      }
                    } catch {
                      // 忽略單題失敗
                    }
                  } else {
                    try {
                      q.imageUrl = await resizeDataUrl(q.imageUrl, 900, 600, "image/webp", 0.82);
                    } catch {
                      q.imageUrl = null;
                    }
                  }
                }
                if (!user) throw new Error("尚未登入");
                const quizId = await publishPublicQuiz(questions, title, {
                  uid: user.uid,
                  name: user.name,
                  photoUrl: user.photoUrl ?? null
                });
                const origin = window.location.origin;
                const link = `${origin}/quiz/${quizId}`;
                setShareLink(link);
                setMessage("AI 出題完成並已發佈！");
              } catch (e: any) {
                setMessage(e?.message || "AI 出題失敗，請稍後再試。");
              }
            }}
          >
            用 AI 產生 20 題並發佈
          </Button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            題目內容
          </label>
          <textarea
            className="w-full rounded-2xl border border-pink-200 bg-white/90 p-3 outline-none focus:ring-2 focus:ring-pink-300"
            placeholder="在這裡輸入題目..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            題目圖片（可留空）
          </label>
          <input
            type="file"
            accept="image/*"
            className="w-full rounded-2xl border border-pink-200 bg-white/90 p-3 outline-none focus:ring-2 focus:ring-pink-300"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) {
                setImagePreview(null);
                return;
              }
              if (file.size > 2 * 1024 * 1024) {
                setMessage("圖片太大啦！請選擇 2MB 以下的圖片。");
                setImagePreview(null);
                return;
              }
              setUploadingImage(true);
              fileToResizedDataUrl(file, 900, 600, "image/webp", 0.82)
                .then((url) => setImagePreview(url))
                .catch(() => {
                  setMessage("上傳圖片失敗，請再試一次。");
                  setImagePreview(null);
                })
                .finally(() => setUploadingImage(false));
            }}
          />
          {uploadingImage && (
            <div className="mt-2 text-sm text-blue-600">圖片處理中，請稍候…</div>
          )}
          {imagePreview && !uploadingImage && (
            <div className="mt-3 flex flex-col items-center gap-2">
              <img
                src={imagePreview}
                alt="題目預覽"
                className="max-h-40 w-auto rounded-2xl border border-pink-200 object-contain"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setImagePreview(null)}
              >
                移除圖片
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                選項 {i + 1}
              </label>
              <input
                type="text"
                className="w-full rounded-2xl border border-pink-200 bg-white/90 p-3 outline-none focus:ring-2 focus:ring-pink-300"
                placeholder={`輸入第 ${i + 1} 個選項`}
                value={options[i]}
                onChange={(e) => onChangeOption(i, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            正確答案
          </label>
          <select
            className="w-full rounded-2xl border border-pink-200 bg-white/90 p-3 outline-none focus:ring-2 focus:ring-pink-300"
            value={correctIndex}
            onChange={(e) =>
              setCorrectIndex(Number(e.target.value) as 0 | 1 | 2 | 3)
            }
          >
            <option value={0}>選項 1</option>
            <option value={1}>選項 2</option>
            <option value={2}>選項 3</option>
            <option value={3}>選項 4</option>
          </select>
        </div>

        {message && (
          <div className="rounded-2xl bg-yellow-100 text-gray-900 px-4 py-2">
            {message}
          </div>
        )}
        {shareLink && (
          <div className="flex items-center gap-2 rounded-2xl bg-blue-50 px-4 py-2 text-sm text-gray-900">
            <span className="truncate">分享連結：<span className="font-medium">{shareLink}</span></span>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(shareLink);
                  setMessage("已複製分享連結！");
                } catch {
                  setMessage("複製失敗，請手動選取連結。");
                }
              }}
            >
              複製
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-3">
        <Button onClick={onSubmit} className="btn-cute btn-pink">
          新增單題（示範）
        </Button>
        <Button onClick={onClearAll} variant="outline">
          清空全部題目
        </Button>
      </CardFooter>
    </Card>
  );
}



