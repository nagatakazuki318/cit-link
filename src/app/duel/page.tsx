"use client";

import { useState } from "react";
import Lobby, { type LobbyResult } from "./Lobby";
import Table from "./Table";

const KEY = "duel:lobby";

function readInitial(): Partial<LobbyResult> {
  let saved: Partial<LobbyResult> = {};
  try {
    saved = JSON.parse(localStorage.getItem(KEY) ?? "{}");
  } catch {}
  const room = new URLSearchParams(window.location.search).get("room");
  if (room) saved = { ...saved, room, mode: "online" };
  return saved;
}

function readActive(): LobbyResult | null {
  try {
    const active = sessionStorage.getItem("duel:active");
    return active ? JSON.parse(active) : null;
  } catch {
    return null;
  }
}

// ルートレイアウトがマウント後にのみ children を描画するため、ここでは window を直接参照できる
export default function DuelPage() {
  const [initial, setInitial] = useState<Partial<LobbyResult> | null>(() =>
    typeof window === "undefined" ? null : readInitial(),
  );
  const [config, setConfig] = useState<LobbyResult | null>(() => (typeof window === "undefined" ? null : readActive()));

  if (!initial) return null;

  if (!config) {
    return (
      <Lobby
        initial={initial}
        onStart={r => {
          try {
            localStorage.setItem(KEY, JSON.stringify(r));
            sessionStorage.setItem("duel:active", JSON.stringify(r));
          } catch {}
          setConfig(r);
        }}
      />
    );
  }

  return (
    <Table
      key={`${config.mode}:${config.room}`}
      config={config}
      onLeave={() => {
        try {
          sessionStorage.removeItem("duel:active");
        } catch {}
        setInitial(config);
        setConfig(null);
      }}
    />
  );
}
