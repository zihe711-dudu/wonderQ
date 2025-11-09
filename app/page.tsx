"use client";

import { useState } from "react";
import AddQuestion from "@/components/AddQuestion";
import PlayQuiz from "@/components/PlayQuiz";
import Leaderboard from "@/components/Leaderboard";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [tab, setTab] = useState<"play" | "add" | "rank">("play");

  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-3xl bg-white/70 shadow-lg backdrop-blur p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            台灣小朋友問答遊戲
          </h1>
          <p className="mt-2 text-gray-600">
            自己出題、隨機作答、立即計分。一起開心學習！
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={() => setTab("play")}
            className="btn-cute btn-blue"
            aria-pressed={tab === "play"}
          >
            開始玩！
          </Button>
          <Button
            onClick={() => setTab("add")}
            className="btn-cute btn-pink"
            aria-pressed={tab === "add"}
          >
            出題囉！
          </Button>
          <Button
            onClick={() => setTab("rank")}
            className="btn-cute btn-yellow"
            aria-pressed={tab === "rank"}
          >
            看排行榜
          </Button>
        </div>

        <div className="mt-6">
          {tab === "play" ? (
            <PlayQuiz onExit={() => setTab("rank")} />
          ) : tab === "add" ? (
            <AddQuestion />
          ) : (
            <Leaderboard />
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-pink-200 bg-white/80 p-4 text-sm text-gray-700">
          想給其他同學一起玩嗎？在【出題囉】頁面完成題目後，點【發佈成分享題庫】，把連結貼給大家，就可以在各自的手機或電腦上作答，成績會記錄在雲端排行榜！
        </div>
      </div>
    </main>
  );
}



