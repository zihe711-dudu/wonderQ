"use client";

import { useEffect, useState } from "react";
import AddQuestion from "@/components/AddQuestion";
import Leaderboard from "@/components/Leaderboard";
import RoomLobby from "@/components/RoomLobby";
import QuizGallery from "@/components/QuizGallery";
import { Button } from "@/components/ui/button";
import { listenUser, type SimpleUser } from "@/lib/auth";
import { isTeacher } from "@/lib/teachers";

type Tab = "play" | "add" | "rank" | "rooms";

export default function Home() {
  const [tab, setTab] = useState<Tab>("play");
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [isTeacherUser, setIsTeacherUser] = useState<boolean>(false);

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
          {isTeacherUser && (
            <Button
              onClick={() => setTab("add")}
              className="btn-cute btn-pink"
              aria-pressed={tab === "add"}
            >
              出題囉！
            </Button>
          )}
          <Button
            onClick={() => setTab("rank")}
            className="btn-cute btn-yellow"
            aria-pressed={tab === "rank"}
          >
            看排行榜
          </Button>
          <Button
            onClick={() => setTab("rooms")}
            className="btn-cute btn-blue"
            aria-pressed={tab === "rooms"}
          >
            房間模式
          </Button>
        </div>

        <div className="mt-6">
          {tab === "play" ? (
            <QuizGallery />
          ) : tab === "add" ? (
            <AddQuestion />
          ) : tab === "rank" ? (
            <Leaderboard />
          ) : (
            <RoomLobby />
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-pink-200 bg-white/80 p-4 text-sm text-gray-700">
          想給其他同學一起玩嗎？除了本機出題，也可以到【房間模式】請 Google 登入建立房間，把房間連結分享給同學，大家登入後就能在線上作答並記錄雲端排行榜！
        </div>
      </div>
    </main>
  );
}



