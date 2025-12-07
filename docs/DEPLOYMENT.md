# WonderQ 部署規劃文件

## 📋 部署目標
將 WonderQ 問答遊戲部署到公開網頁，讓所有使用者可以透過網址訪問。

---

## 🎯 部署選項比較

### 方案一：Vercel（推薦 ⭐）
**優點：**
- Next.js 官方推薦，零配置部署
- 自動 HTTPS、CDN 加速
- 免費方案足夠使用
- 自動部署（連接 GitHub）
- 支援環境變數管理

**缺點：**
- 需要 GitHub 帳號

**適合：** 快速上線，最佳體驗

---

### 方案二：Firebase Hosting
**優點：**
- 與現有 Firebase 服務整合
- 免費方案可用
- 支援自訂域名

**缺點：**
- 需要額外配置 Next.js 輸出
- 部署流程較複雜

**適合：** 已深度使用 Firebase 生態

---

### 方案三：Netlify
**優點：**
- 簡單易用
- 免費方案
- 自動部署

**缺點：**
- 與 Firebase 整合需要額外配置

**適合：** 需要更多自訂選項

---

### 方案四：Cloudflare Pages（推薦 ⭐⭐）
**優點：**
- 全球 CDN，速度極快
- 免費方案非常慷慨（無限請求、無限頻寬）
- 自動 HTTPS、自動部署
- 支援 Next.js 完整功能
- 與 Cloudflare Workers 整合（邊緣運算）
- 支援自訂域名（免費）

**缺點：**
- 需要 GitHub 帳號
- 環境變數設定介面較簡單

**適合：** 追求極致效能和免費方案

**注意：** Cloudflare Pages 適合 Next.js 應用，而 Cloudflare Workers 更適合 API 路由。本專案使用 **Cloudflare Pages**。

---

### 方案五：Cloudflare Workers（進階）
**優點：**
- 邊緣運算，超低延遲
- 免費方案：10 萬請求/天
- 適合 API 路由

**缺點：**
- 需要將 API 路由改為 Edge Runtime
- 不支援完整的 Next.js 功能
- 需要額外配置

**適合：** 僅部署 API 路由，或需要邊緣運算的特殊需求

**注意：** 對於完整的 Next.js 應用，建議使用 **Cloudflare Pages** 而非 Workers。

---

## 🚀 推薦方案

### 方案 A：Vercel（最簡單）⭐
- Next.js 官方推薦
- 零配置，開箱即用
- 最適合快速上線

### 方案 B：Cloudflare Pages（最划算）⭐⭐
- 免費方案最慷慨
- 全球 CDN 速度最快
- 適合長期使用

---

## 📝 詳細部署步驟

### 選項 1：Vercel 部署

### 前置準備

#### 1. 準備 GitHub 倉庫
- [ ] 確保代碼已推送到 GitHub
- [ ] 確認 `.env.local` 已加入 `.gitignore`（不要上傳 API Key）

#### 2. 準備環境變數清單
需要設定的環境變數：
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
OPENAI_API_KEY=
```

---

## 📝 詳細部署步驟（Vercel）

### 步驟 1：註冊 Vercel 帳號
1. 前往 https://vercel.com
2. 使用 GitHub 帳號登入（推薦）或註冊新帳號

### 步驟 2：匯入專案
1. 點擊「Add New Project」
2. 選擇你的 GitHub 倉庫（`Wonder.Q` 或 `quizy-tw-kids`）
3. Vercel 會自動偵測 Next.js 專案

### 步驟 3：設定環境變數
1. 在「Environment Variables」區塊
2. 逐一新增以下變數：
   - `NEXT_PUBLIC_FIREBASE_API_KEY` = （你的 Firebase API Key）
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` = （你的 Firebase Auth Domain）
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` = （你的 Firebase Project ID）
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` = （你的 Firebase Storage Bucket）
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` = （你的 Firebase Messaging Sender ID）
   - `NEXT_PUBLIC_FIREBASE_APP_ID` = （你的 Firebase App ID）
   - `OPENAI_API_KEY` = （你的 OpenAI API Key）⚠️ **重要：不要公開此 Key**

### 步驟 4：設定建置選項（如需要）
- **Framework Preset:** Next.js（自動偵測）
- **Root Directory:** `./quizy-tw-kids`（如果專案在子目錄）
- **Build Command:** `npm run build`（預設）
- **Output Directory:** `.next`（預設）

### 步驟 5：部署
1. 點擊「Deploy」
2. 等待建置完成（約 2-5 分鐘）
3. 部署成功後會獲得一個網址，例如：`https://wonderq-xxx.vercel.app`

