# 📝 部署所需帳號說明

## 必需的帳號

### 1. GitHub 帳號（必需）⭐
**用途：** 存放代碼，讓部署平台可以訪問你的代碼

**如何註冊：**
1. 前往 https://github.com/signup
2. 輸入用戶名、郵箱、密碼
3. 驗證郵箱
4. **免費方案即可**

**為什麼需要：**
- Vercel 和 Cloudflare Pages 都需要連接 GitHub 來獲取代碼
- 這是部署流程的標準做法

---

### 2. 部署平台帳號（二選一）

#### 選項 A：Vercel 帳號
**用途：** 部署 Next.js 應用到 Vercel

**如何註冊：**
1. 前往 https://vercel.com/signup
2. **推薦：使用 GitHub 帳號登入**（一鍵註冊，最簡單）
3. 或使用郵箱註冊
4. **免費方案即可**

**優點：**
- 可以用 GitHub 帳號直接登入，無需額外註冊
- 自動連接你的 GitHub 倉庫

---

#### 選項 B：Cloudflare 帳號
**用途：** 部署到 Cloudflare Pages

**如何註冊：**
1. 前往 https://dash.cloudflare.com/sign-up
2. 輸入郵箱和密碼
3. 驗證郵箱
4. **免費方案即可**

**優點：**
- 免費方案最慷慨（無限頻寬）
- 全球 CDN 速度最快

---

## 帳號需求總結

### 最少需要：2 個帳號
1. ✅ **GitHub**（必需）- 存放代碼
2. ✅ **Vercel 或 Cloudflare**（二選一）- 部署平台

### 推薦組合
- **最簡單：** GitHub + Vercel（用 GitHub 帳號登入 Vercel，只需註冊 GitHub）
- **最划算：** GitHub + Cloudflare Pages（無限頻寬）

---

## 其他服務帳號（已擁有）

### Firebase 帳號
- ✅ 你已經有 Firebase 專案
- ✅ 不需要額外註冊
- ✅ 只需在 Firebase Console 新增授權網域

### OpenAI 帳號
- ✅ 你已經有 OpenAI API Key
- ✅ 不需要額外註冊
- ✅ 只需在部署平台設定環境變數

---

## 快速註冊流程

### 如果還沒有 GitHub 帳號：
1. **註冊 GitHub**（5 分鐘）
   - https://github.com/signup
   - 輸入用戶名、郵箱、密碼
   - 驗證郵箱

2. **選擇部署平台**（2 分鐘）
   - **Vercel：** https://vercel.com/signup（用 GitHub 登入）
   - **Cloudflare Pages：** https://dash.cloudflare.com/sign-up

3. **推送代碼到 GitHub**（5 分鐘）
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/你的用戶名/Wonder.Q.git
   git push -u origin main
   ```

4. **開始部署**（10 分鐘）
   - 按照 `docs/DEPLOY-CHECKLIST.md` 執行

---

## 常見問題

### Q: 我可以用其他 Git 平台嗎？
**A:** 
- Vercel 和 Cloudflare Pages 主要支援 GitHub
- 也可以使用 GitLab 或 Bitbucket，但設定較複雜
- **建議使用 GitHub**（最簡單、最通用）

### Q: 免費方案夠用嗎？
**A:** 
- ✅ **GitHub 免費方案：** 無限公開倉庫，足夠使用
- ✅ **Vercel 免費方案：** 100GB 頻寬/月，足夠中小型應用
- ✅ **Cloudflare Pages 免費方案：** 無限頻寬，最慷慨

### Q: 需要付費嗎？
**A:** 
- **不需要！** 所有服務的免費方案都足夠使用
- 只有當你的應用規模非常大時才需要考慮付費方案

### Q: 我可以同時使用 Vercel 和 Cloudflare 嗎？
**A:** 
- 可以，但通常只需要一個
- 建議先選擇一個平台部署，測試無誤後再考慮其他平台

---

## 下一步

1. **確認已有帳號：**
   - [ ] GitHub 帳號
   - [ ] Firebase 專案（已有）
   - [ ] OpenAI API Key（已有）

2. **選擇並註冊部署平台：**
   - [ ] Vercel 帳號（推薦：用 GitHub 登入）
   - 或
   - [ ] Cloudflare 帳號

3. **開始部署：**
   - 參考 `docs/DEPLOY-CHECKLIST.md`

---

**總時間：** 約 10-15 分鐘註冊所有必需帳號

