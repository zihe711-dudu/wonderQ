import { getFirebase } from "@/lib/firebase";
import { addDoc, collection, doc, getDoc, getDocs, query } from "firebase/firestore";
import type { QuizQuestion, RemoteQuiz, RemoteResult } from "@/types";

function ensureDb() {
  const { db } = getFirebase();
  if (!db) {
    throw new Error("尚未設定 Firebase 連線資訊");
  }
  return db;
}

export async function publishQuizFromLocal(
  localQuestions: QuizQuestion[],
  title: string,
  creatorName: string
): Promise<string> {
  if (!Array.isArray(localQuestions) || localQuestions.length === 0) {
    throw new Error("無題目可發佈");
  }
  try {
    const db = ensureDb();
    const quizzesCol = collection(db, "quizzes");
    const safeTitle = title?.trim() || "我的小小問答挑戰";
    const safeCreator = creatorName?.trim() || "小老師";
    const payload = {
      title: safeTitle,
      ownerUid: "",
      ownerName: safeCreator,
      ownerPhotoUrl: null,
      questionCount: localQuestions.length,
      questions: localQuestions,
      createdAt: Date.now()
    };
    const docRef = await addDoc(quizzesCol, payload);
    return docRef.id;
  } catch {
    throw new Error("發佈失敗，請稍後再試");
  }
}

export async function loadRemoteQuiz(quizId: string): Promise<RemoteQuiz | null> {
  try {
    const db = ensureDb();
    const ref = doc(db, "quizzes", quizId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data() as any;
    const questions = Array.isArray(data.questions)
      ? (data.questions as QuizQuestion[])
      : [];
    const quiz: RemoteQuiz = {
      id: snap.id,
      title: data.title ?? "未命名題庫",
      ownerUid: data.ownerUid ?? "",
      ownerName: data.ownerName ?? data.creatorName ?? "小老師",
      ownerPhotoUrl: data.ownerPhotoUrl ?? null,
      questionCount: (data.questionCount ?? questions.length) || 10,
      questions,
      createdAt: typeof data.createdAt === "number" ? data.createdAt : Date.now()
    };
    return quiz;
  } catch {
    return null;
  }
}

export async function addRemoteResult(
  quizId: string,
  name: string,
  score: number,
  total: number
): Promise<void> {
  try {
    const db = ensureDb();
    const resultsCol = collection(db, "quizzes", quizId, "results");
    const safeName = (name?.trim() || "小朋友").slice(0, 16);
    await addDoc(resultsCol, {
      userUid: "",
      name: safeName,
      photoUrl: null,
      score,
      total,
      createdAt: Date.now()
    });
  } catch {
    // 忽略錯誤以維持頁面穩定
  }
}

export async function getTopResults(quizId: string, limitN: number): Promise<RemoteResult[]> {
  try {
    const db = ensureDb();
    const resultsCol = collection(db, "quizzes", quizId, "results");
    // 為避免索引需求，簡化為抓取全部再前端排序；教學/小量資料可接受
    const q = query(resultsCol);
    const snap = await getDocs(q);
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


