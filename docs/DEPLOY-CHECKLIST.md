# 🚀 WonderQ 快速部署檢查清單

## 部署前準備（5 分鐘）

### ✅ 1. 確認代碼已備份到 GitHub
```bash
# 檢查是否有未提交的變更
git status

# 如果有變更，提交並推送
git add .
git commit -m "準備部署"
git push origin main
```

### ✅ 2. 準備環境變數清單
打開你的 `.env.local` 文件，準備以下變數：

**Firebase 變數（公開，安全）：**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

**OpenAI 變數（私密，重要）：**
- `OPENAI_API_KEY`

---

## 選擇部署平台

### 選項 A：Vercel（最簡單）⭐
- 零配置，開箱即用
- Next.js 官方推薦
- 適合快速上線

### 選項 B：Cloudflare Pages（最划算）⭐⭐
- 無限頻寬、無限請求
- 全球 CDN 速度最快
- 免費方案最慷慨

---

## 選項 A：Vercel 部署步驟（10 分鐘）

### 步驟 1：註冊/登入 Vercel
- [ ] 前往 https://vercel.com
- [ ] 使用 GitHub 帳號登入

### 步驟 2：匯入專案
- [ ] 點擊「Add New Project」
- [ ] 選擇 `Wonder.Q` 或 `quizy-tw-kids` 倉庫
- [ ] 確認 Framework Preset 顯示「Next.js」

### 步驟 3：設定專案
- [ ] Root Directory: `./quizy-tw-kids`（如果專案在子目錄）
- [ ] 其他設定保持預設

### 步驟 4：新增環境變數
在「Environment Variables」區塊，逐一新增：

**Firebase 變數（7 個）：**
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY` = `你的值`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` = `你的值`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID` = `你的值`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` = `你的值`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` = `你的值`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID` = `你的值`

**OpenAI 變數（1 個）：**
- [ ] `OPENAI_API_KEY` = `你的值` ⚠️ **不要公開**

### 步驟 5：部署
- [ ] 點擊「Deploy」按鈕
- [ ] 等待建置完成（約 2-5 分鐘）
- [ ] 記下部署網址（例如：`https://wonderq-xxx.vercel.app`）

---

## 選項 B：Cloudflare Pages 部署步驟（10 分鐘）

### 步驟 1：註冊/登入 Cloudflare
- [ ] 前往 https://dash.cloudflare.com/sign-up
- [ ] 註冊帳號（免費）

### 步驟 2：連接 GitHub
- [ ] 前往 https://dash.cloudflare.com
- [ ] 左側選單選擇 **Pages**
- [ ] 點擊 **Create a project**
- [ ] 選擇 **Connect to Git**
- [ ] 授權 Cloudflare 訪問 GitHub
- [ ] 選擇 `Wonder.Q` 或 `quizy-tw-kids` 倉庫

### 步驟 3：設定專案
- [ ] Project name: 輸入名稱（例如：`wonderq`）
- [ ] Production branch: `main` 或 `master`
- [ ] Framework preset: `Next.js`（自動偵測）
- [ ] Build command: `npm run build`
- [ ] Build output directory: `.next`
- [ ] Root directory: `quizy-tw-kids`（如果專案在子目錄）

### 步驟 4：新增環境變數
在「Environment variables」區塊，逐一新增：

**Firebase 變數（7 個）：**
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY` = `你的值`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` = `你的值`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID` = `你的值`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` = `你的值`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` = `你的值`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID` = `你的值`

**OpenAI 變數（1 個）：**
- [ ] `OPENAI_API_KEY` = `你的值` ⚠️ **不要公開**

### 步驟 5：部署
- [ ] 點擊 **Save and Deploy**
- [ ] 等待建置完成（約 3-5 分鐘）
- [ ] 記下部署網址（例如：`https://wonderq.pages.dev`）

### 步驟 6：自訂域名（選用）
- [ ] 在專案設定 → **Custom domains**
- [ ] 輸入你的域名
- [ ] 按照指示設定 DNS 記錄

---

## Firebase 設定（5 分鐘）

### 授權網域設定
- [ ] 前往 [Firebase Console](https://console.firebase.google.com)
- [ ] 選擇你的專案
- [ ] 前往 **Authentication** → **Settings** → **Authorized domains**
- [ ] 點擊「Add domain」
- [ ] 輸入你的部署網址：
  - Vercel: `wonderq-xxx.vercel.app`
  - Cloudflare Pages: `wonderq.pages.dev`
  - 或自訂域名
- [ ] 儲存

---

## 部署後測試（10 分鐘）

### 基本功能測試
- [ ] 訪問部署網址，網站正常載入
- [ ] 首頁顯示正常
- [ ] 右上角顯示「Google 登入」按鈕

### 登入功能測試
- [ ] 點擊「Google 登入」
- [ ] 成功登入，顯示頭像和暱稱
- [ ] 右上角選單正常運作

### 出題功能測試（需登入 + 白名單）
- [ ] 點擊「出題囉」標籤
- [ ] 測試「用 AI 產生 20 題並發佈」
- [ ] 確認圖片自動生成
- [ ] 確認分享連結正常

### 房間功能測試（需登入）
- [ ] 點擊「建立房間」
- [ ] 測試「AI 產生 X 題」
- [ ] 確認圖片自動生成
- [ ] 確認發佈成功，獲得分享連結

### 遊玩功能測試
- [ ] 使用分享連結開啟題目
- [ ] 確認圖片正常顯示
- [ ] 測試答題流程
- [ ] 確認即時回饋正常
- [ ] 確認成績計算正確

### 行動裝置測試
- [ ] 在手機瀏覽器開啟網站
- [ ] 確認版面正常
- [ ] 測試觸控操作

---

## 常見問題快速修復

### ❌ 問題：Firebase 登入錯誤「unauthorized-domain」
**解決：** 在 Firebase Console → Authentication → Settings → Authorized domains 新增你的部署網址（Vercel 或 Cloudflare Pages）

### ❌ 問題：AI 圖片生成失敗
**解決：** 
1. 檢查環境變數中 `OPENAI_API_KEY` 是否正確（Vercel 或 Cloudflare Pages）
2. 檢查建置日誌是否有錯誤

### ❌ 問題：建置失敗
**解決：**
1. 查看建置日誌（Vercel Dashboard 或 Cloudflare Pages Dashboard）
2. 確認所有環境變數都已設定
3. 確認 `package.json` 中的依賴正確
4. 確認 Root directory 設定正確（如果是子目錄）

---

## 🎉 部署完成！

部署成功後，你會獲得：
- ✅ 公開網址
  - Vercel: `https://wonderq-xxx.vercel.app`
  - Cloudflare Pages: `https://wonderq.pages.dev`
- ✅ 自動 HTTPS 加密
- ✅ CDN 全球加速
- ✅ 自動部署（每次推送代碼到 GitHub 會自動更新）

**分享給使用者：** 直接分享你的部署網址即可！

**Cloudflare Pages 額外優勢：**
- ⭐ 無限頻寬、無限請求（免費方案）
- ⭐ 全球 CDN 速度最快

---

## 📝 備註

- 詳細部署說明請參考：`docs/DEPLOYMENT.md`
- **Cloudflare Pages vs Workers：** 本專案使用 **Pages**（完整 Next.js 支援），而非 Workers（僅適合 API 路由）
- 如有問題，檢查建置日誌和瀏覽器控制台
- 建議先在小範圍測試，確認無誤後再公開分享

