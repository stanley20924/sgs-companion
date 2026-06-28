"use client";

import { MessageSquare, Send, Star, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ratingOptions, type RatingKey, useGeneralFeedback } from "./use-general-feedback";

export type General = {
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

const typeLabels: Record<NonNullable<General["type"]>, string> = {
  normal: "一般",
  dual: "雙勢力",
  lord: "君主",
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

type GeneralDetailModalProps = {
  general: General;
  onClose: () => void;
  compact?: boolean;
};

export default function GeneralDetailModal({ general, onClose, compact = false }: GeneralDetailModalProps) {
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentRating, setCommentRating] = useState<RatingKey>("show");
  const { feedback, totalVotes, leadingRating, syncStatus, vote, submitComment: saveComment } = useGeneralFeedback(
    compact ? undefined : general.id
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function submitComment() {
    if (!commentText.trim()) return;

    const saved = await saveComment(commentName, commentRating, commentText);
    if (saved) {
      setCommentText("");
      setCommentName("");
    }
  }

  return (
    <div className="general-detail-overlay" role="dialog" aria-modal="true" aria-label={`${general.name} 詳情`}>
      <div className={`general-detail-modal ${compact ? "compact-general-modal" : ""}`}>
        <button type="button" className="general-detail-close" onClick={onClose} aria-label="關閉武將詳情">
          <X size={22} />
        </button>

        <section className="general-detail-main">
          <div className="general-detail-image">
            {general.image ? <img src={general.image} alt={general.name} /> : <span>{general.name.slice(0, 1)}</span>}
          </div>

          <div className="general-detail-info">
            <div className="detail-title-row">
              <div>
                <h2>{general.name}</h2>
                <p>{getTitle(general)}</p>
              </div>
              <div className="detail-factions">
                {getFactions(general).map((faction) => (
                  <span key={faction} className={`general-faction faction-${faction}`}>
                    {faction}
                  </span>
                ))}
              </div>
            </div>

            {!compact && <dl className="general-meta-grid">
              <div>
                <dt>ID</dt>
                <dd>{general.id}</dd>
              </div>
              <div>
                <dt>模式</dt>
                <dd>{general.modes.join(" / ")}</dd>
              </div>
              <div>
                <dt>版本</dt>
                <dd>{general.versions.join(" / ")}</dd>
              </div>
              <div>
                <dt>類型</dt>
                <dd>{general.type ? typeLabels[general.type] : "一般"}</dd>
              </div>
            </dl>}

            {!compact && <section className="detail-rating-panel">
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
            </section>}
          </div>
        </section>

        {!compact && <section className="general-feedback-panel">
          <div className="feedback-heading">
            <div>
              <MessageSquare size={20} />
              <h3>留言建議</h3>
            </div>
            <span>{syncStatus === "synced" ? "已同步到公開建議牆" : "給自製武將平衡調整用"}</span>
          </div>

          <div className="feedback-form">
            <input value={commentName} onChange={(event) => setCommentName(event.target.value)} placeholder="你的名字，可留空" />
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
        </section>}
      </div>
    </div>
  );
}
