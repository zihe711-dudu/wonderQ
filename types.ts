export type QuizQuestion = {
  id: string;
  prompt: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
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