### 步驟 6：測試部署
- [ ] 訪問部署網址
- [ ] 測試 Google 登入功能
- [ ] 測試建立房間
- [ ] 測試 AI 出題（確認圖片生成）
- [ ] 測試遊玩功能

---

### 選項 2：Cloudflare Pages 部署

#### 前置準備
與 Vercel 相同，需要：
- [ ] GitHub 倉庫已準備好
- [ ] 環境變數清單已準備

#### 步驟 1：註冊 Cloudflare 帳號
1. 前往 https://dash.cloudflare.com/sign-up
2. 註冊帳號（免費）

#### 步驟 2：連接 GitHub
1. 前往 https://dash.cloudflare.com
2. 左側選單選擇 **Pages**
3. 點擊 **Create a project**
4. 選擇 **Connect to Git**
5. 授權 Cloudflare 訪問你的 GitHub 帳號
6. 選擇你的倉庫（`Wonder.Q` 或 `quizy-tw-kids`）

#### 步驟 3：設定建置選項
1. **Project name:** 輸入專案名稱（例如：`wonderq`）
2. **Production branch:** `main` 或 `master`
3. **Framework preset:** `Next.js`（自動偵測）
4. **Build command:** `npm run build`
5. **Build output directory:** `.next`
6. **Root directory:** `quizy-tw-kids`（如果專案在子目錄）

#### 步驟 4：設定環境變數
在「Environment variables」區塊，新增：

**Firebase 變數（7 個）：**
- `NEXT_PUBLIC_FIREBASE_API_KEY` = （你的值）
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` = （你的值）
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` = （你的值）
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` = （你的值）
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` = （你的值）
- `NEXT_PUBLIC_FIREBASE_APP_ID` = （你的值）

**OpenAI 變數（1 個）：**
- `OPENAI_API_KEY` = （你的值）⚠️ **重要：不要公開**

#### 步驟 5：部署
1. 點擊 **Save and Deploy**
2. 等待建置完成（約 3-5 分鐘）
3. 部署成功後會獲得網址，例如：`https://wonderq.pages.dev`

#### 步驟 6：自訂域名（選用）
1. 在專案設定 → **Custom domains**
2. 輸入你的域名
3. 按照指示設定 DNS 記錄（通常只需新增 CNAME）

#### 步驟 7：測試部署
- [ ] 訪問部署網址
- [ ] 測試所有功能（與 Vercel 相同）

---

### Cloudflare Pages vs Workers 說明

**Cloudflare Pages：**
- ✅ 支援完整的 Next.js 應用
- ✅ 自動處理 SSR、ISR、API Routes
- ✅ 適合部署整個 Next.js 專案
- ✅ 本專案推薦使用

**Cloudflare Workers：**
- ⚠️ 僅適合 API 路由
- ⚠️ 需要將 API 路由改為 Edge Runtime
- ⚠️ 不支援完整的 Next.js 功能
- ⚠️ 需要額外配置

**本專案建議：** 使用 **Cloudflare Pages** 部署完整應用。

---

## 🔧 Firebase 設定調整

### 1. 授權網域設定
部署後需要在 Firebase Console 新增授權網域：

1. 前往 Firebase Console → Authentication → Settings → Authorized domains
2. 新增你的 Vercel 網址（例如：`wonderq-xxx.vercel.app`）
3. 如果使用自訂域名，也要新增

### 2. Firestore 規則檢查
確認 Firestore 安全規則已正確設定，允許公開讀取必要的資料。

---

## 🌐 自訂域名（選用）

### 步驟 1：購買域名
- 推薦：Namecheap、Google Domains、Cloudflare

### 步驟 2：在 Vercel 設定
1. 專案設定 → Domains
2. 輸入你的域名
3. 按照指示設定 DNS 記錄

### 步驟 3：更新 Firebase 授權網域
在 Firebase Console 新增你的自訂域名。

---

## ⚠️ 重要注意事項

