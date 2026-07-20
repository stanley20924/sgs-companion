# Identity 2026 Advice Research Audit

Date: 2026-07-19

Scope:
- Mode: 身分局
- Version: 2026珍藏版
- Current app pool: 77 identity generals with `identity_2026_` IDs.
- Status: research candidates only. Do not add fixed in-app role rankings until approved.

Selection flow assumption:
- 主公: player sees 3 lord-candidate generals + 2 random generals, then chooses 1.
- 忠臣 / 反賊 / 內奸: player sees 3 generals, then chooses 1.
- The app should ask player identity first, then let them add the actually drawn candidates, then generate an AI prompt from the card images.

Primary sources reviewed:
- 三國殺移動版首頁：身份場勝利條件 overview
  https://www.sanguosha.cn/new_index_pc/
- 曹丕全模式攻略
  https://www.sanguosha.cn/pc/guide-info-126.html
- 持重守節——荀彧攻略
  https://www.sanguosha.cn/guide-info-45.html
- 進階的激昂—界孫策前瞻攻略
  https://www.sanguosha.cn/pc/guide-info-136.html
- 經典再現——諸葛亮
  https://www.sanguosha.cn/pc/guide-info-111.html
- 官人帶你看武將系列——袁紹篇
  https://www.sanguosha.cn/pc/guide-info-103.html
- 刺美人界祝融武將攻略
  https://www.sanguosha.cn/pc/guide-info-137.html
- 幻化無窮——界左慈簡介
  https://www.sanguosha.cn/pc/guide-info-68.html
- 普通玩家必有武將(上) - 魯肅
  https://www.sanguosha.cn/pc/guide-info-46.html

Source caveat:
- Most official guide pages are older mobile-version articles and may discuss boundary-break / mobile variants.
- Treat these as identity-role tendency references, not exact 2026珍藏版 balance.
- Final app recommendations should still use the screenshot/card text as the highest priority.

## Implemented Prompt Logic

The AI screenshot tool now uses identity-specific prompt rules:

| Identity | Candidate count | Prompt focus |
|---|---:|---|
| 主公 | 5 | survival, self-protection, control, early round stability |
| 忠臣 | 3 | protecting lord, supporting lord, reliable damage/control |
| 反賊 | 3 | early pressure, focus fire, breaking lord defense |
| 內奸 | 3 | self-preservation, late-game solo, threat management |

## Candidate Recommendations For Approval

These are candidates we can later turn into built-in identity advice after user approval.

| Role | Candidate | App ID | Suggested status | Source support |
|---|---|---|---|---|
| 主公 | 曹丕 | `identity_2026_wei014` | Strong approve candidate | guide-info-126 describes 曹丕主公 as strong against rush with 放逐 control. |
| 主公 | 孫策 | `identity_2026_wu010` | Approve candidate | guide-info-136 says 孫策 can serve as 主公 and is recommended in that role. |
| 主公 | 左慈 | `identity_2026_qun009` | Conditional candidate | guide-info-68 says 左慈主公 can be selected but needs loyalist support and is slow early. |
| 主公 | 諸葛亮 | `identity_2026_shu004` / `identity_2026_shu011` | Caution candidate | guide-info-111 gives 主公 only low rating; defensive but low card advantage. |
| 忠臣 | 荀彧 | `identity_2026_wei013` | Strong approve candidate | guide-info-45 gives 忠臣 high rating and highlights strong support. |
| 忠臣 | 袁紹 | `identity_2026_qun004` | Conditional approve candidate | guide-info-103 says 袁紹 can be strong loyalist especially in 魏 lord context. |
| 忠臣 | 祝融 | `identity_2026_shu015` | Conditional candidate | guide-info-137 says she works better as loyalist with supply/support lords. |
| 忠臣 | 魯肅 | `identity_2026_wu014` | Strong support candidate | guide-info-46 describes high-value card-difference, control, and support role. |
| 反賊 | 荀彧 | `identity_2026_wei013` | Strong approve candidate | guide-info-45 rates 荀彧 highly as rebel due to pressure and support. |
| 反賊 | 曹丕 | `identity_2026_wei014` | Approve candidate | guide-info-126 says 曹丕 is reliable as rebel, especially against turn-dependent lords. |
| 反賊 | 祝融 | `identity_2026_shu015` | Approve candidate | guide-info-137 says 祝融 is more suitable as rebel than lord. |
| 反賊 | 諸葛亮 | `identity_2026_shu004` / `identity_2026_shu011` | Approve candidate | guide-info-111 rates 諸葛亮 rebel higher because rebel numbers let 觀星 support team pressure. |
| 反賊 | 左慈 | `identity_2026_qun009` | Soft approve candidate | guide-info-68 says 左慈 can be used as rebel due to broad compatibility. |
| 內奸 | 左慈 | `identity_2026_qun009` | Strong approve candidate | guide-info-68 explicitly recommends 左慈 as internal due to scaling and solo potential. |
| 內奸 | 諸葛亮 | `identity_2026_shu004` / `identity_2026_shu011` | Approve candidate | guide-info-111 says 諸葛亮 can be good internal because of card control and solo strength. |
| 內奸 | 孫策 | `identity_2026_wu010` | Conditional candidate | guide-info-136 says 孫策 internal has low early threat but hard control decisions. |
| 內奸 | 祝融 | `identity_2026_shu015` | Soft approve candidate | guide-info-137 says 祝融 internal is possible due to attack/defense mix and 南蠻 timing. |

## Do Not Promote Yet

| Candidate | Reason |
|---|---|
| 袁紹 as 反賊 | guide-info-103 explicitly says rebel is weak / low score. |
| 袁紹 as 內奸 | guide-info-103 says high threat and generally not recommended unless special state. |
| 荀彧 as 內奸 | guide-info-45 rates internal low due to weak solo and threat management issues. |
| 祝融 as 主公 | guide-info-137 says she cannot withstand rush well. |
| 諸葛亮 as 忠臣 | guide-info-111 rates loyalist low because protection/output are limited. |

## Suggested Approval Batch 1

If we want the first built-in identity ranking hints later, approve these first:

1. 主公: 曹丕, 孫策
2. 忠臣: 荀彧, 魯肅
3. 反賊: 荀彧, 曹丕, 祝融, 諸葛亮
4. 內奸: 左慈, 諸葛亮

After approval:
- Add `data/identity-advice.json`.
- Let the identity advice modal show "內建身份傾向" when selected candidates match these IDs.
- Keep wording soft: "可優先考慮", "不一定最強", "以牌面技能和座次為準".
