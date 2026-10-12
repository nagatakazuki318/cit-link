'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ReviewItem {
  id: string;
  course_name: string;
  professor: string;
  difficulty: string;
  workload: string;
  exam_type: string;
  comment: string;
  tag: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  // ページを開いたときにSupabaseからデータを取得する
  useEffect(() => {
    async function fetchReviews() {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .order('created_at', { ascending: false }); // 新しい順に並べ替え

        if (error) {
          console.error('データの取得に失敗しました:', error.message);
        } else if (data) {
          setReviews(data);
        }
      } catch (err) {
        console.error('予期せぬエラーが発生しました:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, []);

  return (
    <main className="min-h-screen bg-white text-zinc-900 py-20 px-6 sm:px-12 lg:px-20 font-sans antialiased">
      <div className="max-w-2xl mx-auto">
        
        {/* Apple風ヘッダー */}
        <div className="mb-20 flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-zinc-100 pb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">
              CIT-LINK REVIEWS
            </p>
            <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-zinc-900 mb-4">
              Reviews.
            </h1>
            <p className="text-zinc-500 text-base font-normal tracking-wide">
              先輩たちが残してくれたリアルな講義の難易度やテスト情報のアーカイブ。
            </p>
          </div>
          
          {/* 投稿ボタン */}
          <button className="inline-flex items-center justify-center bg-[#a94448] text-white text-xs font-medium uppercase tracking-wider px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity whitespace-nowrap shadow-sm">
            ＋ 投稿する
          </button>
        </div>

        {/* レビューリスト */}
        <div className="space-y-12">
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-6 px-1">
              Recent Feedback
            </h2>
            
            {loading ? (
              <p className="text-sm text-zinc-400 py-10 text-center">読み込み中...</p>
            ) : reviews.length === 0 ? (
              <div className="bg-zinc-50 rounded-2xl border border-zinc-100 p-8 text-center text-zinc-500 text-sm">
                まだ授業評価が投稿されていません。「＋ 投稿する」から最初のレビューを追加してみよう！
              </div>
            ) : (
              <div className="bg-zinc-50 rounded-2xl border border-zinc-100 overflow-hidden shadow-sm divide-y divide-zinc-100">
                {reviews.map((review, index) => (
                <div
                    key={review.id || index}
                    className="group p-6 sm:p-8 transition-all duration-200 hover:bg-zinc-100/80"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="text-base font-medium text-zinc-900 group-hover:text-blue-600 transition-colors">
                            {review.course_name}
                          </span>
                          {review.tag && (
                            <span className="text-[10px] font-medium uppercase tracking-wider bg-zinc-200/60 text-zinc-600 px-2.5 py-0.5 rounded-full">
                              {review.tag}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 font-normal">
                          担当: {review.professor}
                        </p>
                      </div>

                      {/* 難易度バッジ */}
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <span className={`px-2.5 py-1 rounded-md ${
                          review.difficulty === '鬼' ? 'bg-red-100 text-red-700' :
                          review.difficulty === '普通' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          難易度: {review.difficulty}
                        </span>
                        <span className="bg-zinc-200/70 text-zinc-700 px-2.5 py-1 rounded-md">
                          負担: {review.workload}
                        </span>
                      </div>
                    </div>

                    {/* コメント本文 */}
                    <p className="text-sm text-zinc-600 font-normal leading-relaxed my-3">
                      「{review.comment}」
                    </p>

                    {/* フッター情報 */}
                    <div className="pt-3 border-t border-zinc-200/40 flex items-center justify-between text-xs text-zinc-400 font-normal">
                      <span>試験・評価: <strong className="text-zinc-600">{review.exam_type}</strong></span>
                      <span className="hover:text-zinc-600 cursor-pointer transition-colors">参考になった (0)</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* フッター */}
        <div className="mt-24 text-center text-xs text-zinc-400 tracking-wider">
          Chiba Institute of Technology — Student Community
        </div>

      </div>
    </main>
  );
}