import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">

      {/* ヘッダー */}
      <header className="bg-[#a94448] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

          <Link href="/" className="text-2xl font-bold">
            CIT LINK
          </Link>

          <nav className="flex gap-6 text-sm font-medium">
            <Link
              href="/board"
              className="transition hover:text-red-100"
            >
              掲示板
            </Link>

            <Link
              href="/calendar"
              className="transition hover:text-red-100"
            >
              カレンダー
            </Link>

            <Link
              href="/labs"
              className="transition hover:text-red-100"
            >
              研究室
            </Link>

            <Link
              href="/links"
              className="transition hover:text-red-100"
            >
              リンク集
            </Link>
          </nav>

        </div>
      </header>


      {/* メインビジュアル */}
      <section className="relative overflow-hidden text-white">

        {/* 背景写真 */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/hero.jpg')",
          }}
        />

        {/* 写真を少し暗くする */}
        <div className="absolute inset-0 bg-black/35" />

        {/* メインビジュアルの内容 */}
        <div className="relative mx-auto max-w-6xl px-6 py-28">

          <p className="mb-3 text-sm font-medium tracking-wider">
            認知情報科学科 学生ポータル
          </p>

          <h1 className="mb-6 text-4xl font-bold md:text-5xl">
            学年を越えて、
            <br />
            学生をつなぐ。
          </h1>

          <p className="mb-8 max-w-2xl text-lg leading-relaxed text-white/90">
            質問・募集・研究・イベントなど、
            認知情報科学科の学生に役立つ情報を共有する
            学生向けプラットフォームです。
          </p>

          {/* ボタン */}
          <div className="flex flex-wrap gap-4">

            <Link
              href="/board"
              className="inline-block rounded-lg bg-white px-6 py-3 font-bold text-[#a94448] transition hover:bg-red-50"
            >
              掲示板を見る
            </Link>

            <Link
              href="/board/new"
              className="inline-block rounded-lg border border-white px-6 py-3 font-bold text-white transition hover:bg-white/10"
            >
              ＋ 投稿する
            </Link>

          </div>

        </div>
      </section>


      {/* CIT LINKでできること */}
      <section className="mx-auto max-w-6xl px-6 py-16">

        <div className="mb-10">
          <h2 className="text-2xl font-bold">
            CIT LINKでできること
          </h2>

          <p className="mt-2 text-gray-600">
            学年を越えた情報交換や交流をサポートします。
          </p>
        </div>


        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

          {/* 掲示板 */}
          <Link
            href="/board"
            className="group rounded-xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="mb-4 text-3xl">
              💬
            </div>

            <h3 className="mb-2 text-lg font-bold group-hover:text-[#a94448]">
              掲示板
            </h3>

            <p className="text-sm leading-relaxed text-gray-600">
              質問・アンケート・実験協力・メンバー募集などを投稿できます。
            </p>
          </Link>


          {/* カレンダー */}
          <Link
            href="/calendar"
            className="group rounded-xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="mb-4 text-3xl">
              📅
            </div>

            <h3 className="mb-2 text-lg font-bold group-hover:text-[#a94448]">
              カレンダー
            </h3>

            <p className="text-sm leading-relaxed text-gray-600">
              オフィスアワーやイベントなどの予定を確認できます。
            </p>
          </Link>


          {/* 研究室 */}
          <Link
            href="/labs"
            className="group rounded-xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="mb-4 text-3xl">
              🔬
            </div>

            <h3 className="mb-2 text-lg font-bold group-hover:text-[#a94448]">
              研究室
            </h3>

            <p className="text-sm leading-relaxed text-gray-600">
              認知情報科学科の研究室や教授について確認できます。
            </p>
          </Link>


          {/* リンク集 */}
          <Link
            href="/links"
            className="group rounded-xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="mb-4 text-3xl">
              🔗
            </div>

            <h3 className="mb-2 text-lg font-bold group-hover:text-[#a94448]">
              リンク集
            </h3>

            <p className="text-sm leading-relaxed text-gray-600">
              学内サービスや学生生活に役立つリンクをまとめています。
            </p>
          </Link>

        </div>
      </section>


      {/* 掲示板でできること */}
      <section className="bg-gray-100">

        <div className="mx-auto max-w-6xl px-6 py-16">

          <div className="mb-10">
            <h2 className="text-2xl font-bold">
              掲示板でできること
            </h2>

            <p className="mt-2 text-gray-600">
              学年を越えて、気軽に情報を共有できます。
            </p>
          </div>


          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {/* 質問・相談 */}
            <Link
              href="/board"
              className="rounded-xl border bg-white p-6 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-3 text-2xl">
                💬
              </div>

              <h3 className="mb-2 font-bold">
                質問・相談
              </h3>

              <p className="text-sm leading-relaxed text-gray-600">
                授業や大学生活について、先輩や同級生に質問できます。
              </p>
            </Link>


            {/* アンケート */}
            <Link
              href="/board"
              className="rounded-xl border bg-white p-6 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-3 text-2xl">
                📝
              </div>

              <h3 className="mb-2 font-bold">
                アンケート協力
              </h3>

              <p className="text-sm leading-relaxed text-gray-600">
                授業や研究などのアンケートへの協力を募集できます。
              </p>
            </Link>


            {/* 実験協力 */}
            <Link
              href="/board"
              className="rounded-xl border bg-white p-6 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-3 text-2xl">
                🧪
              </div>

              <h3 className="mb-2 font-bold">
                実験協力
              </h3>

              <p className="text-sm leading-relaxed text-gray-600">
                認知科学などの実験に協力してくれる学生を募集できます。
              </p>
            </Link>


            {/* メンバー募集 */}
            <Link
              href="/board"
              className="rounded-xl border bg-white p-6 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-3 text-2xl">
                👥
              </div>

              <h3 className="mb-2 font-bold">
                メンバー募集
              </h3>

              <p className="text-sm leading-relaxed text-gray-600">
                サークルやプロジェクトなどのメンバーを募集できます。
              </p>
            </Link>


            {/* 研究紹介 */}
            <Link
              href="/board"
              className="rounded-xl border bg-white p-6 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-3 text-2xl">
                🔬
              </div>

              <h3 className="mb-2 font-bold">
                研究・研究室紹介
              </h3>

              <p className="text-sm leading-relaxed text-gray-600">
                自分の研究や興味のある研究について紹介できます。
              </p>
            </Link>


            {/* イベント */}
            <Link
              href="/board"
              className="rounded-xl border bg-white p-6 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-3 text-2xl">
                🎉
              </div>

              <h3 className="mb-2 font-bold">
                学生活動・イベント
              </h3>

              <p className="text-sm leading-relaxed text-gray-600">
                学生同士の交流やイベントの情報を共有できます。
              </p>
            </Link>

          </div>


          <div className="mt-10 text-center">
            <Link
              href="/board"
              className="inline-block rounded-lg bg-[#a94448] px-6 py-3 font-bold text-white transition hover:bg-[#963f43]"
            >
              掲示板で投稿を探す →
            </Link>
          </div>

        </div>
      </section>


      {/* 新着情報 */}
      <section className="border-t bg-white">

        <div className="mx-auto max-w-6xl px-6 py-16">

          <div className="mb-8 flex items-center justify-between">

            <div>
              <h2 className="text-2xl font-bold">
                新着情報
              </h2>

              <p className="mt-2 text-gray-600">
                掲示板の最新情報を確認できます。
              </p>
            </div>

            <Link
              href="/board"
              className="text-sm font-medium text-[#a94448] hover:underline"
            >
              すべて見る →
            </Link>

          </div>


          <div className="space-y-4">

            {/* 投稿1 */}
            <article className="rounded-lg border p-5 transition hover:bg-gray-50">

              <div className="mb-2 flex items-center gap-3">

                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-[#a94448]">
                  質問・相談
                </span>

                <span className="text-xs text-gray-500">
                  1年生
                </span>

              </div>

              <h3 className="font-bold">
                おすすめの授業について教えてください
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                2年生の方で、おすすめの授業があれば教えてほしいです！
              </p>

            </article>


            {/* 投稿2 */}
            <article className="rounded-lg border p-5 transition hover:bg-gray-50">

              <div className="mb-2 flex items-center gap-3">

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  実験協力
                </span>

                <span className="text-xs text-gray-500">
                  3年生
                </span>

              </div>

              <h3 className="font-bold">
                認知実験の参加者を募集しています
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                30分程度の実験に協力していただける方を募集しています。
              </p>

            </article>


            {/* 投稿3 */}
            <article className="rounded-lg border p-5 transition hover:bg-gray-50">

              <div className="mb-2 flex items-center gap-3">

                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                  アンケート
                </span>

                <span className="text-xs text-gray-500">
                  2年生
                </span>

              </div>

              <h3 className="font-bold">
                授業に関するアンケートへの協力お願いします
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                授業改善のためのアンケートを実施しています。
              </p>

            </article>

          </div>

        </div>
      </section>


      {/* フッター */}
      <footer className="border-t bg-gray-900 text-gray-400">

        <div className="mx-auto max-w-6xl px-6 py-8 text-center text-sm">
          © 2026 CIT LINK
        </div>

      </footer>

    </main>
  );
}