'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AccountSettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setEmail(user.email);
    }
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-zinc-900 mb-1">アカウント管理</h2>
        <p className="text-xs text-zinc-500 mb-6">ログイン情報やセッションの管理を行います。</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-600 mb-1.5">登録メールアドレス</label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full px-4 py-2.5 bg-zinc-100 border border-zinc-200 rounded-xl text-sm text-zinc-500 cursor-not-allowed"
        />
        <p className="mt-1 text-[11px] text-zinc-400">※大学ドメイン（@chibatech.ac.jp）のアカウントです。</p>
      </div>

      <div className="pt-6 border-t border-zinc-100">
        <h3 className="text-sm font-semibold text-zinc-900 mb-2">ログアウト</h3>
        <p className="text-xs text-zinc-500 mb-4">このデバイスでのセッションを終了します。</p>
        <button
          onClick={handleLogout}
          className="px-5 py-2.5 bg-zinc-200 text-zinc-800 text-xs font-medium rounded-xl hover:bg-zinc-300 transition-colors"
        >
          ログアウトする
        </button>
      </div>
    </div>
  );
}