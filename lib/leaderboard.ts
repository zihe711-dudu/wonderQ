import { LEADERBOARD_KEY, type LeaderboardEntry } from "@/types";

export function getLeaderboard(): LeaderboardEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as LeaderboardEntry[];
  } catch {
    return [];
  }
}

export function saveLeaderboard(entries: LeaderboardEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
}

export function addLeaderboardEntry(entry: LeaderboardEntry): LeaderboardEntry[] {
  const list = getLeaderboard();
  const next = [...list, entry].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // 同分以較早完成者優先
    return a.createdAt - b.createdAt;
  });
  saveLeaderboard(next);
  return next;
}

export function getTop(n: number): LeaderboardEntry[] {
  return getLeaderboard()
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.createdAt - b.createdAt;
    })
    .slice(0, n);
}


