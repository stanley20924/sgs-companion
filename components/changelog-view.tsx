import Link from "next/link";
import { ChevronLeft } from "lucide-react";

const changelog = [
  {
    version: "v1.1",
    date: "2026/06/14",
    title: "身分局 2026 珍藏版",
    summary: "加入身分局 2026 珍藏版基本武將，並整理卡牌資料庫與首頁入口。",
    sections: [
      {
        heading: "身分局",
        items: ["新增 2026 珍藏版基本武將資料與新 UI 圖片。", "首頁進入身分局時可先選玩家數與身分局版本。", "房間內版本篩選已支援 2026珍藏版。"]
      },
      {
        heading: "資料庫",
        items: ["武將圖鑑數量改由資料自動計算。", "卡牌資料庫擴充到 140 筆，並拆分身份牌與武將牌資料。", "缺圖卡牌統一使用 placeholder 圖。"]
      },
      {
        heading: "首頁",
        items: ["最近更新改為身分局新武將。", "首頁統計同步更新武將數與卡牌數。", "保留最近更新武將直接開啟詳情視窗的流程。"]
      }
    ]
  },
  {
    version: "v1.0",
    date: "2026/06/14",
    title: "受命於天基礎版本",
    summary: "建立 SGS Companion 的基本資料站與國戰牌局入口。",
    sections: [
      {
        heading: "國戰",
        items: ["加入受命於天作為主要國戰版本入口。", "建立國戰設定流程，可先選玩家數與版本再建立房間。", "保留既有房間與即時同步邏輯。"]
      },
      {
        heading: "基本頁面",
        items: ["完成首頁、武將圖鑑、卡牌資料庫、FAQ、更新日誌入口。", "首頁採用暗色三國戰場風格與金色 UI。", "加入全站非官方資料站版權說明。"]
      },
      {
        heading: "資料庫",
        items: ["武將圖鑑加入搜尋、模式、版本與勢力篩選。", "卡牌資料庫建立第一批身分局與國戰卡牌資料。", "FAQ 開始整理容易誤判的規則重點。"]
      }
    ]
  }
];

export default function ChangelogView() {
  return (
    <main className="changelog-page">
      <div className="generals-backdrop" aria-hidden="true" />
      <div className="generals-shell changelog-shell">
        <Link href="/" className="generals-home-link">
          <ChevronLeft size={18} />
          首頁
        </Link>

        <section className="generals-hero changelog-hero">
          <span className="generals-kicker">版本記錄</span>
          <h1>更新日誌</h1>
          <p>記錄 SGS Companion 每次資料、介面與功能更新。之後新增武將、卡牌、FAQ 或牌局功能，都會在這裡留下版本筆記。</p>
        </section>

        <section className="changelog-timeline" aria-label="更新日誌列表">
          {changelog.map((entry) => (
            <article key={entry.version} className="changelog-card">
              <header>
                <div>
                  <span>{entry.version}</span>
                  <h2>{entry.title}</h2>
                </div>
                <time>{entry.date}</time>
              </header>
              <p>{entry.summary}</p>

              <div className="changelog-section-grid">
                {entry.sections.map((section) => (
                  <section key={section.heading}>
                    <h3>{section.heading}</h3>
                    <ul>
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
