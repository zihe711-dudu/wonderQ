"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { STORAGE_KEY, type QuizQuestion, type LeaderboardEntry } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { addLeaderboardEntry } from "@/lib/leaderboard";
import { playCorrect, playWrong, playFinish } from "@/lib/sfx";
import { cn } from "@/lib/utils";

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
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [feedbackPositive, setFeedbackPositive] = useState<boolean | null>(null);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 28 }, () => ({
        left: Math.random(),
        delay: Math.random() * 1.5,
        duration: 2.8 + Math.random() * 1.5,
        color: ["#FBCFE8", "#BFDBFE", "#FDE68A", "#C7D2FE"][Math.floor(Math.random() * 4)],
        size: 6 + Math.random() * 8
      })),
    []
  );

  const starPieces = useMemo(
    () =>
      Array.from({ length: 12 }, () => ({
        left: Math.random(),
        top: Math.random(),
        delay: Math.random() * 1.4,
        duration: 1.6 + Math.random() * 1.2,
        scale: 0.8 + Math.random() * 0.7,
        color: ["#F472B6", "#FBBF24", "#38BDF8"][Math.floor(Math.random() * 3)]
      })),
    []
  );

  useEffect(() => {
    const qs = loadQuestions();
    setQuestions(qs);
    setOrder(shuffle(qs.map((_, i) => i)));
    setCurrent(0);
    setScore(0);
    setFinished(false);
    setSelectedChoice(null);
    setFeedbackMessage("");
    setFeedbackPositive(null);
    setIsTransitioning(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const currentQuestion = useMemo(() => {
    if (finished) return null;
    if (order.length === 0) return null;
    const idx = order[current];
    return questions[idx] ?? null;
  }, [current, finished, order, questions]);

  const answer = useCallback(
    (choice: number) => {
      if (!currentQuestion || isTransitioning || selectedChoice !== null) return;
      const idx = order[current];
      const q = questions[idx];
      setSelectedChoice(choice);
      setIsTransitioning(true);
      if (choice === q.correctIndex) {
        setScore((s) => s + 1);
        setFeedbackMessage("答對了！");
        setFeedbackPositive(true);
        playCorrect();
      } else {
        setFeedbackMessage(`答錯囉！正確答案：${q.options[q.correctIndex]}`);
        setFeedbackPositive(false);
        playWrong();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      const isLast = current + 1 >= order.length;
      timeoutRef.current = setTimeout(() => {
        if (isLast) {
          setFinished(true);
          playFinish();
        } else {
          setCurrent((c) => c + 1);
          setSelectedChoice(null);
          setFeedbackMessage("");
          setFeedbackPositive(null);
        }
        setIsTransitioning(false);
      }, 1500);
    },
    [current, currentQuestion, isTransitioning, order, questions, selectedChoice]
  );

  const reset = useCallback(() => {
    const qs = loadQuestions();
    setQuestions(qs);
    setOrder(shuffle(qs.map((_, i) => i)));
    setCurrent(0);
    setScore(0);
    setFinished(false);
    setSelectedChoice(null);
    setFeedbackMessage("");
    setFeedbackPositive(null);
    setIsTransitioning(false);
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
    const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    const isHighScore = percentage >= 90;
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>成績出爐！</CardTitle>
          <CardDescription>{isHighScore ? "太強啦！閃亮亮的榮耀時刻～" : "辛苦了，再接再厲！"}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={cn("relative overflow-hidden rounded-3xl p-6 text-center", isHighScore ? "bg-gradient-to-br from-pink-100 via-white to-blue-100" : "bg-white/90 border border-pink-200")}>
            {isHighScore && (
              <>
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  {confettiPieces.map((piece, index) => (
                    <span
                      key={`confetti-${index}`}
                      className="absolute block rounded-full"
                      style={{
                        left: `${piece.left * 100}%`,
                        top: "-10%",
                        width: `${piece.size}px`,
                        height: `${piece.size * 2}px`,
                        backgroundColor: piece.color,
                        opacity: 0.8,
                        animation: `confetti-fall ${piece.duration}s linear ${piece.delay}s infinite`
                      }}
                    />
                  ))}
                  {starPieces.map((star, index) => (
                    <span
                      key={`star-${index}`}
                      className="absolute text-2xl"
                      style={{
                        left: `${star.left * 100}%`,
                        top: `${star.top * 100}%`,
                        color: star.color,
                        animation: `star-twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
                        transform: `scale(${star.scale})`
                      }}
                    >
                      ✦
                    </span>
                  ))}
                </div>
                <style jsx>{`
                  @keyframes confetti-fall {
                    0% {
                      transform: translateY(-10%) rotate(0deg);
                      opacity: 1;
                    }
                    100% {
                      transform: translateY(110%) rotate(360deg);
                      opacity: 0;
                    }
                  }
                  @keyframes star-twinkle {
                    0%,
                    100% {
                      opacity: 0.2;
                      transform: scale(0.8);
                    }
                    50% {
                      opacity: 1;
                      transform: scale(1.1);
                    }
                  }
                `}</style>
              </>
            )}
            <div className="relative space-y-4">
              <div className={cn("text-6xl font-extrabold", isHighScore ? "text-pink-500 drop-shadow-[0_4px_10px_rgba(236,72,153,0.35)]" : "text-blue-500")}>
                {score} / {questions.length}
              </div>
              <p className={cn("text-2xl font-bold", isHighScore ? "text-pink-600" : "text-gray-700")}>
                {isHighScore ? `太棒了！你得分：${score}／${questions.length}` : `下次再加油～得分：${score}／${questions.length}`}
              </p>
              <p className="text-base text-gray-600">正確率：{percentage}%</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
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
        {currentQuestion?.imageUrl ? (
          <div className="flex justify-center">
            <img
              src={currentQuestion.imageUrl}
              alt="題目圖片"
              className="max-h-60 w-auto rounded-3xl border border-pink-200 bg-white/80 p-2 object-contain shadow-inner"
            />
          </div>
        ) : null}
        <div className="rounded-2xl bg-white/90 border border-pink-200 p-4 text-lg font-semibold text-gray-800">
          {currentQuestion?.prompt}
        </div>
        <div className="grid gap-3">
          {currentQuestion?.options.map((opt, i) => (
            <Button
              key={i}
              onClick={() => answer(i)}
              variant={i % 3 === 0 ? "default" : i % 3 === 1 ? "blue" : "yellow"}
              className={cn(
                "w-full text-lg font-semibold transition-all",
                selectedChoice !== null
                  ? i === currentQuestion.correctIndex
                    ? "scale-[1.02] bg-emerald-500 text-white hover:bg-emerald-500"
                    : i === selectedChoice
                    ? "bg-gray-300 text-gray-600 hover:bg-gray-300"
                    : "opacity-80"
                  : ""
              )}
              disabled={selectedChoice !== null}
            >
              {opt}
            </Button>
          ))}
        </div>
        {feedbackMessage && (
          <div
            className={cn(
              "rounded-2xl px-4 py-3 text-center text-lg font-bold shadow-sm",
              feedbackPositive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
            )}
          >
            {feedbackMessage}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between text-sm text-gray-600">
        <div>目前分數：{score}</div>
        <div>剩餘：{questions.length - current - 1} 題</div>
      </CardFooter>
    </Card>
  );
}



