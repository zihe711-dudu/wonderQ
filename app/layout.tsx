import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "台灣小朋友問答遊戲｜Quizy TW Kids",
  description: "可愛風格的繁體中文問答遊戲，自己出題、隨機作答、計分顯示。"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant-TW">
      <body className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-pink-200 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}


