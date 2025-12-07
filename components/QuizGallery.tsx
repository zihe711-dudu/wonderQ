"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFirebase } from "@/lib/firebase";
import { collection, getDocs, query } from "firebase/firestore";
import type { RemoteQuiz } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function QuizGallery() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<RemoteQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    async function fetchQuizzes() {
      const { db } = getFirebase();
      if (!db) {
        setError("伺服器尚未設定雲端題庫功能。");
        setLoading(false);
        return;
      }
      try {
        const q = query(collection(db, "quizzes"));
        const snap = await getDocs(q);
        const list: RemoteQuiz[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            title: data.title ?? "未命名題庫",
            ownerUid: data.ownerUid ?? "",
            ownerName: data.ownerName ?? "小老師",
            ownerPhotoUrl: data.ownerPhotoUrl ?? null,
            questionCount: data.questionCount ?? (Array.isArray(data.questions) ? data.questions.length : 10),
            questions: Array.isArray(data.questions) ? data.questions : [],
            createdAt: typeof data.createdAt === "number" ? data.createdAt : Date.now()
          };
        });
        setQuizzes(list);
      } catch (e: any) {
        setError(e?.message || "讀取題庫失敗，請稍後再試。");
      } finally {
        setLoading(false);
      }
    }
    fetchQuizzes();
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-600">題庫讀取中…</p>;
  }

  if (error) {
    return <p className="text-sm text-gray-600">{error}</p>;
  }

  if (quizzes.length === 0) {
    return (
      <div className="rounded-2xl bg-yellow-100 text-gray-900 px-4 py-2">
        還沒有公開題庫，請老師先發佈一份吧！
      </div>
    );
  }

  const filtered = quizzes.filter((q) => {
    const k = keyword.trim().toLowerCase();
    if (!k) return true;
    return (
      q.title.toLowerCase().includes(k) ||
      (q.ownerName || "").toLowerCase().includes(k)
    );
  });

  return (
    <div className="space-y-3">
      <form
        className="flex items-center gap-2"
        role="search"
        aria-label="搜尋公開題庫"
        onSubmit={(e) => {
          e.preventDefault();
          // 即時過濾已生效，提交僅作為鍵盤使用者的可及性回饋
        }}
      >
        <label htmlFor="quiz-search" className="sr-only">
          搜尋題庫或老師名稱
        </label>
        <input
          id="quiz-search"
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="搜尋題庫或老師名稱"
          className="flex-1 rounded-2xl border border-pink-200 bg-white/90 p-3 outline-none focus:ring-2 focus:ring-pink-300"
        />
        <Button type="submit" variant="outline" aria-label="搜尋">
          搜尋
        </Button>
      </form>
      {filtered.length === 0 && (
        <div className="rounded-2xl bg-yellow-100 text-gray-900 px-4 py-2">
          找不到符合「{keyword}」的題庫。
        </div>
      )}
      {filtered.map((qz) => (
        <Card key={qz.id} className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>{qz.title}</CardTitle>
                <CardDescription>
                  老師：{qz.ownerName}｜題數：{qz.questionCount}
                </CardDescription>
              </div>
              <Button className="btn-cute btn-pink" onClick={() => router.push(`/quiz/${qz.id}`)}>
                開始作答
              </Button>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}


