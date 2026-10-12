
import Link from "next/link";
import { samplePosts } from "../lib/posts";

export default function RecentPosts() {
  // 投稿日時が新しい順に並べ、3件だけ表示する
  const posts = [...samplePosts]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 3);

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {posts.map((post) => (
        <Link
          key={post.id}
          href="/board"
          className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
        >
          <div className="mb-4 flex items-center justify-between gap-2">
            <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-[#a94448]">
              {post.category}
            </span>

            <span className="text-sm text-gray-500">
              {post.year}年生
            </span>
          </div>

          <h3 className="mb-3 text-lg font-bold text-gray-900 transition group-hover:text-[#a94448]">
            {post.title}
          </h3>

          <p className="mb-5 text-sm leading-6 text-gray-600">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-sm text-gray-500">
            <time dateTime={post.createdAt}>
              {new Date(post.createdAt).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "short",
                day: "numeric",
                timeZone: "Asia/Tokyo",
              })}
            </time>

            <span className="font-medium text-[#a94448]">
              詳細を見る →
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
