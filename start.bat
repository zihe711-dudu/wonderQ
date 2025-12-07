@echo off
REM WonderQ 本地服務器啟動腳本（Windows）

echo 🚀 正在啟動 WonderQ 本地服務器...

REM 進入專案目錄
cd /d "%~dp0"

REM 檢查 node_modules 是否存在
if not exist "node_modules" (
    echo 📦 首次啟動，正在安裝依賴...
    call npm install
)

REM 啟動開發服務器
echo ✅ 啟動開發服務器...
echo 📍 訪問地址：http://localhost:3000
echo.
call npm run dev

