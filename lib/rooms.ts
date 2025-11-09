import { getFirebase } from "@/lib/firebase";
import type { SimpleUser } from "@/lib/auth";
import type { QuizQuestion, RemoteQuiz, RemoteResult } from "@/types";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query
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
    createdAt: Date.now()
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
    return {
      id: snap.id,
      title: data.title ?? "未命名房間",
      ownerUid: data.ownerUid ?? "",
      ownerName: data.ownerName ?? "小老師",
      ownerPhotoUrl: data.ownerPhotoUrl ?? null,
      questionCount: data.questionCount ?? 10,
      questions: Array.isArray(data.questions) ? (data.questions as QuizQuestion[]) : [],
      createdAt: typeof data.createdAt === "number" ? data.createdAt : Date.now()
    };
  } catch {
    return null;
  }
}

export async function addRoomResult(
  roomId: string,
  user: SimpleUser,
  score: number,
  total: number
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
    const list: RemoteResult[] = snap.docs.map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        userUid: data.userUid ?? "",
        name: data.name ?? "小朋友",
        photoUrl: data.photoUrl ?? null,
        score: Number(data.score) || 0,
        total: Number(data.total) || 0,
        createdAt: typeof data.createdAt === "number" ? data.createdAt : Date.now()
      };
    });
    list.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
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
        createdAt: typeof data.createdAt === "number" ? data.createdAt : Date.now()
      };
    });
    list.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
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

export async function listRooms(limitN: number): Promise<RemoteQuiz[]> {
  try {
    const db = ensureDb();
    const q = query(collection(db, "rooms"), orderBy("createdAt", "desc"), limit(limitN));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        title: data.title ?? "未命名房間",
        ownerUid: data.ownerUid ?? "",
        ownerName: data.ownerName ?? "小老師",
        ownerPhotoUrl: data.ownerPhotoUrl ?? null,
        questionCount: data.questionCount ?? 10,
        questions: Array.isArray(data.questions) ? (data.questions as QuizQuestion[]) : [],
        createdAt: typeof data.createdAt === "number" ? data.createdAt : Date.now()
      };
    });
  } catch {
    return [];
  }
}


