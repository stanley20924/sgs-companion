# Guozhan Combo Research Audit

Date: 2026-07-18

Scope:
- Mode: 國戰
- Primary target version: 受命于天 / 受命於天
- Status: research candidates only. Do not add to app data until approved.

Primary sources reviewed:
- 三國殺移動版攻略中心 - 國戰超一流組合盤點
  https://www.sanguosha.cn/pc/guide-info-19.html
- 三國殺移動版攻略中心 - 國戰選將搭配講解
  https://www.sanguosha.cn/pc/guide-info-20.html
- 三國殺移動版攻略中心 - 新手推薦開將順序及講解
  https://www.sanguosha.cn/pc/guide-info-21.html

Source caveat:
- These articles are from 2020 and discuss 新國戰 / mobile app context.
- Before promotion to built-in recommendations, each pair should be checked against our current 受命于天 general pool and card text.
- The source is useful for player-known pairing ideas, not final balance authority.

## Already Covered

These are already in `data/guozhan-combos.json`.

| Combo | App IDs | Source support | Notes |
|---|---|---|---|
| 黃月英 + 遲暮·諸葛亮 | `gz_smyt_shu007_huangyueying` + `gz_smyt_shu004_zhugeliang` | guide-info-19 names it as 大月亮 | Keep, add source after approval |
| 關羽 + 張飛 | `gz_smyt_shu002_guanyu` + `gz_smyt_shu003_zhangfei` | guide-info-19 / guide-info-20 both recommend 關張 | Keep, add source after approval |
| 曹丕 + 甄姬 | `gz_smyt_wei014_caopi` + `gz_smyt_wei007_zhenji` | indirectly common Wei pairing; not the main sourced pair in current audit | Keep as companion curated |

## Recommend Add After Approval

These are clear enough to add after user approval.

| Priority | Combo | App IDs | Faction | Suggested tier | Tags | Why this belongs |
|---|---|---|---|---|---|---|
| High | 鄧艾 + 郭嘉 | `gz_smyt_wei015_dengai` + `gz_smyt_wei006_guojia` | 魏 | A | 賣血, 判定, 防禦, 控制 | guide-info-19 calls this 鄧稼先 / 艾嘉 and explains 屯田 + 天妒 synergy. guide-info-20 also recommends it first in a Wei selection example. |
| High | 甄姬 + 司馬懿 | `gz_smyt_wei007_zhenji` + `gz_smyt_wei002_simayi` | 魏 | A | 判定, 過牌, 防禦 | guide-info-19 calls it 老司機 and explains 洛神 + 鬼才. |
| High | 陸遜 + 孫尚香 | `gz_smyt_wu007_luxun` + `gz_smyt_wu008_sunshangxiang` | 吳 | A | 過牌, 裝備, 防禦 | guide-info-19 calls this 陸香香 and describes it as 東吳超一流. |
| High | 周泰 + 孫策 | `gz_smyt_wu013_zhoutai` + `gz_smyt_wu010_sunce` | 吳 | A | 鏖戰, 續爆, 保核 | guide-info-19 / guide-info-20 both point to 僵尸笨 as a top Wu option. |
| High | 賈詡 + 貂蟬 | `gz_smyt_qun007_jiaxu` + `gz_smyt_qun003_diaochan` | 群 | A | 完殺, 離間, 翻盤 | guide-info-19 calls 完殺蟬 群雄第一超一流. |
| Medium | 曹丕 + 郭嘉 | `gz_smyt_wei014_caopi` + `gz_smyt_wei006_guojia` | 魏 | A- | 賣血, 翻面, 牌差 | guide-info-20 says 太子狗 can be considered after 艾嘉 in a Wei pool. |
| Medium | 貂蟬 + 田豐 | `gz_smyt_qun003_diaochan` + `gz_smyt_qun016_tianfeng` | 群 | A- | 控場, 輸出, 單挑 | guide-info-20 recommends it when treating the game as an isolated / high-pressure 群 pool. |
| Medium | 孔融 + 貂蟬 | `gz_smyt_qun014_kongrong` + `gz_smyt_qun003_diaochan` | 群 | B+ | 攻防輔, 苟活, 離間 | guide-info-20 suggests this as an attack/defense/support option, but notes it needs teammate context. |
| Medium | 孔融 + 田豐 | `gz_smyt_qun014_kongrong` + `gz_smyt_qun016_tianfeng` | 群 | B+ | 嘴哥, 收益, 控場 | guide-info-20 lists it as a stronger/toxic option when conditions are right. |
| Medium | 馬超 + 馬岱 | `gz_smyt_shu006_machao` + `gz_smyt_shu019_madai` | 蜀 | B+ | 珠聯璧合, 菜刀, 壓制 | guide-info-20 mentions 大長腿 / 雙馬兄弟 as a good 珠聯璧合 option. |
| Medium | 周瑜 + 孫策 | `gz_smyt_wu005_zhouyu` + `gz_smyt_wu010_sunce` | 吳 | B+ | 珠聯璧合, 過牌, 輸出 | guide-info-20 says 瑜策 is strong but ranks below 僵尸笨 in that example. |
| Medium | 太史慈 + 孫策 | `gz_smyt_wu012_taishici` + `gz_smyt_wu010_sunce` | 吳 | B+ | 珠聯璧合, 雙刀, 壓制 | guide-info-20 says 太史策 is strong but ranks below 僵尸笨 in that example. |
| Medium | 龐德 + 張任 | `gz_smyt_qun008_pangde` + `gz_smyt_qun024_zhangren` | 群 | B+ | 破防, 強命, 壓迫 | guide-info-21 specifically says 龐德國戰搭配張任很噁心. |
| Medium | 臥龍·諸葛亮 + 蔣琬&費禕 | `gz_smyt_shu011_zhugeliang` + `gz_smyt_shu018_jiangwan_feiyi` | 蜀 | A- | 保鏢, 無懈, 輔助 | guide-info-21 calls 臥龍國戰第一保鏢 and says 真愛蔣費. |

