"use client";

import { BookOpen, ExternalLink, Search } from "lucide-react";
import { Converter } from "opencc-js";
import { useMemo, useState } from "react";
import SiteNav from "./site-nav";

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
  },
  {
    id: "vine-armor-fire-chain",
    mode: "共通",
    title: "藤甲遇到火殺、火攻、鐵索連環時怎麼算？",
    short: "藤甲怕火。只要最後受到的是火焰傷害，就要檢查藤甲與連環傳導。",
    answer: [
      "藤甲常見效果是防止普通【殺】、【南蠻入侵】、【萬箭齊發】造成的傷害，但受到火焰傷害時通常會令傷害增加。",
      "若角色處於連環狀態並受到火焰傷害，先按傷害流程計算實際傷害，再檢查連環傳導。被傳導的仍是火焰傷害。",
      "火殺、火攻、朱雀羽扇轉化後的火焰殺，都可能讓藤甲與鐵索連環同時變得很危險。"
    ],
    pitfalls: [
      "藤甲不是免疫所有傷害；它最怕火焰傷害。",
      "普通殺不會因鐵索連環傳導，火殺才會。",
      "若火焰傷害被防止，通常就沒有實際傷害可傳導。"
    ],
    source: {
      label: "GLTJK：裝備牌規則",
      url: "https://gltjk.com/sanguosha/rules/card/equipment.html"
    }
  },
  {
    id: "wine-elemental-slash",
    mode: "共通",
    title: "酒殺如果是火殺或雷殺，連環會傳幾點？",
    short: "先算這次殺實際造成幾點屬性傷害，再處理連環傳導。",
    answer: [
      "【酒】常見用途是令本回合下一張【殺】造成的傷害增加。若下一張是火殺或雷殺，增加後的傷害仍保留火焰或雷電屬性。",
      "若該屬性殺成功造成傷害，且受傷角色處於連環狀態，就會進入鐵索連環的傳導檢查。",
      "例如酒火殺造成2點火焰傷害，若沒有其他防止或減傷效果，傳導時通常也會以這次火焰傷害的結果去處理。"
    ],
    pitfalls: [
      "酒不是讓所有後續傷害都+1，通常只影響下一張符合條件的殺。",
      "如果殺被閃避或傷害被防止，就不會因為酒而憑空產生傳導。",
      "白銀獅子、藤甲、技能增減傷會讓最後數字改變，先算完實際傷害再看傳導。"
    ],
    source: {
      label: "GLTJK：基本牌規則",
      url: "https://gltjk.com/sanguosha/rules/card/basic.html"
    }
  },
  {
    id: "fire-attack-step-by-step",
    mode: "共通",
    title: "火攻是不是一定會造成火焰傷害？",
    short: "不是。要先展示手牌，使用者棄同花色牌後才會造成火焰傷害。",
    answer: [
      "火攻的目標通常需要有手牌。結算時目標展示一張手牌。",
      "使用火攻者可以棄置一張與展示牌同花色的手牌；若這樣做，才對目標造成1點火焰傷害。",
      "若沒有棄同花色牌，火攻不造成傷害，也就不會觸發鐵索連環傳導。"
    ],
    pitfalls: [
      "火攻被無懈可擊抵消時，不會進入展示與造成傷害的流程。",
      "展示牌的花色只決定你要不要/能不能棄同花色牌，不代表直接受傷。",
      "火攻造成的是火焰傷害，所以真的造成傷害時會牽涉藤甲與連環。"
    ],
    source: {
      label: "GLTJK：錦囊牌規則",
      url: "https://gltjk.com/sanguosha/rules/card/scroll.html"
    }
  },
  {
    id: "silver-lion-damage",
    mode: "共通",
    title: "白銀獅子遇到酒殺、閃電、連環時怎麼處理？",
    short: "它通常把大於1點的單次傷害防止到只受1點，然後失去裝備時可回血。",
    answer: [
      "白銀獅子的重點是單次傷害大於1點時，防止多餘的傷害，通常最後只受到1點。",
      "酒殺、閃電、連環傳導如果讓某名角色將受到大於1點的傷害，要檢查白銀獅子的減傷效果。",
      "白銀獅子離開裝備區後，通常會令裝備者回復1點體力。"
    ],
    pitfalls: [
      "白銀獅子不是防止所有傷害；1點傷害通常照常受到。",
      "每名角色受到的傷害事件分別檢查，不是全場共用一次白銀獅子。",
      "先處理裝備是否仍在裝備區，再判斷失去裝備後的回血。"
    ],
    source: {
      label: "GLTJK：裝備牌規則",
      url: "https://gltjk.com/sanguosha/rules/card/equipment.html"
    }
  },
  {
    id: "nullification-single-target",
    mode: "共通",
    title: "無懈可擊是抵消整張錦囊，還是只抵消一個人？",
    short: "常見判斷是抵消錦囊牌對一名角色產生的效果，群體錦囊要特別看目標。",
    answer: [
      "無懈可擊的核心是讓一張錦囊牌對一名角色的效果無效。",
      "對單一目標錦囊時，看起來就像整張被抵消；但對群體錦囊時，常常只是其中一名角色不受該次效果。",
      "如果連續有人使用無懈可擊，依照後發先至與當前規則處理抵消關係。"
    ],
    pitfalls: [
      "不要看到南蠻入侵、萬箭齊發就直接說一張無懈保全場。",
      "延時錦囊與普通錦囊的使用時機不同，先確認正在抵消哪個效果。",
      "國戰裡涉及勢力、目標合法性時，也要先看錦囊是否真的對該角色生效。"
    ],
    source: {
      label: "GLTJK：錦囊牌規則",
      url: "https://gltjk.com/sanguosha/rules/card/scroll.html"
    }
  },
  {
    id: "drowning-seven-armies",
    mode: "身分局",
    title: "水淹七軍容易搞錯在哪裡？",
    short: "它不是普通傷害牌，通常會牽涉裝備區、棄牌或傷害選項，需看版本牌文。",
    answer: [
      "水淹七軍屬於需要獨立看牌文的錦囊。不同版本可能在目標、棄置裝備、受到傷害或結算細節上有差異。",
      "實戰判斷時先看合法目標，再看目標是否有裝備、是否需要選擇棄置裝備或承受傷害。",
      "若最後造成的是傷害，再進一步檢查是否有防止、減傷、連環或技能觸發。"
    ],
    pitfalls: [
      "不要把水淹七軍直接當成南蠻/萬箭類全體傷害。",
      "如果版本牌文不同，以當局使用的卡牌文字為準。",
      "我們卡牌資料庫補齊此牌後，FAQ 會再和牌文做一次對照。"
    ],
    source: {
      label: "BWIKI：三國殺卡牌資料",
      url: "https://wiki.biligame.com/sgs/"
    }
  },
  {
    id: "damage-vs-hp-loss",
    mode: "共通",
    title: "造成傷害、受到傷害、失去體力是一樣的嗎？",
    short: "不一樣。很多技能只看傷害，不看失去體力。",
    answer: [
      "造成傷害通常有來源，會觸發「造成傷害後」「受到傷害後」這類技能。",
      "失去體力不是傷害，通常不會觸發受到傷害、傷害來源、鐵索連環傳導等結算。",
      "例如某些牌或技能寫的是「失去1點體力」，就不要拿它去觸發藤甲、白銀獅子或連環傳導。"
    ],
    pitfalls: [
      "扣體力不一定是傷害。",
      "沒有傷害來源時，很多反擊或拿牌技能不會觸發。",
      "火焰/雷電屬性只存在於傷害，不存在於單純失去體力。"
    ],
    source: {
      label: "GLTJK：規則流程",
      url: "https://gltjk.com/sanguosha/rules/info/index.html"
    }
  },
  {
    id: "distance-vs-range",
    mode: "共通",
    title: "距離和攻擊範圍差在哪？",
    short: "距離是角色之間的計算；攻擊範圍主要決定你能不能用殺打到人。",
    answer: [
      "距離會被座次、坐騎、技能與特殊效果影響。順手牽羊、部分技能會看距離。",
      "攻擊範圍通常由武器與技能決定，最常用來判斷你使用【殺】能否指定目標。",
      "你計算到別人的距離，和別人計算到你的距離，可能因為坐騎或技能而不同。"
    ],
    pitfalls: [
      "+1馬不是讓你打更遠，是讓別人算到你更遠。",
      "-1馬是讓你算到別人更近，不是直接增加武器攻擊範圍。",
      "國戰調虎離山會讓座次/距離計算暫時改變，要先處理特殊效果。"
    ],
    source: {
      label: "GLTJK：規則流程",
      url: "https://gltjk.com/sanguosha/rules/info/index.html"
    }
  },
  {
    id: "dying-peach-wine",
    mode: "身分局",
    title: "瀕死時桃和酒怎麼用？",
    short: "桃可以救自己或別人；酒通常只能在自己瀕死時自救。",
    answer: [
      "角色體力值降到0或更低時進入瀕死狀態，按當前回合與座次順序詢問是否使用救援牌。",
      "【桃】通常可令瀕死角色回復1點體力，其他角色也可以對瀕死角色使用。",
      "【酒】的瀕死用法通常是自己瀕死時自救回復1點體力，不等同於對別人使用桃。"
    ],
    pitfalls: [
      "出牌階段喝酒加殺傷害，和瀕死時用酒自救，是兩種用法。",
      "瀕死要救到體力至少回到1，才會離開瀕死狀態。",
      "某些技能會改變救援方式，以牌面為準。"
    ],
    source: {
      label: "GLTJK：基本牌規則",
      url: "https://gltjk.com/sanguosha/rules/card/basic.html"
    }
  },
  {
    id: "judgment-replace",
    mode: "共通",
    title: "改判是改哪一張牌？司馬懿、張角這類怎麼排？",
    short: "先產生判定牌，再依可改判技能與回應順序處理，最後才看最終判定結果。",
    answer: [
      "判定不是直接翻完就結束。翻出判定牌後，若有改判技能或效果，會在判定牌生效前介入。",
      "多個角色都能改判時，依當前規則的回應順序處理；後改的牌可能覆蓋前一次結果。",
      "最後留在判定區作為判定牌的那張，才是樂不思蜀、閃電、八卦陣等效果檢查的結果。"
    ],
    pitfalls: [
      "不要在第一張判定牌翻出來時就立刻宣布結果。",
      "天妒、鬼才、鬼道等技能的時機不同，要看牌面寫的是判定前、判定牌生效後或判定結果後。",
      "判定牌被替換後，原本那張牌通常依改判效果進入相應區域。"
    ],
    source: {
      label: "GLTJK：規則流程",
      url: "https://gltjk.com/sanguosha/rules/info/index.html"
    }
  },
  {
    id: "lose-equipment-vs-discard",
    mode: "共通",
    title: "失去裝備、棄置裝備、被拿走裝備有差嗎？",
    short: "有些技能只要求失去裝備，有些要求棄置；文字不同會影響觸發。",
    answer: [
      "棄置裝備是失去裝備的一種，但失去裝備不一定都是棄置，也可能是被獲得、移動或替換。",
      "例如白銀獅子常看的是離開裝備區後回血；有些技能則明確要求棄置裝備才觸發。",
      "判斷時先看裝備是如何離開裝備區，再看技能文字要求的是「失去」「棄置」還是「被棄置」。"
    ],
    pitfalls: [
      "被順手牽羊拿走不等於被棄置，但仍可能算失去裝備。",
      "替換裝備時，原裝備離開裝備區，也可能觸發失去裝備相關效果。",
      "裝備牌進入棄牌堆、手牌或其他角色區域，對不同技能意義不同。"
    ],
    source: {
      label: "GLTJK：裝備牌規則",
      url: "https://gltjk.com/sanguosha/rules/card/equipment.html"
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
        <SiteNav currentLabel="FAQ" />

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
