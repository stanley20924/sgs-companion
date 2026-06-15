"use client";

import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Menu,
  Shield,
  Wrench,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import GeneralDetailModal, { type General } from "../components/general-detail-modal";
import generalsJson from "../data/generals.json";

type ModeKey = "war" | "identity";

const generals = generalsJson as General[];

const nationalVersions = ["受命于天", "標準國戰", "君臨天下"];

const modeCards = [
  {
    key: "war" as const,
    title: "國戰",
    icon: "/images/home/icon/flag.png",
    eyebrow: "受命於天・君臨天下",
    meta: "雙將・勢力推演・8人對戰",
    className: "war",
    playerOptions: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },
  {
    key: "identity" as const,
    title: "身分局",
    icon: "/images/home/icon/crowne.png",
    eyebrow: "主公・忠臣・反賊・內奸",
    meta: "經典身份・5-8人對戰",
    className: "identity",
    playerOptions: [5, 6, 7, 8, 9, 10],
  },
];

const libraryCards = [
  {
    href: "/generals",
    title: "武將圖鑑",
    mark: "將",
    count: "188+ 位武將",
    meta: "技能・勢力・稱號・皮膚",
    className: "generals",
  },
  {
    href: "/cards",
    title: "卡牌資料庫",
    mark: "牌",
    count: "全卡牌庫",
    meta: "基本牌・錦囊牌・裝備牌",
    className: "cards",
  },
];

const toolCards = [
  { href: "/faq", title: "FAQ", subtitle: "規則解答・常見問題", icon: "/images/home/icon/faq-transparent.png", className: "faq-tool" },
  { href: "/changelog", title: "更新日誌", subtitle: "版本更新・功能紀錄", icon: "/images/home/icon/updat4e journal.png", className: "changelog-tool" },
];

const menuItems = [
  { href: "/", label: "首頁" },
  { href: "/generals", label: "武將圖鑑" },
  { href: "/cards", label: "卡牌資料庫" },
  { href: "/faq", label: "FAQ" },
  { href: "/changelog", label: "更新日誌" },
];

const updates = [
  {
    name: "文鴦",
    id: "gz_smyt_jin042_wenyang",
    faction: "晉",
    mode: "國戰",
    date: "2026/05/28",
    image: "/images/generals/国战UI.JIN042.陆拔山岳.文鸯.png",
  },
  {
    name: "張魯",
    id: "gz_smyt_qun_wei048_zhanglu",
    faction: "群",
    mode: "國戰",
    date: "2026/05/27",
    image: "/images/generals/国战UI.QUN%26WEI048.政宽教惠.张鲁.png",
  },
  {
    name: "夏侯霸",
    id: "gz_smyt_shu_wei041_xiahouba",
    faction: "蜀",
    mode: "國戰",
    date: "2026/05/25",
    image: "/images/generals/国战UI.SHU%26WEI041.棘途壮志.夏侯霸.png",
  },
  {
    name: "羊祜",
    id: "gz_smyt_jin022_yanghu",
    faction: "晉",
    mode: "國戰",
    date: "2026/05/24",
    image: "/images/generals/国战UI.JIN022.执德清劭.羊祜.png",
  },
  {
    name: "陸郁生",
    id: "gz_smyt_wu078_luyusheng",
    faction: "吳",
    mode: "國戰",
    date: "2026/05/23",
    image: "/images/generals/国战UI.WU078.义姑.陆郁生.png",
  },
];

const stats = [
  { label: "武將數", value: "156", icon: "/images/home/icon/武將數-cropped.png" },
  { label: "卡牌數", value: "0", icon: "/images/home/icon/卡牌數-cropped.png" },
  { label: "支援模式", value: "國戰 / 身分局", icon: "/images/home/icon/支援模式-cropped.png" },
  { label: "版本", value: "v1.0", icon: "/images/home/icon/版本-cropped.png" },
];

function makeRoomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default function Home() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [setupMode, setSetupMode] = useState<ModeKey | null>(null);
  const [nationalPlayers, setNationalPlayers] = useState(8);
  const [identityPlayers, setIdentityPlayers] = useState(8);
  const [nationalVersion, setNationalVersion] = useState(nationalVersions[0]);
  const [selectedGeneral, setSelectedGeneral] = useState<General | null>(null);
  const setupRef = useRef<HTMLElement | null>(null);

  const selectedMode = modeCards.find((mode) => mode.key === setupMode);

  useEffect(() => {
    if (!selectedMode) return;
    window.requestAnimationFrame(() => {
      setupRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [selectedMode]);

  function createRoom() {
    if (!setupMode) return;

    const params = new URLSearchParams({
      mode: setupMode,
      players: String(setupMode === "war" ? nationalPlayers : identityPlayers),
    });

    if (setupMode === "war") {
      params.set("version", nationalVersion);
    }

    router.push(`/s/${makeRoomCode()}?${params.toString()}`);
  }

  function openRecentGeneral(id: string) {
    const general = generals.find((item) => item.id === id);
    if (general) {
      setSelectedGeneral(general);
    }
  }

  return (
    <main className="home-screen">
      <div className="home-backdrop" aria-hidden="true" />
      <span className="ember ember-one" aria-hidden="true" />
      <span className="ember ember-two" aria-hidden="true" />
      <span className="ember ember-three" aria-hidden="true" />

      <header className="home-topbar">
        <button
          className="icon-button"
          type="button"
          aria-label="選單"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Menu size={31} strokeWidth={2.5} />
        </button>

        {menuOpen && (
          <nav className="home-menu" aria-label="主選單">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <section className="hero-lockup" aria-label="三國殺 Companion">
        <img className="hero-logo" src="/images/home/logo-transparent.png" alt="三國殺 Companion" />
        <p className="hero-nav">國戰・身分局・武將圖鑑・卡牌資料庫</p>
      </section>

      <section className="mode-grid" aria-label="主要模式">
        {modeCards.map((card) => {
          return (
            <article
              key={card.key}
              className={`mode-card ${card.className}`}
              role="button"
              tabIndex={0}
              onClick={() => setSetupMode(card.key)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSetupMode(card.key);
                }
              }}
            >
              <div className="card-corners" aria-hidden="true">
                <span className="corner corner-tl" />
                <span className="corner corner-tr" />
                <span className="corner corner-bl" />
                <span className="corner corner-br" />
              </div>
              <div className="mode-icon">
                <img className="mode-emblem" src={card.icon} alt="" aria-hidden="true" />
              </div>
              <h2>{card.title}</h2>
              <p>{card.eyebrow}</p>
              <small>{card.meta}</small>
              <button type="button" onClick={() => setSetupMode(card.key)} className="mode-action">
                進入模式
                <ChevronRight size={24} strokeWidth={2.4} />
              </button>
            </article>
          );
        })}
      </section>

      {selectedMode && (
        <section ref={setupRef} className={`setup-panel ${selectedMode.className}`} aria-label={`${selectedMode.title}設定`}>
          <button type="button" className="setup-back" onClick={() => setSetupMode(null)}>
            <ChevronLeft size={18} />
            返回模式
          </button>
          <h2>{selectedMode.title}設定</h2>

          <label className="setup-field">
            <span>玩家數</span>
            <select
              value={setupMode === "war" ? nationalPlayers : identityPlayers}
              onChange={(event) =>
                setupMode === "war"
                  ? setNationalPlayers(Number(event.target.value))
                  : setIdentityPlayers(Number(event.target.value))
              }
            >
              {selectedMode.playerOptions.map((count) => (
                <option key={count} value={count}>
                  {count} 人
                </option>
              ))}
            </select>
          </label>

          {setupMode === "war" && (
            <label className="setup-field">
              <span>國戰版本</span>
              <select value={nationalVersion} onChange={(event) => setNationalVersion(event.target.value)}>
                {nationalVersions.map((version) => (
                  <option key={version} value={version}>
                    {version}
                  </option>
                ))}
              </select>
            </label>
          )}

          <button type="button" className="setup-create" onClick={createRoom}>
            建立牌局
            <ChevronRight size={22} />
          </button>
        </section>
      )}

      <section className="home-section">
        <div className="section-heading">
          <div>
            <Shield size={22} fill="currentColor" strokeWidth={1.8} />
            <h2>資料庫</h2>
          </div>
        </div>

        <div className="library-grid">
          {libraryCards.map((card) => (
            <Link key={card.title} href={card.href} className={`library-card ${card.className}`}>
              <span className="round-mark">{card.mark}</span>
              <span className="library-content">
                <strong>{card.title}</strong>
                <small>{card.count}</small>
                <em>{card.meta}</em>
              </span>
              <ChevronRight className="tile-arrow" size={24} />
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading">
          <div>
            <Wrench size={22} fill="currentColor" strokeWidth={1.8} />
            <h2>工具</h2>
          </div>
        </div>

        <div className="tool-grid">
          {toolCards.map((card) => {
            return (
              <Link key={card.title} href={card.href} className={`tool-card ${card.className}`}>
                <span className="tool-icon">
                  <img className="filled-emblem" src={card.icon} alt="" aria-hidden="true" />
                </span>
                <span>
                  <strong>{card.title}</strong>
                  <small>{card.subtitle}</small>
                </span>
                <ChevronRight className="tile-arrow" size={24} />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="home-section updates-section" id="updates">
        <div className="section-heading">
          <div>
            <Flame size={22} fill="currentColor" strokeWidth={1.8} />
            <h2>最近更新</h2>
          </div>
          <Link href={`/generals?recent=${updates.map((item) => item.id).join(",")}`}>
            查看全部
            <ChevronRight size={20} />
          </Link>
        </div>

        <div className="update-list">
          {updates.map((item) => (
            <button
              key={`${item.name}-${item.date}`}
              type="button"
              className="update-row"
              onClick={() => openRecentGeneral(item.id)}
            >
              <span className="new-badge">NEW</span>
              <img src={item.image} alt="" aria-hidden="true" />
              <strong>{item.name}</strong>
              <span className="mode-badge">{item.mode}</span>
              <span className={`faction-badge faction-${item.faction}`}>{item.faction}</span>
              <time>{item.date}</time>
              <ChevronRight size={22} />
            </button>
          ))}
        </div>
      </section>

      <section className="stats-panel" aria-label="網站狀態">
        {stats.map((item) => {
          return (
            <div key={item.label} className="stat-item">
              <img className="stat-emblem" src={item.icon} alt="" aria-hidden="true" />
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          );
        })}
      </section>

      {selectedGeneral && (
        <GeneralDetailModal general={selectedGeneral} onClose={() => setSelectedGeneral(null)} />
      )}
    </main>
  );
}
