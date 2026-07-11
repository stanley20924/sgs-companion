export type SkillGlossaryEntry = {
  name: string;
  summary: string;
  source?: string;
};

export const skillGlossary: Record<string, SkillGlossaryEntry> = {
  仁德: {
    name: "仁德",
    summary: "出牌階段每名角色限一次，你可以將任意張手牌交給一名其他角色，當此階段內你以此法給出第二張牌時，你可以視為使用一張基本牌。",
    source: "取自 SHU001 劉備牌面",
  },
  武聖: {
    name: "武聖",
    summary: "常見關羽技能。通常可將紅色牌當【殺】使用或打出；不同版本可能調整顏色、距離或額外效果。",
  },
  咆哮: {
    name: "咆哮",
    summary: "常見張飛技能。通常代表出牌階段使用【殺】沒有次數限制。",
  },
  觀星: {
    name: "觀星",
    summary: "常見諸葛亮技能。通常在準備階段觀看牌堆頂若干張牌，並可調整置於牌堆頂或牌堆底。",
  },
  空城: {
    name: "空城",
    summary: "常見諸葛亮技能。通常在沒有手牌時，不能成為【殺】或【決鬥】的目標。",
  },
  龍膽: {
    name: "龍膽",
    summary: "常見趙雲技能。通常可將【殺】當【閃】、【閃】當【殺】使用或打出。",
  },
  馬術: {
    name: "馬術",
    summary: "常見馬超/龐德類技能。通常計算與其他角色距離時有利於自己，具體以牌面為準。",
  },
  鐵騎: {
    name: "鐵騎",
    summary: "常見馬超技能。通常在使用【殺】指定目標後進行判定或限制目標使用【閃】。",
  },
  集智: {
    name: "集智",
    summary: "常見黃月英技能。通常在使用非延時錦囊牌時可摸牌。",
  },
  奇才: {
    name: "奇才",
    summary: "常見黃月英技能。通常使用錦囊牌無距離限制；部分版本會改成與裝備或專屬牌互動。",
  },
  烈弓: {
    name: "烈弓",
    summary: "常見黃忠技能。通常在使用【殺】指定目標時，若符合手牌數/體力等條件，目標不能使用【閃】。",
  },
  狂骨: {
    name: "狂骨",
    summary: "常見魏延技能。通常當你對距離較近的角色造成傷害後，可回復體力或摸牌。",
  },
  連環: {
    name: "連環",
    summary: "常見龐統技能。通常可將梅花手牌當【鐵索連環】使用或重鑄。",
  },
  涅槃: {
    name: "涅槃",
    summary: "常見龐統限定技。通常在瀕死時棄置區域內牌、重置狀態並回復體力、摸牌。",
  },
  奸雄: {
    name: "奸雄",
    summary: "常見曹操技能。通常受到傷害後可獲得造成此傷害的牌。",
  },
  反饋: {
    name: "反饋",
    summary: "常見司馬懿技能。通常受到傷害後可獲得傷害來源的一張牌。",
  },
  鬼才: {
    name: "鬼才",
    summary: "常見司馬懿技能。通常可打出手牌代替判定牌。",
  },
  剛烈: {
    name: "剛烈",
    summary: "常見夏侯惇技能。通常受到傷害後可判定，令傷害來源棄牌或受到傷害。",
  },
  突襲: {
    name: "突襲",
    summary: "常見張遼技能。通常摸牌階段可改為獲得其他角色手牌。",
  },
  裸衣: {
    name: "裸衣",
    summary: "常見許褚技能。通常摸牌數減少，之後使用【殺】或【決鬥】造成傷害增加。",
  },
  天妒: {
    name: "天妒",
    summary: "常見郭嘉技能。通常判定牌生效後可獲得該判定牌。",
  },
  遺計: {
    name: "遺計",
    summary: "常見郭嘉技能。通常受到傷害後可摸牌並分配給任意角色。",
  },
  洛神: {
    name: "洛神",
    summary: "常見甄姬技能。通常準備階段可連續判定，黑色判定牌可獲得。",
  },
  傾國: {
    name: "傾國",
    summary: "常見甄姬技能。通常可將黑色手牌當【閃】使用或打出。",
  },
  制衡: {
    name: "制衡",
    summary: "常見孫權技能。通常出牌階段可棄置任意張牌並摸等量牌。",
  },
  奇襲: {
    name: "奇襲",
    summary: "常見甘寧技能。通常可將黑色牌當【過河拆橋】使用。",
  },
  克己: {
    name: "克己",
    summary: "常見呂蒙技能。通常若出牌階段未使用或打出【殺】，可跳過棄牌階段。",
  },
  苦肉: {
    name: "苦肉",
    summary: "常見黃蓋技能。通常出牌階段可失去體力並摸牌。",
  },
  英姿: {
    name: "英姿",
    summary: "常見周瑜技能。通常摸牌階段額外摸牌。",
  },
  反間: {
    name: "反間",
    summary: "常見周瑜技能。通常令其他角色猜花色並獲得你一張牌，猜錯則受到傷害。",
  },
  國色: {
    name: "國色",
    summary: "常見大喬技能。通常可將方塊牌當【樂不思蜀】使用。",
  },
  流離: {
    name: "流離",
    summary: "常見大喬技能。通常可棄牌將指定自己的【殺】轉移給攻擊範圍內另一名角色。",
  },
  謙遜: {
    name: "謙遜",
    summary: "常見陸遜技能。通常不能成為【順手牽羊】或【樂不思蜀】的目標。",
  },
  連營: {
    name: "連營",
    summary: "常見陸遜技能。通常失去最後手牌後可摸牌。",
  },
};

const referencedSkillHints: Record<string, string[]> = {
  gz_smyt_em001_liubei: ["仁德"],
};

export function getSkillNotesForGeneral(generalId: string, explicitSkills: string[] = []) {
  const names = new Set([...(referencedSkillHints[generalId] ?? [])]);
  for (const skillName of explicitSkills) {
    if (skillGlossary[skillName]) names.add(skillName);
  }

  return Array.from(names)
    .map((skillName) => skillGlossary[skillName])
    .filter(Boolean);
}
