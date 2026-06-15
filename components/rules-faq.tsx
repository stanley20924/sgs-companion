"use client";

import Link from "next/link";
import { BookOpen, ChevronLeft, ExternalLink, Search } from "lucide-react";
import { Converter } from "opencc-js";
import { useMemo, useState } from "react";

type FaqMode = "共通" | "身分局" | "國戰";

type FaqItem = {
  id: string;
  mode: FaqMode;
  title: string;
  short: string;
  answer: string[];
  pitfalls: string[];
  source: {
    label: string;
    url: string;
  };
};

const modeFilters: Array<"全部" | FaqMode> = ["全部", "共通", "身分局", "國戰"];
const t2s = Converter({ from: "tw", to: "cn" });

const faqItems: FaqItem[] = [
  {
    id: "chain-elemental-damage",
    mode: "共通",
    title: "鐵索連環遇到火焰 / 雷電傷害怎麼結算？",
    short: "先造成一次屬性傷害，再依序傳導給其他橫置角色。",
    answer: [
      "被橫置的角色處於連環狀態。當其中一名連環角色受到火焰或雷電這類屬性傷害時，傷害會依次傳導給其他橫置角色。",
      "傳導的是同一次屬性傷害的後續結算，不是重新使用一張牌。傳導後，相關角色會重置武將牌，離開連環狀態。",
      "普通殺、決鬥、南蠻入侵這類普通傷害不會因鐵索連環傳導；火殺、雷殺、閃電、火攻等屬性傷害才是容易出事的部分。"
    ],
    pitfalls: [
      "不要把鐵索連環理解成增加傷害，它是讓屬性傷害傳導。",
      "傳導傷害的來源通常看本次傳導的起點，會影響部分武將技能判斷。",
      "已經重置、不再橫置的角色不會繼續被當成連環狀態。"
    ],
    source: {
      label: "BWIKI：鐵索連環",
      url: "https://wiki.biligame.com/sgs/%E9%93%81%E7%B4%A2%E8%BF%9E%E7%8E%AF"
    }
  },
  {
    id: "lightning-chain",
    mode: "共通",
    title: "閃電命中後，鐵索連環會不會傳導？",
    short: "會。閃電造成雷電傷害，雷電是屬性傷害。",
    answer: [
      "閃電判定命中時，當前回合角色受到雷電傷害。若該角色處於連環狀態，這個雷電傷害可以透過鐵索連環傳導。",
      "傳導時不是每個人都重新判定閃電，而是同一次雷電傷害往其他連環角色結算。",
      "若第一名受傷角色因防止傷害、免疫或其他技能導致傷害沒有實際造成，是否繼續傳導要依該技能與當前規則結算。"
    ],
    pitfalls: [
      "不是每個被傳導的人都受到閃電牌本身的效果，而是受到雷電傳導傷害。",
      "閃電未命中時，只會移動到下一名角色判定區，不會造成傷害，也不會觸發連環傳導。"
    ],
    source: {
      label: "BWIKI：閃電",
      url: "https://wiki.biligame.com/sgs/%E9%97%AA%E7%94%B5"
    }
  },
  {
    id: "fire-attack-chain",
    mode: "共通",
    title: "火攻、火殺造成傷害時會觸發連環嗎？",
    short: "會，只要實際造成火焰傷害，連環狀態就要檢查。",
    answer: [
      "火殺與火攻造成的是火焰傷害。只要傷害成功造成，且受傷角色處於連環狀態，就可能觸發鐵索連環傳導。",
      "酒火殺造成的火焰傷害若傷害值增加，傳導時通常也按該次火焰傷害結算。",
      "藤甲、白銀獅子、技能防止傷害等效果會影響最後實際受到的傷害，需要先按傷害流程處理。"
    ],
    pitfalls: [
      "火焰傷害不是只看牌名，要看最後造成的傷害屬性。",
      "被無懈可擊抵消的火攻不會進入造成傷害這一步。"
    ],
    source: {
      label: "官方規則集 3.0：傷害事件流程",
      url: "https://gltjk.com/sanguosha/rules/info/index.html"
    }
  },
  {
    id: "guozhan-array-siege",
    mode: "國戰",
    title: "國戰的陣列、隊列、圍攻到底在看什麼？",
    short: "主要看座次相鄰、勢力狀態與是否形成特定位置關係。",
    answer: [
      "國戰有些牌或技能會提到隊列、圍攻、同勢力或不同勢力。判斷時先看角色是否明置、勢力是否確定，再看座次位置。",
      "同隊列通常與連續相鄰的同勢力角色有關；圍攻則常見於兩側或位置關係夾住目標的判定。",
      "如果有人暗置、未確定勢力、被調虎離山暫時不計入座次，陣列判定可能會改變。"
    ],
    pitfalls: [
      "不要只看玩家實際坐哪裡，還要看是否被規則暫時排除在距離與座次計算外。",
      "暗置武將不一定能直接算作某勢力，先確認是否已明置或確定勢力。"
    ],
    source: {
      label: "官方規則集 3.0：國戰資料",
      url: "https://gltjk.com/sanguosha/rules/info/guo.html"
    }
  },
  {
    id: "guozhan-diaohu",
    mode: "國戰",
    title: "調虎離山為什麼會影響陣列 / 距離？",
    short: "被調虎離山的角色本回合不計入距離與座次計算。",
    answer: [
      "調虎離山會讓目標在本回合內暫時不計入距離與座次計算，並限制其使用牌、打出牌或發動技能。",
      "這會直接影響順手牽羊距離、圍攻、隊列、火燒連營等需要看位置關係的判斷。",
      "它不是移動角色座位，而是本回合結算時把該角色暫時從相關計算中排除。"
    ],
    pitfalls: [
      "不要把它當成翻面或跳過回合，它是本回合內的特殊排除效果。",
      "被排除座次後，相鄰關係可能重新接起來。"
    ],
    source: {
      label: "官方勢備篇資料",
      url: "https://www.sanguosha.com/news/20170719_5639_4109"
    }
  },
  {
    id: "guozhan-chiling",
    mode: "國戰",
    title: "敕令什麼時候最容易搞錯？",
    short: "重點是未確定勢力角色要在明置與失去體力之間選擇。",
    answer: [
      "敕令主要針對未確定勢力的角色。結算時，目標通常要選擇明置一張武將牌並摸牌，或失去體力。",
      "這張牌常用來逼暗將表態，也可能讓對手為了藏勢力付出體力。",
      "若角色已經確定勢力，是否仍為合法目標要依當前牌文與國戰規則判斷。"
    ],
    pitfalls: [
      "不要把敕令當成直接翻開對方武將，目標通常有選擇。",
      "未確定勢力與暗置武將相關，但不是完全同一件事。"
    ],
    source: {
      label: "官方勢備篇資料",
      url: "https://www.sanguosha.com/news/20170719_5639_4109"
    }
  },
  {
    id: "identity-victory",
    mode: "身分局",
    title: "身分局勝利條件怎麼快速判斷？",
    short: "主忠一隊、反賊一隊，內奸通常要最後單挑主公。",
    answer: [
      "主公與忠臣目標一致：主公存活，反賊與內奸全部出局。",
      "反賊目標是擊敗主公。只要主公死亡，通常反賊達成勝利。",
      "內奸通常需要先讓其他角色出局，最後擊敗主公。實際細節以使用版本規則為準。"
    ],
    pitfalls: [
      "忠臣死光不代表主公輸，主公是否死亡與敵方是否清空才是核心。",
      "內奸不能只把主公打死就贏，通常需要滿足最後局面條件。"
    ],
    source: {
      label: "三國殺條目：身份模式",
      url: "https://zh.wikipedia.org/wiki/%E4%B8%89%E5%9B%BD%E6%9D%80"
    }
  },
  {
    id: "delayed-tricks",
    mode: "身分局",
    title: "樂不思蜀、兵糧寸斷、閃電的順序怎麼看？",
    short: "都在判定區，依判定階段與判定區牌的結算順序處理。",
    answer: [
      "延時錦囊會放在判定區，在角色的判定階段依規則順序結算。",
      "樂不思蜀影響出牌階段；兵糧寸斷影響摸牌階段；閃電命中時造成雷電傷害。",
      "若同時有多張判定牌，順序、改判、無懈可擊與技能都可能改變結果。"
    ],
    pitfalls: [
      "樂不思蜀不是跳過整個回合，只是影響出牌階段。",
      "兵糧寸斷不是不能出牌，而是影響摸牌階段。",
      "閃電不是錦囊傷害，而是雷電傷害，會牽動連環。"
    ],
    source: {
      label: "官方規則集 3.0：判定事件流程",
      url: "https://gltjk.com/sanguosha/rules/info/index.html"
    }
  }
];

