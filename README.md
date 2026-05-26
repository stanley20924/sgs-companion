# 三國殺牌局 Companion MVP

非官方玩家自用工具。資料僅供參考，以官方最新公告與裁定為準。

## 功能

- 建立牌局房間 `/s/ROOMCODE`
- 國戰 / 身分局模式
- 版本選擇：受命于天、標準國戰、2026 身分局、自訂版本
- 玩家數、玩家名稱
- 國戰雙將、身分局單將與身分欄
- 武將搜尋與選將
- 點武將查看技能與配將建議
- 死亡狀態
- 勢力統計
- 分享連結
- localStorage 本機保存
- Supabase client 已預留，下一步可接 Realtime

## 本機執行

```bash
npm install
npm run dev
```

打開：

```txt
http://localhost:3000
```

## 圖片放置

把圖片放到：

```txt
public/images/generals/
```

然後在 `lib/data.ts` 的 `image` 欄位填：

```ts
image: "/images/generals/caocao.jpg"
```

## Vercel 部署

1. 上傳到 GitHub
2. 到 Vercel 建立專案
3. 選這個 repo
4. Deploy

## Supabase Realtime 下一步

`.env.example` 已預留：

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

建議建立 `sessions` table：

```sql
create table sessions (
  room_code text primary key,
  game_mode text not null,
  version text not null,
  player_count int not null,
  players jsonb not null,
  updated_at timestamptz default now()
);
```

接上後，將 `saveSession()` 改成 upsert，並訂閱同一個 `room_code` 的 realtime update。
