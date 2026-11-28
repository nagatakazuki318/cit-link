"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import CardView from "./CardView";
import {
  buildBoard,
  drawCards,
  inZone,
  moveCard,
  parseDeck,
  setupGame,
  shuffleDeck,
  toPublic,
  untapAll,
  update,
  ZONE_LABEL,
  type Board,
  type Card,
  type PublicCard,
  type PublicState,
  type Zone,
} from "./game";
import { connect, type LogEntry, type Message, type Transport, type TransportStatus } from "./transport";
import type { LobbyResult } from "./Lobby";

const PUBLIC_ZONES: Zone[] = ["battle", "mana", "grave", "hyper"];
const MOVE_TARGETS: Zone[] = ["hand", "battle", "mana", "shield", "grave", "hyper"];

type MenuState = { x: number; y: number; cardId?: string; pile?: Zone };
type ViewerState = { zone: Zone; limit?: number; opp?: boolean };
type DragState = { id: string; sx: number; sy: number; moved: boolean; timer?: number; longPressed?: boolean };

const uid = () => Math.random().toString(36).slice(2, 10);
const btn =
  "rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 disabled:opacity-40";

export default function Table({ config, onLeave }: { config: LobbyResult; onLeave: () => void }) {
  const me = useMemo(() => {
    const key = "duel:playerId";
    try {
      // タブごとに別プレイヤーにするため sessionStorage
      const saved = sessionStorage.getItem(key);
      if (saved) return saved;
      const id = uid();
      sessionStorage.setItem(key, id);
      return id;
    } catch {
      return uid();
    }
  }, []);
  const storageKey = `duel:board:${config.mode}:${config.room || "solo"}`;

  const [board, setBoardState] = useState<Board>(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved).board as Board;
    } catch {}
    return setupGame(buildBoard(parseDeck(config.deck)));
  });
  const [turn, setTurn] = useState<number>(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved).turn as number;
    } catch {}
    return 0;
  });
  const [revealed, setRevealed] = useState<string[]>([]);
  const [opp, setOpp] = useState<{ id: string; state: PublicState | null } | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState<TransportStatus>(config.mode === "solo" ? "online" : "connecting");
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [viewer, setViewer] = useState<ViewerState | null>(null);
  const [ghost, setGhost] = useState<{ id: string; x: number; y: number } | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [chat, setChat] = useState("");
  const [copied, setCopied] = useState(false);

  const transport = useRef<Transport | null>(null);
  // 同じイベント内で連続操作しても最新の盤面を使えるよう、ref も同時に更新する
  const boardRef = useRef(board);
  const setBoard = (b: Board) => {
    boardRef.current = b;
    setBoardState(b);
  };
  const oppRef = useRef(opp);
  const drag = useRef<DragState | null>(null);

  // 手札から離れたカードは公開対象から外す
  const shown = useMemo(
    () => revealed.filter(id => board.cards.some(c => c.id === id && c.zone === "hand")),
    [revealed, board],
  );
  const publicState = useMemo(() => toPublic(board, config.name, shown), [board, config.name, shown]);
  const publicRef = useRef(publicState);
  useEffect(() => {
    publicRef.current = publicState;
    oppRef.current = opp;
  });

  // ---- 通信 ----
  const pushLog = useCallback(
    (text: string, chatMsg = false) => {
      const entry: LogEntry = { id: uid(), player: config.name, text, at: Date.now(), chat: chatMsg };
      setLog(l => [...l.slice(-199), entry]);
      transport.current?.send({ type: "log", from: me, entry });
    },
    [config.name, me],
  );

  useEffect(() => {
    if (config.mode === "solo") return;
    const onMessage = (msg: Message) => {
      if (msg.from === me) return;
      const current = oppRef.current;
      // 先に入ってきた1人だけを対戦相手として扱う（3人目以降は無視）
      if (current && current.id !== msg.from) return;
      switch (msg.type) {
        case "hello":
          setOpp({ id: msg.from, state: current?.state ?? null });
          transport.current?.send({ type: "state", from: me, state: publicRef.current });
          break;
        case "state":
          if (!current) transport.current?.send({ type: "state", from: me, state: publicRef.current });
          setOpp({ id: msg.from, state: msg.state });
          break;
        case "log":
          setLog(l => [...l.slice(-199), msg.entry]);
          break;
        case "bye":
          if (current) {
            setOpp(null);
            setLog(l => [
              ...l,
              { id: uid(), player: "", text: `${current.state?.player ?? "相手"} が退出しました`, at: Date.now() },
            ]);
          }
          break;
      }
    };
    const t = connect(config.room, me, config.mode === "local" ? "local" : "online", onMessage, setStatus);
    transport.current = t;
    const onUnload = () => t.close();
    window.addEventListener("beforeunload", onUnload);
    return () => {
      window.removeEventListener("beforeunload", onUnload);
      t.close();
      transport.current = null;
    };
  }, [config.mode, config.room, me]);

  // 盤面が変わるたびに公開情報を送る
  useEffect(() => {
    transport.current?.send({ type: "state", from: me, state: publicState });
  }, [publicState, me, status]);

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ board, turn }));
    } catch {}
  }, [board, turn, storageKey]);

  // ---- 操作 ----
  const describe = (card: Card, from: Zone, to: Zone, faceDownAfter: boolean) => {
    const visibleBefore = PUBLIC_ZONES.includes(from) && !card.faceDown;
    const visibleAfter = (PUBLIC_ZONES.includes(to) || to === "shield") && !faceDownAfter;
    return visibleBefore || visibleAfter ? `《${card.name}》` : "カード";
  };

  const move = (id: string, to: Zone, opts: Parameters<typeof moveCard>[3] = {}) => {
    const card = boardRef.current.cards.find(c => c.id === id);
    if (!card) return;
    const next = moveCard(boardRef.current, id, to, opts);
    setBoard(next);
    if (card.zone === to && to === "battle") return; // 位置調整はログしない
    if (card.zone === to && to !== "deck") return;
    const after = next.cards.find(c => c.id === id)!;
    const where = to === "deck" ? (opts.toTop ? "山札の上" : "山札の下") : ZONE_LABEL[to];
    if (card.zone === "deck" && to === "hand") pushLog("山札から1枚引いた");
    else if (card.zone === "shield" && to === "hand") pushLog(`シールドを1枚手札に加えた`);
    else pushLog(`${describe(card, card.zone, to, after.faceDown)} を ${ZONE_LABEL[card.zone]} → ${where}`);
  };

  const moveToDeckBottom = (id: string) => {
    const card = boardRef.current.cards.find(c => c.id === id);
    if (!card) return;
    setBoard(moveCard(boardRef.current, id, "deck"));
    pushLog(`${describe(card, card.zone, "deck", true)} を ${ZONE_LABEL[card.zone]} → 山札の下`);
  };

  const toggleTap = (id: string) => {
    const card = boardRef.current.cards.find(c => c.id === id);
    if (!card) return;
    setBoard(update(boardRef.current, id, { tapped: !card.tapped }));
    pushLog(`${card.faceDown ? "カード" : `《${card.name}》`} を${card.tapped ? "アンタップ" : "タップ"}`);
  };

  const flip = (id: string) => {
    const card = boardRef.current.cards.find(c => c.id === id);
    if (!card) return;
    setBoard(update(boardRef.current, id, { faceDown: !card.faceDown }));
    pushLog(card.faceDown ? `${ZONE_LABEL[card.zone]}の《${card.name}》を表向きにした` : `${ZONE_LABEL[card.zone]}のカードを裏向きにした`);
  };

  const draw = (n = 1) => {
    const count = Math.min(n, inZone(boardRef.current, "deck").length);
    if (!count) return pushLog("山札がありません！");
    setBoard(drawCards(boardRef.current, count));
    pushLog(`山札から${count}枚引いた`);
  };

  const topTo = (zone: Zone, faceDown?: boolean) => {
    const top = inZone(boardRef.current, "deck")[0];
    if (!top) return;
    move(top.id, zone, { faceDown });
  };

  const startTurn = () => {
    const n = turn + 1;
    setTurn(n);
    let next = untapAll(boardRef.current);
    const drew = inZone(next, "deck").length > 0;
    if (n > 1 || config.mode === "solo") next = drawCards(next, 1);
    setBoard(next);
    pushLog(`── ターン${n} 開始（アンタップ${n > 1 || config.mode === "solo" ? (drew ? "・ドロー" : "・山札切れ!") : ""}）`);
  };

  const resetGame = () => {
    if (!confirm("全てのカードを戻してシャッフルし、シールド5枚・手札5枚で始め直しますか？")) return;
    setBoard(setupGame(boardRef.current));
    setTurn(0);
    pushLog("ゲームをリセット（シールド5枚・手札5枚）");
  };

  const coin = () => pushLog(`コイントス: ${Math.random() < 0.5 ? "表（先攻）" : "裏（後攻）"}`);
  const dice = () => pushLog(`サイコロ: ${1 + Math.floor(Math.random() * 6)}`);

  // ---- ドラッグ ----
  const dropAt = (id: string, x: number, y: number) => {
    const els = document.elementsFromPoint(x, y);
    const target = els.find(el => (el as HTMLElement).dataset?.drop) as HTMLElement | undefined;
    if (!target) return;
    const zone = target.dataset.drop as Zone;
    if (zone === "battle") {
      const r = target.getBoundingClientRect();
      const px = Math.min(0.97, Math.max(0.03, (x - r.left) / r.width));
      const py = Math.min(0.95, Math.max(0.05, (y - r.top) / r.height));
      move(id, "battle", { x: px, y: py });
    } else if (zone === "deck") {
      move(id, "deck", { toTop: true });
    } else {
      move(id, zone);
    }
  };

  const startDrag = (e: React.PointerEvent, id: string, onClick: () => void) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const state: DragState = { id, sx: e.clientX, sy: e.clientY, moved: false };
    state.timer = window.setTimeout(() => {
      if (!state.moved) {
        state.longPressed = true;
        setMenu({ x: state.sx, y: state.sy, cardId: id });
      }
    }, 550);
    drag.current = state;
    const onMove = (ev: PointerEvent) => {
      const d = drag.current;
      if (!d || d.longPressed) return;
      if (!d.moved && Math.hypot(ev.clientX - d.sx, ev.clientY - d.sy) < 6) return;
      d.moved = true;
      clearTimeout(d.timer);
      // 画面端に近づいたら自動スクロール
      if (ev.clientY < 90) window.scrollBy(0, -24);
      else if (ev.clientY > window.innerHeight - 40) window.scrollBy(0, 24);
      setGhost({ id: d.id, x: ev.clientX, y: ev.clientY });
    };
    const onUp = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      const d = drag.current;
      drag.current = null;
      setGhost(null);
      if (!d) return;
      clearTimeout(d.timer);
      if (d.longPressed) return;
      if (d.moved) dropAt(d.id, ev.clientX, ev.clientY);
      else onClick();
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  const openMenu = (e: React.MouseEvent, m: Omit<MenuState, "x" | "y">) => {
    e.preventDefault();
    setMenu({ x: e.clientX, y: e.clientY, ...m });
  };

  // ---- 描画用 ----
  const my = (z: Zone) => inZone(board, z);
  const oppCards = (z: Zone) => (opp?.state?.cards ?? []).filter(c => c.zone === z);
  const ghostCard = ghost && board.cards.find(c => c.id === ghost.id);

  const ownCard = (c: Card, props: { size?: number; badge?: string } = {}) => (
    <div
      key={c.id}
      className={`touch-none ${ghost?.id === c.id ? "opacity-30" : ""} cursor-grab`}
      onPointerDown={e =>
        startDrag(e, c.id, () => {
          if (c.zone === "battle" || c.zone === "mana") toggleTap(c.id);
          else setMenu({ x: e.clientX, y: e.clientY, cardId: c.id });
        })
      }
      onContextMenu={e => openMenu(e, { cardId: c.id })}
      onMouseEnter={() => !c.faceDown && setPreview(c.name)}
      onMouseLeave={() => setPreview(null)}
    >
      <CardView
        name={c.name}
        faceDown={c.faceDown && c.zone !== "hand"}
        tapped={c.tapped}
        size={props.size}
        badge={props.badge}
        highlight={shown.includes(c.id)}
      />
    </div>
  );

  const oppCard = (c: PublicCard, size?: number) => (
    <div
      key={c.id}
      onMouseEnter={() => c.name && !c.faceDown && setPreview(c.name)}
      onMouseLeave={() => setPreview(null)}
    >
      <CardView name={c.name} faceDown={c.faceDown} tapped={c.tapped} size={size} />
    </div>
  );

  const pile = (zone: Zone, cards: Card[], label: string) => {
    const top = cards[zone === "deck" ? 0 : cards.length - 1];
    return (
      <div className="flex flex-col items-center gap-1">
        <div
          data-drop={zone}
          className="flex min-h-[90px] min-w-[66px] items-center justify-center rounded-lg border border-dashed border-white/30 bg-black/20 p-0.5"
          onContextMenu={e => openMenu(e, { pile: zone })}
        >
          {top ? (
            <div
              className="cursor-grab touch-none"
              onPointerDown={e =>
                startDrag(e, top.id, () =>
                  zone === "deck" ? draw(1) : setViewer({ zone }),
                )
              }
              onMouseEnter={() => zone !== "deck" && setPreview(top.name)}
              onMouseLeave={() => setPreview(null)}
            >
              <CardView name={top.name} faceDown={zone === "deck" || top.faceDown} badge={String(cards.length)} />
            </div>
          ) : (
            <span className="text-[10px] text-white/40">なし</span>
          )}
        </div>
        <button className="text-[11px] text-white/80 hover:underline" onClick={e => openMenu(e, { pile: zone })}>
          {label} ▾
        </button>
      </div>
    );
  };

  const oppPile = (zone: Zone, count: number, top: PublicCard | undefined, label: string) => (
    <div className="flex flex-col items-center gap-1">
      <div className="flex min-h-[90px] min-w-[66px] items-center justify-center rounded-lg border border-dashed border-white/20 bg-black/20 p-0.5">
        {count > 0 ? (
          <div
            className={zone !== "deck" ? "cursor-pointer" : ""}
            onClick={() => zone !== "deck" && setViewer({ zone, opp: true })}
            onMouseEnter={() => top?.name && setPreview(top.name)}
            onMouseLeave={() => setPreview(null)}
          >
            <CardView name={zone === "deck" ? null : top?.name ?? null} faceDown={zone === "deck"} badge={String(count)} />
          </div>
        ) : (
          <span className="text-[10px] text-white/40">なし</span>
        )}
      </div>
      <span className="text-[11px] text-white/60">{label}</span>
    </div>
  );

  const inviteUrl =
    typeof window !== "undefined" && config.mode === "online"
      ? `${window.location.origin}/duel?room=${encodeURIComponent(config.room)}`
      : "";

  const os = opp?.state;
  const oppGrave = oppCards("grave");
  const oppHyper = oppCards("hyper");

  return (
    <div className="min-h-screen select-none bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-white">
      {/* ツールバー */}
      <div className="sticky top-16 z-30 flex flex-wrap items-center gap-2 border-b border-white/10 bg-emerald-950/95 px-4 py-2 backdrop-blur">
        <span className="mr-2 text-sm font-bold">
          {config.mode === "solo" ? "一人回し" : `ルーム ${config.room}`}
          <span
            className={`ml-2 inline-block h-2 w-2 rounded-full ${
              status === "online" ? (opp || config.mode === "solo" ? "bg-green-400" : "bg-amber-400") : status === "error" ? "bg-red-500" : "bg-stone-400"
            }`}
            title={status}
          />
        </span>
        <span className="mr-2 text-xs text-white/70">ターン {turn}</span>
        <button className={btn} onClick={startTurn}>ターン開始</button>
        <button className={btn} onClick={() => draw(1)}>1枚引く</button>
        <button
          className={btn}
          onClick={() => {
            setBoard(untapAll(boardRef.current));
            pushLog("全てアンタップ");
          }}
        >
          全アンタップ
        </button>
        <button
          className={btn}
          onClick={() => {
            setBoard(shuffleDeck(boardRef.current));
            pushLog("山札をシャッフル");
          }}
        >
          シャッフル
        </button>
        <button className={btn} onClick={coin}>コイン</button>
        <button className={btn} onClick={dice}>サイコロ</button>
        <button className={btn} onClick={resetGame}>リセット</button>
        {inviteUrl && (
          <button
            className={btn}
            onClick={() => {
              void navigator.clipboard?.writeText(inviteUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? "コピーしました" : "招待リンク"}
          </button>
        )}
        <button
          className={`${btn} ml-auto`}
          onClick={() => {
            if (!confirm("卓を離れますか？（盤面はこのタブに保存されます）")) return;
            onLeave();
          }}
        >
          退出
        </button>
      </div>

      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 p-4 lg:flex-row">
        <div className="min-w-0 flex-1 space-y-3">
          {/* ===== 相手側 ===== */}
          {config.mode !== "solo" && (
            <section className="rounded-2xl bg-black/20 p-3">
              {!os ? (
                <p className="py-16 text-center text-sm text-white/60">
                  {status === "error" ? "接続できませんでした。ページを再読み込みしてください。" : "対戦相手の入室を待っています…"}
                </p>
              ) : (
                <div className="space-y-3">
                  <Row label={`${os.player} の手札 (${os.handCount})`}>
                    <div className="flex flex-wrap gap-1">
                      {Array.from({ length: os.handCount }).map((_, i) => {
                        const name = os.revealed[i];
                        return (
                          <div key={i} onMouseEnter={() => name && setPreview(name)} onMouseLeave={() => setPreview(null)}>
                            <CardView name={name ?? null} faceDown={!name} size={0.6} highlight={!!name} />
                          </div>
                        );
                      })}
                    </div>
                  </Row>
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="min-w-[160px] flex-1">
                      <div className="mb-1 text-[11px] text-white/60">
                        マナ ({oppCards("mana").length} ／ 未タップ {oppCards("mana").filter(c => !c.tapped).length})
                      </div>
                      <div className="flex min-h-[70px] flex-wrap gap-1">{oppCards("mana").map(c => oppCard(c, 0.75))}</div>
                    </div>
                    {oppPile("deck", os.deckCount, undefined, "山札")}
                    {oppPile("grave", oppGrave.length, oppGrave[oppGrave.length - 1], "墓地")}
                    {oppPile("hyper", oppHyper.length, oppHyper[oppHyper.length - 1], "超次元")}
                    <div className="flex-1">
                      <div className="mb-1 text-[11px] text-white/60">シールド ({oppCards("shield").length})</div>
                      <div className="flex flex-wrap gap-1">{oppCards("shield").map(c => oppCard(c, 0.8))}</div>
                    </div>
                  </div>
                  <div className="relative h-[210px] rounded-xl border border-white/15 bg-black/10">
                    <span className="absolute left-2 top-1 text-[11px] text-white/40">{os.player} のバトルゾーン</span>
                    {oppCards("battle").map(c => (
                      <div
                        key={c.id}
                        className="absolute"
                        style={{ left: `${(1 - c.x) * 100}%`, top: `${(1 - c.y) * 100}%`, transform: "translate(-50%,-50%)", zIndex: c.z }}
                      >
                        {oppCard(c)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ===== 自分側 ===== */}
          <section className="space-y-3 rounded-2xl bg-black/20 p-3">
            <div data-drop="battle" className="relative h-[250px] rounded-xl border border-amber-200/30 bg-black/10">
              <span className="pointer-events-none absolute left-2 top-1 text-[11px] text-white/40">
                バトルゾーン（クリックでタップ／ドラッグで移動／右クリック・長押しでメニュー）
              </span>
              {my("battle").map(c => (
                <div
                  key={c.id}
                  className="absolute"
                  style={{ left: `${c.x * 100}%`, top: `${c.y * 100}%`, transform: "translate(-50%,-50%)", zIndex: c.z }}
                >
                  {ownCard(c)}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1">
                <div className="mb-1 text-[11px] text-white/60">シールド ({my("shield").length})</div>
                <div data-drop="shield" className="flex min-h-[92px] flex-wrap gap-1 rounded-lg border border-dashed border-white/30 bg-black/20 p-1">
                  {my("shield").map((c, i) => ownCard(c, { size: 0.9, badge: String(i + 1) }))}
                </div>
              </div>
              {pile("deck", my("deck"), "山札")}
              {pile("grave", my("grave"), "墓地")}
              {pile("hyper", my("hyper"), "超次元")}
            </div>

            <div>
              <div className="mb-1 text-[11px] text-white/60">
                マナ ({my("mana").length} ／ 未タップ {my("mana").filter(c => !c.tapped).length})
              </div>
              <div data-drop="mana" className="flex min-h-[80px] flex-wrap gap-1 rounded-lg border border-dashed border-white/30 bg-black/20 p-1">
                {my("mana").map(c => ownCard(c, { size: 0.8 }))}
              </div>
            </div>

            <div>
              <div className="mb-1 text-[11px] text-white/60">手札 ({my("hand").length})</div>
              <div data-drop="hand" className="flex min-h-[100px] flex-wrap gap-1.5 rounded-lg border border-dashed border-amber-200/40 bg-black/30 p-1.5">
                {my("hand").map(c => ownCard(c, { size: 1.05 }))}
              </div>
            </div>
          </section>
        </div>

        {/* ===== サイド：プレビュー・ログ ===== */}
        <aside className="w-full shrink-0 space-y-3 lg:w-72">
          <div className="flex h-[180px] items-center justify-center rounded-2xl bg-black/20 p-3">
            {preview ? <CardView name={preview} size={1.9} /> : <span className="text-xs text-white/40">カードにカーソルを合わせると拡大</span>}
          </div>
          <div className="flex h-[420px] flex-col rounded-2xl bg-black/20 p-3">
            <h2 className="mb-2 text-xs font-bold text-white/70">ログ</h2>
            <LogList log={log} me={config.name} />
            <form
              className="mt-2 flex gap-1"
              onSubmit={e => {
                e.preventDefault();
                if (!chat.trim()) return;
                pushLog(chat.trim().slice(0, 200), true);
                setChat("");
              }}
            >
              <input
                className="min-w-0 flex-1 rounded-lg bg-white/10 px-2 py-1.5 text-xs outline-none placeholder:text-white/40 focus:bg-white/20"
                placeholder="チャット"
                value={chat}
                onChange={e => setChat(e.target.value)}
              />
              <button className={btn}>送信</button>
            </form>
          </div>
        </aside>
      </div>

      {/* ドラッグ中のカード */}
      {ghost && ghostCard && (
        <div className="pointer-events-none fixed z-50" style={{ left: ghost.x, top: ghost.y, transform: "translate(-50%,-50%) rotate(-4deg)" }}>
          <CardView name={ghostCard.name} faceDown={ghostCard.faceDown && ghostCard.zone !== "hand"} />
        </div>
      )}

      {menu && (
        <ContextMenu menu={menu} onClose={() => setMenu(null)}>
          {menu.cardId
            ? cardMenu(board.cards.find(c => c.id === menu.cardId))
            : menu.pile && pileMenu(menu.pile)}
        </ContextMenu>
      )}

      {viewer && renderViewer(viewer)}
    </div>
  );

  // ---- メニュー定義 ----
  function cardMenu(c: Card | undefined) {
    if (!c) return null;
    const close = (fn: () => void) => () => {
      fn();
      setMenu(null);
    };
    return (
      <>
        <MenuTitle>{c.faceDown && c.zone !== "hand" ? `${ZONE_LABEL[c.zone]}のカード（${c.name}）` : c.name}</MenuTitle>
        {(c.zone === "battle" || c.zone === "mana") && (
          <MenuItem onClick={close(() => toggleTap(c.id))}>{c.tapped ? "アンタップ" : "タップ"}</MenuItem>
        )}
        {c.zone !== "hand" && <MenuItem onClick={close(() => flip(c.id))}>{c.faceDown ? "表向きにする" : "裏向きにする"}</MenuItem>}
        {c.zone === "hand" && config.mode !== "solo" && (
          <MenuItem
            onClick={close(() => {
              const on = !shown.includes(c.id);
              setRevealed(on ? [...shown, c.id] : shown.filter(x => x !== c.id));
              pushLog(on ? `手札の《${c.name}》を公開` : "手札の公開をやめた");
            })}
          >
            {shown.includes(c.id) ? "公開をやめる" : "相手に見せる"}
          </MenuItem>
        )}
        <MenuSep />
        {MOVE_TARGETS.filter(z => z !== c.zone).map(z => (
          <MenuItem key={z} onClick={close(() => move(c.id, z))}>
            {ZONE_LABEL[z]}へ
          </MenuItem>
        ))}
        {c.zone === "battle" || c.zone === "hand" ? (
          <MenuItem onClick={close(() => move(c.id, "battle", { faceDown: true }))}>裏向きでバトルゾーンへ</MenuItem>
        ) : null}
        <MenuItem onClick={close(() => move(c.id, "deck", { toTop: true }))}>山札の上へ</MenuItem>
        <MenuItem onClick={close(() => moveToDeckBottom(c.id))}>山札の下へ</MenuItem>
      </>
    );
  }

  function pileMenu(zone: Zone) {
    const close = (fn: () => void) => () => {
      fn();
      setMenu(null);
    };
    if (zone === "deck") {
      return (
        <>
          <MenuTitle>山札（{my("deck").length}枚）</MenuTitle>
          <MenuItem onClick={close(() => draw(1))}>1枚引く</MenuItem>
          <MenuItem
            onClick={close(() => {
              const n = Number(prompt("何枚引きますか？", "2"));
              if (n > 0) draw(n);
            })}
          >
            X枚引く…
          </MenuItem>
          <MenuItem onClick={close(() => topTo("mana"))}>上から1枚マナへ</MenuItem>
          <MenuItem onClick={close(() => topTo("grave"))}>上から1枚墓地へ</MenuItem>
          <MenuItem onClick={close(() => topTo("shield"))}>上から1枚シールドへ</MenuItem>
          <MenuItem onClick={close(() => topTo("battle"))}>上から1枚めくってバトルゾーンへ</MenuItem>
          <MenuSep />
          <MenuItem
            onClick={close(() => {
              const n = Number(prompt("上から何枚見ますか？", "3"));
              if (n > 0) {
                setViewer({ zone: "deck", limit: n });
                pushLog(`山札の上から${n}枚を見た`);
              }
            })}
          >
            上からX枚を見る…
          </MenuItem>
          <MenuItem
            onClick={close(() => {
              setViewer({ zone: "deck" });
              pushLog("山札を見た（サーチ）");
            })}
          >
            山札をすべて見る（サーチ）
          </MenuItem>
          <MenuItem
            onClick={close(() => {
              setBoard(shuffleDeck(boardRef.current));
              pushLog("山札をシャッフル");
            })}
          >
            シャッフル
          </MenuItem>
        </>
      );
    }
    return (
      <>
        <MenuTitle>
          {ZONE_LABEL[zone]}（{my(zone).length}枚）
        </MenuTitle>
        <MenuItem onClick={close(() => setViewer({ zone }))}>一覧を見る</MenuItem>
      </>
    );
  }

  function renderViewer(v: ViewerState) {
    const isOpp = !!v.opp;
    const zone = v.zone;
    const list: (Card | PublicCard)[] = isOpp ? oppCards(zone) : my(zone).slice(0, v.limit ?? undefined);
    const title = `${isOpp ? `${os?.player ?? "相手"}の` : ""}${ZONE_LABEL[zone]}${v.limit ? `（上から${v.limit}枚）` : ""}`;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setViewer(null)}>
        <div className="max-h-[85vh] w-full max-w-3xl overflow-auto rounded-2xl bg-emerald-950 p-5 text-white shadow-xl" onClick={e => e.stopPropagation()}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">
              {title} <span className="text-sm font-normal text-white/60">{list.length}枚</span>
            </h2>
            <div className="flex gap-2">
              {zone === "deck" && !isOpp && (
                <button
                  className={btn}
                  onClick={() => {
                    setBoard(shuffleDeck(boardRef.current));
                    pushLog("山札をシャッフル");
                    setViewer(null);
                  }}
                >
                  シャッフルして閉じる
                </button>
              )}
              <button className={btn} onClick={() => setViewer(null)}>
                閉じる
              </button>
            </div>
          </div>
          {list.length === 0 ? (
            <p className="py-10 text-center text-sm text-white/50">カードがありません</p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-3">
              {list.map(c => (
                <div key={c.id} className="flex flex-col items-center gap-1.5 rounded-xl bg-black/20 p-2">
                  <CardView name={c.name} size={1.2} />
                  {!isOpp && (
                    <select
                      className="w-full rounded bg-white/10 px-1 py-1 text-[11px]"
                      value=""
                      onChange={e => {
                        const to = e.target.value;
                        if (to === "deckTop") move(c.id, "deck", { toTop: true });
                        else if (to === "deckBottom") moveToDeckBottom(c.id);
                        else move(c.id, to as Zone);
                      }}
                    >
                      <option value="" disabled>
                        移動…
                      </option>
                      {MOVE_TARGETS.filter(z => z !== zone).map(z => (
                        <option key={z} value={z} className="text-black">
                          {ZONE_LABEL[z]}へ
                        </option>
                      ))}
                      {zone !== "deck" && (
                        <option value="deckTop" className="text-black">
                          山札の上へ
                        </option>
                      )}
                      <option value="deckBottom" className="text-black">
                        山札の下へ
                      </option>
                    </select>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[11px] text-white/60">{label}</div>
      <div className="min-h-[40px]">{children}</div>
    </div>
  );
}

function LogList({ log, me }: { log: LogEntry[]; me: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight });
  }, [log]);
  return (
    <div ref={ref} className="flex-1 space-y-1 overflow-y-auto pr-1 text-xs leading-5">
      {log.length === 0 && <p className="text-white/40">操作の履歴がここに表示されます</p>}
      {log.map(l => (
        <p key={l.id} className={l.chat ? "rounded bg-white/10 px-1.5 py-0.5" : ""}>
          {l.player && <span className={`font-bold ${l.player === me ? "text-amber-300" : "text-sky-300"}`}>{l.player}: </span>}
          <span className="break-words text-white/85">{l.text}</span>
        </p>
      ))}
    </div>
  );
}

function ContextMenu({ menu, onClose, children }: { menu: MenuState; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: menu.x, top: menu.y });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({
      left: Math.max(8, Math.min(menu.x, window.innerWidth - r.width - 8)),
      top: Math.max(8, Math.min(menu.y, window.innerHeight - r.height - 8)),
    });
  }, [menu.x, menu.y]);
  return (
    <div className="fixed inset-0 z-50" onClick={onClose} onContextMenu={e => (e.preventDefault(), onClose())}>
      <div
        ref={ref}
        className="fixed min-w-[200px] overflow-hidden rounded-xl border border-white/10 bg-stone-900 py-1 text-sm text-white shadow-2xl"
        style={pos}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

const MenuTitle = ({ children }: { children: ReactNode }) => (
  <div className="max-w-[260px] truncate px-3 py-1.5 text-xs font-bold text-white/60">{children}</div>
);
const MenuSep = () => <div className="my-1 border-t border-white/10" />;
const MenuItem = ({ onClick, children }: { onClick: () => void; children: ReactNode }) => (
  <button className="block w-full px-3 py-1.5 text-left hover:bg-white/10" onClick={onClick}>
    {children}
  </button>
);