function normalize(value: string) {
  return t2s(value.toLowerCase().replace(/\s+/g, ""));
}

export default function RulesFaq() {
  const [selectedMode, setSelectedMode] = useState<(typeof modeFilters)[number]>("全部");
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => {
    const keyword = normalize(query);

    return faqItems.filter((item) => {
      const matchesMode = selectedMode === "全部" || item.mode === selectedMode;
      const searchable = normalize(
        [item.title, item.short, item.mode, ...item.answer, ...item.pitfalls].join(" ")
      );
      return matchesMode && (!keyword || searchable.includes(keyword));
    });
  }, [query, selectedMode]);

  return (
    <main className="faq-page">
      <div className="generals-backdrop" aria-hidden="true" />
      <div className="generals-shell faq-shell">
        <Link href="/" className="generals-home-link">
          <ChevronLeft size={18} />
          首頁
        </Link>

        <section className="generals-hero faq-hero">
          <span className="generals-kicker">規則檢查</span>
          <h1>FAQ</h1>
          <p>整理身分局與國戰常見誤判，特別是陣列、鐵索連環、閃電與屬性傷害這類牌局中最容易吵起來的結算。</p>
        </section>

        <section className="generals-toolbar faq-toolbar" aria-label="FAQ 搜尋與篩選">
          <label className="generals-search">
            <Search size={20} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜尋鐵索、閃電、陣列、勝利條件..."
            />
          </label>

          <div className="generals-filter-row">
            <span>模式</span>
            {modeFilters.map((mode) => (
              <button
                key={mode}
                type="button"
                className={`filter-chip ${selectedMode === mode ? "active" : ""}`}
                onClick={() => setSelectedMode(mode)}
              >
                {mode}
              </button>
            ))}
          </div>

          <p className="generals-count">共 {filteredItems.length} 則規則筆記</p>
        </section>

        <section className="faq-list" aria-label="FAQ 列表">
          {filteredItems.map((item) => (
            <article key={item.id} className="faq-card">
              <header>
                <span>{item.mode}</span>
                <h2>{item.title}</h2>
                <p>{item.short}</p>
              </header>

              <div className="faq-card-body">
                <section>
                  <h3>怎麼判斷</h3>
                  {item.answer.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </section>

                <section>
                  <h3>常見誤會</h3>
                  <ul>
                    {item.pitfalls.map((pitfall) => (
                      <li key={pitfall}>{pitfall}</li>
                    ))}
                  </ul>
                </section>
              </div>

              <a className="faq-source" href={item.source.url} target="_blank" rel="noreferrer">
                <BookOpen size={16} />
                {item.source.label}
                <ExternalLink size={14} />
              </a>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
