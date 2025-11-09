"use client";

import { useCallback, useMemo, useState } from "react";
import { STORAGE_KEY, type QuizQuestion } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type OptionsArray = [string, string, string, string];

function loadExisting(): QuizQuestion[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as QuizQuestion[];
  } catch {
    return [];
  }
}

export default function AddQuestion() {
  const [prompt, setPrompt] = useState<string>("");
  const [options, setOptions] = useState<OptionsArray>(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState<0 | 1 | 2 | 3>(0);
  const [message, setMessage] = useState<string>("");

  const isValid = useMemo(() => {
    return (
      prompt.trim().length > 0 &&
      options.every((o) => o.trim().length > 0) &&
      correctIndex >= 0 &&
      correctIndex <= 3
    );
  }, [prompt, options, correctIndex]);

  const resetForm = useCallback(() => {
    setPrompt("");
    setOptions(["", "", "", ""]);
    setCorrectIndex(0);
  }, []);

  const onChangeOption = useCallback(
    (idx: number, value: string) => {
      setOptions((prev) => {
        const next = [...prev] as OptionsArray;
        next[idx as 0 | 1 | 2 | 3] = value;
        return next;
      });
    },
    [setOptions]
  );

  const onSubmit = useCallback(() => {
    if (!isValid) {
      setMessage("請把題目與四個選項都填好喔！");
      return;
    }
    const newQ: QuizQuestion = {
      id: crypto.randomUUID(),
      prompt: prompt.trim(),
      options: [
        options[0].trim(),
        options[1].trim(),
        options[2].trim(),
        options[3].trim()
      ],
      correctIndex
    };
    const existing = loadExisting();
    const next = [...existing, newQ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setMessage("新增成功！已經把題目存到電腦裡囉！");
    resetForm();
  }, [isValid, prompt, options, correctIndex, resetForm]);

  const onClearAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setMessage("已清空所有本機題目！");
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>出題囉！</CardTitle>
        <CardDescription>請輸入題目、四個選項，並選擇正確答案。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            題目內容
          </label>
          <textarea
            className="w-full rounded-2xl border border-pink-200 bg-white/90 p-3 outline-none focus:ring-2 focus:ring-pink-300"
            placeholder="在這裡輸入題目..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                選項 {i + 1}
              </label>
              <input
                type="text"
                className="w-full rounded-2xl border border-pink-200 bg-white/90 p-3 outline-none focus:ring-2 focus:ring-pink-300"
                placeholder={`輸入第 ${i + 1} 個選項`}
                value={options[i]}
                onChange={(e) => onChangeOption(i, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            正確答案
          </label>
          <select
            className="w-full rounded-2xl border border-pink-200 bg-white/90 p-3 outline-none focus:ring-2 focus:ring-pink-300"
            value={correctIndex}
            onChange={(e) =>
              setCorrectIndex(Number(e.target.value) as 0 | 1 | 2 | 3)
            }
          >
            <option value={0}>選項 1</option>
            <option value={1}>選項 2</option>
            <option value={2}>選項 3</option>
            <option value={3}>選項 4</option>
          </select>
        </div>

        {message && (
          <div className="rounded-2xl bg-yellow-100 text-gray-900 px-4 py-2">
            {message}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-3">
        <Button onClick={onSubmit} className="btn-cute btn-pink">
          新增題目
        </Button>
        <Button onClick={onClearAll} variant="outline">
          清空全部題目
        </Button>
      </CardFooter>
    </Card>
  );
}



