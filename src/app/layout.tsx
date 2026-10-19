'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
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
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  // クライアントサイドでマウントされた後に認証チェックを行うことで、SSRの不一致（ハイドレーションエラー）を防ぐ
  useEffect(() => {
    setIsMounted(true);

    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsAuthenticated(false);
        if (!isAuthPage) {
          router.push('/login');
        }
      } else {
        setIsAuthenticated(true);
      }
    }

    checkUser();

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

  // サーバーサイドレンダリング時（またはマウント前）は、ハイドレーションのズレを防ぐために最低限のHTMLを返す
  if (!isMounted) {
    return (
      <html lang="ja">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-zinc-900 flex flex-col min-h-screen`}>
          <div className="flex-grow flex items-center justify-center text-sm text-zinc-400">
            読み込み中...
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-zinc-900 flex flex-col min-h-screen`}>
        {!isAuthPage && <Header />}

        <div className="flex-grow">
          {children}
        </div>

        {!isAuthPage && <Footer />}
      </body>
    </html>
  );
}