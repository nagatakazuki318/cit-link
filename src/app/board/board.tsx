"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { categories, grades, type Thread } from "./types";

const field = "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-[#a94448] focus:ring-2 focus:ring-red-100";
const primary = "rounded-xl bg-[#a94448] px-5 py-3 font-semibold text-white transition hover:bg-[#91383c] disabled:opacity-50";
const date = (value: string) => new Date(value).toLocaleString("ja-JP", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

export default function Board({ initialCreate = false }: { initialCreate?: boolean }) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [creating, setCreating] = useState(initialCreate);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("すべて");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    let active = true;
    async function refresh() {
      try {
        const response = await fetch("/board/api", { cache: "no-store" });
        if (!response.ok) throw new Error("掲示板を読み込めませんでした。通信環境を確認してください。");
        const data: Thread[] = await response.json();
        if (active) { setThreads(data); setError(""); }
      } catch (e) { if (active) setError((e as Error).message); }
      finally { if (active) setLoading(false); }
    }
    void refresh();
    const timer = setInterval(refresh, 10000);
    return () => { active = false; clearInterval(timer); };
  }, []);
  const current = threads.find(t => t.id === selected);
  const visible = threads.filter(t => (filter === "すべて" || t.category === filter) && `${t.title} ${t.posts[0].body} ${t.posts[0].name}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const input = Object.fromEntries(new FormData(form));
    setBusy(true); setNotice("");
    try {
      const response = await fetch("/board/api", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...input, threadId: creating ? undefined : selected }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "投稿できませんでした。");
      setThreads(previous => [...previous.filter(t => t.id !== data.id), data]);
      setSelected(data.id); setCreating(false);
      form.reset(); setNotice("投稿しました。");
    } catch (e) { setNotice((e as Error).message); }
    finally { setBusy(false); }
  }
  function identity() {
    return <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-medium">ニックネーム<input className={`${field} mt-2`} name="name" placeholder="例：たろう" maxLength={30} required /></label><label className="text-sm font-medium">学年<select name="grade" className={`${field} mt-2`} required defaultValue=""><option value="" disabled>学年を選択</option>{grades.map(g => <option key={g}>{g}</option>)}</select></label></div>;
  }
  return <main className="min-h-screen bg-[#f8f7f5] text-stone-800">
    <header className="bg-[#a94448] text-white"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4"><Link href="/" className="text-2xl font-bold tracking-wide">CIT LINK</Link><nav aria-label="メインナビゲーション" className="flex flex-wrap gap-5 text-sm"><Link href="/board" aria-current="page" className="font-bold underline underline-offset-8">掲示板</Link><Link href="/calendar">カレンダー</Link><Link href="/labs">研究室</Link><Link href="/links">リンク集</Link></nav></div></header>
    <div className="mx-auto max-w-6xl px-5 py-10 md:py-14">
      <Link href="/" className="text-sm text-stone-500 hover:underline">ホーム /</Link>
      <div className="my-6 flex flex-wrap items-end justify-between gap-5"><div><p className="mb-2 text-xs font-bold tracking-widest text-[#a94448]">COMMUNITY BOARD</p><h1 className="text-3xl font-bold md:text-4xl">みんなの掲示板</h1><p className="mt-3 text-stone-500">ちょっとした質問も、仲間探しも。学年を越えて話してみよう。</p></div><button className={primary} onClick={() => { setCreating(true); setSelected(null); setNotice(""); }}>＋ スレッドを作成</button></div>
      <p className="mb-7 rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm leading-relaxed text-[#873c40]">誰でも気軽に参加できます。相手を尊重し、個人情報の投稿は控えましょう。</p>
      {error && <p role="alert" className="mb-4 rounded-xl bg-amber-50 p-4 text-amber-800">{error} 自動で再読み込みします。</p>}
      <div className="grid items-start gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-2xl border border-stone-200 bg-white p-5"><label className="text-sm font-semibold" htmlFor="search">スレッドを検索</label><input id="search" className={`${field} mt-2 mb-5`} placeholder="キーワードを入力" value={search} onChange={e => setSearch(e.target.value)} /><p className="mb-3 text-sm font-semibold">カテゴリ</p><div className="flex flex-wrap gap-2 lg:flex-col">{["すべて", ...categories].map(c => <button key={c} aria-pressed={filter === c} onClick={() => setFilter(c)} className={`rounded-lg px-3 py-2 text-left text-sm ${filter === c ? "bg-red-50 font-bold text-[#a94448]" : "text-stone-600 hover:bg-stone-50"}`}>{c}<span className="ml-3 text-xs text-stone-400">{threads.filter(t => c === "すべて" || t.category === c).length}</span></button>)}</div><p className="mt-6 border-t border-stone-100 pt-4 text-xs leading-6 text-stone-400">会話は10秒ごとに更新されます。<br />投稿時の名前・学年は自己申告です。</p></aside>
        <section aria-label="スレッド" className="min-w-0">
          <p role="status" className="mb-3 text-sm text-[#a94448]">{notice}</p>
          {creating ? <div className="rounded-2xl border border-stone-200 bg-white p-6 md:p-8"><button className="mb-5 text-sm text-stone-500 hover:underline" onClick={() => { setCreating(false); setNotice(""); }}>← 一覧へ戻る</button><h2 className="mb-6 text-2xl font-bold">新しいスレッド</h2><form onSubmit={submit} className="space-y-5">{identity()}<label className="block text-sm font-medium">カテゴリ<select name="category" className={`${field} mt-2`}>{categories.map(c => <option key={c}>{c}</option>)}</select></label><label className="block text-sm font-medium">タイトル<input name="title" className={`${field} mt-2`} placeholder="どんなことを話したい？" maxLength={100} required /></label><label className="block text-sm font-medium">本文<textarea name="body" className={`${field} mt-2 min-h-40`} placeholder="質問や話したいことを自由に書いてください。" maxLength={2000} required /></label><button disabled={busy} className={primary}>{busy ? "投稿中…" : "スレッドを公開"}</button></form></div>
          : current ? <div className="rounded-2xl border border-stone-200 bg-white p-6 md:p-8"><button className="mb-5 text-sm text-stone-500 hover:underline" onClick={() => { setSelected(null); setNotice(""); }}>← 一覧へ戻る</button><span className="rounded-full bg-red-50 px-3 py-1 text-xs text-[#a94448]">{current.category}</span><h2 className="mt-4 break-words text-2xl font-bold">{current.title}</h2><p className="mt-2 text-xs text-stone-400">{current.posts.length - 1} 件の返信</p><div className="my-6 divide-y divide-stone-100">{current.posts.map((p, index) => <article key={p.id} className="py-5"><div className="flex flex-wrap items-center gap-2 text-sm"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 font-bold text-[#a94448]" aria-hidden="true">{p.name.slice(0, 1)}</span><span className="break-all font-semibold">{p.name}</span><span className="text-xs text-stone-500">{p.grade} · {index === 0 ? "スレッド作成者" : `#${index}`}</span><time dateTime={p.createdAt} className="text-xs text-stone-400">{date(p.createdAt)}</time></div><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7">{p.body}</p></article>)}</div><h3 className="mb-4 text-lg font-bold">会話に参加する</h3><form key={current.id} onSubmit={submit} className="space-y-4">{identity()}<label className="block text-sm font-medium">返信<textarea name="body" className={`${field} mt-2 min-h-28`} maxLength={2000} required placeholder="あなたの経験やアイデアを共有しよう。" /></label><button className={primary} disabled={busy}>{busy ? "送信中…" : "返信を投稿"}</button></form></div>
          : <><div className="mb-4 flex items-center justify-between"><h2 className="font-bold">{filter} <span className="ml-2 text-sm font-normal text-stone-400">{visible.length} スレッド</span><span className="text-xs text-stone-500">更新順</span></h2></div>{loading ? <p role="status" className="rounded-2xl bg-white p-8">読み込み中…</p> : visible.length === 0 ? <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center"><p className="text-3xl" aria-hidden="true">💬</p><h3 className="mt-4 text-lg font-bold">{search || filter !== "すべて" ? "該当するスレッドがありません" : "最初の会話を始めよう"}</h3><p className="mt-2 text-sm text-stone-500">{search || filter !== "すべて" ? "キーワードやカテゴリを変えてみてください。" : "授業の相談、趣味の話、仲間の募集。どんな話題でもどうぞ。"}</p></div> : <div className="space-y-3">{visible.map(t => <button key={t.id} onClick={() => { setSelected(t.id); setNotice(""); }} className="w-full rounded-2xl border border-stone-200 bg-white p-6 text-left transition hover:border-red-200 hover:shadow-sm"><div className="flex items-center justify-between gap-2"><span className="rounded-full bg-red-50 px-3 py-1 text-xs text-[#a94448]">{t.category}</span><span className="text-xs text-stone-400">{date(t.updatedAt)}</span></div><h3 className="mt-3 break-words text-lg font-bold">{t.title}</h3><p className="mt-2 line-clamp-2 break-words text-sm leading-6 text-stone-500">{t.posts[0].body}</p><div className="mt-4 flex flex-wrap justify-between gap-2 text-xs text-stone-400"><span className="break-all">{t.posts[0].name} · {t.posts[0].grade}</span><span className="text-[#a94448]">{t.posts.length - 1} 件の返信 →</span></div></button>)}</div>}</>}
        </section>
      </div>
      <footer className="mt-12 text-center text-xs text-stone-400">© 2026 CIT LINK · 学年を越えて、学生をつなぐ。</footer>
    </div>
  </main>;
}
