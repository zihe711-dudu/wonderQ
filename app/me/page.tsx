"use client";

import { useEffect, useMemo, useState } from "react";
import { listenUser, type SimpleUser, signInWithGoogle } from "@/lib/auth";
import { listQuizzesByOwner, updateQuizMeta } from "@/lib/cloud";
import { listUserBestRoomResults, listRoomsByOwner, updateRoomMeta, deleteRoom } from "@/lib/rooms";
import type { RemoteQuiz, RemoteResult } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Avatar from "@/components/Avatar";
import { useRouter } from "next/navigation";

export default function MePage() {
  const router = useRouter();
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [myQuizzes, setMyQuizzes] = useState<RemoteQuiz[]>([]);
  const [myRooms, setMyRooms] = useState<RemoteQuiz[]>([]);
  const [myRoomResults, setMyRoomResults] = useState<Array<RemoteResult & { roomId: string; roomTitle: string }>>([]);

  useEffect(() => {
    const unsub = listenUser(async (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        const [qs, rooms, rs] = await Promise.all([
          listQuizzesByOwner(u.uid),
          listRoomsByOwner(u.uid),
          listUserBestRoomResults(u.uid, 30),
        ]);
        setMyQuizzes(qs);
        setMyRooms(rooms);
        setMyRoomResults(rs);
      }
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <main className="container mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-3xl bg-white/70 shadow-lg backdrop-blur p-6 sm:p-8">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>載入中…</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="container mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-3xl bg-white/70 shadow-lg backdrop-blur p-6 sm:p-8">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>我的頁面</CardTitle>
              <CardDescription>請先登入以查看你的題庫與成績。</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="btn-cute btn-blue" onClick={() => signInWithGoogle()}>
                Google 登入
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-3xl bg-white/70 shadow-lg backdrop-blur p-6 sm:p-8">
        <div className="space-y-6">
          <Card className="w-full">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Avatar name={user.name} src={user.photoUrl} size="lg" />
                  <div className="min-w-0">
                    <CardTitle className="truncate">{user.name}</CardTitle>
                    <CardDescription>我的個人頁面</CardDescription>
                    {/* 統計：近 30 天 + 歷史累積 */}
                    {(() => {
                      const now = Date.now();
                      const last30 = 30 * 24 * 60 * 60 * 1000;
                      const recent = myRoomResults.filter((r) => typeof r.createdAt === "number" && now - r.createdAt <= last30);
                      const roomsTried = recent.length;
                      const sumScoreRecent = recent.reduce((s, r) => s + (r.score || 0), 0);
                      const sumTotalRecent = recent.reduce((s, r) => s + (r.total || 0), 0);
                      const bestPointsRecent = recent.reduce((m, r) => Math.max(m, (r.points ?? r.score) || 0), 0);
                      const accRecent = sumTotalRecent > 0 ? Math.round((sumScoreRecent / sumTotalRecent) * 100) : 0;

                      // 歷史：以目前抓到的房間最佳成績集合為基礎（可擴充為掃描更多房間）
                      const sumScoreAll = myRoomResults.reduce((s, r) => s + (r.score || 0), 0);
                      const sumTotalAll = myRoomResults.reduce((s, r) => s + (r.total || 0), 0);
                      const accAll = sumTotalAll > 0 ? Math.round((sumScoreAll / sumTotalAll) * 100) : 0;
                      const bestPointsAll = myRoomResults.reduce((m, r) => Math.max(m, (r.points ?? r.score) || 0), 0);

                      return (
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full border border-pink-200 bg-white/80 px-2.5 py-1 text-gray-700">
                            近30天挑戰房數：<strong className="num-font text-pink-600">{roomsTried}</strong>
                          </span>
                          <span className="rounded-full border border-pink-200 bg-white/80 px-2.5 py-1 text-gray-700">
                            近30天正確率：<strong className="num-font text-pink-600">{accRecent}%</strong>
                          </span>
                          <span className="rounded-full border border-pink-200 bg-white/80 px-2.5 py-1 text-gray-700">
                            近30天最高積分：<strong className="num-font text-pink-600">{bestPointsRecent}</strong>
                          </span>
                          <span className="rounded-full border border-blue-200 bg-white/80 px-2.5 py-1 text-gray-700">
                            歷史正確率：<strong className="num-font text-blue-700">{accAll}%</strong>
                          </span>
                          <span className="rounded-full border border-blue-200 bg-white/80 px-2.5 py-1 text-gray-700">
                            歷史最高積分：<strong className="num-font text-blue-700">{bestPointsAll}</strong>
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="w-full">
            <CardHeader>
              <CardTitle>我出過的題庫</CardTitle>
              <CardDescription>只有你（擁有者）可以上架/下架，並修改標題與標籤。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {myQuizzes.length === 0 ? (
                <div className="rounded-2xl bg-yellow-100 px-4 py-2 text-sm text-gray-900">
                  目前還沒有題庫，請到「出題囉」建立一份吧！
                </div>
              ) : (
                myQuizzes.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between rounded-2xl border border-pink-200 bg-white/80 p-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-base font-semibold text-gray-800">{q.title}</div>
                      <div className="text-sm text-gray-600">
                        題數：{q.questionCount} ｜ 狀態：{(q as any).status || "active"}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={async () => {
                          const nextTitle = window.prompt("修改題庫標題：", q.title);
                          if (!nextTitle) return;
                          const tagsText = window.prompt("修改標籤（以逗號分隔，可留空）：", ((q as any).tags || []).join(","));
                          const tags = (tagsText || "")
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean);
                          const ok = await updateQuizMeta(q.id, { title: nextTitle.trim(), tags });
                          if (ok) {
                            setMyQuizzes((prev) =>
                              prev.map((it) => (it.id === q.id ? { ...it, title: nextTitle } : it))
                            );
                            alert("已更新標題/標籤！");
                          } else {
                            alert("更新失敗，請稍後再試。");
                          }
                        }}
                      >
                        編輯
                      </Button>
                      <Button
                        variant="outline"
                        onClick={async () => {
                          const current = (q as any).status || "active";
                          const next = current === "active" ? "archived" : "active";
                          const ok = await updateQuizMeta(q.id, { status: next as any });
                          if (ok) {
                            setMyQuizzes((prev) =>
                              prev.map((it) => (it.id === q.id ? ({ ...it, status: next } as any) : it))
                            );
                            alert(next === "active" ? "已上架！" : "已下架！");
                          } else {
                            alert("更新失敗，請稍後再試。");
                          }
                        }}
                      >
                        {(q as any).status === "archived" ? "上架" : "下架"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigator.clipboard.writeText(`${window.location.origin}/quiz/${q.id}`)}
                      >
                        複製分享
                      </Button>
                      <Button variant="outline" onClick={() => router.push(`/quiz/${q.id}`)}>
                        預覽
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader>
              <CardTitle>我建立的房間</CardTitle>
              <CardDescription>只有你（擁有者）可以編輯、下架或刪除房間。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {myRooms.length === 0 ? (
                <div className="rounded-2xl bg-yellow-100 px-4 py-2 text-sm text-gray-900">
                  目前還沒有房間，請到「房間模式」建立一個吧！
                </div>
              ) : (
                myRooms.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-2xl border border-blue-200 bg-white/80 p-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-base font-semibold text-gray-800">{r.title}</div>
                      <div className="text-sm text-gray-600">
                        題數：{r.questionCount} ｜ 狀態：{(r as any).status || "active"}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={async () => {
                          const nextTitle = window.prompt("修改房間標題：", r.title);
                          if (!nextTitle || nextTitle.trim() === r.title) return;
                          const ok = await updateRoomMeta(r.id, { title: nextTitle.trim() });
                          if (ok) {
                            setMyRooms((prev) =>
                              prev.map((it) => (it.id === r.id ? { ...it, title: nextTitle.trim() } : it))
                            );
                            alert("已更新房間標題！");
                          } else {
                            alert("更新失敗，請稍後再試。");
                          }
                        }}
                      >
                        編輯
                      </Button>
                      <Button
                        variant="outline"
                        onClick={async () => {
                          const current = (r as any).status || "active";
                          const next = current === "active" ? "archived" : "active";
                          const ok = await updateRoomMeta(r.id, { status: next as any });
                          if (ok) {
                            setMyRooms((prev) =>
                              prev.map((it) => (it.id === r.id ? ({ ...it, status: next } as any) : it))
                            );
                            alert(next === "active" ? "已上架！" : "已下架！");
                          } else {
                            alert("更新失敗，請稍後再試。");
                          }
                        }}
                      >
                        {(r as any).status === "archived" ? "上架" : "下架"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigator.clipboard.writeText(`${window.location.origin}/play/${r.id}`)}
                      >
                        複製分享
                      </Button>
                      <Button variant="outline" onClick={() => router.push(`/play/${r.id}`)}>
                        預覽
                      </Button>
                      <Button
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={async () => {
                          if (!window.confirm(`確定要刪除房間「${r.title}」嗎？\n\n注意：刪除後無法復原，但成績記錄會保留。`)) {
                            return;
                          }
                          const ok = await deleteRoom(r.id);
                          if (ok) {
                            setMyRooms((prev) => prev.filter((it) => it.id !== r.id));
                            alert("已刪除房間！");
                          } else {
                            alert("刪除失敗，請稍後再試。");
                          }
                        }}
                      >
                        刪除
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader>
              <CardTitle>我回答過的房間題目</CardTitle>
              <CardDescription>顯示近期最佳積分與「再挑戰」連結。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {myRoomResults.length === 0 ? (
                <div className="rounded-2xl bg-yellow-100 px-4 py-2 text-sm text-gray-900">
                  還沒有作答紀錄，去「房間模式」挑戰看看吧！
                </div>
              ) : (
                myRoomResults.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-2xl border border-pink-200 bg-white/80 p-3">
                    <div>
                      <div className="text-sm text-gray-800">
                        房間：{r.roomTitle} ｜ 積分：<span className="font-semibold text-pink-600">{r.points ?? r.score}</span>（分數：{r.score}/{r.total}）
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => router.push(`/play/${(r as any).roomId || ""}`)}>
                        再挑戰
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}


