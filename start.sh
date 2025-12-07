#!/bin/bash

# WonderQ 本地服務器啟動腳本

echo "🚀 正在啟動 WonderQ 本地服務器..."

# 進入專案目錄
cd "$(dirname "$0")"

# 加載 nvm（如果存在）
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
    . "$NVM_DIR/nvm.sh"
    # 嘗試使用 Node.js 20，如果沒有則安裝或使用 LTS
    nvm use 20 2>/dev/null || nvm install 20 2>/dev/null || (nvm install --lts && nvm use --lts)
fi

# 檢查 node_modules 是否存在
if [ ! -d "node_modules" ]; then
    echo "📦 首次啟動，正在安裝依賴..."
    npm install --no-fund --no-audit
fi

# 啟動開發服務器
echo "✅ 啟動開發服務器..."
echo "📍 訪問地址：http://localhost:3000"
echo ""
npm run dev

