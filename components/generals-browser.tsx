"use client";

import Link from "next/link";
import { ChevronLeft, MessageSquare, Search, Send, Star, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Converter } from "opencc-js";
import { useEffect, useMemo, useState } from "react";
import generalsJson from "../data/generals.json";

type General = {
  id: string;
  name: string;
  faction: string;
  factions?: string[];
  type?: "normal" | "dual" | "lord";
  image?: string;
  modes: string[];
  versions: string[];
  skills?: string[];
  cardEntry?: boolean;
};

type RatingKey = "show" | "top" | "strong" | "npc" | "weak";

type GeneralFeedback = {
  ratingCounts: Record<RatingKey, number>;
  userVote?: RatingKey;
  comments: Array<{
    id: string;
    name: string;
    rating: RatingKey;
    text: string;
    createdAt: string;
  }>;
};

const generals = (generalsJson as General[]).filter((general) => !general.cardEntry);
const t2s = Converter({ from: "tw", to: "cn" });
const factions = ["全部", "魏", "蜀", "吳", "群", "晉"];
const modeFilters = Array.from(new Set(["全部", "國戰", "身分局", ...generals.flatMap((general) => general.modes)]));
const versionFilters = Array.from(new Set(["全部", ...generals.flatMap((general) => general.versions)]));
const typeFilters = [
  { key: "all", label: "全部" },
  { key: "lord", label: "君主" },
  { key: "dual", label: "雙勢力" },
  { key: "normal", label: "一般" },
] as const;

const ratingOptions: Array<{ key: RatingKey; label: string; tone: string }> = [
  { key: "show", label: "秀", tone: "blue" },
  { key: "top", label: "頂級", tone: "gold" },
  { key: "strong", label: "人人人", tone: "green" },
  { key: "npc", label: "npc", tone: "red" },
  { key: "weak", label: "拉完了", tone: "slate" },
];

const defaultFeedback: GeneralFeedback = {
  ratingCounts: { show: 0, top: 0, strong: 0, npc: 0, weak: 0 },
  comments: [],
};

function getTitle(general: General) {
  if (!general.image) return "待補稱號";

  const filename = decodeURIComponent(general.image.split("/").pop() ?? "");
  const parts = filename.replace(/\.[^.]+$/, "").split(".");

  return parts.length >= 3 ? parts.slice(1, -1).join(".") : "待補稱號";
}

function getFactions(general: General) {
  return general.factions?.length ? general.factions : [general.faction];
}

function normalize(value: string) {
  return t2s(value.toLowerCase().replace(/\s+/g, ""));
}

function getFeedbackKey(generalId: string) {
  return `sgs-general-feedback:${generalId}`;
}

function emptyFeedback(): GeneralFeedback {
  return {
    ratingCounts: { ...defaultFeedback.ratingCounts },
    userVote: undefined,
    comments: [],
  };
}

