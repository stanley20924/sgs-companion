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
do $$
begin
  alter publication supabase_realtime add table rooms;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table players;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table player_generals;
exception
  when duplicate_object then null;
end $$;

-- 武將評價投票表
create table if not exists general_votes (
  id uuid default gen_random_uuid() primary key,
  general_id text not null,
  voter_id text not null,
  rating text not null check (rating in ('show', 'top', 'strong', 'npc', 'weak')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(general_id, voter_id)
);

-- 武將留言建議表
create table if not exists general_comments (
  id uuid default gen_random_uuid() primary key,
  general_id text not null,
  voter_id text not null,
  name text not null default '匿名軍師',
  rating text not null check (rating in ('show', 'top', 'strong', 'npc', 'weak')),
  text text not null check (char_length(text) between 1 and 1000),
  created_at timestamp with time zone default now()
);

create index if not exists idx_general_votes_general_id on general_votes(general_id);
create index if not exists idx_general_comments_general_id_created_at on general_comments(general_id, created_at desc);

alter table general_votes enable row level security;
alter table general_comments enable row level security;

drop policy if exists "general_votes_select_public" on general_votes;
drop policy if exists "general_votes_insert_public" on general_votes;
drop policy if exists "general_votes_update_public" on general_votes;
drop policy if exists "general_comments_select_public" on general_comments;
drop policy if exists "general_comments_insert_public" on general_comments;

create policy "general_votes_select_public"
  on general_votes for select
  to anon
  using (true);

create policy "general_votes_insert_public"
  on general_votes for insert
  to anon
  with check (char_length(general_id) > 0 and char_length(voter_id) > 0);

create policy "general_votes_update_public"
  on general_votes for update
  to anon
  using (true)
  with check (char_length(general_id) > 0 and char_length(voter_id) > 0);

create policy "general_comments_select_public"
  on general_comments for select
  to anon
  using (true);

create policy "general_comments_insert_public"
  on general_comments for insert
  to anon
  with check (char_length(general_id) > 0 and char_length(voter_id) > 0 and char_length(text) between 1 and 1000);

do $$
begin
  alter publication supabase_realtime add table general_votes;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table general_comments;
exception
  when duplicate_object then null;
end $$;
