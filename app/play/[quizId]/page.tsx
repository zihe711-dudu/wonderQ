"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadRemoteQuiz, addRemoteResult, getTopResults } from "@/lib/cloud";
import type { RemoteQuiz, RemoteResult } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { playCorrect, playWrong, playFinish } from "@/lib/sfx";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function RemotePlayPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<RemoteQuiz | null>(null);
  const [order, setOrder] = useState<number[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [name, setName] = useState<string>("小朋友");
  const [top, setTop] = useState<RemoteResult[]>([]);
  const [saving, setSaving] = useState(false);

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
        const defaultName = window.prompt("請輸入你的暱稱：", "小朋友") ?? "小朋友";
        setName(defaultName.trim().slice(0, 16) || "小朋友");
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
      if (choice === q.correctIndex) {
        setScore((s) => s + 1);
        playCorrect();
      } else {
        playWrong();
      }
      if (current + 1 >= order.length) {
        setFinished(true);
        playFinish();
      } else {
        setCurrent((c) => c + 1);
      }
    },
    [current, currentQuestion, order, quiz]
  );

  const reset = useCallback(() => {
    if (!quiz) return;
    setOrder(shuffle(quiz.questions.map((_, i) => i)));
    setCurrent(0);
    setScore(0);
    setFinished(false);
  }, [quiz]);

  const saveResult = useCallback(async () => {
    if (!quiz) return;
    setSaving(true);
    await addRemoteResult(quiz.id, name, score, quiz.questions.length);
    const list = await getTopResults(quiz.id, 10);
    setTop(list);
    setSaving(false);
    alert("已把你的成績存到雲端排行榜！");
  }, [quiz, name, score]);

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
            <CardDescription>由 {quiz.creatorName} 建立，一起來挑戰吧！</CardDescription>
          </CardHeader>
          {!finished ? (
            <>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600">
                  你好，{name}！第 {current + 1} 題，共 {quiz.questions.length} 題。分數：{score}
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
                <Button disabled={saving} onClick={saveResult} className="btn-cute btn-pink">
                  把成績存到雲端排行榜
                </Button>
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
                      {e.score} / {e.total}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}


