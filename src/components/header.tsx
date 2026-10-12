import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-[#a94448] text-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* ロゴ / サイト名（text-zinc-900 を text-white に変更） */}
        <Link href="/" className="text-lg font-semibold tracking-tight text-white hover:opacity-80 transition-opacity">
          CIT LINK<span className="text-red-200"> .</span>
        </Link>

        {/* ナビゲーションメニュー（text-zinc-600 を削除し、親の white を継承） */}
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/board" className="hover:text-red-100 transition-colors">
            掲示板
          </Link>
          <Link href="/reviews" className="transition hover:text-red-100">
            授業評価
          </Link>
          <Link href="/calendar" className="hover:text-red-100 transition-colors">
            カレンダー
          </Link>
          <Link href="/labs" className="hover:text-red-100 transition-colors">
            研究室・教授
          </Link>
          <Link href="/links" className="hover:text-red-100 transition-colors">
            リンク
          </Link>
        </nav>
        
      </div>
    </header>
  );
}