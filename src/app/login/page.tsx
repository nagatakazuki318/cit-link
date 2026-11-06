'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

const TERMS_TEXT = `第1条（目的）

本規約は、CIT LINK（以下「本サービス」といいます）の利用条件を定めるものです。本サービスは、千葉工業大学認知情報科学科の学生同士の情報共有および学年を越えた交流を促進することを目的としています。（本サービスは千葉工業大学非公式です。）

第2条（利用資格・登録）

1. 本サービスは、認知情報科学科の学生および認知情報科学実験2の11グループが利用を認めた者を対象とします。
2. 利用者は、指定された大学のメールアドレスを使用してアカウントを登録するものとします。
3. 登録に際しては、メールアドレスによる本人確認を行うものとします。
4. 利用者は、自身のアカウントを第三者に貸与、譲渡または共有してはなりません。

第3条（アカウントの管理）

利用者は、自身のアカウント情報を適切に管理するものとし、第三者による不正利用が判明した場合は、速やかに運営者へ連絡するものとします。

第4条（サービス内容）

本サービスでは、以下の機能を提供します。

・学生同士の質問・相談および情報共有
・アンケート・実験協力者の募集
・研究室・研究活動に関する情報の共有
・学内イベントや学生生活に関する情報の共有
・その他、運営者が提供する機能

第5条（禁止事項）

利用者は、以下の行為を行ってはなりません。

1. 他の利用者への誹謗中傷、嫌がらせ、差別的な行為
2. 他人の個人情報を本人の許可なく掲載する行為
3. 虚偽の情報や他人になりすました投稿
4. 著作権、肖像権、プライバシーなどの権利を侵害する行為
5. 不適切な宣伝、勧誘、迷惑行為
6. 本サービスの運営や他の利用者の利用を妨害する行為
7. その他、運営者が不適切と判断する行為

第6条（投稿内容の取り扱い）

1. 利用者は、自身が投稿する内容について責任を負うものとします。
2. 運営者は、本規約に違反する投稿や不適切と判断した投稿について、削除または非公開にすることがあります。
3. 投稿内容の公開範囲は、各機能の表示仕様に従うものとします。

第7条（ポイント制度）

1. 本サービスでは、利用者の交流・協力活動に応じてポイントを付与する場合があります。
2. ポイントの獲得条件および利用方法は、別途本サービス内で定めます。
3. 不正な方法によるポイントの取得・利用は禁止します。
4. ポイントは、原則として現金への換金や他人への譲渡はできないものとします。
5. 運営者は、ポイント制度の内容を変更または終了する場合があります。

第8条（利用停止・退会）

1. 利用者は、我々が提示する退会方法により退会することができます。
2. 運営者は、利用者が本規約に違反した場合、アカウントの利用停止または削除を行うことがあります。
3. 退会後の投稿内容および登録情報の取り扱いは、プライバシーポリシーに従うものとします。

第9条（免責事項）

1. 利用者間で発生したトラブルについては、当事者間での解決を基本とします。
2. 運営者は、投稿内容の正確性、完全性、有用性を保証するものではありません。
3. 運営者は、保守、障害その他の事情により、本サービスの全部または一部を停止する場合があります。

第10条（規約の変更）

運営者は、必要に応じて本規約を変更することがあります。変更する場合は、本サービス上で変更内容および適用時期を周知します。

第11条（お問い合わせ）

本規約および本サービスに関するお問い合わせは、下記までご連絡ください。`;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleGoogleLogin = async () => {
    if (!agreed || loading) return;

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
    <main className="min-h-screen bg-white text-zinc-900 flex items-center justify-center px-6 py-10 font-sans">
      <div className="max-w-md w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-6 sm:p-8 shadow-sm">
        <p className="text-xs font-semibold tracking-widest text-zinc-400 mb-2">
          CIT-LINK
        </p>

        <h1 className="text-2xl font-semibold mb-4">
          ログイン
        </h1>

        <p className="text-sm text-zinc-600 mb-6">
          大学のGoogleアカウント（@chibatech.ac.jp）で
          ログインしてください。
          初めての方も同じボタンから登録できます。
        </p>

        <section
          aria-labelledby="terms-heading"
          className="mb-4 rounded-xl border border-zinc-200 bg-white p-4"
        >
          <h2
            id="terms-heading"
            className="mb-3 text-sm font-semibold"
          >
            CIT LINK 利用規約
          </h2>

          <div
            tabIndex={0}
            role="region"
            aria-labelledby="terms-heading"
            className="max-h-64 overflow-y-auto rounded text-xs leading-6 text-zinc-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a94448]"
          >
            <p className="whitespace-pre-wrap break-words">
              {TERMS_TEXT}
            </p>

            <a
              href="mailto:s25g2138bj@chibatech.ac.jp"
              className="break-all underline text-zinc-900"
            >
              s25g2138bj@chibatech.ac.jp
            </a>
          </div>
        </section>

        <label className="mb-6 flex items-start gap-3 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            disabled={loading}
            className="mt-1 h-4 w-4 shrink-0 accent-[#a94448]"
          />
          <span>利用規約を確認し、同意します。</span>
        </label>

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
          disabled={loading || !agreed}
          aria-busy={loading}
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