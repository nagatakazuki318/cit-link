// デュエマ フリー対戦 — 盤面の型と純粋な状態操作

export type Zone = "deck" | "hand" | "battle" | "mana" | "shield" | "grave" | "hyper";

export const ZONE_LABEL: Record<Zone, string> = {
  deck: "山札",
  hand: "手札",
  battle: "バトルゾーン",
  mana: "マナゾーン",
  shield: "シールド",
  grave: "墓地",
  hyper: "超次元",
};

export type Card = {
  id: string;
  name: string;
  zone: Zone;
  tapped: boolean;
  faceDown: boolean;
  /** バトルゾーン内の位置（0〜1 の割合） */
  x: number;
  y: number;
  /** 重なり順 */
  z: number;
  /** 超次元ゾーン由来か（リセット時に超次元へ戻す） */
  hyper: boolean;
};

/** 相手に送る公開情報。裏向きのカードは名前を伏せる */
export type PublicCard = Omit<Card, "name"> & { name: string | null };

export type PublicState = {
  player: string;
  cards: PublicCard[]; // 手札・山札以外
  handCount: number;
  deckCount: number;
  /** 公開中の手札（「相手に見せる」で一時的に公開） */
  revealed: string[];
};

export type Board = { cards: Card[]; zCounter: number };

let seq = 0;
const newId = () => `${Date.now().toString(36)}-${(seq++).toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

/** 「4 ボルシャック・ドラゴン」形式のデッキリストを解析。超次元は「超 2 カード名」 */
export function parseDeck(text: string): { name: string; zone: Zone }[] {
  const out: { name: string; zone: Zone }[] = [];
  for (const raw of text.split(/\r?\n/)) {
    let line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    let zone: Zone = "deck";
    const hyper = line.match(/^(超|超次元|hyper)[\s:：]+/i);
    if (hyper) {
      zone = "hyper";
      line = line.slice(hyper[0].length);
    }
    const m = line.match(/^(\d+)\s*[x×枚]?\s+(.+)$/) ?? line.match(/^(.+?)\s*[x×]\s*(\d+)$/);
    let count = 1;
    let name = line;
    if (m) {
      if (/^\d+$/.test(m[1])) {
        count = Number(m[1]);
        name = m[2];
      } else {
        name = m[1];
        count = Number(m[2]);
      }
    }
    count = Math.min(Math.max(count, 0), 40);
    for (let i = 0; i < count; i++) out.push({ name: name.trim().slice(0, 60), zone });
  }
  return out.slice(0, 120);
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildBoard(list: { name: string; zone: Zone }[]): Board {
  const cards = shuffle(list).map<Card>(c => ({
    id: newId(),
    name: c.name,
    zone: c.zone,
    tapped: false,
    faceDown: c.zone === "deck",
    x: 0.5,
    y: 0.5,
    z: 0,
    hyper: c.zone === "hyper",
  }));
  return { cards, zCounter: 1 };
}

export const inZone = (b: Board, zone: Zone) => b.cards.filter(c => c.zone === zone);

/** カードを別ゾーンへ。toTop=true なら山札の上（＝配列の先頭側）へ */
export function moveCard(
  b: Board,
  id: string,
  zone: Zone,
  opts: { x?: number; y?: number; toTop?: boolean; faceDown?: boolean } = {},
): Board {
  const card = b.cards.find(c => c.id === id);
  if (!card) return b;
  const rest = b.cards.filter(c => c.id !== id);
  const z = b.zCounter + 1;
  const moved: Card = {
    ...card,
    zone,
    tapped: zone === card.zone ? card.tapped : false,
    faceDown: opts.faceDown ?? defaultFaceDown(zone, card),
    x: opts.x ?? (zone === "battle" && card.zone !== "battle" ? 0.5 : card.x),
    y: opts.y ?? (zone === "battle" && card.zone !== "battle" ? 0.5 : card.y),
    z,
  };
  // 山札の上 = そのゾーン内で最初、それ以外は最後に追加
  if (zone === "deck" && opts.toTop) return { cards: [moved, ...rest], zCounter: z };
  return { cards: [...rest, moved], zCounter: z };
}

function defaultFaceDown(zone: Zone, card: Card) {
  if (zone === "deck" || zone === "shield") return true;
  if (zone === card.zone) return card.faceDown;
  return false;
}

export function drawCards(b: Board, n = 1): Board {
  let next = b;
  for (let i = 0; i < n; i++) {
    const top = inZone(next, "deck")[0];
    if (!top) break;
    next = moveCard(next, top.id, "hand");
  }
  return next;
}

export function update(b: Board, id: string, patch: Partial<Card>): Board {
  return { ...b, cards: b.cards.map(c => (c.id === id ? { ...c, ...patch } : c)) };
}

export function shuffleDeck(b: Board): Board {
  const deck = shuffle(inZone(b, "deck"));
  return { ...b, cards: [...deck, ...b.cards.filter(c => c.zone !== "deck")] };
}

export function untapAll(b: Board): Board {
  return {
    ...b,
    cards: b.cards.map(c => (c.zone === "battle" || c.zone === "mana" ? { ...c, tapped: false } : c)),
  };
}

/** 全カードを山札に戻してシャッフル → シールド5枚 → 5枚ドロー */
export function setupGame(b: Board): Board {
  let next: Board = {
    zCounter: 1,
    cards: b.cards.map(c =>
      c.hyper
        ? { ...c, zone: "hyper", tapped: false, faceDown: false }
        : { ...c, zone: "deck", tapped: false, faceDown: true },
    ),
  };
  next = shuffleDeck(next);
  for (let i = 0; i < 5; i++) {
    const top = inZone(next, "deck")[0];
    if (top) next = moveCard(next, top.id, "shield");
  }
  return drawCards(next, 5);
}

export function toPublic(b: Board, player: string, revealed: string[]): PublicState {
  return {
    player,
    cards: b.cards
      .filter(c => c.zone !== "hand" && c.zone !== "deck")
      .map(c => ({ ...c, name: c.faceDown ? null : c.name })),
    handCount: inZone(b, "hand").length,
    deckCount: inZone(b, "deck").length,
    revealed,
  };
}

/** 名前から文明風の色を決める（画像の代わり） */
export function cardHue(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h % 360;
}

export const SAMPLE_DECK = `# 「枚数 カード名」を1行ずつ。超次元ゾーンは先頭に「超」
4 火の鳥ブレイズ
4 灼熱の剣士
4 蒼き水流のスナイパー
4 森の守護獣
4 光の盾ガーディアン
4 闇の囁き手
4 雷鳴のドラゴン
4 大地のマンモス
4 天空の騎士
4 終焉の大魔王
超 2 次元の覇者`;
