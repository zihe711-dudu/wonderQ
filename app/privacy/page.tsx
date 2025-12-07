export default function PrivacyPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-3xl bg-white/70 shadow-lg backdrop-blur p-6 sm:p-8 space-y-4">
        <h1 className="text-2xl font-bold">隱私權條款</h1>
        <p className="text-gray-700">
          我們重視你的個人資料保護。此專案僅於教學/非商業目的使用，僅在你同意登入時讀取 Google 基本公開資料（暱稱、頭像與 UID），用於顯示頭像與記錄排行榜。未經同意不會蒐集其他資訊。
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          <li>登入僅用於識別玩家與避免重複積分。</li>
          <li>本機模式的資料儲存在你的瀏覽器 localStorage。</li>
          <li>公開題庫與房間模式的成績儲存在 Firebase Firestore。</li>
          <li>你可隨時登出並刪除瀏覽器本機資料。</li>
        </ul>
        <p className="text-gray-700">
          若你是老師白名單成員，發佈的題庫內容請避免包含任何個資或敏感資訊。
        </p>
      </div>
    </main>
  );
}


