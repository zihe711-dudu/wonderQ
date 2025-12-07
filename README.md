# Wonder.Q（台灣小朋友問答遊戲）

可在本機出題與作答，並可選擇「雲端題庫 + 分享連結 + 雲端排行榜」模式（使用 Firebase Firestore）。

## 啟動（本機）

### ⚡ 最簡單的方式

**macOS/Linux：**
```bash
./start.sh
```

**Windows：**
```bash
start.bat
```

或直接雙擊 `start.sh`（macOS/Linux）或 `start.bat`（Windows）文件

✅ 就這麼簡單！腳本會自動處理所有步驟。

---

### 手動啟動

```bash
# 1. 進入專案目錄
cd quizy-tw-kids

# 2. 安裝依賴
npm install

# 3. 啟動開發服務器
npm run dev
```

### 環境變數設定

在專案根目錄創建 `.env.local` 文件，並設定：

```env
# Firebase 配置（必需，用於雲端功能）
NEXT_PUBLIC_FIREBASE_API_KEY=你的Firebase_API_Key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=你的Firebase_Auth_Domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=你的Firebase_Project_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=你的Firebase_Storage_Bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=你的Firebase_Messaging_Sender_ID
NEXT_PUBLIC_FIREBASE_APP_ID=你的Firebase_App_ID

# OpenAI API（可選，僅用於 AI 出題功能）
OPENAI_API_KEY=你的OpenAI_API_Key
```

### 訪問應用

啟動後訪問：`http://localhost:3000`

### 詳細說明

- **快速啟動指南：** 查看 `QUICK-START.md`
- **本地開發完整指南：** 查看 `docs/LOCAL-DEVELOPMENT.md`
- **部署到線上：** 查看 `docs/DEPLOYMENT.md`

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
    // 輔助函數：檢查是否為擁有者
    function isOwner(ownerUid) {
      return request.auth != null && request.auth.uid == ownerUid;
    }

    // quizzes collection（公共題庫）
    match /quizzes/{quizId} {
      allow read: if true;                // 任何人可讀取題庫
      allow create: if true;              // 任何人可新增題庫
      // 允許擁有者更新標題、標籤、狀態
      allow update: if isOwner(resource.data.ownerUid) && 
                       request.resource.data.diff(resource.data).affectedKeys()
                         .hasOnly(['title', 'tags', 'status', 'updatedAt']);
      allow delete: if false;             // 禁止刪除（保護資料）

      // 成績子集合
      match /results/{resultId} {
        allow read: if true;              // 任何人可讀取排行榜
        allow create: if true;            // 任何人可新增成績
        allow update, delete: if false;   // 禁止更新與刪除
      }
    }

    // rooms collection（房間模式）
    match /rooms/{roomId} {
      allow read: if true;                // 任何人可讀取房間（但前端會過濾已下架）
      allow create: if request.auth != null;  // 需登入才能建立房間
      // 允許擁有者更新標題、狀態
      allow update: if isOwner(resource.data.ownerUid) && 
                       request.resource.data.diff(resource.data).affectedKeys()
                         .hasOnly(['title', 'status', 'updatedAt']);
      // 允許擁有者刪除自己的房間
      allow delete: if isOwner(resource.data.ownerUid);

      // 房間成績子集合
      match /results/{resultId} {
        allow read: if true;              // 任何人可讀取排行榜
        allow create: if request.auth != null;  // 需登入才能新增成績
        allow update, delete: if false;   // 禁止更新與刪除
      }
    }

    // teachers collection（白名單）
    match /teachers/{uid} {
      allow read: if true;                // 任何人可讀取（檢查是否為老師）
      allow write: if false;              // 禁止寫入（需手動在 Firebase Console 設定）
    }
  }
}
```

## 注意

- 本專案未包含使用者登入/Auth，請勿存放個資
- 若要更嚴格的規則（例如僅允許擁有分享連結者寫入、或限制頻率），請自行擴充 Firestore 規則與前端驗證


