export type QuizQuestion = {
  id: string;
  prompt: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  imageUrl?: string | null;
};

export const STORAGE_KEY = "quizy_tw_kids_questions";

export type LeaderboardEntry = {
  id: string;
  name: string;
  score: number;
  total: number;
  createdAt: number; // unix ms
};

export const LEADERBOARD_KEY = "quizy_tw_kids_leaderboard";

export type RoomQuestionCount = 10 | 20 | 30;

export type RemoteQuiz = {
  id: string;
  title: string;
  ownerUid: string;
  ownerName: string;
  ownerPhotoUrl: string | null;
  questionCount: RoomQuestionCount;
  questions: QuizQuestion[];
  createdAt: number;
};

export type RemoteResult = {
  id: string;
  userUid: string;
  name: string;
  photoUrl: string | null;
  score: number;
  total: number;
  points?: number; // 新：積分（含時間加成）
  timeMs?: number; // 新：總作答耗時（毫秒）
  createdAt: number;
};


