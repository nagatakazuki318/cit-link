import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Post, Thread } from "../types";

type ThreadRow = {
  id: string;
  title: string | null;
  category: string | null;
  user_id: string | null;
  created_at: string | null;
  updated_at: string | null;
};
type PostRow = {
  id: string;
  thread_id: string;
  user_id: string | null;
  nickname: string | null;
  body: string | null;
  created_at: string | null;
};
type MessageInput = { body: string; nickname: string };
type ThreadInput = MessageInput & { title: string; category: string };
const threadColumns = "id,title,category,user_id,created_at,updated_at";
const postColumns = "id,thread_id,user_id,nickname,body,created_at";
const pageSize = 500;
const unknownTime = "1970-01-01T00:00:00.000Z";

/** Supabase timestamp columns may return an ISO timestamp without a timezone. */
export function normalizeTimestamp(value: string | null | undefined, fallback = unknownTime): string {
  if (!value) return fallback;
  const text = value.trim().replace(" ", "T");
  const hasTime = /T\d{2}:\d{2}/.test(text);
  const hasZone = /(?:Z|[+-]\d{2}(?::?\d{2})?)$/i.test(text);
  const time = Date.parse(hasTime && !hasZone ? `${text}Z` : text);
  return Number.isFinite(time) ? new Date(time).toISOString() : fallback;
}

function post(row: PostRow): Post {
  return {
    id: row.id,
    name: row.nickname?.trim() || (row.user_id ? `投稿者 ${row.user_id.slice(0, 8)}` : "投稿者"),
    grade: "",
    body: row.body || "",
    createdAt: normalizeTimestamp(row.created_at),
  };
}

function thread(row: ThreadRow, rows: PostRow[] = []): Thread {
  // Stable sorting keeps the database's microsecond-level ordering when JS dates
  // normalize two distinct PostgreSQL timestamps into the same millisecond.
  const messages = rows.map(post).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const createdAt = normalizeTimestamp(row.created_at);
  const updatedAt = normalizeTimestamp(row.updated_at, createdAt);
  const lastMessageTime = messages.at(-1)?.createdAt || createdAt;
  return {
    id: row.id,
    title: row.title || "無題のスレッド",
    category: row.category || "雑談",
    posts: messages,
    updatedAt: [createdAt, updatedAt, lastMessageTime].sort().at(-1)!,
  };
}

/**
 * Without a transaction RPC, creating a thread and its first post takes two INSERTs.
 * Keep the known-saved thread so callers can open it, preserve the draft, and retry
 * only the first post after checking whether the result has already appeared.
 */
export class ThreadCreatedError extends Error {
  readonly thread: Thread;
  constructor(savedThread: Thread, cause: unknown) {
    super("スレッドは作成されましたが、本文の保存結果を確認できませんでした。表示を確認してから本文を再送してください。", { cause });
    this.name = "ThreadCreatedError";
    this.thread = savedThread;
  }
}

export function createBoardStore(client: SupabaseClient, userId: string) {
  async function allRows<T>(table: string, select: string, threadId?: string): Promise<T[]> {
    const rows: T[] = [];
    for (let offset = 0; ; offset += pageSize) {
      let query = client.from(table).select(select);
      if (threadId) query = query.eq("thread_id", threadId);
      const { data, error } = await query
        .order("created_at", { ascending: true, nullsFirst: true })
        .order("id", { ascending: true })
        .range(offset, offset + pageSize - 1)
        .abortSignal(AbortSignal.timeout(12000));
      if (error) throw error;
      const page = data as unknown as T[];
      rows.push(...page);
      if (page.length < pageSize) return rows;
    }
  }

  return {
    async list(): Promise<Thread[]> {
      const [threads, posts] = await Promise.all([
        allRows<ThreadRow>("threads", threadColumns),
        allRows<PostRow>("posts", postColumns),
      ]);
      const grouped = new Map<string, PostRow[]>();
      for (const item of posts) {
        const group = grouped.get(item.thread_id) || [];
        group.push(item);
        grouped.set(item.thread_id, group);
      }
      return threads.map(row => thread(row, grouped.get(row.id)))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.id.localeCompare(b.id));
    },

    async create(input: ThreadInput): Promise<Thread> {
      const rootId = randomUUID();
      const { data: root, error } = await client.from("threads")
        .insert({ id: rootId, title: input.title, category: input.category, user_id: userId })
        .select(threadColumns).abortSignal(AbortSignal.timeout(12000)).single();
      if (error) throw error;
      const savedThread = thread(root as ThreadRow);
      try {
        const { data, error: postError } = await client.from("posts")
          .insert({ id: randomUUID(), thread_id: savedThread.id, user_id: userId, nickname: input.nickname, body: input.body })
          .select(postColumns).abortSignal(AbortSignal.timeout(12000)).single();
        if (postError) throw postError;
        return thread(root as ThreadRow, [data as PostRow]);
      } catch (cause) {
        // No compensating DELETE: the table belongs to another owner and may disallow it.
        throw new ThreadCreatedError(savedThread, cause);
      }
    },

    async reply(threadId: string, input: MessageInput): Promise<Thread | null> {
      const { data: root, error: rootError } = await client.from("threads")
        .select(threadColumns).eq("id", threadId)
        .abortSignal(AbortSignal.timeout(12000)).maybeSingle();
      if (rootError) throw rootError;
      if (!root) return null;
      // Read before writing so a subsequent read failure cannot obscure a saved reply.
      const existing = await allRows<PostRow>("posts", postColumns, threadId);
      const { data, error } = await client.from("posts")
        .insert({ id: randomUUID(), thread_id: threadId, user_id: userId, nickname: input.nickname, body: input.body })
        .select(postColumns).abortSignal(AbortSignal.timeout(12000)).single();
      if (error) throw error;
      return thread(root as ThreadRow, [...existing, data as PostRow]);
    },
  };
}
