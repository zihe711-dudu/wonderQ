# 💻 本地開發服務器啟動指南

## 🚀 最簡單的啟動方式

### 方法 1：使用啟動腳本（推薦）⭐

**macOS/Linux：**
```bash
./start.sh
```

**Windows：**
```bash
start.bat
```

或直接雙擊 `start.sh`（macOS/Linux）或 `start.bat`（Windows）文件

✅ 腳本會自動處理所有步驟！

---

### 方法 2：手動啟動

1. **進入專案目錄**
   ```bash
   cd quizy-tw-kids
   ```

2. **安裝依賴**（首次或更新後需要）
   ```bash
   npm install
   ```

3. **啟動開發服務器**
   ```bash
   npm run dev
   ```

4. **訪問應用**
   - 打開瀏覽器訪問：`http://localhost:3000`
   - 開發服務器會自動重新載入代碼變更

---

## 📋 快速參考

**最簡單：** 雙擊 `start.sh` 或 `start.bat`  
**手動：** `npm install && npm run dev`  
**訪問：** http://localhost:3000

---

## 📋 完整啟動流程

### 步驟 1：確認環境

**必需：**
- ✅ Node.js（建議 v18 或 v20）
- ✅ npm 或 yarn

**檢查版本：**
```bash
node -v    # 應該顯示 v18.x.x 或 v20.x.x
npm -v     # 應該顯示 9.x.x 或更高
```

### 步驟 2：安裝依賴

**首次安裝：**
```bash
npm install
```

**更新依賴後：**
```bash
npm install
# 或清除緩存後重新安裝
rm -rf node_modules package-lock.json
npm install
```

### 步驟 3：設定環境變數

**創建 `.env.local` 文件**（如果還沒有）：
```bash
# 在專案根目錄（quizy-tw-kids/）創建 .env.local
touch .env.local
```

**編輯 `.env.local`，添加以下變數：**
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

**注意：**
- `.env.local` 文件不會被提交到 Git（已在 `.gitignore` 中）
- 如果沒有設定環境變數，部分功能可能無法使用

### 步驟 4：啟動服務器

**開發模式（推薦）：**
```bash
npm run dev
```

**生產模式（測試建置）：**
```bash
# 先建置
npm run build

# 啟動生產服務器
npm start
```

### 步驟 5：訪問應用

- **開發模式：** `http://localhost:3000`
- **生產模式：** `http://localhost:3000`（預設）

---

## 🔌 離線環境說明

### ✅ 離線可用的功能

即使沒有網絡連接，以下功能仍可使用：

1. **本地出題**
   - 在「出題囉」頁面手動輸入題目
   - 題目會儲存在瀏覽器的 `localStorage`
   - 不需要網絡連接

2. **本地遊玩**
   - 使用 `localStorage` 中的題目進行答題
   - 音效、計分、本地排行榜
   - 完全離線運作

3. **基本 UI**
   - 所有頁面都可以訪問
   - 基本互動功能正常

### ⚠️ 離線不可用的功能

以下功能需要網絡連接：

1. **Firebase 相關功能**
   - ❌ Google 登入
   - ❌ 發佈公共題庫到雲端
   - ❌ 建立房間（需要 Firebase）
   - ❌ 雲端排行榜
   - ❌ 儲存成績到雲端

2. **AI 功能**
   - ❌ AI 出題（需要 OpenAI API）
   - ❌ AI 生成圖片（需要 OpenAI API）

3. **雲端功能**
   - ❌ 訪問分享連結的題庫
   - ❌ 查看其他使用者的成績

---

## 🛠️ 常用命令

### 開發相關

```bash
# 啟動開發服務器
npm run dev

# 建置生產版本
npm run build

# 啟動生產服務器（需要先建置）
npm start

# 檢查代碼風格
npm run lint
```

### 故障排除

```bash
# 清除 Next.js 緩存
rm -rf .next

# 清除 node_modules 並重新安裝
rm -rf node_modules package-lock.json
npm install

# 檢查端口是否被占用（macOS/Linux）
lsof -ti:3000 | xargs kill -9

# 檢查端口是否被占用（Windows）
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## 🔧 環境變數說明

### 必需變數（Firebase）

如果沒有設定這些變數，雲端功能將無法使用：

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### 可選變數（OpenAI）

如果沒有設定，AI 出題功能將無法使用：

- `OPENAI_API_KEY`

**注意：** 即使沒有 `OPENAI_API_KEY`，應用仍可正常啟動，只是 AI 功能會失敗。

---

## 🐛 常見問題

### Q: 啟動後顯示 "Port 3000 is already in use"
**解決：**
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# 或使用其他端口
PORT=3001 npm run dev
```

### Q: 啟動後顯示 "Cannot find module"
**解決：**
```bash
# 重新安裝依賴
rm -rf node_modules package-lock.json
npm install
```

### Q: 環境變數沒有生效
**解決：**
1. 確認 `.env.local` 在專案根目錄（`quizy-tw-kids/.env.local`）
2. 確認變數名稱正確（注意大小寫）
3. 重啟開發服務器（`Ctrl+C` 停止，然後 `npm run dev`）

### Q: Firebase 功能無法使用
**解決：**
1. 檢查 `.env.local` 中的 Firebase 變數是否正確
2. 確認網絡連接正常
3. 檢查 Firebase Console 中的專案設定

### Q: AI 出題功能失敗
**解決：**
1. 檢查 `OPENAI_API_KEY` 是否正確設定
2. 確認網絡連接正常
3. 檢查 OpenAI API 額度是否足夠

### Q: 離線時如何測試本地功能？
**解決：**
1. 斷開網絡連接
2. 啟動開發服務器：`npm run dev`
3. 訪問 `http://localhost:3000`
4. 使用「出題囉」手動輸入題目
5. 使用「開始玩」進行本地答題

---

## 📝 開發提示

### 熱重載（Hot Reload）
- Next.js 會自動監聽文件變更
- 修改代碼後，瀏覽器會自動刷新
- 不需要手動重啟服務器

### 開發工具
- **瀏覽器開發者工具：** `F12` 或 `Cmd+Option+I`（Mac）
- **Next.js 終端輸出：** 查看編譯錯誤和警告
- **React DevTools：** 安裝瀏覽器擴展以調試 React 組件

### 性能優化
- 開發模式下，建置速度較慢是正常的
- 生產模式（`npm run build`）會優化代碼
- 使用 `npm start` 測試生產版本的性能

---

## 🎯 快速參考

### 最簡單的啟動方式
```bash
cd quizy-tw-kids
npm install
npm run dev
# 訪問 http://localhost:3000
```

### 離線測試本地功能
```bash
# 1. 確保 .env.local 已設定（即使沒有網絡）
# 2. 啟動服務器
npm run dev
# 3. 訪問 http://localhost:3000
# 4. 使用「出題囉」手動輸入題目
# 5. 使用「開始玩」進行本地答題
```

---

## 📚 相關文檔

- **部署指南：** `docs/DEPLOYMENT.md`
- **部署檢查清單：** `docs/DEPLOY-CHECKLIST.md`
- **帳號需求：** `docs/ACCOUNT-REQUIREMENTS.md`
- **專案 README：** `README.md`

---

**最後更新：** 2024年
**維護者：** WonderQ 開發團隊

