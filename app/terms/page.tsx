export default function TermsPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-3xl bg-white/70 shadow-lg backdrop-blur p-6 sm:p-8 space-y-4">
        <h1 className="text-2xl font-bold">使用者條款</h1>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          <li>本服務為教學/非商業用途提供，請愛用並遵守相關法律。</li>
          <li>不得上傳或散布侵權、攻擊性、或含個資的內容。</li>
          <li>公開題庫由白名單老師建立，平台保留移除違規內容之權利。</li>
          <li>你同意我們以匿名統計方式改善產品體驗。</li>
          <li>若有重大異動，將以頁面公告方式通知。</li>
        </ul>
        <p className="text-gray-700">
          使用本服務即表示你已閱讀並同意上述條款。如有疑問，請於課堂或聯絡教學單位反映。
        </p>
      </div>
    </main>
  );
}


