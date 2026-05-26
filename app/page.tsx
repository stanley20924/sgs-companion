import Link from "next/link";

function makeRoomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default function Home() {
  const roomCode = makeRoomCode();
  return (
    <main className="min-h-screen bg-[#130f0d] px-5 py-10 text-stone-100">
      <section className="mx-auto max-w-3xl rounded-3xl border border-amber-700/50 bg-[#1d1713] p-8 shadow-2xl shadow-black/30">
        <p className="mb-3 text-sm font-black text-red-300">非官方玩家自用工具</p>
        <h1 className="text-4xl font-black md:text-6xl">三國殺牌局 Companion</h1>
        <p className="mt-5 leading-7 text-stone-300">
          開一桌牌局，分享網址給玩家。國戰可記錄雙將亮將；身分局可記錄武將、身分與死亡狀態。手機直接查看，不用拍照傳圖。
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href={`/s/${roomCode}`} className="rounded-xl bg-red-900 px-5 py-3 text-center font-black text-white hover:bg-red-800">
            建立新牌局
          </Link>
          <Link href="/s/DEMO01" className="rounded-xl border border-stone-700 px-5 py-3 text-center font-black text-stone-100 hover:bg-stone-800">
            查看 Demo 房間
          </Link>
        </div>
      </section>
      <footer className="mx-auto mt-8 max-w-3xl text-center text-xs leading-6 text-stone-500">
        三國殺玩家自用資料站。資料僅供參考，以官方最新公告與裁定為準。所有角色、卡牌與美術版權歸原權利方所有。
      </footer>
    </main>
  );
}
