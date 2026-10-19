'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LoginCallbackPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let active = true;

    const finishLogin = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user) {
          throw new Error('ログインできませんでした。再度お試しください。');
        }

        // 画面表示用の確認。
        // 本当の登録・アクセス制限はSupabase側でも実施する。
        const domain = data.user.email
          ?.toLowerCase()
          .split('@')[1];

        if (domain !== 'chibatech.ac.jp') {
          await supabase.auth.signOut();
          throw new Error(
            '大学のGoogleアカウントでログインしてください。'
          );
        }

        if (active) {
          router.replace('/');
          router.refresh();
        }
      } catch (error) {
        if (active) {
          setErrorMsg(
            error instanceof Error
              ? error.message
              : 'ログイン処理に失敗しました。'
          );
        }
      }
    };

    void finishLogin();

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        {errorMsg ? (
          <>
            <p role="alert" className="text-red-600 mb-4">
              {errorMsg}
            </p>
            <Link href="/login" className="underline">
              ログイン画面へ戻る
            </Link>
          </>
        ) : (
          <p role="status">ログインを確認しています…</p>
        )}
      </div>
    </main>
  );
}