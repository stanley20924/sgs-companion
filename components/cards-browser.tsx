"use client";

import { Search, X } from "lucide-react";
import { Converter } from "opencc-js";
import { useMemo, useState } from "react";
import cardsJson from "../data/cards.json";
import SiteNav from "./site-nav";

type CardData = {
  id: string;
  name: string;
  simplifiedName?: string;
  modes: string[];
  category: string;
  subtype?: string;
  expansion: string;
  deckCount?: number;
  timing?: string;
  target?: string;
  effect: string;
  notes?: string | string[];
  image?: string;
  sourceUrl?: string;
};

const cards = cardsJson as CardData[];
const t2s = Converter({ from: "tw", to: "cn" });
const allLabel = "全部";

const modeFilters = Array.from(new Set([allLabel, ...cards.flatMap((card) => card.modes)]));
const categoryFilters = Array.from(new Set([allLabel, ...cards.map((card) => card.category)]));
const expansionFilters = Array.from(new Set([allLabel, ...cards.map((card) => card.expansion)]));

function normalize(value: string) {
  return t2s(value.toLowerCase().replace(/\s+/g, ""));
}

function getCardTone(card: CardData) {
  if (card.category === "基本牌") return "basic";
  if (card.category === "裝備牌") return "equipment";
  if (card.category === "身份牌") return "role";
  if (card.category === "武將牌") return "general";
  if (card.modes.includes("國戰")) return "guozhan";
  return "trick";
}

function getImagePath(card: CardData) {
  return card.image?.trim() || "";
}

function getDisplayNameStyle(name: string) {
  if (name.length >= 5) return { fontSize: "clamp(23px, 2.4vw, 34px)" };
  if (name.length >= 4) return { fontSize: "clamp(27px, 3vw, 40px)" };
  if (name.length >= 3) return { fontSize: "clamp(31px, 3.8vw, 48px)" };
  return undefined;
}

function getCardNotes(card: CardData) {
  if (!card.notes) return [];
  return Array.isArray(card.notes) ? card.notes.filter(Boolean) : [card.notes].filter(Boolean);
}

