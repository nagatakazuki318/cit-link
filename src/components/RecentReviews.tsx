"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ReviewPreview = {
  id: string;
  course_name: string;
  grade: string | null;
  professor: string;
  difficulty: string;
  workload: string;
  comment: string;
  created_at: string | null;
};

const PREVIEW_COUNT = 3;

const difficultyClass = (difficulty: string) =>
  difficulty === "難しい" || difficulty === "鬼"
    ? "bg-red-100 text-red-700"
    : difficulty === "普通"
      ? "bg-amber-100 text-amber-700"
      : "bg-emerald-100 text-emerald-700";

export default function RecentReviews() {
  const [reviews, setReviews] = useState<ReviewPreview[]>([]);
  const [helpfulCounts, setHelpfulCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchReviews() {
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select(
            "id, course_name, grade, professor, difficulty, workload, comment, created_at",
          )
          .order("created_at", { ascending: false })
          .limit(PREVIEW_COUNT);

        if (error) throw error;
        if (!active) return;

        const latest = data ?? [];
        setReviews(latest);

        // 「参考になった」の件数（取得できなくてもプレビューは表示する）
        if (latest.length > 0) {
          const { data: helpfuls } = await supabase
            .from("review_helpfuls")
            .select("review_id")
            .in(
              "review_id",
              latest.map((review) => review.id),
            );

          if (active && helpfuls) {
            const counts: Record<string, number> = {};
            for (const row of helpfuls) {
              const reviewId = String(row.review_id);
              counts[reviewId] = (counts[reviewId] ?? 0) + 1;
            }
            setHelpfulCounts(counts);
          }
        }
      } catch (e) {
        console.error("授業評価の取得に失敗しました", e);
        if (active) setError("授業評価を読み込めませんでした。");
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchReviews();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <p className="py-8 text-center text-gray-500">授業評価を読み込み中...</p>
    );
  }

  if (error) {
    return <p className="py-8 text-center text-red-600">{error}</p>;
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-white p-8 text-center">
        <p className="font-bold">まだ授業評価はありません</p>
        <p className="mt-2 text-sm text-gray-500">
          受けた授業の感想を残してみましょう！
        </p>
        <Link
          href="/reviews"
          className="mt-4 inline-block rounded-lg bg-[#a94448] px-5 py-2 text-white hover:bg-[#963f43]"
        >
          ＋ 授業評価を書く
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {reviews.map((review) => (
        <Link
          key={review.id}
          href="/reviews"
          className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-md"
        >
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {review.grade && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                {review.grade}
              </span>
            )}
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${difficultyClass(review.difficulty)}`}
            >
              難易度: {review.difficulty}
            </span>
          </div>

          <h3 className="line-clamp-2 font-bold">{review.course_name}</h3>
          <p className="mb-3 mt-1 text-xs text-gray-400">
            担当: {review.professor}
          </p>

          <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-gray-600">
            「{review.comment}」
          </p>

          <div className="mt-4 flex justify-between border-t pt-3 text-xs text-gray-400">
            <span>負担: {review.workload}</span>
            <span>👍 参考になった {helpfulCounts[review.id] ?? 0}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
