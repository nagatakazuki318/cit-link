'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // サイドバーのメニュー項目
  const menuItems = [
    { name: 'プロフィール', href: '/settings/profile' },
    { name: 'アカウント', href: '/settings/account' },
    { name: '環境設定・通知', href: '/settings/preferences' },
  ];

  return (
    <main className="min-h-screen bg-zinc-50/50 text-zinc-900 py-12 px-6 sm:px-10 lg:px-16 font-sans antialiased">
      <div className="max-w-5xl mx-auto">
        
        {/* ページタイトル */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 mb-1">
            設定
          </h1>
          <p className="text-zinc-500 text-sm">
            cit-linkのアカウント情報やプロフィールを管理します。
          </p>
        </div>

        {/* 左右レイアウト（左：サイドバータブ、右：コンテンツ） */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* サイドバーナビゲーション */}
          <aside className="md:col-span-1">
            <nav className="space-y-1 bg-white p-2 rounded-2xl border border-zinc-200/80 shadow-sm">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-zinc-900 text-white'
                        : 'text-zinc-600 hover:bg-zinc-100/60 hover:text-zinc-900'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* メインコンテンツエリア */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 sm:p-8 shadow-sm">
              {children}
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}