export default function GeneralsBrowser() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [selectedFaction, setSelectedFaction] = useState("全部");
  const [selectedMode, setSelectedMode] = useState("全部");
  const [selectedVersion, setSelectedVersion] = useState("全部");
  const [selectedType, setSelectedType] = useState<(typeof typeFilters)[number]["key"]>("all");
  const [selectedGeneral, setSelectedGeneral] = useState<General | null>(null);
  const [feedback, setFeedback] = useState<GeneralFeedback>(emptyFeedback);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentRating, setCommentRating] = useState<RatingKey>("show");
  const recentIds = useMemo(
    () => (searchParams.get("recent") ?? "").split(",").filter(Boolean),
    [searchParams]
  );

  const filteredGenerals = useMemo(() => {
    const keyword = normalize(query);
    const recentSet = new Set(recentIds);

    return generals.filter((general) => {
      const searchable = normalize(
        [
          general.name,
          general.id,
          general.faction,
          getTitle(general),
          ...(general.factions ?? []),
          ...(general.skills ?? []),
        ].join(" ")
      );

      const matchesKeyword = !keyword || searchable.includes(keyword);
      const matchesFaction =
        selectedFaction === "全部" || getFactions(general).includes(selectedFaction);
      const matchesMode = selectedMode === "全部" || general.modes.includes(selectedMode);
      const matchesVersion = selectedVersion === "全部" || general.versions.includes(selectedVersion);
      const matchesType = selectedType === "all" || general.type === selectedType;
      const matchesRecent = recentSet.size === 0 || recentSet.has(general.id);

      return matchesKeyword && matchesFaction && matchesMode && matchesVersion && matchesType && matchesRecent;
    });
  }, [query, selectedFaction, selectedMode, selectedVersion, selectedType, recentIds]);

  const totalVotes = ratingOptions.reduce((sum, option) => sum + feedback.ratingCounts[option.key], 0);
  const leadingRating = ratingOptions.reduce(
    (best, option) =>
      feedback.ratingCounts[option.key] > feedback.ratingCounts[best.key] ? option : best,
    ratingOptions[0]
  );

  useEffect(() => {
    const generalId = searchParams.get("general");
    if (!generalId) return;

    const target = generals.find((general) => general.id === generalId);
    if (target) {
      setSelectedGeneral(target);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!selectedGeneral) return;

    const raw = window.localStorage.getItem(getFeedbackKey(selectedGeneral.id));
    if (!raw) {
      setFeedback(emptyFeedback());
      return;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<GeneralFeedback>;
      setFeedback({
        ...emptyFeedback(),
        ...parsed,
        ratingCounts: { ...defaultFeedback.ratingCounts, ...parsed.ratingCounts },
        comments: parsed.comments ?? [],
      });
    } catch {
      setFeedback(emptyFeedback());
    }
  }, [selectedGeneral]);

  function saveFeedback(nextFeedback: GeneralFeedback) {
    if (!selectedGeneral) return;

    setFeedback(nextFeedback);
    window.localStorage.setItem(getFeedbackKey(selectedGeneral.id), JSON.stringify(nextFeedback));
  }

  function vote(rating: RatingKey) {
    const nextCounts = { ...feedback.ratingCounts };

    if (feedback.userVote) {
      nextCounts[feedback.userVote] = Math.max(0, nextCounts[feedback.userVote] - 1);
    }

    nextCounts[rating] += 1;

    const nextFeedback = {
      ...feedback,
      userVote: rating,
      ratingCounts: nextCounts,
    };

    saveFeedback(nextFeedback);
  }

  function submitComment() {
    if (!commentText.trim()) return;

    const nextFeedback = {
      ...feedback,
      comments: [
        {
          id: crypto.randomUUID(),
          name: commentName.trim() || "匿名軍師",
          rating: commentRating,
          text: commentText.trim(),
          createdAt: new Date().toISOString(),
        },
        ...feedback.comments,
      ].slice(0, 30),
    };

    saveFeedback(nextFeedback);
    setCommentText("");
    setCommentName("");
  }

  return (
    <main className="generals-page">
      <div className="generals-backdrop" aria-hidden="true" />

      <div className="generals-shell">
        <Link href="/" className="generals-home-link">
          <ChevronLeft size={18} />
          首頁
        </Link>

        <section className="generals-hero">
          <span className="generals-kicker">武將</span>
          <h1>武將圖鑑</h1>
          <p>瀏覽全部 {generals.length} 名國戰武將，搜尋武將名、稱號與勢力，點開卡片可查看大圖並留下調整建議。</p>
        </section>

        <section className="generals-toolbar" aria-label="武將搜尋與篩選">
          <label className="generals-search">
            <Search size={20} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜尋武將名、稱號、技能名..."
            />
          </label>

          <div className="generals-filter-row">
            <span>勢力</span>
            {factions.map((faction) => (
              <button
                key={faction}
                type="button"
                className={`filter-chip faction-${faction} ${selectedFaction === faction ? "active" : ""}`}
                onClick={() => setSelectedFaction(faction)}
              >
                {faction}
              </button>
            ))}
          </div>

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
            <span>版本</span>
            {versionFilters.map((version) => (
              <button
                key={version}
                type="button"
                className={`filter-chip ${selectedVersion === version ? "active" : ""}`}
                onClick={() => setSelectedVersion(version)}
              >
                {version}
              </button>
            ))}
          </div>

          <div className="generals-filter-row">
            <span>類型</span>
            {typeFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                className={`filter-chip ${selectedType === filter.key ? "active" : ""}`}
                onClick={() => setSelectedType(filter.key)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <p className="generals-count">共 {filteredGenerals.length} 名武將</p>
        </section>

        <section className="generals-grid" aria-label="武將列表">
          {filteredGenerals.map((general) => (
            <button
              key={general.id}
              type="button"
              className="general-card-tile"
              onClick={() => setSelectedGeneral(general)}
            >
              <span className="general-card-art">
                {general.image ? <img src={general.image} alt={general.name} /> : <span>{general.name.slice(0, 1)}</span>}
              </span>
              <span className="general-card-body">
                <strong>{general.name}</strong>
                <small>{getTitle(general)}</small>
                <span className="general-card-badges">
                  {getFactions(general).map((faction) => (
                    <em key={faction} className={`general-faction faction-${faction}`}>
                      {faction}
                    </em>
                  ))}
                </span>
              </span>
            </button>
          ))}
        </section>
      </div>

      {selectedGeneral && (
        <div className="general-detail-overlay" role="dialog" aria-modal="true" aria-label={`${selectedGeneral.name} 詳情`}>
          <div className="general-detail-modal">
            <button
              type="button"
              className="general-detail-close"
              onClick={() => setSelectedGeneral(null)}
              aria-label="關閉武將詳情"
            >
              <X size={22} />
            </button>

            <section className="general-detail-main">
              <div className="general-detail-image">
                {selectedGeneral.image ? (
                  <img src={selectedGeneral.image} alt={selectedGeneral.name} />
                ) : (
                  <span>{selectedGeneral.name.slice(0, 1)}</span>
                )}
              </div>

              <div className="general-detail-info">
                <div className="detail-title-row">
                  <div>
                    <h2>{selectedGeneral.name}</h2>
                    <p>{getTitle(selectedGeneral)}</p>
                  </div>
                  <div className="detail-factions">
                    {getFactions(selectedGeneral).map((faction) => (
                      <span key={faction} className={`general-faction faction-${faction}`}>
                        {faction}
                      </span>
                    ))}
                  </div>
                </div>

                <dl className="general-meta-grid">
                  <div>
                    <dt>ID</dt>
                    <dd>{selectedGeneral.id}</dd>
                  </div>
                  <div>
                    <dt>模式</dt>
                    <dd>{selectedGeneral.modes.join(" / ")}</dd>
                  </div>
                  <div>
                    <dt>版本</dt>
                    <dd>{selectedGeneral.versions.join(" / ")}</dd>
                  </div>
                  <div>
                    <dt>類型</dt>
                    <dd>{typeFilters.find((filter) => filter.key === selectedGeneral.type)?.label ?? "一般"}</dd>
                  </div>
                </dl>

                <section className="detail-rating-panel">
                  <div className="rating-summary">
                    <span>
                      <Star size={18} fill="currentColor" />
                      目前 {totalVotes} 票，最多投給：{totalVotes ? leadingRating.label : "尚未評價"}
                    </span>
                  </div>
                  <div className="rating-actions">
                    {ratingOptions.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        className={`rating-chip ${option.tone} ${feedback.userVote === option.key ? "selected" : ""}`}
                        aria-pressed={feedback.userVote === option.key}
                        onClick={() => vote(option.key)}
                      >
                        {option.label}
                        <small>{feedback.ratingCounts[option.key]}</small>
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            </section>

            <section className="general-feedback-panel">
              <div className="feedback-heading">
                <div>
                  <MessageSquare size={20} />
                  <h3>留言建議</h3>
                </div>
                <span>給自製武將平衡調整用</span>
              </div>

              <div className="feedback-form">
                <input
                  value={commentName}
                  onChange={(event) => setCommentName(event.target.value)}
                  placeholder="你的名字，可留空"
                />
                <select value={commentRating} onChange={(event) => setCommentRating(event.target.value as RatingKey)}>
                  {ratingOptions.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <textarea
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  placeholder="例如：技能太吃手牌、回合外防禦不足、國戰配合某勢力太強..."
                />
                <button type="button" onClick={submitComment}>
                  <Send size={17} />
                  送出建議
                </button>
              </div>

              <div className="feedback-list">
                {feedback.comments.length === 0 && (
                  <p className="feedback-empty">目前還沒有留言。先記下你的平衡想法，之後可以接到 Supabase 做公開建議牆。</p>
                )}

                {feedback.comments.map((comment) => {
                  const rating = ratingOptions.find((option) => option.key === comment.rating);
                  return (
                    <article key={comment.id} className="feedback-item">
                      <header>
                        <strong>{comment.name}</strong>
                        <span>{rating?.label}</span>
                        <time>{new Date(comment.createdAt).toLocaleDateString("zh-TW")}</time>
                      </header>
                      <p>{comment.text}</p>
                    </article>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      )}
    </main>
  );
}
