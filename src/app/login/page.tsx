'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/login/callback`,
          queryParams: {
            // 大学アカウントの選択を促す指定。
            // これだけではアクセス制限にはならない。
            hd: 'chibatech.ac.jp',
            prompt: 'select_account',
          },
        },
      });

      if (error) throw error;
    } catch {
      setErrorMsg(
        'Googleログインを開始できませんでした。時間をおいて再度お試しください。'
      );
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-zinc-900 flex items-center justify-center px-6 font-sans">
      <div className="max-w-md w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-8 shadow-sm">
        <p className="text-xs font-semibold tracking-widest text-zinc-400 mb-2">
          CIT-LINK
        </p>

        <h1 className="text-2xl font-semibold mb-4">
          ログイン
        </h1>

        <p className="text-sm text-zinc-600 mb-6">
          大学のGoogleアカウント
          （@chibatech.ac.jp）でログインしてください。
          初めての方も同じボタンから登録できます。
        </p>

        {errorMsg && (
          <p
            role="alert"
            className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg"
          >
            {errorMsg}
          </p>
        )}

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 bg-[#a94448] text-white text-sm font-medium rounded-xl hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? 'Googleへ移動中…'
            : '大学のGoogleアカウントでログイン'}
        </button>
      </div>
    </main>
  );
}