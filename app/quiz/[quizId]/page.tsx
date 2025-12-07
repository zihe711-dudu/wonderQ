"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadRemoteQuiz, addRemoteResult, getTopResults } from "@/lib/cloud";
import type { RemoteQuiz, RemoteResult } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { playCorrect, playWrong, playFinish } from "@/lib/sfx";
import { listenUser, signInWithGoogle, type SimpleUser } from "@/lib/auth";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PublicQuizPlayPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const router = useRouter();

  const [user, setUser] = useState<SimpleUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<RemoteQuiz | null>(null);
  const [order, setOrder] = useState<number[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [name, setName] = useState<string>("小朋友");
  const [top, setTop] = useState<RemoteResult[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedOnce, setSavedOnce] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [points, setPoints] = useState(0);
  const [timeMs, setTimeMs] = useState(0);
  const [remainMs, setRemainMs] = useState(15000);
  const timePerQuestionMs = 15000;

  useEffect(() => {
    const unsub = listenUser((u) => {
      setUser(u);
      setLoadingUser(false);
      if (u) setName(u.name || "小朋友");
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    let mounted = true;
    async function init() {
      if (!quizId) {
        setLoading(false);
        setQuiz(null);
        return;
      }
      setLoading(true);
      const q = await loadRemoteQuiz(quizId);
      if (!mounted) return;
      setQuiz(q);
      setLoading(false);
      if (q) {
        setOrder(shuffle(q.questions.map((_, i) => i)));
        setCurrent(0);
        setScore(0);
        setFinished(false);
        setAnswers([]);
        const list = await getTopResults(q.id, 10);
        if (!mounted) return;
        setTop(list);
      }
    }
    init();
    return () => {
      mounted = false;
    };
  }, [quizId]);

  const currentQuestion = useMemo(() => {
    if (!quiz || finished) return null;
    if (order.length === 0) return null;
    const idx = order[current];
    return quiz.questions[idx] ?? null;
  }, [quiz, current, finished, order]);

  const answer = useCallback(
    (choice: number) => {
      if (!currentQuestion || !quiz) return;
      const idx = order[current];
      const q = quiz.questions[idx];
      const used = Math.max(0, timePerQuestionMs - remainMs);
      if (choice === q.correctIndex) {
        setScore((s) => s + 1);
        playCorrect();
        const gain = Math.max(10, Math.round((remainMs / timePerQuestionMs) * 1000));
        setPoints((p) => p + gain);
      } else {
        playWrong();
      }
      setTimeMs((t) => t + used);
      setAnswers((prev) => {
        const next = [...prev];
        next[current] = choice;
        return next;
      });
      if (current + 1 >= order.length) {
        setFinished(true);
        playFinish();
      } else {
        setCurrent((c) => c + 1);
        setRemainMs(timePerQuestionMs);
      }
    },
    [current, currentQuestion, order, quiz, remainMs]
  );

  const reset = useCallback(() => {
    if (!quiz) return;
    setOrder(shuffle(quiz.questions.map((_, i) => i)));
    setCurrent(0);
    setScore(0);
    setFinished(false);
    setAnswers([]);
    setPoints(0);
    setTimeMs(0);
    setRemainMs(timePerQuestionMs);
  }, [quiz]);

  useEffect(() => {
    if (finished || !quiz) return;
    const timer = setInterval(() => {
      setRemainMs((ms) => {
        if (ms <= 100) {
          answer(-1 as any);
          return timePerQuestionMs;
        }
        return ms - 100;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [finished, quiz, answer, current]);

  // 快速鍵：1~4 選答案、Enter 下一題或重玩
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!quiz) return;
      if (!finished) {
        if (["1", "2", "3", "4"].includes(e.key)) {
          const idx = Number(e.key) - 1;
          if (idx >= 0 && idx <= 3) answer(idx);
        } else if (e.key === "Enter") {
          if (current < order.length) {
            // 不作答直接進下一題（略過）
            answer(-1 as any);
          }
        }
      } else if (e.key === "Enter") {
        reset();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [quiz, finished, current, order, answer, reset]);

  const saveResult = useCallback(async () => {
    if (!quiz || !user || savedOnce) return;
    setSaving(true);
    await addRemoteResult(
      quiz.id,
      { uid: user.uid, name: user.name, photoUrl: user.photoUrl },
      score,
      quiz.questions.length,
      { points, timeMs }
    );
    const list = await getTopResults(quiz.id, 10);
    setTop(list);
    setSavedOnce(true);
    setSaving(false);
  }, [quiz, user, score, points, timeMs, savedOnce]);

  // 自動存成績：完成當下即寫入，避免重複按鈕與多次提交
  useEffect(() => {
    if (finished) {
      saveResult();
    }
  }, [finished, saveResult]);

  if (loading) {
    return (
      <main className="container mx-auto max-w-3xl px-4 py-10">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>題庫讀取中…</CardTitle>
          </CardHeader>
        </Card>
      </main>
    );
  }

  if (loadingUser) {
    return (
      <main className="container mx-auto max-w-3xl px-4 py-10">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>登入狀態載入中…</CardTitle>
          </CardHeader>
        </Card>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="container mx-auto max-w-3xl px-4 py-10">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>開始前先登入</CardTitle>
            <CardDescription>要作答並記錄分數，請先使用 Google 登入。</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="btn-cute btn-blue" onClick={() => signInWithGoogle()}>
              Google 登入
            </Button>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => router.push("/")}>
              回首頁
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  if (!quiz) {
    return (
      <main className="container mx-auto max-w-3xl px-4 py-10">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>找不到這個題庫</CardTitle>
            <CardDescription>請確認分享連結或伺服器設定。</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/")}>回到首頁</Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <div className="space-y-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{quiz.title}</CardTitle>
            <CardDescription>由 {quiz.ownerName} 建立，一起來挑戰吧！</CardDescription>
          </CardHeader>
          {!finished ? (
            <>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600">
                  你好，{name}！第 {current + 1} 題，共 {quiz.questions.length} 題。分數：{score}｜積分：{points}｜剩餘：{Math.ceil(remainMs/1000)} 秒（鍵盤 1~4 作答，Enter 下一題）
                </div>
                <div className="rounded-2xl bg-white/90 border border-pink-200 p-4">
                  {currentQuestion?.prompt}
                </div>
                <div className="grid gap-3">
                  {currentQuestion?.options.map((opt, i) => (
                    <Button
                      key={i}
                      onClick={() => answer(i)}
                      variant={i % 3 === 0 ? "default" : i % 3 === 1 ? "blue" : "yellow"}
                      className="w-full"
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </>
          ) : (
            <>
              <CardContent className="text-center space-y-3">
                <div className="text-2xl">做完囉，{name}！</div>
                <div className="text-5xl font-extrabold text-pink-500">
                  你的分數：{score} / {quiz.questions.length}
                </div>
              </CardContent>
              <CardFooter className="flex flex-wrap items-center justify-center gap-3">
                <Button onClick={reset} className="btn-cute btn-blue">
                  再玩一次
                </Button>
              </CardFooter>
            </>
          )}
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>雲端排行榜（前 10 名）</CardTitle>
            <CardDescription>看看高手們的分數！</CardDescription>
          </CardHeader>
          <CardContent>
            {top.length === 0 ? (
              <div className="rounded-2xl bg-yellow-100 text-gray-900 px-4 py-2">
                還沒有任何成績，當第一個挑戰者吧！
              </div>
            ) : (
              <ol className="space-y-2">
                {top.map((e, idx) => (
                  <li
                    key={e.id}
                    className="flex items-center justify-between rounded-2xl border border-pink-200 bg-white/90 px-4 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 text-pink-600 font-bold">
                        {idx + 1}
                      </span>
                      <span className="font-semibold">{e.name}</span>
                    </div>
                    <div className="text-pink-600 font-bold">
                      積分 {e.points ?? e.score}（{e.score}/{e.total}）
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        {finished && quiz && (
          (() => {
            const wrongs = order
              .map((idx, i) => ({ i, q: quiz.questions[idx], chosen: answers[i] }))
              .filter((x) => typeof x.chosen === "number" && x.q.correctIndex !== x.chosen);
            if (wrongs.length === 0) return null;
            return (
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>錯題回顧</CardTitle>
                  <CardDescription>看看哪幾題需要再加強～</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {wrongs.map(({ i, q, chosen }) => (
                    <div key={i} className="rounded-2xl border border-pink-200 bg-white/90 p-3">
                      <div className="font-medium text-gray-800">第 {i + 1} 題：{q.prompt}</div>
                      <div className="mt-1 text-sm">
                        你的答案：<span className="text-pink-600 font-semibold">{q.options[chosen as number]}</span>
                      </div>
                      <div className="text-sm">
                        正確答案：<span className="text-green-600 font-semibold">{q.options[q.correctIndex]}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })()
        )}
      </div>
    </main>
  );
}


