import React from 'react';

interface ReviewItem {
  courseName: string;
  professor: string;
  difficulty: '楽勝' | '普通' | '鬼';
  workload: '軽め' | '普通' | '重め';
  examType: string;
  comment: string;
  tag: string;
}

const reviewData: ReviewItem[] = [
  {
    courseName: "プログラミング演習",
    professor: "情報 太郎 教授",
    difficulty: "普通",
    workload: "重め",
    examType: "課題提出 + テスト",
    comment: "毎回の課題をしっかりやっておけば単位は固いです。分からないところは早めに周りに聞くのがおすすめ。",
    tag: "必修",
  },
  {
    courseName: "線形代数学I",
    professor: "数理工 花子 教授",
    difficulty: "鬼",
    workload: "重め",
    examType: "期末試験 100%",
    comment: "過去問の入試・演習問題を解けるようにしておくことが必須。油断すると落とすので注意。",
    tag: "基礎",
  },
  {
    courseName: "キャリアデザイン",
    professor: "キャリア センター",
    difficulty: "楽勝",
    workload: "軽め",
    examType: "レポート提出",
    comment: "毎回の授業後の感想レポートを真面目に書けば大丈夫です。就活の準備にも役立ちます。",
    tag: "選択",
  },
];

export default function ReviewsPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900 py-20 px-6 sm:px-12 lg:px-20 font-sans antialiased">
      <div className="max-w-3xl mx-auto">
        
        {/* ヘッダーセクション */}
        <div className="mb-16 border-b border-zinc-100 pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">
              CIT-LINK REVIEWS
            </p>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-zinc-900 mb-2">
              授業評価・レビュー.
            </h1>
            <p className="text-zinc-500 text-sm sm:text-base">
              先輩たちが残してくれたリアルな講義の難易度やテスト情報をチェック。
            </p>
          </div>
          
          {/* 投稿ボタン（今後フォームと繋げる用） */}
          <button className="inline-flex items-center justify-center bg-[#a94448] text-white text-sm font-medium px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap">
            ＋ レビューを投稿する
          </button>
        </div>

        {/* レビューリスト */}
        <div className="space-y-6">
          {reviewData.map((review, index) => (
            <div 
              key={index} 
              className="bg-zinc-50 rounded-2xl border border-zinc-100 p-6 sm:p-8 transition-all duration-200 hover:shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-zinc-900">
                      {review.courseName}
                    </h2>
                    <span className="text-[10px] font-medium uppercase tracking-wider bg-zinc-200/60 text-zinc-600 px-2.5 py-0.5 rounded-full">
                      {review.tag}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    担当: {review.professor}
                  </p>
                </div>

                {/* バッジ情報（難易度など） */}
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
              <p className="text-sm text-zinc-600 leading-relaxed mb-4">
                「{review.comment}」
              </p>

              {/* テスト形式などのフッター情報 */}
              <div className="pt-4 border-t border-zinc-200/60 flex items-center justify-between text-xs text-zinc-400">
                <span>試験・評価: <strong className="text-zinc-600">{review.examType}</strong></span>
                <span className="hover:text-zinc-700 cursor-pointer">参考になった (0)</span>
              </div>
            </div>
          ))}
        </div>

        {/* フッター */}
        <div className="mt-20 text-center text-xs text-zinc-400 tracking-wider">
          Chiba Institute of Technology — Student Community
        </div>

      </div>
    </main>
  );
}