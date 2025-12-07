"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listenUser, signInWithGoogle, type SimpleUser } from "@/lib/auth";
import { addRoomResult, getRoom, getRoomResults, getUserRank } from "@/lib/rooms";
import type { RemoteQuiz, RemoteResult } from "@/types";
import { playCorrect, playWrong, playFinish } from "@/lib/sfx";
import Avatar from "@/components/Avatar";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function RoomPlayPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const router = useRouter();

  const [user, setUser] = useState<SimpleUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [room, setRoom] = useState<RemoteQuiz | null>(null);
  const [loadingRoom, setLoadingRoom] = useState(true);

  const [order, setOrder] = useState<number[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [points, setPoints] = useState(0);
  const [timeMs, setTimeMs] = useState(0);
  const [finished, setFinished] = useState(false);

  const [results, setResults] = useState<RemoteResult[]>([]);
  const [showMore, setShowMore] = useState(false);
  const [userRank, setUserRank] = useState<{ rank: number; best: RemoteResult } | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [remainMs, setRemainMs] = useState(15000);
  const timePerQuestionMs = 15000;

  useEffect(() => {
    const unsubscribe = listenUser((u) => {
      setUser(u);
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchRoom() {
      if (!quizId) {
        setRoom(null);
        setLoadingRoom(false);
        return;
      }
      setLoadingRoom(true);
      const data = await getRoom(quizId);
      setRoom(data);
      setLoadingRoom(false);
      if (data) {
        setOrder(shuffle(data.questions.map((_, i) => i)));
        setCurrent(0);
        setScore(0);
        setFinished(false);
        setAnswers([]);
        setPoints(0);
        setTimeMs(0);
        setRemainMs(timePerQuestionMs);
      }
    }
    fetchRoom();
  }, [quizId]);

  useEffect(() => {
    async function fetchResults() {
      if (!quizId) return;
      const list = await getRoomResults(quizId, 30);
      setResults(list);
      if (user) {
        const rank = await getUserRank(quizId, user.uid);
        setUserRank(rank);
      }
    }
    fetchResults();
  }, [quizId, user, finished]);

  const currentQuestion = useMemo(() => {
    if (!room || finished) return null;
    if (order.length === 0) return null;
    const idx = order[current];
    return room.questions[idx] ?? null;
  }, [room, finished, order, current]);

  const answer = useCallback(
    (choice: number) => {
      if (!currentQuestion || !room) return;
      const idx = order[current];
      const q = room.questions[idx];
      if (choice === q.correctIndex) {
        setScore((s) => s + 1);
        setPoints((p) => p + 100 + Math.max(0, Math.floor(remainMs / 100)));
        playCorrect();
      } else {
        playWrong();
      }
      setAnswers((prev) => {
        const next = [...prev];
        next[current] = choice;
        return next;
      });
      setTimeMs((t) => t + (timePerQuestionMs - Math.max(0, remainMs)));
      setRemainMs(timePerQuestionMs);
      if (current + 1 >= order.length) {
        setFinished(true);
        playFinish();
      } else {
        setCurrent((c) => c + 1);
      }
    },
    [currentQuestion, room, order, current, remainMs]
  );

  const resetQuiz = () => {
    if (!room) return;
    setOrder(shuffle(room.questions.map((_, i) => i)));
    setCurrent(0);
    setScore(0);
    setPoints(0);
    setTimeMs(0);
    setAnswers([]);
    setRemainMs(timePerQuestionMs);
    setFinished(false);
  };

  useEffect(() => {
    async function saveResult() {
      if (!finished || !room || !user) return;
      await addRoomResult(room.id, user, score, room.questions.length, { points, timeMs });
      // 去重：同一 userUid 只保留最高分
      const list = await getRoomResults(room.id, 500);
      const bestMap = new Map<string, RemoteResult>();
      list.forEach((r) => {
        const exists = bestMap.get(r.userUid);
        const rp = r.points ?? r.score;
        const ep = exists ? (exists.points ?? exists.score) : -1;
        if (!exists || rp > ep) bestMap.set(r.userUid, r);
      });
      const dedup = Array.from(bestMap.values()).sort((a, b) =>
        (b.points ?? b.score) !== (a.points ?? a.score)
          ? (b.points ?? b.score) - (a.points ?? a.score)
          : a.createdAt - b.createdAt
      );
      setResults(dedup);
      const rank = await getUserRank(room.id, user.uid);
      setUserRank(rank);
    }
    saveResult();
  }, [finished, room, user, score, points, timeMs]);

  // 倒數計時（hooks 必須在任何 early return 之前宣告）
  useEffect(() => {
    if (finished || !room) return;
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
  }, [finished, room, answer, current]);

  if (loadingUser || loadingRoom) {
    return (
      <main className="container mx-auto max-w-3xl px-4 py-10">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>載入中…</CardTitle>
            <CardDescription>請稍候，正在準備房間資訊。</CardDescription>
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
            <CardTitle>加入房間前先登入</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="rounded-2xl bg-yellow-100 px-4 py-2 text-sm text-gray-900">
              要加入房間並記錄分數，請先使用 Google 登入。
            </p>
            <Button className="btn-cute btn-blue" onClick={() => signInWithGoogle()}>
              Google 登入
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!room) {
    return (
      <main className="container mx-auto max-w-3xl px-4 py-10">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>找不到這個房間</CardTitle>
            <CardDescription>請確認分享連結或請房主重新發送房間代碼。</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/")}>回到首頁</Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  const visibleResults = results.slice(0, showMore ? 30 : 10);
  const wrongs = finished && room
    ? order
        .map((idx, i) => ({ i, q: room.questions[idx], chosen: answers[i] }))
        .filter((x) => typeof x.chosen === "number" && x.q.correctIndex !== x.chosen)
    : [];

  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <div className="space-y-6">
        <Card className="w-full">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>{room.title}</CardTitle>
                <CardDescription>
                  房主：{room.ownerName}｜題數：{room.questionCount}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Avatar name={room.ownerName} src={room.ownerPhotoUrl} size="md" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!finished ? (
              <>
                <div className="text-sm text-gray-600">
                  {user.name}，第 {current + 1} 題／共 {room.questions.length} 題，分數：{score}｜積分：{points}｜剩餘：{Math.ceil(remainMs/1000)} 秒（鍵盤 1~4 作答，Enter 下一題）
                </div>
                <div className="rounded-2xl border border-pink-200 bg-white/90 p-4">
                  {currentQuestion?.prompt}
                </div>
                <div className="grid gap-3">
                  {currentQuestion?.options.map((opt, idx) => (
                    <Button
                      key={idx}
                      onClick={() => answer(idx)}
                      variant={idx % 3 === 0 ? "default" : idx % 3 === 1 ? "blue" : "yellow"}
                      className="w-full"
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-3 text-center">
                <div className="text-2xl font-semibold">做完囉，{user.name}！</div>
                <div className="text-5xl font-extrabold text-pink-500">
                  你的分數：{score} / {room.questions.length}
                </div>
                <Button className="btn-cute btn-blue" onClick={resetQuiz}>
                  再玩一次
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>房間排行榜</CardTitle>
            <CardDescription>
              預設展示前 10 名，想看更多可以點下方按鈕。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {results.length === 0 ? (
              <div className="rounded-2xl bg-yellow-100 px-4 py-2 text-sm text-gray-900">
                還沒有任何成績，當第一個挑戰者吧！
              </div>
            ) : (
              <ol className="space-y-2">
                {visibleResults.map((result, index) => (
                  <li
                    key={result.id}
                    className="flex items-center justify-between rounded-2xl border border-pink-200 bg-white/90 px-4 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 text-pink-600 font-bold">
                        {index + 1}
                      </span>
                      <Avatar name={result.name} src={result.photoUrl} size="sm" />
                      <span className="font-semibold text-gray-800">{result.name}</span>
                    </div>
                    <div className="text-pink-600 font-bold">
                      {result.score} / {result.total}
                    </div>
                  </li>
                ))}
              </ol>
            )}
            {results.length > 10 && (
              <Button variant="outline" onClick={() => setShowMore((prev) => !prev)}>
                {showMore ? "收合到前 10 名" : "顯示更多"}
              </Button>
            )}
          </CardContent>
          {userRank && (
            <CardFooter>
              <div className="flex w-full items-center justify-between rounded-2xl border border-blue-300 bg-blue-50 px-4 py-2">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-200 text-blue-700 font-bold">
                    第 {userRank.rank} 名
                  </span>
                  <Avatar name={userRank.best.name} src={userRank.best.photoUrl} size="sm" className="bg-blue-200 text-blue-700" />
                  <span className="font-semibold text-blue-700">{userRank.best.name}</span>
                </div>
                <div className="text-blue-700 font-bold">
                  {userRank.best.score} / {userRank.best.total}
                </div>
              </div>
            </CardFooter>
          )}
        </Card>

        {finished && wrongs.length > 0 && (
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
        )}
      </div>
    </main>
  );
}



