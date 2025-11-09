"use client";

import { useEffect, useState } from "react";
import { type LeaderboardEntry } from "@/types";
import { getTop } from "@/lib/leaderboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Leaderboard() {
  const [top, setTop] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setTop(getTop(10));
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>排行榜</CardTitle>
        <CardDescription>看看最近的高分小勇者！</CardDescription>
      </CardHeader>
      <CardContent>
        {top.length === 0 ? (
          <div className="rounded-2xl bg-yellow-100 text-gray-900 px-4 py-2">
            目前還沒有成績，趕快去挑戰吧！
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
  );
}


