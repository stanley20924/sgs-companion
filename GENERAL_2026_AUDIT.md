# 2026 Identity General Audit

Generated: 2026-07-05

Scope: only check 身分局 2026 珍藏版 generals. Guozhan / 受命於天 is excluded because the user already verified it.

## Current State

- 2026 珍藏版 generals in `data/generals.json`: 77
- Image files present for all 77 current entries.
- Skills are currently empty for all 77 entries.
- Duplicate name needing confirmation:
  - 諸葛亮: `identity_2026_shu004`, `identity_2026_shu011`

## Current 2026 Roster In App

### 群: 18

- 华佗, 吕布, 貂蝉, 袁绍, 颜良&文丑, 董卓, 贾诩, 庞德, 左慈, 张角, 于吉, 蔡文姬, 华雄, 袁术, 张绣, 公孙瓒, 许攸, 卢植

### 蜀: 20

- 刘备, 关羽, 张飞, 诸葛亮, 赵云, 马超, 黄月英, 黄忠, 魏延, 庞统, 诸葛亮, 姜维, 刘禅, 孟获, 祝融, 王平, 伊籍, 严颜, 陈到, 诸葛瞻

### 魏: 20

- 曹操, 司马懿, 夏侯惇, 张辽, 许褚, 郭嘉, 甄姬, 夏侯渊, 张郃, 徐晃, 曹仁, 典韦, 荀彧, 曹丕, 邓艾, 曹彰, 王基, 蒯良&蒯越, 郝昭, 毌丘俭

### 吳: 19

- 孙权, 甘宁, 吕蒙, 黄盖, 周瑜, 大乔, 陆逊, 孙尚香, 孙坚, 孙策, 小乔, 太史慈, 周泰, 鲁肃, 张昭&张纮, 陆抗, 陆绩, 孙亮, 周妃

## Skill Audit Plan

For each 2026 general:

1. Find the most likely official / trusted skill text.
2. Check whether the 2026 version differs from standard identity text.
3. Mark confidence:
   - High: official or product scan confirms text.
   - Medium: BWIKI / community source matches visible image text.
   - Low: only older identity version found.
4. Prepare proposed skill entries but do not write them until approved.

## Image Candidate Plan

For missing generals not yet added:

- Find candidate high-resolution image.
- Record source URL and preview size.
- Do not overwrite existing images without approval.
- Do not add a new general unless we can identify:
  - name
  - faction
  - version
  - image
  - skill text or "pending skill"

## Current Blocking Point

I could not find a stable public source list for "2026 珍藏版" as a complete official roster from quick search. The next best path is:

1. Audit current 77 entries for skill text using card-image OCR / individual web lookup.
2. Compare against any additional images you upload.
3. Add missing generals only when a source image or product list confirms them.

## Approval Questions

- Should I fill 2026 skills from the text printed on your existing card images first?
  - Recommended: yes, because those images are the exact version in the app.
- Should duplicate 諸葛亮 be kept as two separate entries?
  - Recommended: keep for now, but label one as standard and one as 臥龍 if the image confirms it.

