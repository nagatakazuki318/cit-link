'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '@/lib/supabase';

interface ReviewItem {
  id: string;
  course_name: string;
  grade: string | null;
  professor: string;
  difficulty: string;
  workload: string;
  exam_type: string;
  comment: string;
  tag: string | null;
}

const reviewFields = [
  { name: 'course_name', label: '授業名', required: true },
  { name: 'grade', label: '対象学年', required: true },
  { name: 'professor', label: '担当教員', required: true },
  { name: 'difficulty', label: '難易度', required: true },
  { name: 'workload', label: '負担', required: true },
  { name: 'exam_type', label: '試験・評価方法', required: true },
  { name: 'comment', label: 'コメント', required: true },
  { name: 'tag', label: 'タグ（任意）', required: false },
] as const;

const reviewColumns =
  'id, course_name, grade, professor, difficulty, workload, exam_type, comment, tag';

const inputClass =
  'mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-normal';

const buttonClass =
  'inline-flex items-center justify-center whitespace-nowrap rounded-full bg-[#a94448] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState('');

  useEffect(() => {
    async function fetchReviews() {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select(reviewColumns)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('授業評価の取得に失敗しました', error);
          setLoadError('授業評価を読み込めませんでした。');
          return;
        }

        setReviews(data ?? []);
      } catch (error) {
        console.error('授業評価の取得に失敗しました', error);
        setLoadError('授業評価を読み込めませんでした。');
      } finally {
        setLoading(false);
      }
    }

    void fetchReviews();
  }, []);

  async function handlePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (posting) return;

    setPostError('');

    const formData = new FormData(event.currentTarget);
    const values = Object.fromEntries(
      reviewFields.map(({ name }) => [
        name,
        String(formData.get(name) ?? '').trim(),
      ]),
    );

    const missingField = reviewFields.find(
      ({ name, required }) => required && !values[name],
    );

    if (missingField) {
      setPostError(`${missingField.label}を入力してください。`);
      return;
    }

    setPosting(true);

    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert(values)
        .select(reviewColumns)
        .single();

      if (error) {
        console.error('授業評価の投稿に失敗しました', error);
        setPostError(`投稿できませんでした。${error.message}`);
        return;
      }

      setReviews((current) => [data, ...current]);
      setShowForm(false);
    } catch (error) {
      console.error('授業評価の投稿に失敗しました', error);
      setPostError(
        '通信エラーが発生しました。再投稿する前に一覧を確認してください。',
      );
    } finally {
      setPosting(false);
    }
  }

  return (
    <main className="min-h-screen bg-white px-6 py-20 font-sans text-zinc-900 antialiased sm:px-12 lg:px-20">
      <div className="mx-auto max-w-2xl">
        <header className="mb-20 flex flex-col justify-between gap-6 border-b border-zinc-100 pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
              CIT-LINK REVIEWS
            </p>
            <h1 className="mb-4 text-4xl font-semibold tracking-tight sm:text-6xl">
              Reviews.
            </h1>
            <p className="text-base tracking-wide text-zinc-500">
              先輩たちが残してくれたリアルな講義の難易度やテスト情報のアーカイブ。
            </p>
          </div>

          <button
            type="button"
            aria-expanded={showForm}
            disabled={posting}
            onClick={() => {
              setPostError('');
              setShowForm((open) => !open);
            }}
            className={buttonClass}
          >
            {showForm ? 'フォームを閉じる' : '＋ 投稿する'}
          </button>
        </header>

        {showForm && (
          <form
            onSubmit={handlePost}
            className="mb-12 space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-6"
          >
            <h2 className="text-lg font-semibold">授業評価を投稿</h2>

            <fieldset disabled={posting} className="space-y-4">
              {reviewFields.map(({ name, label, required }) => (
                <label key={name} className="block text-sm font-medium">
                  {label}

                  {name === 'comment' ? (
                    <textarea
                      name={name}
                      rows={4}
                      required={required}
                      className={inputClass}
                    />
                  ) : name === 'grade' ? (
                    <select
                      name={name}
                      required={required}
                      defaultValue=""
                      className={inputClass}
                    >
                      <option value="" disabled>学年を選択してください</option>
                      <option value="1年生">1年生</option>
                      <option value="2年生">2年生</option>
                      <option value="3年生">3年生</option>
                      <option value="4年生">4年生</option>
                    </select>
                  ) : name === 'difficulty' ? (
                    <select
                      name={name}
                      required={required}
                      defaultValue=""
                      className={inputClass}
                    >
                      <option value="" disabled>選択してください</option>
                      <option value="易しい">易しい</option>
                      <option value="普通">普通</option>
                      <option value="難しい">難しい</option>
                    </select>
                  ) : name === 'workload' ? (
                    <select
                      name={name}
                      required={required}
                      defaultValue=""
                      className={inputClass}
                    >
                      <option value="" disabled>負担を選択してください</option>
                      <option value="非常に少ない">非常に少ない</option>
                      <option value="少ない">少ない</option>
                      <option value="普通">普通</option>
                      <option value="多い">多い</option>
                      <option value="非常に多い">非常に多い</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      name={name}
                      required={required}
                      className={inputClass}
                    />
                  )}
                </label>
              ))}

              <button type="submit" className={buttonClass}>
                {posting ? '投稿中…' : '投稿する'}
              </button>
            </fieldset>

            {postError && (
              <p role="alert" className="text-sm text-red-600">
                {postError}
              </p>
            )}
          </form>
        )}

        <section>
          <h2 className="mb-6 px-1 text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Recent Feedback
          </h2>

          {loadError && (
            <p role="alert" className="mb-4 text-sm text-red-600">
              {loadError}
            </p>
          )}

          {loading ? (
            <p className="py-10 text-center text-sm text-zinc-400">
              読み込み中...
            </p>
          ) : reviews.length > 0 ? (
            <div className="divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-100 bg-zinc-50 shadow-sm">
              {reviews.map((review, index) => (
                <div
                  key={review.id || index}
                  className="group p-6 transition-colors hover:bg-zinc-100/80 sm:p-8"
                >
                  <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-base font-medium text-zinc-900 transition-colors group-hover:text-blue-600">
                          {review.course_name}
                        </span>

                        {review.grade && (
                          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-medium text-blue-700">
                            {review.grade}
                          </span>
                        )}

                        {review.tag && (
                          <span className="rounded-full bg-zinc-200/60 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                            {review.tag}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-400">
                        担当: {review.professor}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                      <span
                        className={`rounded-md px-2.5 py-1 ${
                          review.difficulty === '鬼'
                            ? 'bg-red-100 text-red-700'
                            : review.difficulty === '普通'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        難易度: {review.difficulty}
                      </span>

                      <span className="rounded-md bg-zinc-200/70 px-2.5 py-1 text-zinc-700">
                        負担: {review.workload}
                      </span>
                    </div>
                  </div>

                  <p className="my-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-600">
                    「{review.comment}」
                  </p>

                  <div className="flex items-center justify-between gap-2 border-t border-zinc-200/40 pt-3 text-xs text-zinc-400">
                    <span>
                      試験・評価:{' '}
                      <strong className="text-zinc-600">
                        {review.exam_type}
                      </strong>
                    </span>
                    <span>参考になった (0)</span>
                  </div>
                </div>
              ))}
            </div>
          ) : !loadError ? (
            <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-8 text-center text-sm text-zinc-500">
              まだ授業評価が投稿されていません。「＋ 投稿する」から最初のレビューを追加してみよう！
            </div>
          ) : null}
        </section>

        <footer className="mt-24 text-center text-xs tracking-wider text-zinc-400">
          Chiba Institute of Technology — Student Community
        </footer>
      </div>
    </main>
  );
}