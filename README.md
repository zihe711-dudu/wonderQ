# Wonder.Q（台灣小朋友問答遊戲）

可在本機出題與作答，並可選擇「雲端題庫 + 分享連結 + 雲端排行榜」模式（使用 Firebase Firestore）。

## 啟動（本機）

1. 於根目錄建立 `.env.local`，並設定：
   - `NEXT_PUBLIC_FIREBASE_API_KEY=...`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID=...`
2. 安裝依賴並啟動：
   - `npm install`
   - `npm run dev`

## 功能簡述

- 本機出題：將題目存於 localStorage
- 本機作答：隨機出題、音效提示、計分、本機排行榜
- 雲端題庫：於出題頁點擊「發佈成分享題庫」，取得分享連結
- 雲端作答：任何裝置開啟分享連結即可作答
- 雲端排行榜：成績寫入 Firestore，顯示前 10 名

## Firebase 設定（Firestore 規則建議）

教學/非商業用途的簡化版本，允許任何人讀寫新增，但禁止更新與刪除，降低被亂改風險。請依專案實際需求自行調整。

> 注意：以下為範例（pseudo），請至 Firebase Console → Firestore → Rules 貼上並調整。

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // quizzes collection
    match /quizzes/{quizId} {
      allow read: if true;                // 任何人可讀取題庫
      allow create: if true;              // 任何人可新增題庫
      allow update, delete: if false;     // 禁止更新與刪除

      // 成績子集合
      match /results/{resultId} {
        allow read: if true;              // 任何人可讀取排行榜
        allow create: if true;            // 任何人可新增成績
        allow update, delete: if false;   // 禁止更新與刪除
      }
    }
  }
}
```

## 注意

- 本專案未包含使用者登入/Auth，請勿存放個資
- 若要更嚴格的規則（例如僅允許擁有分享連結者寫入、或限制頻率），請自行擴充 Firestore 規則與前端驗證


