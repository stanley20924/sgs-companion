# Supabase 實時同步 - 測試指南

## 前置準備

### 1. Supabase 設置
- 到 Supabase 儀表板：https://supabase.com
- 建立新 project 或使用現有的
- 複製以下到 SQL 編輯器並執行：[database.sql](./lib/database.sql)

### 2. 環境變數
在 `.env.local` 添加：
```
NEXT_PUBLIC_SUPABASE_URL=你的_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_ANON_KEY
```

可以在 Supabase 設定 > API 中找到這些值。

## 測試步驟

### 單機測試
1. 運行 `npm run dev`
2. 打開 `http://localhost:3000/s/test-room`
3. 修改玩家名稱、武將等
4. 檢查 Supabase 儀表板的 `players` 和 `player_generals` 表是否更新

### 多人同步測試
1. 開啟兩個瀏覽器窗口，都訪問同一房間代碼 `test-room`
2. 在一個窗口修改資料（玩家名稱、選武將等）
3. **立即檢查另一個窗口是否實時更新**

## 常見問題

### 環境變數沒有設置
- 確保 `.env.local` 檔案在根目錄
- 重啟開發服務器：`npm run dev`

### Realtime 不工作
- 檢查 Supabase 是否啟用了 Realtime
- 在 SQL Editor 執行：
```sql
alter publication supabase_realtime add table rooms, players, player_generals;
```

### 資料庫表不存在
- 在 SQL Editor 運行 database.sql 中的所有 SQL

## 已實現的功能
✅ 房間初始化和載入  
✅ 玩家資料同步  
✅ 武將選擇同步  
✅ 實時訂閱  
✅ 本機備份（Supabase 失敗時的降級）  
✅ 加載狀態指示  

## 待優化
- [ ] 樂觀更新（UI 立即更新，然後同步到服務器）
- [ ] 離線支持
- [ ] 衝突解決機制
- [ ] 房間過期清理
