"use client";

import Link from "next/link";
import { ChevronLeft, Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/", label: "首頁" },
  { href: "/generals", label: "武將圖鑑" },
  { href: "/cards", label: "卡牌資料庫" },
  { href: "/faq", label: "FAQ" },
  { href: "/changelog", label: "更新日誌" },
];

export default function SiteNav({ currentLabel }: { currentLabel?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="site-nav-wrap">
      <button
        type="button"
        className="site-nav-menu-button"
        aria-label={open ? "關閉主選單" : "開啟主選單"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={23} /> : <Menu size={25} />}
      </button>

      <Link href="/" className="site-nav-home-link">
        <ChevronLeft size={17} />
        首頁
      </Link>

      {currentLabel && <span className="site-nav-current">{currentLabel}</span>}

      {open && (
        <nav className="site-nav-menu" aria-label="主選單">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
