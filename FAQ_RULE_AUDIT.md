# FAQ Rule Audit

Generated: 2026-07-05

Scope: add and verify confusing rules before changing the FAQ page.

## Current State

- Search already normalizes Traditional Chinese to Simplified Chinese with `opencc-js`, so queries like `鐵索連環` and `铁索连环` should both match the same FAQ text.
- Current FAQ has 8 entries.
- Current high-value topics already covered: chain damage, lightning, fire attack/fire slash, Guozhan array/siege, Diaohulishan, Chiling, identity victory, delayed trick order.

## Recommended Source Priority

1. GLTJK rule pages for concise rule wording:
   - Basic cards: https://gltjk.com/sanguosha/rules/card/basic.html
   - Trick cards: https://gltjk.com/sanguosha/rules/card/scroll.html
   - Equipment: https://gltjk.com/sanguosha/rules/card/equipment.html
   - Rules index: https://gltjk.com/sanguosha/rules/info/index.html
2. BWIKI pages for individual card / skill cross-check:
   - https://wiki.biligame.com/sgs/
3. Official article pages when available:
   - Guozhan / Shibei article already used in card data: https://www.sanguosha.com/news/20170719_5639_4109

## Proposed FAQ Additions

### High Priority

- 閃電 + 鐵索連環
  - Clarify that lightning deals thunder damage, so it can trigger chain transmission.
  - Clarify that other chained targets do not re-judge lightning; they receive transmitted thunder damage.
  - Add pitfalls around prevention / immunity / Silver Lion / Taiping Yaoshu.

- 藤甲 + 火焰傷害
  - Clarify when fire damage is increased.
  - Clarify whether chain-transmitted fire damage is still fire damage.
  - Add practical examples: fire slash, fire attack, fire damage through chain.

- 酒殺 + 屬性殺 + 鐵索連環
  - Clarify that Wine can increase the next Slash damage.
  - If the Slash is fire/thunder and successfully deals attribute damage, chain transmission should be checked.
  - Needs careful wording because damage modifiers and prevention effects can alter final damage.

- 火攻
  - Clarify the sequence: target shows a hand card, user may discard a card of the same suit, then fire damage is dealt.
  - Clarify that no same-suit discard means no damage and therefore no chain transmission.

- 白銀獅子
  - Clarify "damage greater than 1" reduction to 1.
  - Clarify interaction with chain-transmitted damage and losing equipment recovery.

### Medium Priority

- 樂不思蜀 / 兵糧寸斷 / 閃電 order
  - Current FAQ exists, but it should add examples for multiple delayed tricks and judgment-changing skills.

- 無懈可擊
  - Clarify what it cancels: one trick card's effect on one target, not always the entire card.

- 借刀殺人
  - Clarify target requirements and what happens if the target does not use Slash.

- 水淹七軍
  - Needs card database first, then FAQ entry.
  - Add once source wording is confirmed.

### Guozhan Specific

- 調虎離山 + 座次 / 距離 / 圍攻
  - Current FAQ exists; add one visual-style example in text.

- 隊列 / 圍攻 / 大勢力 / 小勢力 / 野心家
  - Current FAQ is broad; split into two shorter cards if mobile readability suffers.

## Approval Questions

- Do we want FAQ entries written in Traditional Chinese only, with Simplified matching handled by search? Recommended: yes.
- Should FAQ be "short rule answer first, detailed example below"? Recommended: yes, better for mobile.

