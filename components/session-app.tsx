"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Converter } from "opencc-js";
import generalsJson from "../data/generals.json";
import { supabase } from "../lib/supabase";
import SiteNav from "./site-nav";

type General = {
  id: string;
  name: string;
  faction: string;
  factions?: string[];
  type?: "normal" | "dual" | "lord";
  image?: string;
  modes: string[];
  versions: string[];
};

type GameMode = "國戰" | "身分局";

type Player = {
  id: number;
  dbId?: string;
  name: string;
  generals: (General | null)[];
  dead: boolean;
  identity: string;
  selectedFaction?: string | null;
};

const identities = ["主公", "忠臣", "反賊", "內奸", "未公開"];
const modes: GameMode[] = ["國戰", "身分局"];

const versionsByMode: Record<GameMode, string[]> = {
  國戰: ["受命于天", "標準國戰", "君臨天下"],
  身分局: ["2026珍藏版", "標準身份", "軍爭"],
};

const playerLimitsByMode: Record<GameMode, { min: number; max: number; defaultCount: number }> = {
  國戰: { min: 2, max: 12, defaultCount: 8 },
  身分局: { min: 2, max: 10, defaultCount: 8 },
};

const generals = generalsJson as General[];

const factionOrder = ["魏", "蜀", "吳", "群", "晉"];

const factionColors: Record<string, { bg: string; text: string; border: string }> = {
  魏: { bg: "#10223f", text: "#bfdbfe", border: "#1d4ed8" },
  蜀: { bg: "#3a1111", text: "#fecaca", border: "#b91c1c" },
  吳: { bg: "#102a1c", text: "#bbf7d0", border: "#15803d" },
  群: { bg: "#27272a", text: "#e7e5e4", border: "#71717a" },
  晉: { bg: "#31214f", text: "#e9d5ff", border: "#a78bfa" },
};

function createPlayers(count: number, mode: GameMode): Player[] {
  const slots = mode === "國戰" ? 2 : 1;

  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `玩家 ${index + 1}`,
    generals: Array.from({ length: slots }, () => null),
    dead: false,
    identity: mode === "身分局" ? identities[Math.min(index, identities.length - 1)] : "",
    selectedFaction: null,
  }));
}


function generalFromId(generalId: string | null | undefined) {
  if (!generalId) return null;
  return generals.find((general) => general.id === generalId) ?? null;
}

const t2s = Converter({ from: "tw", to: "cn" });

function normalizeChineseSearch(value: string) {
  return t2s(value.toLowerCase().replace(/\s+/g, ""));
}

function getGeneralFactions(general: General | null | undefined) {
  if (!general) return [];
  return general.factions?.length ? general.factions : [general.faction];
}

function uniqueFactions(factions: string[]) {
  return Array.from(new Set(factions)).filter((faction) => factionOrder.includes(faction));
}

function getSelectedGenerals(generalsList: (General | null)[]) {
  return generalsList.filter(Boolean) as General[];
}

function getPossiblePlayerFactions(generalsList: (General | null)[]) {
  const selected = getSelectedGenerals(generalsList);
  if (selected.length === 0) return [];

const allFactions = selected.map(getGeneralFactions);

const shared =
  allFactions.length > 0
    ? allFactions.slice(1).reduce<string[]>(
        (common, factions) => common.filter((faction) => factions.includes(faction)),
        allFactions[0] ?? []
      )
    : [];

  if (shared.length > 0) return uniqueFactions(shared);

  return uniqueFactions(allFactions.flat());
}

function getAutomaticPlayerFaction(generalsList: (General | null)[]) {
  const selected = getSelectedGenerals(generalsList);
  if (selected.length === 0) return null;

  const singleFactionGeneral = selected.find((general) => getGeneralFactions(general).length === 1);
  if (singleFactionGeneral) {
    return getGeneralFactions(singleFactionGeneral)[0] ?? null;
  }

  const possible = getPossiblePlayerFactions(generalsList);
  return possible.length === 1 ? possible[0] : null;
}

function getResolvedPlayerFaction(player: Player) {
  const automaticFaction = getAutomaticPlayerFaction(player.generals);
  if (automaticFaction) return automaticFaction;

  const possible = getPossiblePlayerFactions(player.generals);
  if (player.selectedFaction && possible.includes(player.selectedFaction)) {
    return player.selectedFaction;
  }

  return null;
}

function getNextSelectedFaction(generalsList: (General | null)[], currentSelectedFaction?: string | null) {
  const automaticFaction = getAutomaticPlayerFaction(generalsList);
  if (automaticFaction) return automaticFaction;

  const possible = getPossiblePlayerFactions(generalsList);
  if (currentSelectedFaction && possible.includes(currentSelectedFaction)) {
    return currentSelectedFaction;
  }

  return null;
}


