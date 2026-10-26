import { createClient } from "@supabase/supabase-js";
import { categories } from "../types";
import { createBoardStore, ThreadCreatedError } from "./storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

class ConfigurationError extends Error {}
class AccessError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

async function store(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new ConfigurationError();
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!token) throw new AccessError("ログインしてから掲示板を利用してください。", 401);
  let client;
  try {
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: {
        headers: { Authorization: `Bearer ${token}` },
        fetch: (input, init) => fetch(input, { ...init, signal: init?.signal || AbortSignal.timeout(12000) }),
      },
    });
  } catch { throw new ConfigurationError(); }
  // Validate the signed token on the server; never trust a user_id sent by the browser.
  const { data, error } = await client.auth.getUser(token);
  if (error) {
    if (error.status === 401 || error.status === 403) throw new AccessError("ログインの有効期限が切れています。再度ログインしてください。", 401);
    throw error;
  }
  if (!data.user) throw new AccessError("ログインしてから掲示板を利用してください。", 401);
  if (data.user.email?.toLowerCase().split("@")[1] !== "chibatech.ac.jp") throw new AccessError("大学のアカウントでログインしてください。", 403);
  return createBoardStore(client, data.user.id);
}

function failure(error: unknown) {
  if (error instanceof AccessError) return Response.json({ error: error.message }, { status: error.status });
  if (error instanceof ThreadCreatedError) {
    return Response.json({
      error: "スレッドは作成されましたが、本文の保存結果を確認できませんでした。本文を下書きに残しました。会話を確認し、未投稿の場合だけ返信として送信してください。",
      thread: error.thread,
    }, { status: 503 });
  }
  const value = error as { code?: string; message?: string; status?: number };
  let message = "Supabaseに接続できませんでした。時間をおいて再度お試しください。";
  if (error instanceof ConfigurationError) message = "Supabaseの接続URLと公開キーが未設定です。接続設定の担当者に確認してください。";
  else if (/timeout|timed out|abort/i.test(value.message || "")) message = "通信がタイムアウトし、送信結果を確認できませんでした。一覧を確認してから再度お試しください。";
  else if (["PGRST205", "42P01", "42703", "PGRST204"].includes(value.code || "")) message = "Supabaseのthreads/postsの列構成（posts.nicknameを含む）を確認してください。";
  else if (value.status === 401 || /invalid.*(key|jwt)|api key|jwt expired/i.test(value.message || "")) message = "Supabaseの接続キーが無効です。接続設定の担当者に確認してください。";
  else if (value.code === "42501" || value.status === 403) message = "掲示板へのアクセスが許可されていません。データベース担当者にthreads/postsの権限とRLS設定を確認してください。";
  else if (value.code === "23503") return Response.json({ error: "スレッドまたは投稿者の情報が見つかりません。" }, { status: 409 });
  return Response.json({ error: message }, { status: 503, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: Request) {
  try { return Response.json(await (await store(request)).list(), { headers: { "Cache-Control": "no-store" } }); }
  catch (error) { return failure(error); }
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ error: "送信元が無効です。" }, { status: 403 });
  let input: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > 12000) return Response.json({ error: "投稿が長すぎます。" }, { status: 413 });
    input = JSON.parse(raw);
    if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error();
  } catch { return Response.json({ error: "投稿データが無効です。" }, { status: 400 }); }
  const string = (key: string) => typeof input[key] === "string" ? (input[key] as string).trim() : "";
  const nickname = string("nickname"), body = string("body"), title = string("title"), category = string("category"), threadId = string("threadId");
  if ((input.threadId != null && (typeof input.threadId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(threadId))) ||
      !nickname || nickname.length > 30 || !body || body.length > 2000 || (!threadId && (!title || title.length > 100 || !categories.some(c => c === category)))) {
    return Response.json({ error: "ニックネーム（1〜30文字）・本文（新規作成時はタイトルとカテゴリも）を確認してください。" }, { status: 400 });
  }
  try {
    const database = await store(request);
    const result = threadId ? await database.reply(threadId, { nickname, body }) : await database.create({ title, category, nickname, body });
    if (!result) return Response.json({ error: "スレッドが見つかりません。" }, { status: 404 });
    return Response.json(result, { status: 201 });
  } catch (error) { return failure(error); }
}