### 安全性
1. **不要將 `.env.local` 上傳到 GitHub**
   - 確認 `.gitignore` 包含 `.env.local`
   - 所有敏感資訊只存在 Vercel 環境變數中

2. **API Key 保護**
   - `OPENAI_API_KEY` 是伺服器端變數，不會暴露給前端
   - Firebase 公開變數（`NEXT_PUBLIC_*`）是安全的，因為是公開配置

### 效能優化
- Vercel 自動處理圖片優化
- 確認圖片已正確壓縮（我們已實作 WebP 轉換）

### 成本考量
- **Vercel 免費方案：**
  - 100GB 頻寬/月
  - 無限請求
  - 足夠中小型應用使用

- **Cloudflare Pages 免費方案：**
  - **無限頻寬** ⭐
  - **無限請求** ⭐
  - 500 個建置/月
  - 最慷慨的免費方案

- **Firebase 免費方案：**
  - Firestore：50K 讀取/天
  - Authentication：無限制
  - 足夠測試和小規模使用

- **OpenAI API：**
  - 按使用量付費
  - 建議設定使用上限

---

## 🔄 持續部署（CI/CD）

### 自動部署設定
Vercel 預設會：
- 監控 GitHub 倉庫
- 當你推送代碼到 `main` 分支時自動部署
- 每次 Pull Request 會建立預覽部署

### 手動部署
如果需要手動觸發：
1. 在 Vercel Dashboard 點擊「Redeploy」
2. 或使用 Vercel CLI：`vercel --prod`

---

## 📊 部署檢查清單

### 部署前
- [ ] 代碼已推送到 GitHub
- [ ] `.env.local` 已加入 `.gitignore`
- [ ] 本地測試通過
- [ ] 所有功能正常運作

### 部署中
- [ ] 已註冊 Vercel 帳號
- [ ] 已匯入 GitHub 專案
- [ ] 已設定所有環境變數
- [ ] 建置成功無錯誤

### 部署後
- [ ] 網站可正常訪問
- [ ] Firebase 授權網域已新增
- [ ] Google 登入功能正常
- [ ] AI 出題功能正常（含圖片生成）
- [ ] 所有頁面可正常瀏覽
- [ ] 行動裝置測試通過

---

## 🆘 常見問題

### Q: 部署後出現「Firebase: Error (auth/unauthorized-domain)」
**A:** 需要在 Firebase Console → Authentication → Settings → Authorized domains 新增你的 Vercel 網址。

### Q: AI 圖片生成失敗
**A:** 檢查 `OPENAI_API_KEY` 是否正確設定在 Vercel 環境變數中。

### Q: 建置失敗
**A:** 
1. 檢查 Vercel 建置日誌
2. 確認所有依賴已正確安裝
3. 確認環境變數都已設定

### Q: 如何更新網站？
**A:** 
- **Vercel:** 推送代碼到 GitHub，Vercel 會自動部署。或手動在 Vercel Dashboard 觸發重新部署。
- **Cloudflare Pages:** 推送代碼到 GitHub，Cloudflare Pages 會自動部署。或手動在 Dashboard 觸發重新部署。

### Q: Cloudflare Pages 和 Workers 有什麼區別？
**A:** 
- **Pages:** 適合完整的 Next.js 應用，支援 SSR、ISR、API Routes，零配置。
- **Workers:** 適合單獨的 API 路由，需要 Edge Runtime，不適合完整 Next.js 應用。
- **本專案建議使用 Pages。**

---

## 📞 下一步

1. **選擇部署方案**
   - **最簡單：** Vercel（零配置）
   - **最划算：** Cloudflare Pages（無限頻寬）
2. **準備 GitHub 倉庫**（確保代碼已推送）
3. **準備環境變數清單**（從 `.env.local` 複製）
4. **按照步驟部署**
5. **測試所有功能**
6. **分享網址給使用者**

---

## 📚 參考資源

- [Vercel 部署文件](https://vercel.com/docs)
- [Cloudflare Pages 文件](https://developers.cloudflare.com/pages/)
- [Cloudflare Pages + Next.js 指南](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [Next.js 部署指南](https://nextjs.org/docs/deployment)
- [Firebase Hosting 文件](https://firebase.google.com/docs/hosting)
- [Firebase 授權網域設定](https://firebase.google.com/docs/auth/web/domain-verification)

---

**最後更新：** 2024年
**維護者：** WonderQ 開發團隊

