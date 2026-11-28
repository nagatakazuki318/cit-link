// 対戦の同期レイヤー。本番は Supabase Realtime（broadcast + presence）、
// 「同じブラウザの別タブ」モードでは BroadcastChannel を使う。

import { supabase } from "@/lib/supabase";
import type { PublicState } from "./game";

export type LogEntry = { id: string; player: string; text: string; at: number; chat?: boolean };

export type Message =
  | { type: "state"; from: string; state: PublicState }
  | { type: "log"; from: string; entry: LogEntry }
  | { type: "hello"; from: string }
  | { type: "bye"; from: string };

export type Transport = {
  send: (msg: Message) => void;
  close: () => void;
};

export type TransportStatus = "connecting" | "online" | "error";

export function connect(
  room: string,
  me: string,
  mode: "online" | "local",
  onMessage: (msg: Message) => void,
  onStatus: (s: TransportStatus) => void,
): Transport {
  if (mode === "local") {
    const bc = new BroadcastChannel(`duel:${room}`);
    let closed = false;
    bc.onmessage = e => onMessage(e.data as Message);
    onStatus("online");
    const t: Transport = {
      send: msg => {
        if (!closed) bc.postMessage(msg);
      },
      close: () => {
        if (closed) return;
        bc.postMessage({ type: "bye", from: me } satisfies Message);
        closed = true;
        bc.close();
      },
    };
    queueMicrotask(() => t.send({ type: "hello", from: me }));
    return t;
  }

  const channel = supabase.channel(`duel:${room}`, {
    config: { broadcast: { self: false }, presence: { key: me } },
  });
  channel.on("broadcast", { event: "msg" }, ({ payload }) => onMessage(payload as Message));
  channel.on("presence", { event: "leave" }, ({ key }) => onMessage({ type: "bye", from: key }));
  channel.subscribe(status => {
    if (status === "SUBSCRIBED") {
      onStatus("online");
      void channel.track({ at: Date.now() });
      void channel.send({ type: "broadcast", event: "msg", payload: { type: "hello", from: me } });
    } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
      onStatus("error");
    }
  });
  return {
    send: msg => void channel.send({ type: "broadcast", event: "msg", payload: msg }),
    close: () => void supabase.removeChannel(channel),
  };
}
