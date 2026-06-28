"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

export type RatingKey = "show" | "top" | "strong" | "npc" | "weak";

export type GeneralComment = {
  id: string;
  name: string;
  rating: RatingKey;
  text: string;
  createdAt: string;
};

export type GeneralFeedback = {
  ratingCounts: Record<RatingKey, number>;
  userVote?: RatingKey;
  comments: GeneralComment[];
};

type VoteRow = {
  voter_id: string;
  rating: RatingKey;
};

type CommentRow = {
  id: string;
  name: string | null;
  rating: RatingKey;
  text: string;
  created_at: string;
};

export const ratingOptions: Array<{ key: RatingKey; label: string; tone: string }> = [
  { key: "show", label: "秀", tone: "blue" },
  { key: "top", label: "頂級", tone: "gold" },
  { key: "strong", label: "人人人", tone: "green" },
  { key: "npc", label: "npc", tone: "red" },
  { key: "weak", label: "拉完了", tone: "slate" },
];

const emptyCounts: Record<RatingKey, number> = {
  show: 0,
  top: 0,
  strong: 0,
  npc: 0,
  weak: 0,
};

const fallbackName = "匿名軍師";

function getFeedbackKey(generalId: string) {
  return `sgs-general-feedback:${generalId}`;
}

function getVoterId() {
  const key = "sgs-voter-id";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;

  const next =
    globalThis.crypto?.randomUUID?.() ?? `voter-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  window.localStorage.setItem(key, next);
  return next;
}

function createCommentId() {
  return globalThis.crypto?.randomUUID?.() ?? `comment-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function emptyFeedback(): GeneralFeedback {
  return {
    ratingCounts: { ...emptyCounts },
    userVote: undefined,
    comments: [],
  };
}

function loadLocalFeedback(generalId: string): GeneralFeedback {
  const raw = window.localStorage.getItem(getFeedbackKey(generalId));
  if (!raw) return emptyFeedback();

  try {
    const parsed = JSON.parse(raw) as Partial<GeneralFeedback>;
    return {
      ...emptyFeedback(),
      ...parsed,
      ratingCounts: { ...emptyCounts, ...parsed.ratingCounts },
      comments: parsed.comments ?? [],
    };
  } catch {
    return emptyFeedback();
  }
}

function saveLocalFeedback(generalId: string, feedback: GeneralFeedback) {
  window.localStorage.setItem(getFeedbackKey(generalId), JSON.stringify(feedback));
}

function rowsToFeedback(votes: VoteRow[], comments: CommentRow[], voterId: string): GeneralFeedback {
  const ratingCounts = { ...emptyCounts };
  let userVote: RatingKey | undefined;

  votes.forEach((vote) => {
    ratingCounts[vote.rating] += 1;
    if (vote.voter_id === voterId) {
      userVote = vote.rating;
    }
  });

  return {
    ratingCounts,
    userVote,
    comments: comments.map((comment) => ({
      id: comment.id,
      name: comment.name || fallbackName,
      rating: comment.rating,
      text: comment.text,
      createdAt: comment.created_at,
    })),
  };
}

export function useGeneralFeedback(generalId?: string) {
  const [feedback, setFeedback] = useState<GeneralFeedback>(emptyFeedback);
  const [syncStatus, setSyncStatus] = useState<"local" | "loading" | "synced" | "error">("loading");
  const [voterId, setVoterId] = useState<string>("");

  useEffect(() => {
    setVoterId(getVoterId());
  }, []);

  const loadFeedback = useCallback(async () => {
    if (!generalId || !voterId) return;

    if (!supabase) {
      setFeedback(loadLocalFeedback(generalId));
      setSyncStatus("local");
      return;
    }

    setSyncStatus("loading");

    try {
      const [{ data: votes, error: votesError }, { data: comments, error: commentsError }] = await Promise.all([
        supabase
          .from("general_votes")
          .select("voter_id, rating")
          .eq("general_id", generalId),
        supabase
          .from("general_comments")
          .select("id, name, rating, text, created_at")
          .eq("general_id", generalId)
          .order("created_at", { ascending: false })
          .limit(30),
      ]);

      if (votesError || commentsError) throw votesError ?? commentsError;

      const nextFeedback = rowsToFeedback((votes ?? []) as VoteRow[], (comments ?? []) as CommentRow[], voterId);
      setFeedback(nextFeedback);
      saveLocalFeedback(generalId, nextFeedback);
      setSyncStatus("synced");
    } catch (error) {
      console.error("General feedback sync failed:", error);
      setFeedback(loadLocalFeedback(generalId));
      setSyncStatus("error");
    }
  }, [generalId, voterId]);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  useEffect(() => {
    if (!supabase || !generalId || !voterId) return;

    const channel = supabase
      .channel(`general-feedback:${generalId}:${voterId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "general_votes", filter: `general_id=eq.${generalId}` }, loadFeedback)
      .on("postgres_changes", { event: "*", schema: "public", table: "general_comments", filter: `general_id=eq.${generalId}` }, loadFeedback)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [generalId, loadFeedback, voterId]);

  const vote = useCallback(
    async (rating: RatingKey) => {
      if (!generalId || !voterId) return;

      const previousFeedback = feedback;
      const optimisticCounts = { ...feedback.ratingCounts };

      if (feedback.userVote) {
        optimisticCounts[feedback.userVote] = Math.max(0, optimisticCounts[feedback.userVote] - 1);
      }

      optimisticCounts[rating] += 1;

      const optimisticFeedback = {
        ...feedback,
        userVote: rating,
        ratingCounts: optimisticCounts,
      };

      setFeedback(optimisticFeedback);
      saveLocalFeedback(generalId, optimisticFeedback);

      if (!supabase) {
        setSyncStatus("local");
        return;
      }

      const { error } = await supabase.from("general_votes").upsert(
        {
          general_id: generalId,
          voter_id: voterId,
          rating,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "general_id,voter_id" }
      );

      if (error) {
        console.error("General vote sync failed:", error);
        setFeedback(previousFeedback);
        saveLocalFeedback(generalId, previousFeedback);
        setSyncStatus("error");
        return;
      }

      setSyncStatus("synced");
      await loadFeedback();
    },
    [feedback, generalId, loadFeedback, voterId]
  );

  const submitComment = useCallback(
    async (name: string, rating: RatingKey, text: string) => {
      if (!generalId || !voterId || !text.trim()) return false;

      const nextComment: GeneralComment = {
        id: createCommentId(),
        name: name.trim() || fallbackName,
        rating,
        text: text.trim(),
        createdAt: new Date().toISOString(),
      };

      const optimisticFeedback = {
        ...feedback,
        comments: [nextComment, ...feedback.comments].slice(0, 30),
      };

      setFeedback(optimisticFeedback);
      saveLocalFeedback(generalId, optimisticFeedback);

      if (!supabase) {
        setSyncStatus("local");
        return true;
      }

      const { error } = await supabase.from("general_comments").insert({
        id: nextComment.id,
        general_id: generalId,
        voter_id: voterId,
        name: nextComment.name,
        rating,
        text: nextComment.text,
      });

      if (error) {
        console.error("General comment sync failed:", error);
        setSyncStatus("error");
        return false;
      }

      setSyncStatus("synced");
      await loadFeedback();
      return true;
    },
    [feedback, generalId, loadFeedback, voterId]
  );

  const totalVotes = useMemo(
    () => ratingOptions.reduce((sum, option) => sum + feedback.ratingCounts[option.key], 0),
    [feedback.ratingCounts]
  );

  const leadingRating = useMemo(
    () =>
      ratingOptions.reduce(
        (best, option) => (feedback.ratingCounts[option.key] > feedback.ratingCounts[best.key] ? option : best),
        ratingOptions[0]
      ),
    [feedback.ratingCounts]
  );

  return {
    feedback,
    totalVotes,
    leadingRating,
    ratingOptions,
    syncStatus,
    vote,
    submitComment,
  };
}
