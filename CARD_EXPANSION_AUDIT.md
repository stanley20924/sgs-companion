# Card Expansion Audit

Generated: 2026-07-05

Scope: identify missing card database coverage before changing `data/cards.json`.

## Current State

- Total card entries: 33
- Current expansions: 標準, 軍爭篇, 國戰, 勢備篇
- Current categories: 基本牌, 錦囊牌, 裝備牌
- Current image sources:
  - BWIKI / QSanguosha for many standard and Junzheng cards.
  - Fandom higher-resolution images for several Guozhan / Shibei cards.
- Missing 2026 珍藏版 card coverage is not yet audited against a trusted list.

## Already Present

### Basic

- 殺, 閃, 桃, 酒, 火殺, 雷殺

### Trick

- 決鬥, 過河拆橋, 順手牽羊, 無中生有, 無懈可擊
- 南蠻入侵, 萬箭齊發, 五穀豐登, 桃園結義, 借刀殺人
- 樂不思蜀, 閃電, 兵糧寸斷, 火攻, 鐵索連環
- 以逸待勞, 遠交近攻, 知己知彼, 敕令, 調虎離山, 火燒連營, 聯軍盛宴

### Equipment

- 諸葛連弩, 八卦陣, 白銀獅子, 太平要術, 玉璽

## Missing / Candidate Cards To Add

### High Priority Equipment

- 藤甲
  - Needed for FAQ interactions with fire damage and chain.
  - Source candidate: GLTJK equipment page / BWIKI.

- 青釭劍
- 雌雄雙股劍
- 青龍偃月刀
- 丈八蛇矛
- 貫石斧
- 方天畫戟
- 麒麟弓
- 寒冰劍
- 仁王盾
- 古錠刀
- 朱雀羽扇
- 木牛流馬
- 驊騮
- 赤兔
- 大宛
- 紫騂
- 絕影
- 的盧
- 爪黃飛電

### High Priority Trick Cards

- 水淹七軍
  - User explicitly noted this is missing.
  - Needs source verification and image candidate.

- 兵臨城下
- 勠力同心
- 聲東擊西
- 增兵減灶
- 草木皆兵
- 棄甲曳兵
- 浮雷

### 2026 珍藏版 Specific

- Need source list first.
- Search target: any 2026 身分珍藏版 deck list, official product images, or card list scans.
- Add only after confirming the card belongs to that version.

### Huang Yueying Special Equipment

- User mentioned 黃月英 special equipment.
- Needs a source/image check before adding because it may be a character-specific token/equipment rather than a normal deck card.
- Approval required before adding.

## Image Audit Rules

- Prefer complete card image, readable text, no severe crop.
- Prefer high resolution over watermark-free if the watermark is small.
- If no reliable image exists, use `/images/cards/placeholder.webp`.
- Do not use low-resolution images if they look worse than current cards.

## Data Rules For Next Pass

Each added card should include:

- `id`
- `name`
- `simplifiedName`
- `modes`
- `category`
- `subtype`
- `expansion`
- `deckCount`
- `timing`
- `target`
- `effect`
- `image`
- `sourceUrl`
- `notes`

## Approval Questions

- Should 2026 珍藏版 cards use a separate expansion label `2026珍藏版`, or merge into `標準 / 軍爭篇` if the card text is identical?
  - Recommended: add `2026珍藏版` only for cards that are visually/version-specific or rule-different.
- For watermarked but high-resolution official-like scans, keep them until better images are found?
  - Recommended: yes.

