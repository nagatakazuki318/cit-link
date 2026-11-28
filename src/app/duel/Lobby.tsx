"use client";

import { useState } from "react";
import { parseDeck, SAMPLE_DECK } from "./game";

export type LobbyResult = {
  name: string;
  room: string;
  deck: string;
  mode: "online" | "local" | "solo";
};

const field =
  "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-[#a94448] focus:ring-2 focus:ring-red-100";

const randomRoom = () => Math.random().toString(36).slice(2, 8);

export default function Lobby({
  initial,
  onStart,
}: {
  initial: Partial<LobbyResult>;
  onStart: (r: LobbyResult) => void;
}) {
  const [name, setName] = useState(initial.name ?? "");
  const [room, setRoom] = useState(initial.room ?? "");
  const [deck, setDeck] = useState(initial.deck ?? SAMPLE_DECK);
  const [mode, setMode] = useState<LobbyResult["mode"]>(initial.mode ?? "online");

  const parsed = parseDeck(deck);
  const main = parsed.filter(c => c.zone === "deck").length;
  const hyper = parsed.length - main;
  const needsRoom = mode !== "solo";
  const ok = name.trim() && main > 0 && (!needsRoom || room.trim());

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-bold">デュエマ フリー対戦</h1>
      <p className="mt-2 text-sm text-stone-500">
        ルール処理はせず、カードを自由に動かして遊ぶ対戦卓です。同じルームIDを入力した相手と盤面がリアルタイムで同期されます。
      </p>

      <form
        className="mt-8 grid gap-6 md:grid-cols-2"
        onSubmit={e => {
          e.preventDefault();
          if (ok) onStart({ name: name.trim(), room: room.trim(), deck, mode });
        }}
      >
        <div className="space-y-5">
          <label className="block text-sm font-medium">
            プレイヤー名
            <input className={`${field} mt-2`} value={name} maxLength={20} onChange={e => setName(e.target.value)} required />
          </label>

          <fieldset className="text-sm">
            <legend className="font-medium">モード</legend>
            <div className="mt-2 space-y-2">
              {(
                [
                  ["online", "オンライン対戦", "ルームIDを共有した相手と対戦"],
                  ["local", "同じブラウザの別タブ", "1台で両プレイヤーを操作して試す"],
                  ["solo", "一人回し", "相手なしでデッキの動きを確認"],
                ] as const
              ).map(([v, label, desc]) => (
                <label
                  key={v}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 ${
                    mode === v ? "border-[#a94448] bg-red-50" : "border-stone-200"
                  }`}
                >
                  <input type="radio" name="mode" className="mt-1" checked={mode === v} onChange={() => setMode(v)} />
                  <span>
                    <span className="font-semibold">{label}</span>
                    <span className="block text-xs text-stone-500">{desc}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {needsRoom && (
            <label className="block text-sm font-medium">
              ルームID
              <div className="mt-2 flex gap-2">
                <input
                  className={field}
                  value={room}
                  maxLength={32}
                  pattern="[A-Za-z0-9_\-]+"
                  title="英数字・-・_ のみ"
                  onChange={e => setRoom(e.target.value)}
                  placeholder="例: abc123"
                  required
                />
                <button
                  type="button"
                  className="shrink-0 rounded-xl border border-stone-300 px-4 text-sm hover:bg-stone-50"
                  onClick={() => setRoom(randomRoom())}
                >
                  作成
                </button>
              </div>
              <span className="mt-1 block text-xs font-normal text-stone-500">
                ルームを作ったら、IDか入室後の招待リンクを相手に送ってください。
              </span>
            </label>
          )}

          <button
            className="w-full rounded-xl bg-[#a94448] px-5 py-3 font-semibold text-white transition hover:bg-[#91383c] disabled:opacity-50"
            disabled={!ok}
          >
            卓につく
          </button>
        </div>

        <label className="block text-sm font-medium">
          デッキリスト
          <textarea
            className={`${field} mt-2 h-80 font-mono text-xs leading-6`}
            value={deck}
            onChange={e => setDeck(e.target.value)}
            spellCheck={false}
          />
          <span className={`mt-1 block text-xs font-normal ${main === 40 ? "text-stone-500" : "text-amber-700"}`}>
            メイン {main} 枚{hyper > 0 && ` ／ 超次元 ${hyper} 枚`}
            {main !== 40 && "（通常は40枚）"}
          </span>
        </label>
      </form>
    </div>
  );
}
