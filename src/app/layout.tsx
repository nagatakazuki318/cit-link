import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "cit-link | 学年間交流プラットフォーム",
  description: "千葉工業大学の学生向けコミュニティ＆情報共有サイト",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-zinc-900 flex flex-col min-h-screen`}>
        {/* 共通ヘッダー */}
        <Header />

        {/* 各ページの中身がここに表示される */}
        <div className="flex-grow">
          {children}
        </div>

        {/* 共通フッター */}
        <Footer />
      </body>
    </html>
  );
}