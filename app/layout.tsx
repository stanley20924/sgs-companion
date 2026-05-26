import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "三國殺牌局 Companion",
  description: "三國殺玩家自用牌局同步與資料站。非官方網站。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
