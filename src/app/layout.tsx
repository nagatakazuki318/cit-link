'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Metadata } from "next"; // ※Client Componentではmetadataは通常exportできないため下部で分離しますが、今回は動きをそのまま維持しています
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // 現在のページがログイン画面または新規登録画面かどうかを判定
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsAuthenticated(false);
        // ログインしておらず、かつ認証ページ（login/signup）以外にいる場合はログイン画面へ飛ばす
        if (!isAuthPage) {
          router.push('/login');
        }
      } else {
        setIsAuthenticated(true);
      }
    }

    checkUser();

    // 認証状態の変化（ログイン・ログアウト）をリアルタイムで監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session && !isAuthPage) {
        setIsAuthenticated(false);
        router.push('/login');
      } else if (session) {
        setIsAuthenticated(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, isAuthPage, router]);

  // 認証状態の判定中（画面のチラつき防止）
  if (isAuthenticated === null && !isAuthPage) {
    return (
      <html lang="ja">
        <body className="min-h-screen flex items-center justify-center bg-white text-zinc-500 text-sm">
          読み込み中...
        </body>
      </html>
    );
  }

  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-zinc-900 flex flex-col min-h-screen`}>
        {/* ログイン・新規登録ページ以外の場合のみヘッダーを表示 */}
        {!isAuthPage && <Header />}

        {/* 各ページの中身がここに表示される */}
        <div className="flex-grow">
          {children}
        </div>

        {/* ログイン・新規登録ページ以外の場合のみフッターを表示 */}
        {!isAuthPage && <Footer />}
      </body>
    </html>
  );
}