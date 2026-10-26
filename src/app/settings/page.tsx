'use client';

import Link from 'next/link';

export default function SettingsIndexPage() {
  return (
    <div className="space-y-8">
      {/* 挨拶・概要 */}
      <div className="border-b border-zinc-100 pb-6">
        <h2 className="text-xl font-semibold text-zinc-900 mb-1">
          一般設定・アカウント管理
        </h2>
        <p className="text-sm text-zinc-500">
          左側のメニューから変更したい項目を選択してください。
        </p>
      </div>

      {/* ショートカットカード（よく使う設定への案内） */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        <Link
          href="/settings/profile"
          className="group block p-6 rounded-2xl bg-zinc-50 border border-zinc-200/60 hover:border-zinc-400 hover:bg-zinc-100/50 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-zinc-900 group-hover:text-zinc-950">
              👤 プロフィール設定
            </h3>
            <span className="text-xs text-zinc-400 group-hover:translate-x-1 transition-transform">
              →
            </span>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            表示名、学年、学部・学科、自己紹介やGitHubリンクなどを編集します。
          </p>
        </Link>

        <Link
          href="/settings/account"
          className="group block p-6 rounded-2xl bg-zinc-50 border border-zinc-200/60 hover:border-zinc-400 hover:bg-zinc-100/50 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-zinc-900 group-hover:text-zinc-950">
              🔒 アカウント管理
            </h3>
            <span className="text-xs text-zinc-400 group-hover:translate-x-1 transition-transform">
              →
            </span>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            登録されている大学メールアドレスの確認や、ログアウトを行います。
          </p>
        </Link>

      </div>

      {/* 補足メッセージ */}
      <div className="p-4 bg-zinc-50/80 rounded-xl border border-zinc-100 text-xs text-zinc-400">
        💡 ヒント：画面左側のサイドバーから、いつでも自由に行き来が可能です。
      </div>
    </div>
  );
}