export default function CardsBrowser() {
  const [query, setQuery] = useState("");
  const [selectedMode, setSelectedMode] = useState(allLabel);
  const [selectedCategory, setSelectedCategory] = useState(allLabel);
  const [selectedExpansion, setSelectedExpansion] = useState(allLabel);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);

  const filteredCards = useMemo(() => {
    const keyword = normalize(query);

    return cards.filter((card) => {
      const searchable = normalize(
        [
          card.name,
          card.simplifiedName ?? "",
          card.id,
          card.category,
          card.subtype ?? "",
          card.expansion,
          card.timing ?? "",
          card.target ?? "",
          card.effect,
          ...getCardNotes(card),
          ...card.modes,
        ].join(" ")
      );

      const matchesKeyword = !keyword || searchable.includes(keyword);
      const matchesMode = selectedMode === allLabel || card.modes.includes(selectedMode);
      const matchesCategory = selectedCategory === allLabel || card.category === selectedCategory;
      const matchesExpansion = selectedExpansion === allLabel || card.expansion === selectedExpansion;

      return matchesKeyword && matchesMode && matchesCategory && matchesExpansion;
    });
  }, [query, selectedMode, selectedCategory, selectedExpansion]);

  return (
    <main className="cards-page">
      <div className="generals-backdrop" aria-hidden="true" />

      <div className="generals-shell cards-shell">
        <SiteNav currentLabel="卡牌資料庫" />

        <section className="generals-hero cards-hero">
          <span className="generals-kicker">卡牌</span>
          <h1>卡牌資料庫</h1>
          <p>
            整理身分局與國戰常用卡牌，支援繁簡搜尋與模式、類型、擴充篩選。點開卡牌可查看效果、時機與來源。
          </p>
        </section>

        <section className="generals-toolbar cards-toolbar" aria-label="卡牌搜尋與篩選">
          <label className="generals-search">
            <Search size={20} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜尋卡名、簡體、效果、擴充..."
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

          <div className="generals-filter-row">
            <span>類型</span>
            {categoryFilters.map((category) => (
              <button
                key={category}
                type="button"
                className={`filter-chip ${selectedCategory === category ? "active" : ""}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="generals-filter-row">
            <span>擴充</span>
            {expansionFilters.map((expansion) => (
              <button
                key={expansion}
                type="button"
                className={`filter-chip ${selectedExpansion === expansion ? "active" : ""}`}
                onClick={() => setSelectedExpansion(expansion)}
              >
                {expansion}
              </button>
            ))}
          </div>

          <p className="generals-count">共 {filteredCards.length} 種卡牌</p>
        </section>

        <section className="cards-grid" aria-label="卡牌列表">
          {filteredCards.map((card) => {
            const imagePath = getImagePath(card);

            return (
              <button
                key={card.id}
                type="button"
                className={`card-record ${getCardTone(card)}`}
                onClick={() => setSelectedCard(card)}
              >
                <span className="card-record-art">
                  {imagePath ? (
                    <img src={imagePath} alt={card.name} />
                  ) : (
                    <span className="card-placeholder">
                      <strong style={getDisplayNameStyle(card.name)}>{card.name}</strong>
                      <small>{card.category}</small>
                    </span>
                  )}
                </span>

                <span className="card-record-body">
                  <span>
                    <strong>{card.name}</strong>
                    <small>{card.subtype || card.category}</small>
                  </span>
                  <em>{card.expansion}</em>
                </span>
              </button>
            );
          })}
        </section>
      </div>

      {selectedCard && (
        <div className="general-detail-overlay" role="dialog" aria-modal="true" aria-label={`${selectedCard.name} 詳情`}>
          <div className="general-detail-modal card-detail-modal">
            <button
              type="button"
              className="general-detail-close"
              onClick={() => setSelectedCard(null)}
              aria-label="關閉卡牌詳情"
            >
              <X size={22} />
            </button>

            <section className="card-detail-main">
              <div className={`card-detail-preview ${getCardTone(selectedCard)}`}>
                {getImagePath(selectedCard) ? (
                  <img src={getImagePath(selectedCard)} alt={selectedCard.name} />
                ) : (
                  <div className="card-detail-placeholder">
                    <span>{selectedCard.category}</span>
                    <strong style={getDisplayNameStyle(selectedCard.name)}>{selectedCard.name}</strong>
                    <small>{selectedCard.expansion}</small>
                  </div>
                )}
              </div>

              <div className="general-detail-info card-detail-info">
                <div className="detail-title-row">
                  <div>
                    <h2>{selectedCard.name}</h2>
                    <p>{selectedCard.subtype || selectedCard.category}</p>
                  </div>
                  <div className="card-mode-badges">
                    {selectedCard.modes.map((mode) => (
                      <span key={mode}>{mode}</span>
                    ))}
                  </div>
                </div>

                <dl className="general-meta-grid">
                  <div>
                    <dt>類型</dt>
                    <dd>{selectedCard.category}</dd>
                  </div>
                  <div>
                    <dt>擴充</dt>
                    <dd>{selectedCard.expansion}</dd>
                  </div>
                  <div>
                    <dt>數量</dt>
                    <dd>{selectedCard.deckCount ?? "待補"}</dd>
                  </div>
                  <div>
                    <dt>時機</dt>
                    <dd>{selectedCard.timing || "待補"}</dd>
                  </div>
                  <div>
                    <dt>目標</dt>
                    <dd>{selectedCard.target || "待補"}</dd>
                  </div>
                  <div>
                    <dt>ID</dt>
                    <dd>{selectedCard.id}</dd>
                  </div>
                </dl>

                <section className="card-effect-panel">
                  <h3>效果</h3>
                  <p>{selectedCard.effect}</p>
                  {getCardNotes(selectedCard).length > 0 && (
                    <div className="card-notes">
                      <h4>備註</h4>
                      <ul>
                        {getCardNotes(selectedCard).map((note) => (
                          <li key={note}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedCard.sourceUrl && (
                    <a href={selectedCard.sourceUrl} target="_blank" rel="noreferrer">
                      查看資料來源
                    </a>
                  )}
                </section>
              </div>
            </section>
          </div>
        </div>
      )}
    </main>
  );
}
