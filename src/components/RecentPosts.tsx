
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { boardHeaders } from "../app/board/client";
import type { Thread } from "../app/board/types";

export default function RecentPosts() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchPosts() {
      try {
        const response = await fetch("/board/api", {
          headers: await boardHeaders(),
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "新着情報を取得できませんでした。");
        }

        if (active) {
          setThreads(data);
          setError("");
        }
      } catch (e) {
        if (active) {
          setError((e as Error).message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchPosts();

    return () => {
      active = false;
    };
  }, []);

  // 更新日時が新しい順に並べ、3件だけ表示
  const recentThreads = [...threads]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 3);

  // 日付の表示形式
  const formatDate = (value: string) => {
    return new Date(value).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  if (loading) {
    return <p className="py-8 text-center text-gray-500">新着情報を読み込み中...</p>;
  }

  if (error) {
    return <p className="py-8 text-center text-red-600">{error}</p>;
  }

  if (recentThreads.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-gray-50 p-8 text-center">
        <p className="font-bold">まだ投稿はありません</p>
        <p className="mt-2 text-sm text-gray-500">
          最初の投稿をしてみましょう！
        </p>
        <Link
          href="/board/new"
          className="mt-4 inline-block rounded-lg bg-[#a94448] px-5 py-2 text-white hover:bg-[#963f43]"
        >
          ＋ 投稿する
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {recentThreads.map((thread) => (
        <Link
          key={thread.id}
          href="/board"
          className="rounded-xl border border-gray-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-md"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-[#a94448]">
              {thread.category}
            </span>

            <time className="text-xs text-gray-400">
              {formatDate(thread.updatedAt)}
            </time>
          </div>

          <h3 className="mb-3 line-clamp-2 font-bold">
            {thread.title}
          </h3>

          <p className="line-clamp-3 text-sm leading-relaxed text-gray-600">
            {thread.posts[0]?.body || "投稿内容はありません。"}
          </p>

          <div className="mt-4 flex justify-between border-t pt-3 text-xs text-gray-400">
            <span>{thread.posts[0]?.name || "投稿者"}</span>
            <span>{Math.max(0, thread.posts.length - 1)} 件の返信</span>
          </div>
        </Link>
      ))}
    </div>
  );
}