async function loadRoomState(roomCode: string, fallbackMode: GameMode, fallbackVersion: string, fallbackCount: number) {
  if (!supabase) return null;

  let { data: room, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("room_code", roomCode)
    .maybeSingle();

  if (error) throw error;

  if (!room) {
    const { data: createdRoom, error: createRoomError } = await supabase
      .from("rooms")
      .insert({
        room_code: roomCode,
        game_mode: fallbackMode,
        version: fallbackVersion,
        player_count: fallbackCount,
      })
      .select("*")
      .single();

    if (createRoomError) throw createRoomError;
    room = createdRoom;
  }

  const mode = (room.game_mode ?? fallbackMode) as GameMode;
  const version = room.version ?? versionsByMode[mode][0];
  const count = Number(room.player_count ?? fallbackCount);
  const slotCount = mode === "國戰" ? 2 : 1;

  const { data: existingPlayers, error: playersError } = await supabase
    .from("players")
    .select("id, room_id, player_id, name, dead, identity, selected_faction, player_generals(general_id, slot_index)")
    .eq("room_id", room.id)
    .order("player_id");

  if (playersError) throw playersError;

  if (!existingPlayers || existingPlayers.length !== count) {
    await supabase.from("players").delete().eq("room_id", room.id);

    const playersToInsert = createPlayers(count, mode).map((player) => ({
      room_id: room.id,
      player_id: player.id,
      name: player.name,
      dead: player.dead,
      identity: player.identity,
    }));

    const { data: insertedPlayers, error: insertPlayersError } = await supabase
      .from("players")
      .insert(playersToInsert)
      .select("*");

    if (insertPlayersError) throw insertPlayersError;

    const generalsToInsert =
      insertedPlayers?.flatMap((player: any) =>
        Array.from({ length: slotCount }, (_, slotIndex) => ({
          player_id: player.id,
          slot_index: slotIndex,
          general_id: null,
        }))
      ) ?? [];

    if (generalsToInsert.length > 0) {
      const { error: insertGeneralsError } = await supabase
        .from("player_generals")
        .insert(generalsToInsert);

      if (insertGeneralsError) throw insertGeneralsError;
    }
  }

  const { data: finalPlayers, error: finalPlayersError } = await supabase
    .from("players")
    .select("id, room_id, player_id, name, dead, identity, selected_faction, player_generals(general_id, slot_index)")
    .eq("room_id", room.id)
    .order("player_id");

  if (finalPlayersError) throw finalPlayersError;

  const mappedPlayers: Player[] = (finalPlayers ?? []).map((player: any) => {
    const bySlot = new Map<number, string | null>();

    player.player_generals?.forEach((entry: any) => {
      bySlot.set(entry.slot_index, entry.general_id);
    });

    return {
      id: player.player_id,
      dbId: player.id,
      name: player.name,
      dead: Boolean(player.dead),
      identity: player.identity ?? "",
      selectedFaction: player.selected_faction ?? null,
      generals: Array.from({ length: slotCount }, (_, slotIndex) => generalFromId(bySlot.get(slotIndex))),
    };
  });

  return {
    roomId: room.id as string,
    gameMode: mode,
    version,
    playerCount: count,
    players: mappedPlayers,
  };
}

async function resetRoomPlayers(roomId: string, count: number, mode: GameMode) {
  if (!supabase) return createPlayers(count, mode);

  await supabase.from("players").delete().eq("room_id", roomId);

  const playersToInsert = createPlayers(count, mode).map((player) => ({
    room_id: roomId,
    player_id: player.id,
    name: player.name,
    dead: player.dead,
    identity: player.identity,
  }));

  const { data: insertedPlayers, error: insertPlayersError } = await supabase
    .from("players")
    .insert(playersToInsert)
    .select("*");

  if (insertPlayersError) throw insertPlayersError;

  const slotCount = mode === "國戰" ? 2 : 1;
  const generalsToInsert =
    insertedPlayers?.flatMap((player: any) =>
      Array.from({ length: slotCount }, (_, slotIndex) => ({
        player_id: player.id,
        slot_index: slotIndex,
        general_id: null,
      }))
    ) ?? [];

  if (generalsToInsert.length > 0) {
    const { error: insertGeneralsError } = await supabase
      .from("player_generals")
      .insert(generalsToInsert);

    if (insertGeneralsError) throw insertGeneralsError;
  }

  return createPlayers(count, mode).map((player) => {
    const dbPlayer = insertedPlayers?.find((item: any) => item.player_id === player.id);
    return { ...player, dbId: dbPlayer?.id };
  });
}

async function clearRoomGenerals(roomId: string, currentPlayers: Player[], mode: GameMode) {
  if (!supabase) return;

  const slotCount = mode === "國戰" ? 2 : 1;
  const playersWithDbIds = currentPlayers.filter((player) => player.dbId);

  const clearedGenerals = playersWithDbIds.flatMap((player) =>
    Array.from({ length: slotCount }, (_, slotIndex) => ({
      player_id: player.dbId,
      slot_index: slotIndex,
      general_id: null,
      updated_at: new Date().toISOString(),
    }))
  );

  if (clearedGenerals.length > 0) {
    const { error: generalsError } = await supabase
      .from("player_generals")
      .upsert(clearedGenerals, { onConflict: "player_id,slot_index" });

    if (generalsError) throw generalsError;
  }

  if (playersWithDbIds.length > 0) {
    const { error: playersError } = await supabase
      .from("players")
      .update({ dead: false, selected_faction: null, updated_at: new Date().toISOString() })
      .in("id", playersWithDbIds.map((player) => player.dbId));

    if (playersError) throw playersError;
  }

  const { error: roomError } = await supabase
    .from("rooms")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", roomId);

  if (roomError) throw roomError;
}


function Badge({ faction }: { faction: string }) {
  const color = factionColors[faction] ?? factionColors["群"];

  return (
    <span
      style={{
        display: "inline-flex",
        borderRadius: 999,
        border: `1px solid ${color.border}`,
        background: color.bg,
        color: color.text,
        fontSize: 12,
        fontWeight: 800,
        padding: "3px 8px",
      }}
    >
      {faction}
    </span>
  );
}

function FactionBadges({ general }: { general: General }) {
  return (
    <span style={{ display: "inline-flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
      {getGeneralFactions(general).map((faction) => (
        <Badge key={faction} faction={faction} />
      ))}
    </span>
  );
}

export default function SessionApp({
  roomCode,
  initialMode = "國戰",
  initialPlayerCount,
  initialVersion,
}: {
  roomCode: string;
  initialMode?: GameMode;
  initialPlayerCount?: number;
  initialVersion?: string;
}) {
  const safeInitialVersion =
    initialVersion && versionsByMode[initialMode].includes(initialVersion)
      ? initialVersion
      : versionsByMode[initialMode][0];
  const initialLimits = playerLimitsByMode[initialMode];
  const safeInitialPlayerCount =
    typeof initialPlayerCount === "number"
      ? Math.min(Math.max(initialPlayerCount, initialLimits.min), initialLimits.max)
      : initialLimits.defaultCount;

  const [gameMode, setGameMode] = useState<GameMode>(initialMode);
  const [version, setVersion] = useState(safeInitialVersion);
  const [playerCount, setPlayerCount] = useState(safeInitialPlayerCount);
  const [players, setPlayers] = useState<Player[]>(() =>
    createPlayers(safeInitialPlayerCount, initialMode)
  );
  const [picker, setPicker] = useState<{ playerId: number; slotIndex: number } | null>(null);
  const [adviceOpen, setAdviceOpen] = useState(false);
  const [adviceQuery, setAdviceQuery] = useState("");
  const [adviceGeneralIds, setAdviceGeneralIds] = useState<string[]>([]);
  const [factionPicker, setFactionPicker] = useState<{ playerId: number; factions: string[] } | null>(null);
  const [query, setQuery] = useState("");
  const [savedAt, setSavedAt] = useState("連線中...");
  const [roomDbId, setRoomDbId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window === "undefined" ? true : window.matchMedia("(max-width: 640px)").matches
  );
  const isApplyingRemote = useRef(false);

  const filteredGenerals = useMemo(() => {
    const keyword = normalizeChineseSearch(query.trim());

    return generals.filter((general) => {
      const searchableText = normalizeChineseSearch(
        [general.name, general.faction, ...(general.factions ?? []), general.id].join(" ")
      );

      const matchesQuery = !keyword || searchableText.includes(keyword);

      return (
        matchesQuery &&
        general.modes.includes(gameMode) &&
        general.versions.includes(version)
      );
    });
  }, [gameMode, query, version]);

  const adviceAvailableGenerals = useMemo(() => {
    const keyword = normalizeChineseSearch(adviceQuery.trim());

    return generals.filter((general) => {
      const searchableText = normalizeChineseSearch(
        [general.name, general.faction, ...(general.factions ?? []), general.id].join(" ")
      );

      return (
        general.modes.includes(gameMode) &&
        general.versions.includes(version) &&
        (!keyword || searchableText.includes(keyword))
      );
    });
  }, [adviceQuery, gameMode, version]);

  const adviceGenerals = useMemo(
    () => adviceGeneralIds.map((id) => generalFromId(id)).filter(Boolean) as General[],
    [adviceGeneralIds]
  );

  const advicePairs = useMemo(() => {
    const pairs: { first: General; second: General; factions: string[] }[] = [];

    for (let i = 0; i < adviceGenerals.length; i++) {
      for (let j = i + 1; j < adviceGenerals.length; j++) {
        const first = adviceGenerals[i];
        const second = adviceGenerals[j];
        const shared = getGeneralFactions(first).filter((faction) => getGeneralFactions(second).includes(faction));

        if (shared.length > 0) {
          pairs.push({ first, second, factions: shared });
        }
      }
    }

    return pairs;
  }, [adviceGenerals]);

  const advicePrompt = useMemo(() => {
    const names = adviceGenerals.map((general) => general.name).join("、") || "尚未選擇";
    const pairs =
      advicePairs.length > 0
        ? advicePairs
            .map((pair) => `${pair.first.name}+${pair.second.name}（${pair.factions.join("/")}）`)
            .join("、")
        : "目前候選中沒有合法同勢力組合，請先依截圖檢查是否有雙勢力可配。";

    return [
      `請分析以下國戰候選武將，推薦最佳 2 張組合。`,
      `目前模式：${gameMode} / ${version}`,
      `候選武將：${names}`,
      `硬性規則：只能推薦同勢力組合；雙勢力武將可視為任一包含勢力；不得推薦不同勢力組合。`,
      `請只根據截圖中的武將牌面技能判斷，不要使用其他版本記憶。`,
      `請排名前 3 組，說明優缺點、新手難度、容錯率與操作提醒。`,
      `系統先檢查出的合法配對：${pairs}`,
    ].join("\n");
  }, [adviceGenerals, advicePairs, gameMode, version]);

  const factionStats = useMemo(() => {
    const stats: Record<string, number> = { 魏: 0, 蜀: 0, 吳: 0, 群: 0, 晉: 0 };

    players.forEach((player) => {
      const faction = getResolvedPlayerFaction(player);

      if (faction && stats[faction] !== undefined) {
        stats[faction] += 1;
      }
    });

    return stats;
  }, [players]);


  async function refreshFromSupabase(showSaved = false) {
    if (!supabase) {
      setSavedAt("本機模式");
      setIsReady(true);
      return;
    }

    try {
      const state = await loadRoomState(roomCode, gameMode, version, playerCount);
      if (!state) return;

      isApplyingRemote.current = true;
      setRoomDbId(state.roomId);
      setGameMode(state.gameMode);
      setVersion(state.version);
      setPlayerCount(state.playerCount);
      setPlayers(state.players);
      setIsReady(true);
      setSavedAt(showSaved ? "已同步" : "已連線");
      queueMicrotask(() => {
        isApplyingRemote.current = false;
      });
    } catch (error) {
      console.error("Supabase load failed:", error);
      setSavedAt("Supabase 連線失敗，本機模式");
      setIsReady(true);
      isApplyingRemote.current = false;
    }
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const updateMobileState = () => setIsMobile(mediaQuery.matches);

    updateMobileState();
    mediaQuery.addEventListener("change", updateMobileState);

    return () => {
      mediaQuery.removeEventListener("change", updateMobileState);
    };
  }, []);

  useEffect(() => {
    let active = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;

    function scheduleRefresh() {
      if (refreshTimer) clearTimeout(refreshTimer);

      refreshTimer = setTimeout(() => {
        refreshFromSupabase(true);
      }, 35);
    }

    async function init() {
      if (!supabase) {
        setSavedAt("本機模式");
        setIsReady(true);
        return;
      }

      try {
        const state = await loadRoomState(roomCode, gameMode, version, playerCount);
        if (!active || !state) return;

        isApplyingRemote.current = true;
        setRoomDbId(state.roomId);
        setGameMode(state.gameMode);
        setVersion(state.version);
        setPlayerCount(state.playerCount);
        setPlayers(state.players);
        setIsReady(true);
        setSavedAt("已連線");
        queueMicrotask(() => {
          isApplyingRemote.current = false;
        });

        channel = supabase
          .channel(`room:${state.roomId}`)
          .on("postgres_changes", { event: "*", schema: "public", table: "rooms", filter: `id=eq.${state.roomId}` }, scheduleRefresh)
          .on("postgres_changes", { event: "*", schema: "public", table: "players", filter: `room_id=eq.${state.roomId}` }, scheduleRefresh)
          .on("postgres_changes", { event: "*", schema: "public", table: "player_generals" }, scheduleRefresh)
          .subscribe();
      } catch (error) {
        console.error("Supabase init failed:", error);
        if (!active) return;
        setSavedAt("Supabase 連線失敗，本機模式");
        setIsReady(true);
        isApplyingRemote.current = false;
      }
    }

    init();

    return () => {
      active = false;

      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }

      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode]);

  function markChanged() {
    if (!isApplyingRemote.current) {
      setSavedAt(supabase ? "同步中..." : "有未本機備份變更");
    }
  }

  async function changeMode(nextMode: GameMode) {
    const limits = playerLimitsByMode[nextMode];
    const nextCount = Math.min(Math.max(playerCount, limits.min), limits.max);
    const nextVersion = versionsByMode[nextMode][0];

    setGameMode(nextMode);
    setVersion(nextVersion);
    setPlayerCount(nextCount);
    setPlayers(createPlayers(nextCount, nextMode));
    markChanged();

    if (supabase && roomDbId) {
      try {
        isApplyingRemote.current = true;
        await supabase
          .from("rooms")
          .update({
            game_mode: nextMode,
            version: nextVersion,
            player_count: nextCount,
            updated_at: new Date().toISOString(),
          })
          .eq("id", roomDbId);

        const freshPlayers = await resetRoomPlayers(roomDbId, nextCount, nextMode);
        setPlayers(freshPlayers);
        setSavedAt("已同步");
      } catch (error) {
        console.error("changeMode failed:", error);
        setSavedAt("同步失敗");
      } finally {
        isApplyingRemote.current = false;
      }
    }
  }

  async function changeVersion(nextVersion: string) {
    setVersion(nextVersion);
    setPlayers(createPlayers(playerCount, gameMode));
    markChanged();

    if (supabase && roomDbId) {
      try {
        isApplyingRemote.current = true;
        await supabase
          .from("rooms")
          .update({ version: nextVersion, updated_at: new Date().toISOString() })
          .eq("id", roomDbId);

        const freshPlayers = await resetRoomPlayers(roomDbId, playerCount, gameMode);
        setPlayers(freshPlayers);
        setSavedAt("已同步");
      } catch (error) {
        console.error("changeVersion failed:", error);
        setSavedAt("同步失敗");
      } finally {
        isApplyingRemote.current = false;
      }
    }
  }

  async function changePlayerCount(nextCount: number) {
    setPlayerCount(nextCount);
    setPlayers(createPlayers(nextCount, gameMode));
    markChanged();

    if (supabase && roomDbId) {
      try {
        isApplyingRemote.current = true;
        await supabase
          .from("rooms")
          .update({ player_count: nextCount, updated_at: new Date().toISOString() })
          .eq("id", roomDbId);

        const freshPlayers = await resetRoomPlayers(roomDbId, nextCount, gameMode);
        setPlayers(freshPlayers);
        setSavedAt("已同步");
      } catch (error) {
        console.error("changePlayerCount failed:", error);
        setSavedAt("同步失敗");
      } finally {
        isApplyingRemote.current = false;
      }
    }
  }

  async function updatePlayer(playerId: number, patch: Partial<Player>) {
    const targetPlayer = players.find((player) => player.id === playerId);
    const targetDbId = targetPlayer?.dbId;

    setPlayers((current) =>
      current.map((player) => {
        if (player.id !== playerId) return player;
        return { ...player, ...patch };
      })
    );

    markChanged();

    if (supabase && targetDbId) {
      const dbPatch: Record<string, unknown> = {};
      if (patch.name !== undefined) dbPatch.name = patch.name;
      if (patch.dead !== undefined) dbPatch.dead = patch.dead;
      if (patch.identity !== undefined) dbPatch.identity = patch.identity;

      try {
        const { error } = await supabase
          .from("players")
          .update({ ...dbPatch, updated_at: new Date().toISOString() })
          .eq("id", targetDbId);

        if (error) throw error;

        setSavedAt("已同步");
      } catch (error) {
        console.error("updatePlayer failed:", error);
        setSavedAt("同步失敗");
      }
    } else if (supabase && !targetDbId) {
      console.error("updatePlayer failed: missing player dbId", {
        playerId,
        players,
      });
      setSavedAt("同步失敗：玩家資料尚未載入");
    }
  }

  async function chooseGeneral(general: General) {
    if (!picker) return;

    const selectedPlayerId = picker.playerId;
    const selectedSlot = picker.slotIndex;
    const targetPlayer = players.find((player) => player.id === selectedPlayerId);
    const targetDbId = targetPlayer?.dbId;

    const nextGenerals = [...(targetPlayer?.generals ?? [])];
    nextGenerals[selectedSlot] = general;

    const nextSelectedFaction = getNextSelectedFaction(
      nextGenerals,
      targetPlayer?.selectedFaction
    );
    const possibleFactions = getPossiblePlayerFactions(nextGenerals);
    const shouldAskFaction =
      gameMode === "國戰" &&
      !nextSelectedFaction &&
      possibleFactions.length > 1;

    setPlayers((current) =>
      current.map((player) => {
        if (player.id !== selectedPlayerId) return player;

        const updatedGenerals = [...player.generals];
        updatedGenerals[selectedSlot] = general;

        return {
          ...player,
          generals: updatedGenerals,
          selectedFaction: getNextSelectedFaction(updatedGenerals, player.selectedFaction),
        };
      })
    );

    setPicker(null);
    setQuery("");
    setFactionPicker(shouldAskFaction ? { playerId: selectedPlayerId, factions: possibleFactions } : null);
    markChanged();

    if (supabase && targetDbId) {
      try {
        const { error } = await supabase
          .from("player_generals")
          .upsert(
            {
              player_id: targetDbId,
              slot_index: selectedSlot,
              general_id: general.id,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "player_id,slot_index" }
          );

        if (error) throw error;

        setSavedAt("已同步");
        if (roomDbId) {
          await supabase
            .from("rooms")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", roomDbId);
        }
      } catch (error) {
        console.error("chooseGeneral failed:", error);
        setSavedAt("同步失敗");
      }
    } else if (supabase && !targetDbId) {
      console.error("chooseGeneral failed: missing player dbId", {
        selectedPlayerId,
        players,
      });
      setSavedAt("同步失敗：玩家資料尚未載入");
    }
  }

  async function removeGeneral(playerId: number, slotIndex: number) {
    const targetPlayer = players.find((player) => player.id === playerId);
    const targetDbId = targetPlayer?.dbId;

    setPlayers((current) =>
      current.map((player) => {
        if (player.id !== playerId) return player;

        const nextGenerals = [...player.generals];
        nextGenerals[slotIndex] = null;

        return {
          ...player,
          generals: nextGenerals,
          selectedFaction: getNextSelectedFaction(nextGenerals, player.selectedFaction),
        };
      })
    );

    markChanged();

    if (supabase && targetDbId) {
      try {
        const { error } = await supabase
          .from("player_generals")
          .upsert(
            {
              player_id: targetDbId,
              slot_index: slotIndex,
              general_id: null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "player_id,slot_index" }
          );

        if (error) throw error;

        setSavedAt("已同步");
        if (roomDbId) {
          await supabase
            .from("rooms")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", roomDbId);
        }
      } catch (error) {
        console.error("removeGeneral failed:", error);
        setSavedAt("同步失敗");
      }
    } else if (supabase && !targetDbId) {
      console.error("removeGeneral failed: missing player dbId", {
        playerId,
        players,
      });
      setSavedAt("同步失敗：玩家資料尚未載入");
    }
  }

  async function clearAll() {
    const clearedPlayers = players.map((player) => ({
      ...player,
      generals: player.generals.map(() => null),
      dead: false,
      selectedFaction: null,
    }));

    setPlayers(clearedPlayers);
    markChanged();

    if (supabase && roomDbId) {
      try {
        isApplyingRemote.current = true;
        await clearRoomGenerals(roomDbId, players, gameMode);
        await refreshFromSupabase(true);
        setSavedAt("已同步");
      } catch (error) {
        console.error("clearAll failed:", error);
        setSavedAt("同步失敗");
      } finally {
        isApplyingRemote.current = false;
      }
    }
  }

  function toggleAdviceGeneral(general: General) {
    setAdviceGeneralIds((current) => {
      if (current.includes(general.id)) {
        return current.filter((id) => id !== general.id);
      }

      return current.length >= 7 ? current : [...current, general.id];
    });
  }

  async function copyAdvicePrompt() {
    await navigator.clipboard?.writeText(advicePrompt);
  }

  async function choosePlayerFaction(playerId: number, faction: string) {
    const targetPlayer = players.find((player) => player.id === playerId);

    setPlayers((current) =>
      current.map((player) =>
        player.id === playerId ? { ...player, selectedFaction: faction } : player
      )
    );

    if (supabase && targetPlayer?.dbId) {
      try {
        await supabase
          .from("players")
          .update({
            selected_faction: faction,
            updated_at: new Date().toISOString(),
          })
          .eq("id", targetPlayer.dbId);
      } catch (error) {
        console.error("choosePlayerFaction failed:", error);
      }
    }

    setFactionPicker(null);
    markChanged();
  }

  async function saveSession() {
    const time = new Date().toLocaleTimeString("zh-TW", { hour12: false });

    localStorage.setItem(
      `sgs-room-${roomCode}`,
      JSON.stringify({ roomCode, gameMode, version, playerCount, players, savedAt: time })
    );

    if (supabase && roomDbId) {
      try {
        await supabase
          .from("rooms")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", roomDbId);
      } catch (error) {
        console.error("saveSession failed:", error);
      }
    }

    setSavedAt(`已保存 · ${time}`);
  }

  function copyShareLink() {
    const url = `${window.location.origin}/s/${roomCode}`;
    navigator.clipboard?.writeText(url);
  }

  const isIdentityMode = gameMode === "身分局";

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <SiteNav currentLabel="牌局" />

        <div style={styles.sectionLabel}>
          <span style={styles.labelLine} />
          牌局
        </div>

        <h1 style={styles.title}>三國殺牌局記錄</h1>

        <p style={styles.description}>
          房間 <strong>{roomCode}</strong> · 目前 {gameMode} / {version} · {supabase ? (isReady ? "多人同步已連線" : "連線中") : "本機模式"}
        </p>
      </header>

      <main style={styles.main}>
        <section style={styles.controlPanel}>
          <label style={styles.field}>
            <span style={styles.fieldLabel}>玩法模式</span>
            <select
              value={gameMode}
              onChange={(event) => changeMode(event.target.value as GameMode)}
              style={styles.select}
            >
              {modes.map((mode) => (
                <option key={mode}>{mode}</option>
              ))}
            </select>
          </label>

          <label style={styles.field}>
            <span style={styles.fieldLabel}>版本</span>
            <select
              value={version}
              onChange={(event) => changeVersion(event.target.value)}
              style={styles.select}
            >
              {versionsByMode[gameMode].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <label style={styles.field}>
            <span style={styles.fieldLabel}>玩家數</span>
            <select
              value={playerCount}
              onChange={(event) => changePlayerCount(Number(event.target.value))}
              style={styles.select}
            >
              {Array.from(
                { length: playerLimitsByMode[gameMode].max - playerLimitsByMode[gameMode].min + 1 },
                (_, index) => index + playerLimitsByMode[gameMode].min
              ).map((count) => (
                <option key={count}>{count}</option>
              ))}
            </select>
          </label>

          <button
            onClick={() => setAdviceOpen(true)}
            style={styles.primaryButton}
            disabled={gameMode !== "國戰"}
            title={gameMode === "國戰" ? "產生 AI 選將分析截圖" : "第一版先支援國戰"}
          >
            選將建議
          </button>

          <button onClick={clearAll} style={styles.dangerButton}>
            重置牌局
          </button>

          <div style={styles.saveArea}>
            <span style={styles.savedText}>{savedAt}</span>
            <button onClick={() => refreshFromSupabase(true)} style={styles.primaryButton}>
              刷新頁面
            </button>
          </div>
        </section>

        <section style={styles.sharePanel}>
          <div>
            <div style={styles.panelTitle}>分享牌局</div>
            <code style={styles.code}>/s/{roomCode}</code>
          </div>

          <button onClick={copyShareLink} style={styles.secondaryButton}>
            複製連結
          </button>
        </section>

        {gameMode === "國戰" && (
          <section style={styles.statsGrid}>
            {factionOrder.map((faction) => (
              <div key={faction} style={styles.statCard}>
                <Badge faction={faction} />
                <div style={styles.statNumber}>{factionStats[faction] ?? 0}</div>
              </div>
            ))}
          </section>
        )}

        <section
          style={{
            ...styles.playersGrid,
            gridTemplateColumns: isMobile
              ? isIdentityMode
                ? "repeat(2, minmax(0, 1fr))"
                : "1fr"
              : isIdentityMode
                ? "repeat(auto-fit, minmax(min(100%, 240px), 300px))"
                : "repeat(auto-fit, minmax(min(100%, 520px), 1fr))",
          }}
        >
          {players.map((player) => {
            const filled = player.generals.filter(Boolean).length;

            return (
              <article
                key={player.id}
                style={{
                  ...styles.playerCard,
                  ...(isIdentityMode ? styles.identityPlayerCard : {}),
                  ...(isMobile ? styles.mobilePlayerCard : {}),
                  ...(isMobile && isIdentityMode ? styles.mobileIdentityPlayerCard : {}),
                  opacity: player.dead ? 0.45 : 1,
                  filter: player.dead ? "grayscale(1)" : "none",
                }}
              >
                <div style={styles.cornerTop} />
                <div style={styles.cornerBottom} />

                <div
                  style={{
                    ...styles.playerHeader,
                    ...(isMobile && isIdentityMode ? styles.mobileIdentityPlayerHeader : {}),
                  }}
                >
                  <input
                    value={player.name}
                    onChange={(event) => updatePlayer(player.id, { name: event.target.value })}
                    style={{
                      ...styles.playerInput,
                      ...(isMobile && isIdentityMode ? styles.mobileIdentityPlayerInput : {}),
                    }}
                  />

                  {gameMode === "身分局" && (
                    <select
                      value={player.identity}
                      onChange={(event) =>
                        updatePlayer(player.id, { identity: event.target.value })
                      }
                      style={{
                        ...styles.identitySelect,
                        ...(isMobile && isIdentityMode ? styles.mobileIdentitySelect : {}),
                      }}
                    >
                      {identities.map((identity) => (
                        <option key={identity}>{identity}</option>
                      ))}
                    </select>
                  )}

                  {gameMode === "國戰" && getResolvedPlayerFaction(player) && (
                    <Badge faction={getResolvedPlayerFaction(player)!} />
                  )}

                  <span style={styles.slotCount}>
                    {filled}/{player.generals.length}
                  </span>

                  <button
                    onClick={() => updatePlayer(player.id, { dead: !player.dead })}
                    style={styles.deadButton}
                  >
                    死
                  </button>
                </div>

                <div
                  style={{
                    ...styles.generalSlots,
                    gridTemplateColumns: isIdentityMode ? "1fr" : "repeat(2, minmax(0, 1fr))",
                    gap: isMobile ? 10 : 16,
                  }}
                >
                  {player.generals.map((general, slotIndex) => {
                    const isPickingThisSlot =
                      picker?.playerId === player.id && picker.slotIndex === slotIndex;

                    return (
                      <div
                        key={slotIndex}
                        onClick={() => {
                          if (!general) {
                            setPicker({ playerId: player.id, slotIndex });
                            setQuery("");
                          }
                        }}
                        style={{
                          ...styles.generalSlot,
                          ...(isIdentityMode ? styles.identityGeneralSlot : {}),
                          ...(isMobile && isIdentityMode ? styles.mobileIdentityGeneralSlot : {}),
                        }}
                      >
                        {general ? (
                          <div style={styles.generalCard}>
                            <div style={styles.generalArt}>
                              {general.image ? (
                                <img src={general.image} alt={general.name} style={styles.generalImage} />
                              ) : (
                                <span style={styles.generalInitial}>{general.name.slice(0, 1)}</span>
                              )}

                              <div style={styles.generalBadge}>
                                <FactionBadges general={general} />
                              </div>
                            </div>

                            <span
                              onClick={(event) => {
                                event.stopPropagation();
                                removeGeneral(player.id, slotIndex);
                              }}
                              style={styles.floatingRemoveButton}
                              aria-label={`移除${general.name}`}
                              title="移除武將"
                            >
                              ×
                            </span>
                          </div>
                        ) : isPickingThisSlot ? (
                          <div
                            style={styles.inlinePicker}
                            onClick={(event) => event.stopPropagation()}
                          >
                            <input
                              value={query}
                              onChange={(event) => setQuery(event.target.value)}
                              autoFocus
                              placeholder="搜尋武將..."
                              style={styles.inlinePickerInput}
                            />

                            <button
                              type="button"
                              onClick={() => {
                                setPicker(null);
                                setQuery("");
                              }}
                              style={styles.inlinePickerCancel}
                            >
                              取消
                            </button>

                            <div style={styles.inlinePickerList}>
                              {filteredGenerals.map((general) => (
                                <button
                                  key={general.id}
                                  type="button"
                                  onClick={() => chooseGeneral(general)}
                                  style={styles.inlinePickerItem}
                                >
                                  <div style={styles.inlinePickerThumb}>
                                    {general.image ? (
                                      <img
                                        src={general.image}
                                        alt={general.name}
                                        style={styles.inlinePickerThumbImage}
                                      />
                                    ) : (
                                      <span style={styles.inlinePickerInitial}>
                                        {general.name.slice(0, 1)}
                                      </span>
                                    )}
                                  </div>

                                  <span style={styles.inlinePickerName}>{general.name}</span>
                                  <FactionBadges general={general} />
                                </button>
                              ))}

                              {filteredGenerals.length === 0 && (
                                <div style={styles.inlinePickerEmpty}>
                                  沒有符合的武將
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div style={styles.emptySlot}>
                            <div style={styles.plus}>＋</div>
                            <div>選擇武將 {slotIndex + 1}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </section>
      </main>

      {adviceOpen && (
        <div style={styles.modalBackdrop}>
          <div style={styles.adviceModal}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>國戰選將建議</h2>
                <p style={styles.adviceIntro}>
                  選 6-7 張候選武將，手機截圖下方分析卡，再丟給 AI。圖片會保留完整牌面，讓 AI 直接讀技能。
                </p>
              </div>

              <button type="button" onClick={() => setAdviceOpen(false)} style={styles.closeButton}>
                ×
              </button>
            </div>

            <div style={styles.adviceActions}>
              <button type="button" onClick={copyAdvicePrompt} style={styles.primaryButton}>
                複製 Prompt
              </button>
              <a href="https://chatgpt.com/" target="_blank" rel="noreferrer" style={styles.aiLink}>
                ChatGPT
              </a>
              <a href="https://gemini.google.com/" target="_blank" rel="noreferrer" style={styles.aiLink}>
                Gemini
              </a>
              <a href="https://claude.ai/" target="_blank" rel="noreferrer" style={styles.aiLink}>
                Claude
              </a>
              <a href="https://chat.deepseek.com/" target="_blank" rel="noreferrer" style={styles.aiLink}>
                DeepSeek
              </a>
            </div>

            <label style={styles.adviceSearchLabel}>
              <span>搜尋候選武將</span>
              <input
                value={adviceQuery}
                onChange={(event) => setAdviceQuery(event.target.value)}
                placeholder="輸入武將名、勢力或編號"
                style={styles.searchInput}
              />
            </label>

            <div style={styles.advicePickerGrid}>
              {adviceAvailableGenerals.slice(0, 36).map((general) => {
                const selected = adviceGeneralIds.includes(general.id);

                return (
                  <button
                    key={general.id}
                    type="button"
                    onClick={() => toggleAdviceGeneral(general)}
                    style={{
                      ...styles.advicePickerButton,
                      ...(selected ? styles.advicePickerButtonSelected : {}),
                    }}
                  >
                    <span>{selected ? "已選" : "加入"}</span>
                    <strong>{general.name}</strong>
                    <small>{getGeneralFactions(general).join(" / ")}</small>
                  </button>
                );
              })}
            </div>

            <section style={styles.screenshotCard}>
              <div style={styles.screenshotHeader}>
                <div>
                  <span style={styles.panelTitle}>AI 分析截圖卡</span>
                  <h3 style={styles.screenshotTitle}>國戰候選武將組合分析</h3>
                </div>
                <div style={styles.screenshotMeta}>{gameMode} / {version}</div>
              </div>

              <pre style={styles.promptBlock}>{advicePrompt}</pre>

              <div style={styles.legalPairs}>
                <strong>合法同勢力配對</strong>
                <span>
                  {advicePairs.length > 0
                    ? advicePairs.map((pair) => `${pair.first.name}+${pair.second.name}`).join("、")
                    : "尚未形成合法配對"}
                </span>
              </div>

              <div style={styles.screenshotGeneralGrid}>
                {adviceGenerals.map((general) => (
                  <article key={general.id} style={styles.screenshotGeneralCard}>
                    <div style={styles.screenshotGeneralImageWrap}>
                      {general.image ? (
                        <img src={general.image} alt={general.name} style={styles.screenshotGeneralImage} />
                      ) : (
                        <span style={styles.generalInitial}>{general.name.slice(0, 1)}</span>
                      )}
                    </div>
                    <div style={styles.screenshotGeneralName}>
                      <strong>{general.name}</strong>
                      <span>{getGeneralFactions(general).join(" / ")}</span>
                    </div>
                  </article>
                ))}

                {adviceGenerals.length === 0 && (
                  <div style={styles.adviceEmpty}>先加入 6-7 張候選武將，這裡會生成可截圖的分析卡。</div>
                )}
              </div>
            </section>
          </div>
        </div>
      )}

      {factionPicker && (
        <div style={styles.factionPickerBackdrop}>
          <div style={styles.factionPickerModal}>
            <h2 style={styles.factionPickerTitle}>選擇玩家勢力</h2>
            <p style={styles.factionPickerDescription}>
              這位玩家目前的武將無法自動判定勢力，請選擇要公開的勢力。
            </p>

            <div style={styles.factionPickerActions}>
              {factionPicker.factions.map((faction) => (
                <button
                  key={faction}
                  type="button"
                  onClick={() => choosePlayerFaction(factionPicker.playerId, faction)}
                  style={styles.factionChoiceButton}
                >
                  <Badge faction={faction} />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setFactionPicker(null)}
              style={styles.factionPickerCancel}
            >
              先不選
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    overflowX: "hidden",
    background:
      "radial-gradient(circle at 50% 0, rgba(218,171,93,.13), transparent 28%), linear-gradient(180deg, rgba(0,0,0,.38), #050504 58%), url('/images/home/hero-background.png') center top / cover fixed no-repeat",
    color: "#f4e4c1",
    fontFamily: '"Noto Serif TC", "Microsoft JhengHei", serif',
  },
  header: {
    maxWidth: 1180,
    boxSizing: "border-box",
    margin: "0 auto",
    padding: "20px 20px 18px",
  },
  nav: {
    height: 42,
    display: "flex",
    alignItems: "center",
    gap: 18,
    borderBottom: "1px solid rgba(218,171,93,.28)",
    marginBottom: 28,
    color: "#cbb487",
    fontSize: 13,
  },
  logo: {
    color: "#fff0d0",
    marginRight: "auto",
    fontWeight: 700,
  },
  homeNavLink: {
    color: "#e7b865",
    textDecoration: "none",
    fontWeight: 700,
  },
  navLink: {
    color: "#cbb487",
    textDecoration: "none",
    fontWeight: 600,
  },
  currentNavItem: {
    color: "#e7b865",
    fontWeight: 700,
  },
  sectionLabel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#e2b469",
    fontSize: 13,
    fontWeight: 800,
    marginBottom: 10,
  },
  labelLine: {
    width: 22,
    height: 1,
    background: "#e2b469",
    display: "inline-block",
  },
  title: {
    margin: 0,
    color: "#fff0d0",
    fontSize: 42,
    lineHeight: 1.15,
    letterSpacing: 1,
    fontWeight: 600,
  },
  description: {
    marginTop: 12,
    marginBottom: 0,
    color: "#d8bd88",
    fontSize: 15,
    lineHeight: 1.8,
  },
  main: {
  width: "100%",
  maxWidth: 1180,
  boxSizing: "border-box",
  margin: "0 auto",
  padding: "0 4px 50px",
  },
  controlPanel: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "end",
    gap: 12,
    border: "1px solid rgba(218,171,93,.42)",
    background: "linear-gradient(135deg, rgba(23,18,12,.94), rgba(7,8,7,.94))",
    borderRadius: 4,
    padding: 16,
    marginBottom: 16,
    boxShadow: "inset 0 0 0 1px rgba(0,0,0,.82), 0 16px 36px rgba(0,0,0,.32)",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    minWidth: 140,
  },
  fieldLabel: {
    color: "#d9b574",
    fontSize: 13,
    fontWeight: 700,
  },
  select: {
    height: 38,
    background: "rgba(5,5,4,.78)",
    color: "#f7ead3",
    border: "1px solid rgba(218,171,93,.36)",
    borderRadius: 4,
    padding: "0 10px",
  },
  dangerButton: {
    height: 38,
    background: "transparent",
    color: "#f2c778",
    border: "1px solid rgba(218,171,93,.5)",
    borderRadius: 4,
    padding: "0 16px",
    fontWeight: 700,
    cursor: "pointer",
  },
  primaryButton: {
    height: 38,
    background: "linear-gradient(180deg, rgba(103,69,21,.92), rgba(45,31,13,.94))",
    color: "#ffe4a5",
    border: "1px solid rgba(242,204,124,.72)",
    borderRadius: 4,
    padding: "0 18px",
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryButton: {
    background: "rgba(5,5,4,.72)",
    color: "#f4e4c1",
    border: "1px solid rgba(218,171,93,.38)",
    borderRadius: 4,
    padding: "8px 16px",
    fontWeight: 700,
    cursor: "pointer",
  },
  saveArea: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  savedText: {
    color: "#c8aa78",
    fontSize: 13,
  },
  sharePanel: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    border: "1px solid rgba(218,171,93,.38)",
    background: "linear-gradient(135deg, rgba(23,18,12,.9), rgba(7,8,7,.94))",
    borderRadius: 4,
    padding: 16,
    marginBottom: 16,
  },
  panelTitle: {
    color: "#e2b469",
    fontSize: 13,
    fontWeight: 900,
    marginBottom: 8,
  },
  code: {
    display: "inline-block",
    color: "#f7ead3",
    border: "1px solid rgba(218,171,93,.32)",
    borderRadius: 4,
    background: "rgba(5,5,4,.72)",
    padding: "7px 10px",
    fontSize: 13,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    background: "linear-gradient(180deg, rgba(20,15,10,.94), rgba(7,8,7,.96))",
    border: "1px solid rgba(218,171,93,.38)",
    borderRadius: 4,
    padding: 14,
  },
  statNumber: {
    marginTop: 10,
    fontSize: 32,
    fontWeight: 900,
  },
  playersGrid: {
    display: "grid",
    gap: 18,
  },
  playerCard: {
    position: "relative",
    minWidth: 0,
    background: "linear-gradient(180deg, rgba(20,15,10,.96), rgba(8,8,6,.98))",
    border: "1px solid rgba(218,171,93,.42)",
    borderRadius: 4,
    padding: 18,
    boxShadow: "inset 0 0 0 1px rgba(0,0,0,.78), 0 16px 34px rgba(0,0,0,.34)",
  },
  identityPlayerCard: {
    maxWidth: 320,
  },
  mobilePlayerCard: {
    padding: 10,
  },
  mobileIdentityPlayerCard: {
    padding: 8,
  },
  cornerTop: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 18,
    height: 18,
    borderLeft: "1px solid #e2b469",
    borderTop: "1px solid #e2b469",
    opacity: 0.8,
  },
  cornerBottom: {
    position: "absolute",
    right: 8,
    bottom: 8,
    width: 18,
    height: 18,
    borderRight: "1px solid #e2b469",
    borderBottom: "1px solid #e2b469",
    opacity: 0.8,
  },
  playerHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  mobileIdentityPlayerHeader: {
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
  },
  playerInput: {
    height: 42,
    flex: 1,
    background: "rgba(5,5,4,.72)",
    color: "#f7ead3",
    border: "1px solid rgba(218,171,93,.32)",
    borderRadius: 4,
    padding: "0 12px",
    minWidth: 90,
    fontSize: 15,
  },
  mobileIdentityPlayerInput: {
    flex: "1 1 100%",
    height: 34,
    minWidth: 0,
    fontSize: 13,
    padding: "0 9px",
  },
  identitySelect: {
    height: 42,
    background: "rgba(5,5,4,.72)",
    color: "#f7ead3",
    border: "1px solid rgba(218,171,93,.32)",
    borderRadius: 4,
    padding: "0 8px",
  },
  slotCount: {
    background: "#d9ae6a",
    color: "#15100a",
    borderRadius: 999,
    padding: "5px 10px",
    fontSize: 12,
    fontWeight: 900,
  },
  deadButton: {
    background: "rgba(32,22,14,.88)",
    color: "#f2c778",
    border: "1px solid rgba(218,171,93,.35)",
    borderRadius: 4,
    height: 42,
    width: 44,
    fontWeight: 900,
    cursor: "pointer",
  },
  generalSlots: {
    display: "grid",
    minWidth: 0,
    gap: 16,
    alignItems: "start",
  },
  generalSlot: {
    position: "relative",
    width: "100%",
    minWidth: 0,
    aspectRatio: "2 / 3",
    height: "auto",
    background: "rgba(45,34,20,.72)",
    border: "1px dashed rgba(218,171,93,.42)",
    borderRadius: 4,
    overflow: "hidden",
    color: "#d6d3d1",
    cursor: "pointer",
    padding: 0,
  },
  identityGeneralSlot: {
    height: 330,
  },
  mobileIdentitySelect: {
    flex: "1 1 auto",
    height: 32,
    minWidth: 0,
    fontSize: 12,
    padding: "0 5px",
  },
  mobileIdentityGeneralSlot: {
    height: "auto",
    aspectRatio: "2 / 3",
  },
  generalCard: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    background: "#070706",
  },
  generalArt: {
    flex: 1,
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    background: "linear-gradient(135deg, #17120d, #3a2c19)",
  },
  generalImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  generalInitial: {
    fontSize: 90,
    fontWeight: 900,
    color: "#d6d3d1",
  },
  generalBadge: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  generalFooter: {
    height: 46,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 14px",
    borderTop: "1px solid #292524",
    color: "#f5f5f4",
    background: "#14100e",
    fontSize: 16,
  },
  removeButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
    borderRadius: 999,
    background: "#7f1d1d",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 900,
  },
  floatingRemoveButton: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 20,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    borderRadius: 999,
    background: "rgba(226,232,240,.86)",
    color: "#334155",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 22,
    lineHeight: 1,
    border: "1px solid rgba(255,255,255,.78)",
    boxShadow: "0 4px 14px rgba(0,0,0,.38)",
    backdropFilter: "blur(3px)",
  },
  inlinePicker: {
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    background: "#1d1713",
    padding: 10,
    gap: 8,
  },
  inlinePickerInput: {
    width: "100%",
    height: 40,
    background: "#14100e",
    color: "#f5f5f4",
    border: "1px solid #57534e",
    borderRadius: 4,
    padding: "0 10px",
    fontSize: 14,
    outline: "none",
  },
  inlinePickerCancel: {
    alignSelf: "center",
    background: "transparent",
    border: "none",
    color: "#a68a64",
    cursor: "pointer",
    fontSize: 13,
    padding: "2px 10px",
  },
  inlinePickerList: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    paddingRight: 4,
  },
  inlinePickerItem: {
    width: "100%",
    minHeight: 52,
    display: "grid",
    gridTemplateColumns: "42px 1fr auto",
    alignItems: "center",
    gap: 10,
    border: "1px solid rgba(185,28,28,.35)",
    borderRadius: 6,
    background: "#d9c48f",
    color: "#fef3c7",
    padding: 6,
    cursor: "pointer",
    textAlign: "left",
  },
  inlinePickerThumb: {
    width: 38,
    height: 44,
    borderRadius: 4,
    overflow: "hidden",
    background: "#292524",
    border: "1px solid rgba(127,29,29,.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inlinePickerThumbImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  inlinePickerInitial: {
    color: "#f5f5f4",
    fontWeight: 900,
    fontSize: 20,
  },
  inlinePickerName: {
    color: "#fff7ed",
    fontWeight: 800,
    fontSize: 15,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  inlinePickerEmpty: {
    color: "#c8b6a6",
    border: "1px solid #57534e",
    background: "#14100e",
    borderRadius: 6,
    padding: 16,
    textAlign: "center",
    fontSize: 14,
  },
  emptySlot: {
    display: "flex",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    color: "#c8b6a6",
    fontSize: 15,
  },
  plus: {
    fontSize: 48,
    lineHeight: 1,
    marginBottom: 10,
    color: "#c8b6a6",
  },
  factionPickerBackdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,0,0,.72)",
    backdropFilter: "blur(4px)",
    padding: 18,
  },
  factionPickerModal: {
    width: "min(100%, 360px)",
    background: "#1d1713",
    border: "1px solid rgba(127,29,29,.75)",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 24px 80px rgba(0,0,0,.55)",
    textAlign: "center",
  },
  factionPickerTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 900,
  },
  factionPickerDescription: {
    color: "#c8b6a6",
    fontSize: 14,
    lineHeight: 1.6,
    margin: "12px 0 18px",
  },
  factionPickerActions: {
    display: "flex",
    justifyContent: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  factionChoiceButton: {
    background: "#292524",
    border: "1px solid #57534e",
    borderRadius: 999,
    padding: 6,
    cursor: "pointer",
  },
  factionPickerCancel: {
    marginTop: 16,
    background: "transparent",
    border: "none",
    color: "#a68a64",
    cursor: "pointer",
    fontSize: 13,
  },
  adviceModal: {
    maxWidth: 1180,
    margin: "0 auto",
    background: "linear-gradient(180deg, #17110b, #070706)",
    border: "1px solid rgba(218,171,93,.58)",
    borderRadius: 8,
    padding: 18,
    boxShadow: "0 24px 80px rgba(0,0,0,.65)",
  },
  adviceIntro: {
    margin: "8px 0 0",
    color: "#d8bd88",
    fontSize: 14,
    lineHeight: 1.6,
  },
  adviceActions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 14,
  },
  aiLink: {
    minHeight: 38,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffe4a5",
    textDecoration: "none",
    border: "1px solid rgba(218,171,93,.46)",
    borderRadius: 4,
    background: "rgba(5,5,4,.72)",
    padding: "0 14px",
    fontWeight: 700,
  },
  adviceSearchLabel: {
    display: "block",
    color: "#d9b574",
    fontSize: 13,
    fontWeight: 800,
  },
  advicePickerGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(138px, 1fr))",
    gap: 8,
    maxHeight: 170,
    overflow: "auto",
    marginBottom: 18,
  },
  advicePickerButton: {
    display: "grid",
    gap: 4,
    textAlign: "left",
    border: "1px solid rgba(218,171,93,.32)",
    borderRadius: 4,
    background: "rgba(5,5,4,.74)",
    color: "#f4e4c1",
    padding: 10,
    cursor: "pointer",
  },
  advicePickerButtonSelected: {
    borderColor: "rgba(255,220,142,.9)",
    background: "linear-gradient(180deg, rgba(86,58,22,.92), rgba(28,19,10,.94))",
  },
  screenshotCard: {
    background: "#050504",
    border: "2px solid rgba(218,171,93,.72)",
    borderRadius: 4,
    padding: 10,
    color: "#fff0d0",
  },
  screenshotHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "start",
    borderBottom: "1px solid rgba(218,171,93,.36)",
    paddingBottom: 10,
    marginBottom: 12,
  },
  screenshotTitle: {
    margin: "4px 0 0",
    fontSize: 21,
    lineHeight: 1.2,
    color: "#fff4d8",
    fontWeight: 700,
  },
  screenshotMeta: {
    color: "#f0c977",
    fontSize: 14,
    whiteSpace: "nowrap",
  },
  promptBlock: {
    margin: "0 0 12px",
    whiteSpace: "pre-wrap",
    color: "#f7ead3",
    background: "#120d08",
    border: "1px solid rgba(218,171,93,.34)",
    borderRadius: 4,
    padding: 9,
    fontFamily: '"Noto Serif TC", "Microsoft JhengHei", serif',
    fontSize: 12,
    lineHeight: 1.5,
  },
  legalPairs: {
    display: "grid",
    gap: 4,
    color: "#e6c88b",
    background: "rgba(38,27,13,.78)",
    border: "1px solid rgba(218,171,93,.28)",
    borderRadius: 4,
    padding: 8,
    marginBottom: 10,
    fontSize: 12,
    lineHeight: 1.45,
  },
  screenshotGeneralGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(92px, 1fr))",
    gap: 8,
  },
  screenshotGeneralCard: {
    minWidth: 0,
    background: "#100c08",
    border: "1px solid rgba(218,171,93,.44)",
    borderRadius: 4,
    overflow: "hidden",
  },
  screenshotGeneralImageWrap: {
    background: "#050504",
    aspectRatio: "2 / 3",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  screenshotGeneralImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    display: "block",
  },
  screenshotGeneralName: {
    display: "grid",
    gap: 3,
    padding: "6px 7px",
    color: "#fff0d0",
    fontSize: 11,
  },
  adviceEmpty: {
    gridColumn: "1 / -1",
    textAlign: "center",
    color: "#d8bd88",
    border: "1px dashed rgba(218,171,93,.34)",
    borderRadius: 4,
    padding: 18,
  },
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 999,
    background: "rgba(0,0,0,.72)",
    backdropFilter: "blur(4px)",
    padding: 18,
    overflow: "auto",
  },
  modal: {
    maxWidth: 1100,
    margin: "0 auto",
    background: "#1d1713",
    border: "1px solid rgba(127,29,29,.75)",
    borderRadius: 10,
    padding: 20,
    boxShadow: "0 24px 80px rgba(0,0,0,.55)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "start",
    marginBottom: 16,
  },
  modalTitle: {
    margin: 0,
    fontSize: 28,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 4,
    border: "1px solid #57534e",
    color: "#fff",
    background: "#292524",
    fontSize: 24,
    cursor: "pointer",
  },
  searchInput: {
    width: "100%",
    height: 46,
    background: "#14100e",
    color: "#f5f5f4",
    border: "1px solid #57534e",
    borderRadius: 4,
    padding: "0 14px",
    marginBottom: 18,
    fontSize: 15,
  },
  pickerGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: 16,
    maxHeight: "70vh",
    overflow: "auto",
  },
  pickerCard: {
    background: "#14100e",
    color: "#f5f5f4",
    border: "1px solid #57534e",
    borderRadius: 10,
    padding: 12,
    textAlign: "left",
    cursor: "pointer",
  },
  pickerArt: {
    aspectRatio: "2 / 3",
    background: "linear-gradient(135deg, #292524, #57534e)",
    borderRadius: 8,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  pickerInitial: {
    fontSize: 54,
    fontWeight: 900,
  },
  pickerFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  emptyResult: {
    gridColumn: "1 / -1",
    border: "1px solid #57534e",
    background: "#14100e",
    color: "#a8a29e",
    padding: 24,
    textAlign: "center",
    borderRadius: 6,
  },
};
