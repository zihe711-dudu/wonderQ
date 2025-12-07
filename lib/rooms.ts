import { getFirebase } from "@/lib/firebase";
import type { SimpleUser } from "@/lib/auth";
import type { QuizQuestion, RemoteQuiz, RemoteResult } from "@/types";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc
} from "firebase/firestore";

function ensureDb() {
  const { db } = getFirebase();
  if (!db) {
    throw new Error("尚未設定 Firebase 連線資訊");
  }
  return db;
}

export async function createRoomWithQuestions(
  quiz: Omit<RemoteQuiz, "id" | "createdAt" | "questions"> & {
    questions: QuizQuestion[];
  }
): Promise<string> {
  const db = ensureDb();
  if (quiz.questions.length !== quiz.questionCount) {
    throw new Error("題目數量與題目內容不一致");
  }
  const payload = {
    title: quiz.title.trim(),
    ownerUid: quiz.ownerUid,
    ownerName: quiz.ownerName,
    ownerPhotoUrl: quiz.ownerPhotoUrl ?? null,
    questionCount: quiz.questionCount,
    questions: quiz.questions,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    status: "active" as "active" | "archived"
  };
  const docRef = await addDoc(collection(db, "rooms"), payload);
  return docRef.id;
}

export async function getRoom(roomId: string): Promise<RemoteQuiz | null> {
  try {
    const db = ensureDb();
    const ref = doc(db, "rooms", roomId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data() as any;
    const room = {
      id: snap.id,
      title: data.title ?? "未命名房間",
      ownerUid: data.ownerUid ?? "",
      ownerName: data.ownerName ?? "小老師",
      ownerPhotoUrl: data.ownerPhotoUrl ?? null,
      questionCount: data.questionCount ?? 10,
      questions: Array.isArray(data.questions) ? (data.questions as QuizQuestion[]) : [],
      createdAt: typeof data.createdAt === "number" ? data.createdAt : Date.now()
    };
    (room as any).status = data.status || "active";
    return room;
  } catch {
    return null;
  }
}

export async function addRoomResult(
  roomId: string,
  user: SimpleUser,
  score: number,
  total: number,
  extra?: { points?: number; timeMs?: number }
): Promise<void> {
  try {
    const db = ensureDb();
    const resultsCol = collection(db, "rooms", roomId, "results");
    await addDoc(resultsCol, {
      userUid: user.uid,
      name: user.name,
      photoUrl: user.photoUrl ?? null,
      score,
      total,
      points: extra?.points ?? score,
      timeMs: extra?.timeMs ?? null,
      createdAt: Date.now()
    });
  } catch {
    // 靜默失敗，避免影響體驗
  }
}

export async function getRoomResults(
  roomId: string,
  limitN: number
): Promise<RemoteResult[]> {
  try {
    const db = ensureDb();
    const resultsCol = collection(db, "rooms", roomId, "results");
    const snap = await getDocs(resultsCol);
    const raw: RemoteResult[] = snap.docs.map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        userUid: data.userUid ?? "",
        name: data.name ?? "小朋友",
        photoUrl: data.photoUrl ?? null,
        score: Number(data.score) || 0,
        total: Number(data.total) || 0,
        points: typeof data.points === "number" ? data.points : (Number(data.score) || 0),
        timeMs: typeof data.timeMs === "number" ? data.timeMs : null,
        createdAt: typeof data.createdAt === "number" ? data.createdAt : Date.now()
      };
    });
    // 去重：同 userUid 保留最高分，若同分則先寫入者排前
    const bestMap = new Map<string, RemoteResult>();
    raw.forEach((r) => {
      const exists = bestMap.get(r.userUid);
      const rp = r.points ?? r.score;
      const ep = exists ? (exists.points ?? exists.score) : -1;
      if (!exists || rp > ep) bestMap.set(r.userUid, r);
    });
    const list = Array.from(bestMap.values());
    list.sort((a, b) => {
      const pa = a.points ?? a.score;
      const pb = b.points ?? b.score;
      if (pb !== pa) return pb - pa;
      return a.createdAt - b.createdAt;
    });
    return list.slice(0, Math.max(1, limitN));
  } catch {
    return [];
  }
}

