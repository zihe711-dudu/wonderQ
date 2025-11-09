"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { STORAGE_KEY, type QuizQuestion, type LeaderboardEntry } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { addLeaderboardEntry } from "@/lib/leaderboard";
import { playCorrect, playWrong, playFinish } from "@/lib/sfx";

type PlayQuizProps = {
  onExit?: () => void;
};

function loadQuestions(): QuizQuestion[] {
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

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PlayQuiz({ onExit }: PlayQuizProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [order, setOrder] = useState<number[]>([]);
  const [current, setCurrent] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [finished, setFinished] = useState<boolean>(false);

  useEffect(() => {
    const qs = loadQuestions();
    setQuestions(qs);
    setOrder(shuffle(qs.map((_, i) => i)));
    setCurrent(0);
    setScore(0);
    setFinished(false);
  }, []);

  const currentQuestion = useMemo(() => {
    if (finished) return null;
    if (order.length === 0) return null;
    const idx = order[current];
    return questions[idx] ?? null;
  }, [current, finished, order, questions]);

  const answer = useCallback(
    (choice: number) => {
      if (!currentQuestion) return;
      const idx = order[current];
      const q = questions[idx];
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
    [current, currentQuestion, order, questions]
  );

  const reset = useCallback(() => {
    const qs = loadQuestions();
    setQuestions(qs);
    setOrder(shuffle(qs.map((_, i) => i)));
    setCurrent(0);
    setScore(0);
    setFinished(false);
  }, []);

  const handleExit = useCallback(() => {
    if (!onExit) return;
    if (!finished) {
      const ok = window.confirm("要離開嗎？目前挑戰進度會被清除喔！");
      if (!ok) return;
    }
    onExit();
  }, [onExit, finished]);

  if (questions.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>開始玩！</CardTitle>
          <CardDescription>還沒有題目，先去出題頁新增幾題吧～</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl bg-yellow-100 text-gray-900 px-4 py-2">
            小提醒：題目會保存在你的電腦（localStorage）。
          </div>
        </CardContent>
      </Card>
    );
  }

  if (finished) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>成績出爐！</CardTitle>
          <CardDescription>做完囉～看看你的分數！</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-6xl font-extrabold text-pink-500">
            {score} / {questions.length}
          </div>
          <p className="mt-2 text-gray-700">
            很棒！再來挑戰一次吧！
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Button
              className="btn-cute btn-pink"
              onClick={() => {
                const name = window.prompt("要把分數存到排行榜嗎？請輸入暱稱：", "小勇者");
                if (!name) return;
                const entry: LeaderboardEntry = {
                  id: crypto.randomUUID(),
                  name: name.trim().slice(0, 16) || "無名小卒",
                  score,
                  total: questions.length,
                  createdAt: Date.now()
                };
                addLeaderboardEntry(entry);
                alert("已存到排行榜！");
              }}
            >
              儲存到排行榜
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={handleExit} variant="outline">
            離開挑戰
          </Button>
          <Button onClick={reset} className="btn-cute btn-blue">
            再玩一次
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>開始玩！</CardTitle>
            <CardDescription>
              第 {current + 1} 題，共 {questions.length} 題
            </CardDescription>
          </div>
          <Button onClick={handleExit} variant="outline" size="sm">
            離開挑戰
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
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
      <CardFooter className="flex items-center justify-between text-sm text-gray-600">
        <div>目前分數：{score}</div>
        <div>剩餘：{questions.length - current - 1} 題</div>
      </CardFooter>
    </Card>
  );
}



