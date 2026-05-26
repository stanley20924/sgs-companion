import { supabase } from "./supabase";
import { GameMode, General, Version } from "./data";

export interface RoomData {
  id: string;
  room_code: string;
  game_mode: GameMode;
  version: Version;
  player_count: number;
}

export interface PlayerData {
  id: string;
  room_id: string;
  player_id: number;
  name: string;
  dead: boolean;
  identity: string;
  generals: (General | null)[];
}

// 獲取或建立房間
export async function getOrCreateRoom(roomCode: string, gameMode: GameMode = "國戰", version: Version = "受命于天", playerCount: number = 8) {
  if (!supabase) throw new Error("Supabase not configured");

  // 先嘗試獲取
  let { data: room, error } = await supabase.from("rooms").select("*").eq("room_code", roomCode).single();

  if (error && error.code === "PGRST116") {
    // 房間不存在，建立新房間
    const { data: newRoom, error: createError } = await supabase
      .from("rooms")
      .insert([{ room_code: roomCode, game_mode: gameMode, version: version, player_count: playerCount }])
      .select()
      .single();

    if (createError) throw createError;
    room = newRoom;
  } else if (error) {
    throw error;
  }

  return room as RoomData;
}

// 獲取房間的所有玩家
export async function getRoomPlayers(roomId: string, generalsList: General[]) {
  if (!supabase) throw new Error("Supabase not configured");

  const { data: players, error } = await supabase
    .from("players")
    .select(
      `
      id,
      room_id,
      player_id,
      name,
      dead,
      identity,
      player_generals(general_id, slot_index)
    `
    )
    .eq("room_id", roomId)
    .order("player_id");

  if (error) throw error;

  // 轉換為應用格式
  return (players || []).map((player: any) => {
    const generalsBySlot = new Map<number, string | null>();
    player.player_generals?.forEach((pg: any) => {
      generalsBySlot.set(pg.slot_index, pg.general_id);
    });

    return {
      id: player.id,
      room_id: player.room_id,
      player_id: player.player_id,
      name: player.name,
      dead: player.dead,
      identity: player.identity,
      generals: Array.from({ length: 2 }, (_, i) => {
        const generalId = generalsBySlot.get(i);
        return generalId ? generalsList.find((g) => g.id === generalId) || null : null;
      }),
    };
  });
}

// 初始化房間玩家
export async function initializeRoomPlayers(roomId: string, count: number, gameMode: GameMode, generals: (General | null)[]) {
  if (!supabase) throw new Error("Supabase not configured");

  // 先刪除現有玩家
  await supabase.from("players").delete().eq("room_id", roomId);

  // 建立新玩家
  const playersToInsert = Array.from({ length: count }, (_, i) => ({
    room_id: roomId,
    player_id: i + 1,
    name: `玩家 ${i + 1}`,
    dead: false,
    identity: gameMode === "身分局" ? ["主公", "忠臣", "反賊", "內奸", "未公開"][Math.min(i, 4)] : "",
  }));

  const { data: insertedPlayers, error: playerError } = await supabase.from("players").insert(playersToInsert).select();

  if (playerError) throw playerError;

  // 建立玩家武將
  const generalsToInsert: any[] = [];
  insertedPlayers?.forEach((player: any) => {
    const slotCount = gameMode === "國戰" ? 2 : 1;
    for (let i = 0; i < slotCount; i++) {
      generalsToInsert.push({
        player_id: player.id,
        slot_index: i,
        general_id: null,
      });
    }
  });

  if (generalsToInsert.length > 0) {
    const { error: genError } = await supabase.from("player_generals").insert(generalsToInsert);
    if (genError) throw genError;
  }
}

// 更新房間設定
export async function updateRoom(roomId: string, patch: Partial<RoomData>) {
  if (!supabase) throw new Error("Supabase not configured");

  const { error } = await supabase.from("rooms").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", roomId);

  if (error) throw error;
}

// 更新玩家信息
export async function updatePlayer(playerId: string, patch: any) {
  if (!supabase) throw new Error("Supabase not configured");

  const { error } = await supabase.from("players").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", playerId);

  if (error) throw error;
}

// 更新玩家武將
export async function updatePlayerGeneral(playerId: string, slotIndex: number, generalId: string | null) {
  if (!supabase) throw new Error("Supabase not configured");

  const { error } = await supabase
    .from("player_generals")
    .update({ general_id: generalId, updated_at: new Date().toISOString() })
    .eq("player_id", playerId)
    .eq("slot_index", slotIndex);

  if (error) throw error;
}

// 訂閱房間即時更新
export function subscribeToRoom(roomId: string, callback: () => void) {
  if (!supabase) return null;

  const subscription = supabase
    .channel(`room:${roomId}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "players", filter: `room_id=eq.${roomId}` }, callback)
    .on("postgres_changes", { event: "*", schema: "public", table: "player_generals" }, callback)
    .on("postgres_changes", { event: "*", schema: "public", table: "rooms", filter: `id=eq.${roomId}` }, callback)
    .subscribe();

  return subscription;
}
