-- 房間表
create table if not exists rooms (
  id uuid default gen_random_uuid() primary key,
  room_code text not null unique,
  game_mode text not null default '國戰',
  version text not null default '受命于天',
  player_count integer not null default 8,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- 玩家表
create table if not exists players (
  id uuid default gen_random_uuid() primary key,
  room_id uuid not null references rooms(id) on delete cascade,
  player_id integer not null,
  name text not null,
  dead boolean default false,
  identity text default '',
  created_at timestamp default now(),
  updated_at timestamp default now(),
  unique(room_id, player_id)
);

-- 玩家武將表
create table if not exists player_generals (
  id uuid default gen_random_uuid() primary key,
  player_id uuid not null references players(id) on delete cascade,
  slot_index integer not null,
  general_id text,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  unique(player_id, slot_index)
);

-- 創建索引以提高查詢效能
create index if not exists idx_rooms_room_code on rooms(room_code);
create index if not exists idx_players_room_id on players(room_id);
create index if not exists idx_player_generals_player_id on player_generals(player_id);

-- 啟用 Realtime
alter publication supabase_realtime add table rooms;
alter publication supabase_realtime add table players;
alter publication supabase_realtime add table player_generals;
