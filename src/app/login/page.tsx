'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg('メールアドレスまたはパスワードが間違っています。');
      setLoading(false);
    } else {
      router.push('/'); // ログイン成功したらトップページへ
      router.refresh();
    }
  };

  return (
    <main className="min-h-screen bg-white text-zinc-900 flex items-center justify-center px-6 font-sans">
      <div className="max-w-md w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2">CIT-LINK</p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 mb-6">ログイン</h1>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              placeholder="xxxxxxxx@chibatech.ac.jp"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#a94448] text-white text-sm font-medium rounded-xl hover:opacity-95 transition-opacity shadow-sm"
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-500">
          アカウントをお持ちではありませんか？{' '}
          <Link href="/signup" className="text-zinc-900 font-medium underline">
            新規登録
          </Link>
        </p>
      </div>
    </main>
  );
}