## Needs More Verification

These are interesting but should not be added yet.

| Combo / concept | Reason to pause |
|---|---|
| 馬騰 + any 群 general | guide-info-19 says 馬騰帶誰都是超一流, but that is not a specific pair. Need choose concrete pairs from our pool. Possible candidates: 馬騰 + 顏良&文醜, 馬騰 + 袁紹, 馬騰 + 貂蟬. |
| 袁紹 + any 群 general | guide-info-19 jokes 大嘴帶誰都強; not a precise recommendation. Current app already has 袁紹 + 田豐 as curated. Need more source support before adding more. |
| 紀靈 + 張讓 | guide-info-20 mentions it as a 黑科技 / toxic option, but `張讓` is not currently in our 國戰受命于天 data. Blocked unless 張讓 is added. |
| 張郃 + any 魏 general | guide-info-21 says 張郃國戰萬搭, but no specific pair. Candidate source support is too broad. |
| 姜維 + 蜀 core | guide-info-21 calls 姜維國戰核心, but no pair is named in the source section. Need separate source or manual approval. |

## Suggested Approval Batch 1

If we want a clean first expansion, add these 10 first:

1. 鄧艾 + 郭嘉
2. 甄姬 + 司馬懿
3. 陸遜 + 孫尚香
4. 周泰 + 孫策
5. 賈詡 + 貂蟬
6. 曹丕 + 郭嘉
7. 貂蟬 + 田豐
8. 孔融 + 貂蟬
9. 馬超 + 馬岱
10. 臥龍·諸葛亮 + 蔣琬&費禕

After approval:
- Add them to `data/guozhan-combos.json`.
- Add source URLs and change reviewStatus to `來源待複核` or `已來源佐證`.
- Keep language user-facing and not too absolute: "常見推薦 / 可考慮", not "最強".
