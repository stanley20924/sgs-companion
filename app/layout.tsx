import type { Metadata, Viewport } from "next";
import SiteFooter from "../components/site-footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "三國殺牌局 Companion",
  description: "三國殺玩家自用牌局同步與資料站。非官方網站。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
