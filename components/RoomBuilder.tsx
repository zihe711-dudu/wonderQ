"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listenUser, signInWithGoogle, type SimpleUser } from "@/lib/auth";
import { createRoomWithQuestions } from "@/lib/rooms";
import type { QuizQuestion, RoomQuestionCount } from "@/types";
import Avatar from "@/components/Avatar";
import { isTeacher } from "@/lib/teachers";
import { fileToResizedDataUrl, resizeDataUrl } from "@/lib/images";

type DraftQuestion = {
  prompt: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  imageUrl?: string | null;
};

const QUESTION_COUNTS: RoomQuestionCount[] = [10, 20, 30];

function emptyQuestion(): DraftQuestion {
  return {
    prompt: "",
    options: ["", "", "", ""],
    correctIndex: 0,
    imageUrl: null
  };
}

function toQuizQuestion(draft: DraftQuestion, index: number): QuizQuestion {
  return {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `q-${index}-${Date.now()}`,
    prompt: draft.prompt.trim(),
    options: draft.options.map((opt) => opt.trim()) as [string, string, string, string],
    correctIndex: draft.correctIndex,
    imageUrl: draft.imageUrl ?? null
  };
}

export default function RoomBuilder() {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isTeacherUser, setIsTeacherUser] = useState(false);

  const [title, setTitle] = useState("");
  const [questionCount, setQuestionCount] = useState<RoomQuestionCount>(10);
  const [questions, setQuestions] = useState<DraftQuestion[]>(
    Array.from({ length: 10 }, () => emptyQuestion())
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [message, setMessage] = useState<string>("");
  const [shareLink, setShareLink] = useState<string>("");
  const [publishing, setPublishing] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [generatingAI, setGeneratingAI] = useState(false);

  useEffect(() => {
    const unsubscribe = listenUser(async (u) => {
      setUser(u);
      setLoadingUser(false);
      if (u) {
        const ok = await isTeacher(u.uid);
        setIsTeacherUser(ok);
      } else {
        setIsTeacherUser(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setQuestions(Array.from({ length: questionCount }, () => emptyQuestion()));
    setCurrentIndex(0);
  }, [questionCount]);

  const currentQuestion = useMemo(() => questions[currentIndex], [questions, currentIndex]);

  const updateCurrentQuestion = useCallback(
    (updater: (prev: DraftQuestion) => DraftQuestion) => {
      setQuestions((prev) => {
        const next = [...prev];
        next[currentIndex] = updater(prev[currentIndex]);
        return next;
      });
    },
    [currentIndex]
  );

  const canPublish = useMemo(() => {
    if (!user) return false;
    if (!title.trim()) return false;
    return questions.every(
      (q) =>
        q.prompt.trim().length > 0 &&
        q.options.every((opt) => opt.trim().length > 0) &&
        q.correctIndex >= 0 &&
        q.correctIndex <= 3
    );
  }, [user, title, questions]);

  const gotoQuestion = (index: number) => {
    if (index < 0 || index >= questions.length) return;
    setCurrentIndex(index);
  };

  const onPublish = useCallback(async () => {
    if (!user) {
      setMessage("請先登入才能建立房間。");
      return;
    }
    if (!canPublish) {
      setMessage("請把房間主題與所有題目都填寫完整喔！");
      return;
    }
    try {
      setPublishing(true);
      setMessage("發佈中，請稍候…");
      const roomId = await createRoomWithQuestions({
        title: title.trim(),
        ownerUid: user.uid,
        ownerName: user.name,
        ownerPhotoUrl: user.photoUrl ?? null,
        questionCount,
        questions: questions.map((draft, idx) => toQuizQuestion(draft, idx))
      });
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const link = `${origin}/play/${roomId}`;
      setShareLink(link);
      setMessage("發佈成功！把下面的連結分享給同學：");
    } catch (err: any) {
      setMessage(err?.message || "發佈失敗，請確認伺服器設定。");
    } finally {
      setPublishing(false);
    }
  }, [user, canPublish, title, questionCount, questions]);

  if (loadingUser) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>建立房間</CardTitle>
          <CardDescription>載入登入狀態中…</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>建立房間</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="rounded-2xl bg-yellow-100 px-4 py-2 text-sm text-gray-900">
            要建立房間並記錄分數，請先使用 Google 登入。
          </p>
          <Button className="btn-cute btn-blue" onClick={() => signInWithGoogle()}>
            Google 登入
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>建立房間</CardTitle>
        <CardDescription>設定題庫後發佈，取得分享連結。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <section>
          <h3 className="text-lg font-semibold text-gray-800">基本設定</h3>
          <div className="mt-3 space-y-3">
            {isTeacherUser && (
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-medium text-blue-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-400"
                      checked={useAI}
                      onChange={(e) => setUseAI(e.target.checked)}
                    />
                    使用 AI 出題（老師）
                  </label>
                  <span className="text-xs text-blue-600">可先用 AI 產生，再手動微調</span>
                </div>
                {useAI && (
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                    <input
                      type="text"
                      placeholder="輸入關鍵字主題，例如：四年級自然：動物分類"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      className="rounded-2xl border border-blue-200 bg-white p-3 outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    <Button
                      className="btn-cute btn-yellow"
                      onClick={async () => {
                        if (!aiTopic.trim()) {
                          setMessage("請輸入 AI 出題的關鍵字主題！");
                          return;
                        }
                        setGeneratingAI(true);
                        setMessage("AI 正在出題中，請稍候…");
                        try {
                          const res = await fetch("/api/ai/generate-quiz", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              topic: aiTopic.trim(),
                              grade: "國小",
                              count: questionCount,
                              withImages: true
                            })
                          });
                          const data = await res.json();
                          if (!res.ok) {
                            throw new Error(data?.error || "AI 出題失敗");
                          }
                          const aiQs: any[] = Array.isArray(data.questions) ? data.questions : [];
                          // 對齊當前題數：不足補空題，多的截斷
                          let mapped: DraftQuestion[] = await Promise.all(
                            aiQs
                            .slice(0, questionCount)
                            .map(async (q) => {
                              let img: string | null = null;
                              if (q.imageUrl) {
                                try {
                                  img = await resizeDataUrl(q.imageUrl, 900, 600, "image/webp", 0.82);
                                } catch {
                                  img = null;
                                }
                              }
                              return {
                                prompt: String(q.prompt || "").trim(),
                                options: (Array.isArray(q.options) && q.options.length === 4
                                  ? q.options
                                  : ["", "", "", ""]) as [string, string, string, string],
                                correctIndex:
                                  typeof q.correctIndex === "number" && q.correctIndex >= 0 && q.correctIndex <= 3
                                    ? (q.correctIndex as 0 | 1 | 2 | 3)
                                    : 0,
                                imageUrl: img
                              } as DraftQuestion;
                            })
                          );
                          // 針對尚未有圖片者，改由本機呼叫 /api/ai/generate-image 逐題補圖並壓縮
                          for (let i = 0; i < mapped.length; i++) {
                            if (!mapped[i].imageUrl) {
                              try {
                                const imagePrompt =
                                  [
                                    "兒童友善、明亮活潑，與題目情境相符，避免畫面文字。",
                                    `題目：「${mapped[i].prompt}」`,
                                    "3:2 構圖（寬>高），主體清楚。"
                                  ].join("\n");
                                const r = await fetch("/api/ai/generate-image", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ prompt: imagePrompt })
                                });
                                if (r.ok) {
                                  const d = await r.json();
                                  const resized = await resizeDataUrl(d.image, 900, 600, "image/webp", 0.82);
                                  mapped[i].imageUrl = resized;
                                }
                              } catch {
                                // 忽略單題失敗
                              }
                            }
                          }
                          const filled: DraftQuestion[] = Array.from({ length: questionCount }, (_, i) =>
                            mapped[i] ?? emptyQuestion()
                          );
                          setQuestions(filled);
                          setCurrentIndex(0);
                          setMessage(`AI 已產生 ${mapped.length} 題，您可以在下方逐題檢視與微調。`);
                        } catch (e: any) {
                          setMessage(e?.message || "AI 出題失敗，請稍後再試。");
                        } finally {
                          setGeneratingAI(false);
                        }
                      }}
                      disabled={generatingAI}
                    >
                      {generatingAI ? "AI 出題中…" : `AI 產生 ${questionCount} 題`}
                    </Button>
                  </div>
                )}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                房間主題
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：五年一班植物大挑戰"
                className="mt-1 w-full rounded-2xl border border-pink-200 bg-white/90 p-3 outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
            <div>
              <span className="block text-sm font-medium text-gray-700 mb-1">
                題目數量
              </span>
              <div className="flex gap-3">
                {QUESTION_COUNTS.map((count) => (
                  <label
                    key={count}
                    className={`flex cursor-pointer items-center gap-2 rounded-2xl border px-3 py-2 text-sm ${
                      questionCount === count
                        ? "border-pink-400 bg-pink-50 text-pink-600"
                        : "border-pink-200 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="questionCount"
                      value={count}
                      checked={questionCount === count}
                      onChange={() => setQuestionCount(count)}
                    />
                    {count} 題
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span>房間主：</span>
              <Avatar name={user.name} src={user.photoUrl} size="sm" />
              <span>{user.name}</span>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-800">
            出題（第 {currentIndex + 1} / {questions.length} 題）
          </h3>
          <div className="mt-3 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                題目內容
              </label>
              <textarea
                value={currentQuestion.prompt}
                onChange={(e) =>
                  updateCurrentQuestion((prev) => ({
                    ...prev,
                    prompt: e.target.value
                  }))
                }
                rows={3}
                className="mt-1 w-full rounded-2xl border border-pink-200 bg-white/90 p-3 outline-none focus:ring-2 focus:ring-pink-300"
                placeholder="請輸入題目"
              />
            </div>
            {currentQuestion.options.map((opt, idx) => (
              <div key={idx}>
                <label className="block text-sm font-medium text-gray-700">
                  選項 {idx + 1}
                </label>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) =>
                    updateCurrentQuestion((prev) => {
                      const nextOptions = [...prev.options] as DraftQuestion["options"];
                      nextOptions[idx] = e.target.value;
                      return { ...prev, options: nextOptions };
                    })
                  }
                  className="mt-1 w-full rounded-2xl border border-pink-200 bg-white/90 p-3 outline-none focus:ring-2 focus:ring-pink-300"
                  placeholder={`輸入第 ${idx + 1} 個選項`}
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                題目圖片（可留空）
              </label>
              <input
                type="file"
                accept="image/*"
                className="mt-1 w-full rounded-2xl border border-pink-200 bg-white/90 p-3 outline-none focus:ring-2 focus:ring-pink-300"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) {
                    updateCurrentQuestion((prev) => ({ ...prev, imageUrl: null }));
                    return;
                  }
                  if (file.size > 2 * 1024 * 1024) {
                    setMessage("圖片太大啦！請選擇 2MB 以下的圖片。");
                    updateCurrentQuestion((prev) => ({ ...prev, imageUrl: null }));
                    return;
                  }
                  try {
                    const url = await fileToResizedDataUrl(file, 900, 600, "image/webp", 0.82);
                    updateCurrentQuestion((prev) => ({ ...prev, imageUrl: url }));
                  } catch {
                    setMessage("上傳圖片失敗，請再試一次。");
                    updateCurrentQuestion((prev) => ({ ...prev, imageUrl: null }));
                  }
                }}
              />
              {currentQuestion.imageUrl && (
                <div className="mt-3 flex flex-col items-center gap-2">
                  <img
                    src={currentQuestion.imageUrl}
                    alt="題目預覽"
                    className="max-h-40 w-auto rounded-2xl border border-pink-200 object-contain"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateCurrentQuestion((prev) => ({ ...prev, imageUrl: null }))}
                  >
                    移除圖片
                  </Button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                正確答案
              </label>
              <select
                value={currentQuestion.correctIndex}
                onChange={(e) =>
                  updateCurrentQuestion((prev) => ({
                    ...prev,
                    correctIndex: Number(e.target.value) as 0 | 1 | 2 | 3
                  }))
                }
                className="mt-1 w-full rounded-2xl border border-pink-200 bg-white/90 p-3 outline-none focus:ring-2 focus:ring-pink-300"
              >
                <option value={0}>選項 1</option>
                <option value={1}>選項 2</option>
                <option value={2}>選項 3</option>
                <option value={3}>選項 4</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => gotoQuestion(currentIndex - 1)}
                disabled={currentIndex === 0}
              >
                上一題
              </Button>
              <Button
                variant="outline"
                onClick={() => gotoQuestion(currentIndex + 1)}
                disabled={currentIndex === questions.length - 1}
              >
                下一題
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => gotoQuestion(idx)}
                  className={`h-8 w-8 rounded-full text-sm font-medium ${
                    idx === currentIndex
                      ? "bg-pink-400 text-white"
                      : "bg-white border border-pink-300 text-pink-600"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </section>

        {message && (
          <div className="rounded-2xl bg-yellow-100 px-4 py-2 text-sm text-gray-900">
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
      <CardFooter className="flex justify-end gap-3">
        <Button
          className="btn-cute btn-pink"
          onClick={onPublish}
          disabled={publishing || !user}
        >
          {publishing ? "發佈中…" : "發佈房間"}
        </Button>
      </CardFooter>
    </Card>
  );
}