export async function getUserRank(
  roomId: string,
  userUid: string
): Promise<{ rank: number; best: RemoteResult } | null> {
  try {
    const db = ensureDb();
    const resultsCol = collection(db, "rooms", roomId, "results");
    const snap = await getDocs(resultsCol);
    const list: RemoteResult[] = snap.docs.map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        userUid: data.userUid ?? "",
        name: data.name ?? "小朋友",
        photoUrl: data.photoUrl ?? null,
        score: Number(data.score) || 0,
        total: Number(data.total) || 0,
        points: typeof data.points === "number" ? data.points : (Number(data.score) || 0),
        timeMs: typeof data.timeMs === "number" ? data.timeMs : null,
        createdAt: typeof data.createdAt === "number" ? data.createdAt : Date.now()
      };
    });
    list.sort((a, b) => {
      const pa = a.points ?? a.score;
      const pb = b.points ?? b.score;
      if (pb !== pa) return pb - pa;
      return a.createdAt - b.createdAt;
    });
    const index = list.findIndex((item) => item.userUid === userUid);
    if (index === -1) return null;
    return {
      rank: index + 1,
      best: list[index]
    };
  } catch {
    return null;
  }
}

export async function listRooms(limitN: number, includeArchived = false): Promise<RemoteQuiz[]> {
  try {
    const db = ensureDb();
    const q = query(collection(db, "rooms"), orderBy("createdAt", "desc"), limit(limitN));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => {
        const data = d.data() as any;
        const room = {
          id: d.id,
          title: data.title ?? "未命名房間",
          ownerUid: data.ownerUid ?? "",
          ownerName: data.ownerName ?? "小老師",
          ownerPhotoUrl: data.ownerPhotoUrl ?? null,
          questionCount: data.questionCount ?? 10,
          questions: Array.isArray(data.questions) ? (data.questions as QuizQuestion[]) : [],
          createdAt: typeof data.createdAt === "number" ? data.createdAt : Date.now()
        };
        (room as any).status = data.status || "active";
        return room;
      })
      .filter((r) => includeArchived || (r as any).status !== "archived");
  } catch {
    return [];
  }
}

// 列出指定擁有者的所有房間
export async function listRoomsByOwner(ownerUid: string): Promise<RemoteQuiz[]> {
  try {
    const db = ensureDb();
    const snap = await getDocs(collection(db, "rooms"));
    const list: RemoteQuiz[] = snap.docs
      .map((d) => {
        const data = d.data() as any;
        const room = {
          id: d.id,
          title: data.title ?? "未命名房間",
          ownerUid: data.ownerUid ?? "",
          ownerName: data.ownerName ?? "小老師",
          ownerPhotoUrl: data.ownerPhotoUrl ?? null,
          questionCount: data.questionCount ?? 10,
          questions: Array.isArray(data.questions) ? (data.questions as QuizQuestion[]) : [],
          createdAt: typeof data.createdAt === "number" ? data.createdAt : Date.now()
        };
        (room as any).status = data.status || "active";
        return room;
      })
      .filter((r) => r.ownerUid === ownerUid);
    return list.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  } catch {
    return [];
  }
}

// 更新房間元數據（標題、狀態）
export async function updateRoomMeta(
  roomId: string,
  patch: { title?: string; status?: "active" | "archived" }
): Promise<boolean> {
  try {
    const db = ensureDb();
    const ref = doc(db, "rooms", roomId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return false;
    const data = snap.data() as any;
    const next = {
      ...data,
      ...(patch.title ? { title: patch.title } : {}),
      ...(patch.status ? { status: patch.status } : {}),
      updatedAt: Date.now()
    };
    await setDoc(ref, next, { merge: true });
    return true;
  } catch {
    return false;
  }
}

// 刪除房間（僅刪除房間文檔，保留成績記錄）
export async function deleteRoom(roomId: string): Promise<boolean> {
  try {
    const db = ensureDb();
    const ref = doc(db, "rooms", roomId);
    await deleteDoc(ref);
    return true;
  } catch {
    return false;
  }
}

// 簡化版：抓最近建立的房間，再找出使用者在各房間的最佳成績
export async function listUserBestRoomResults(
  userUid: string,
  roomScanLimit = 30
): Promise<Array<RemoteResult & { roomId: string; roomTitle: string }>> {
  try {
    const rooms = await listRooms(roomScanLimit);
    const results: Array<RemoteResult & { roomId: string; roomTitle: string }> = [];
    for (const r of rooms) {
      const all = await getRoomResults(r.id, 500);
      const mine = all.filter((x) => x.userUid === userUid);
      if (mine.length === 0) continue;
      mine.sort((a, b) => {
        const pa = a.points ?? a.score;
        const pb = b.points ?? b.score;
        if (pb !== pa) return pb - pa;
        return a.createdAt - b.createdAt;
      });
      results.push({ ...mine[0], roomId: r.id, roomTitle: r.title });
    }
    // 取前 20 筆顯示
    results.sort((a, b) => {
      const pa = a.points ?? a.score;
      const pb = b.points ?? b.score;
      if (pb !== pa) return pb - pa;
      return a.createdAt - b.createdAt;
    });
    return results.slice(0, 20);
  } catch {
    return [];
  }
}


