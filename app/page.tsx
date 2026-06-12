"use client";

import {
  Bell,
  BookOpen,
  ChevronRight,
  Crown,
  Flame,
  Flag,
  Menu,
  ScrollText,
  Shield,
  UsersRound,
  Wrench,
} from "lucide-react";
import { useRouter } from "next/navigation";

type ModeKey = "war" | "identity";

const modeCards = [
  {
    key: "war" as const,
    title: "國戰",
    icon: Flag,
    eyebrow: "受命於天・君臨天下",
    meta: "雙將・勢力推演・8人對戰",
    className: "war",
  },
  {
    key: "identity" as const,
    title: "身分局",
    icon: Crown,
    eyebrow: "主公・忠臣・反賊・內奸",
    meta: "經典身份・5-8人對戰",
    className: "identity",
  },
];

const libraryCards = [
  {
    title: "武將圖鑑",
    mark: "將",
    count: "188+ 位武將",
    meta: "技能・勢力・稱號・皮膚",
    image: "/images/generals/国战UI.SHU002.曜武宣威.关羽.png",
    className: "generals",
  },
  {
    title: "卡牌資料庫",
    mark: "牌",
    count: "全卡牌庫",
    meta: "基本牌・錦囊牌・裝備牌",
    className: "cards",
  },
];

const toolCards = [
  { title: "FAQ", subtitle: "規則解答・常見問題", icon: BookOpen },
  { title: "更新日誌", subtitle: "版本更新・功能紀錄", icon: ScrollText },
];

const updates = [
  {
    name: "文鴦",
    faction: "晉",
    mode: "國戰",
    date: "2024/05/28",
    image: "/images/generals/国战UI.JIN042.陆拔山岳.文鸯.png",
  },
  {
    name: "張魯",
    faction: "群",
    mode: "國戰",
    date: "2024/05/27",
    image: "/images/generals/国战UI.QUN%26WEI048.政宽教惠.张鲁.png",
  },
  {
    name: "夏侯霸",
    faction: "蜀",
    mode: "國戰",
    date: "2024/05/25",
    image: "/images/generals/国战UI.SHU%26WEI041.棘途壮志.夏侯霸.png",
  },
  {
    name: "羊祜",
    faction: "晉",
    mode: "國戰",
    date: "2024/05/24",
    image: "/images/generals/国战UI.JIN022.执德清劭.羊祜.png",
  },
  {
    name: "陸郁生",
    faction: "吳",
    mode: "國戰",
    date: "2024/05/23",
    image: "/images/generals/国战UI.WU078.义姑.陆郁生.png",
  },
];

const stats = [
  { label: "武將數", value: "188+", icon: Shield },
  { label: "卡牌數", value: "XXX+", icon: BookOpen },
  { label: "支援模式", value: "國戰 / 身分局", icon: UsersRound },
  { label: "版本", value: "v0.8.0", icon: Crown },
];

function makeRoomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default function Home() {
  const router = useRouter();

  function enterMode(mode: ModeKey) {
    router.push(`/s/${makeRoomCode()}?mode=${mode}`);
  }

  return (
    <main className="home-screen">
      <div className="home-backdrop" aria-hidden="true" />
      <span className="ember ember-one" aria-hidden="true" />
      <span className="ember ember-two" aria-hidden="true" />
      <span className="ember ember-three" aria-hidden="true" />

      <header className="home-topbar">
        <button className="icon-button" type="button" aria-label="開啟選單">
          <Menu size={25} strokeWidth={2.4} />
        </button>
        <button className="bell-button" type="button" aria-label="通知">
          <Bell size={24} strokeWidth={2.1} />
          <span />
        </button>
      </header>

      <section className="hero-lockup" aria-label="三國殺 Companion">
        <h1>三國殺</h1>
        <div className="hero-subtitle">
          <span />
          <strong>COMPANION</strong>
          <span />
        </div>
        <p className="hero-nav">國戰・身分局・武將圖鑑・卡牌資料庫</p>
        <p className="hero-copy">桌上少一台電腦，每人一支手機就能查號將、查牌、記錄牌局。</p>
      </section>

      <section className="mode-grid" aria-label="主要模式">
        {modeCards.map((card) => {
          const Icon = card.icon;

          return (
            <article key={card.key} className={`mode-card ${card.className}`}>
              <div className="card-corners" aria-hidden="true" />
              <div className="mode-icon">
                <Icon size={42} fill="currentColor" strokeWidth={1.4} />
              </div>
              <h2>{card.title}</h2>
              <p>{card.eyebrow}</p>
              <small>{card.meta}</small>
              <button type="button" onClick={() => enterMode(card.key)} className="mode-action">
                進入模式
                <ChevronRight size={22} strokeWidth={2.4} />
              </button>
            </article>
          );
        })}
      </section>

      <section className="home-section">
        <div className="section-heading">
          <div>
            <Shield size={20} fill="currentColor" strokeWidth={1.8} />
            <h2>資料庫</h2>
          </div>
          <button type="button">
            更多
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="library-grid">
          {libraryCards.map((card) => (
            <button key={card.title} type="button" className={`library-card ${card.className}`}>
              <span className="round-mark">{card.mark}</span>
              <span className="library-content">
                <strong>{card.title}</strong>
                <small>{card.count}</small>
                <em>{card.meta}</em>
              </span>
              {card.image && <img src={card.image} alt="" aria-hidden="true" />}
              <ChevronRight className="tile-arrow" size={22} />
            </button>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading">
          <div>
            <Wrench size={20} fill="currentColor" strokeWidth={1.8} />
            <h2>工具</h2>
          </div>
        </div>

        <div className="tool-grid">
          {toolCards.map((card) => {
            const Icon = card.icon;

            return (
              <button key={card.title} type="button" className="tool-card">
                <span className="tool-icon">
                  <Icon size={29} strokeWidth={1.7} />
                </span>
                <span>
                  <strong>{card.title}</strong>
                  <small>{card.subtitle}</small>
                </span>
                <ChevronRight className="tile-arrow" size={22} />
              </button>
            );
          })}
        </div>
      </section>

      <section className="home-section updates-section" id="updates">
        <div className="section-heading">
          <div>
            <Flame size={20} fill="currentColor" strokeWidth={1.8} />
            <h2>最近更新</h2>
          </div>
          <button type="button">
            查看全部
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="update-list">
          {updates.map((item) => (
            <button key={`${item.name}-${item.date}`} type="button" className="update-row">
              <span className="new-badge">NEW</span>
              <img src={item.image} alt="" aria-hidden="true" />
              <strong>{item.name}</strong>
              <span className={`faction-badge faction-${item.faction}`}>{item.faction}</span>
              <span className="mode-badge">{item.mode}</span>
              <time>{item.date}</time>
              <ChevronRight size={21} />
            </button>
          ))}
        </div>
      </section>

      <section className="stats-panel" aria-label="網站狀態">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="stat-item">
              <Icon size={33} strokeWidth={1.5} />
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          );
        })}
      </section>
    </main>
  );
}
