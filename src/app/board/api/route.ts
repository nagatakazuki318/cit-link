import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { categories, grades, type Thread } from "../types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const directory = process.env.BOARD_DATA_DIR || path.join(process.cwd(), "src", "app", "board", ".data");
const file = path.join(directory, "threads.json");
const state = globalThis as typeof globalThis & { boardQueue?: Promise<unknown> };
async function read(): Promise<Thread[]> {
  try { return JSON.parse(await readFile(file, "utf8")); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return []; throw error; }
}
export async function GET() {
  try { return Response.json(await read(), { headers: { "Cache-Control": "no-store" } }); }
  catch { return Response.json({ error: "掲示板を読み込めませんでした。" }, { status: 500 }); }
}
export async function POST(request: Request) {
  if (request.headers.get("origin") && request.headers.get("origin") !== new URL(request.url).origin) return Response.json({ error: "送信元が無効です。" }, { status: 403 });
  let input: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > 12000) return Response.json({ error: "投稿が長すぎます。" }, { status: 413 });
    input = JSON.parse(raw);
    if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error();
  } catch { return Response.json({ error: "投稿データが無効です。" }, { status: 400 }); }
  const string = (key: string) => typeof input[key] === "string" ? (input[key] as string).trim() : "";
  const name = string("name"), grade = string("grade"), body = string("body"), title = string("title"), category = string("category"), threadId = string("threadId");
  if (!name || name.length > 30 || !grades.some(g => g === grade) || !body || body.length > 2000 || (!threadId && (!title || title.length > 100 || !categories.some(c => c === category)))) return Response.json({ error: "名前・学年・本文（新規作成時はタイトルとカテゴリも）を確認してください。" }, { status: 400 });
  const operation = (state.boardQueue || Promise.resolve()).then(async () => {
    const threads = await read();
    const now = new Date().toISOString();
    const post = { id: randomUUID(), name, grade, body, createdAt: now };
    let thread: Thread;
    if (threadId) {
      const found = threads.find(t => t.id === threadId);
      if (!found) return Response.json({ error: "スレッドが見つかりません。" }, { status: 404 });
      thread = found;
      thread.posts.push(post);
      thread.updatedAt = now;
    } else {
      thread = { id: randomUUID(), title, category, posts: [post], updatedAt: now };
      threads.push(thread);
    }
    await mkdir(directory, { recursive: true });
    const temporary = path.join(directory, `${randomUUID()}.tmp`);
    await writeFile(temporary, JSON.stringify(threads), "utf8");
    await rename(temporary, file);
    return Response.json(thread, { status: 201 });
  });
  state.boardQueue = operation.catch(() => undefined);
  try { return await operation; }
  catch { return Response.json({ error: "保存できませんでした。時間をおいて再度お試しください。" }, { status: 500 }); }
}
