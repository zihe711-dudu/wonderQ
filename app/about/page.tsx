export default function AboutPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-3xl bg-white/70 shadow-lg backdrop-blur p-6 sm:p-8 space-y-4">
        <h1 className="text-2xl font-bold">關於開發者</h1>
        <p className="text-gray-700">
          Wonder.Q 是為台灣小學生打造的可愛風問答練習工具，支援本機模式與雲端題庫、房間模式與排行榜。
          專案採用 Next.js + TypeScript + Tailwind + Firebase，僅供教學與非商業使用。
        </p>
        <p className="text-gray-700">
          歡迎提供建議或回報問題，讓我們一起把學習變得更好玩！
        </p>
      </div>
    </main>
  );
}


