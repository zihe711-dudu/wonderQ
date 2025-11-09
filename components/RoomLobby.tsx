"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthBar from "@/components/AuthBar";
import RoomBuilder from "@/components/RoomBuilder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { listenUser, signInWithGoogle, type SimpleUser } from "@/lib/auth";
import { listRooms } from "@/lib/rooms";
import type { RemoteQuiz } from "@/types";

export default function RoomLobby() {
  const router = useRouter();
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [rooms, setRooms] = useState<RemoteQuiz[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [error, setError] = useState<string>("");
  const [builderOpen, setBuilderOpen] = useState(true);
  const [roomIdInput, setRoomIdInput] = useState("");

  useEffect(() => {
    const unsubscribe = listenUser((u) => {
      setUser(u);
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchRooms() {
      setLoadingRooms(true);
      try {
        const data = await listRooms(20);
        setRooms(data);
        if (data.length === 0) {
          setError("目前還沒有房間，當第一個房主吧！");
        } else {
          setError("");
        }
      } catch (err: any) {
        setError(err?.message || "伺服器尚未設定雲端房間功能。");
        setRooms([]);
      } finally {
        setLoadingRooms(false);
      }
    }
    fetchRooms();
  }, []);

  const joinRoom = (roomId: string) => {
    if (!roomId) return;
    router.push(`/play/${roomId}`);
  };

  return (
    <div className="space-y-6">
      <AuthBar />

      {loadingUser ? (
        <p className="text-sm text-gray-600">登入狀態載入中…</p>
      ) : user ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-2xl border border-pink-200 bg-white/80 px-4 py-3 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">建立房間</h2>
              <p className="text-sm text-gray-600">
                {builderOpen ? "點按按鈕可收起" : "點按按鈕展開"}房主設定與出題表單
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setBuilderOpen((prev) => !prev)}>
              {builderOpen ? "收起" : "展開"}
            </Button>
          </div>
          {builderOpen && <RoomBuilder />}
        </div>
      ) : (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>房間模式</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="rounded-2xl bg-yellow-100 px-4 py-2 text-sm text-gray-900">
              登入後可以建立房間、加入房間，並記錄頭像與分數。
            </p>
            <Button className="btn-cute btn-blue" onClick={() => signInWithGoogle()}>
              Google 登入
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="w-full">
        <CardHeader>
          <CardTitle>房間列表</CardTitle>
          <CardDescription>選擇房間加入，或輸入房間代碼。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={roomIdInput}
              onChange={(e) => setRoomIdInput(e.target.value)}
              placeholder="輸入房間代碼"
              className="flex-1 rounded-2xl border border-pink-200 bg-white/90 p-3 outline-none focus:ring-2 focus:ring-pink-300"
            />
            <Button onClick={() => joinRoom(roomIdInput.trim())} className="btn-cute btn-blue">
              加入房間
            </Button>
          </div>

          {loadingRooms ? (
            <p className="text-sm text-gray-600">房間列表載入中…</p>
          ) : rooms.length === 0 ? (
            <p className="text-sm text-gray-600">{error}</p>
          ) : (
            <div className="space-y-3">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-pink-200 bg-white/80 p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    {room.ownerPhotoUrl ? (
                      <img
                        src={room.ownerPhotoUrl}
                        alt={room.ownerName}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-200 text-sm font-bold text-pink-600">
                        {room.ownerName.slice(0, 1)}
                      </div>
                    )}
                    <div>
                      <div className="text-base font-semibold text-gray-800">{room.title}</div>
                      <div className="text-sm text-gray-600">
                        房主：{room.ownerName}｜題數：{room.questionCount}
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => joinRoom(room.id)} className="btn-cute btn-pink">
                    加入房間
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        {error && rooms.length > 0 && (
          <CardFooter>
            <span className="text-xs text-gray-500">{error}</span>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}


