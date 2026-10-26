import { supabase } from "@/lib/supabase";

// Keep the existing project's login session. Shared lib files are imported, not modified.
export async function boardHeaders(): Promise<Record<string, string>> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) throw new Error("ログインしてから掲示板を利用してください。");
  return { Authorization: `Bearer ${data.session.access_token}` };
}
