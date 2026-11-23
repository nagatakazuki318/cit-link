-- 授業評価の「参考になった」ボタン用テーブル
-- Supabase の SQL Editor で一度だけ実行してください（再実行しても安全です）。
-- 1人のユーザーは1つの授業評価に1回だけ「参考になった」を付けられます。
-- review_id の型は既存の reviews.id の型（uuid / bigint など）に自動で合わせます。

do $$
declare
  review_id_type text;
begin
  select format_type(a.atttypid, a.atttypmod)
    into review_id_type
    from pg_attribute a
   where a.attrelid = 'public.reviews'::regclass
     and a.attname = 'id'
     and not a.attisdropped;

  execute format(
    'create table if not exists public.review_helpfuls (
       review_id %s not null references public.reviews (id) on delete cascade,
       user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
       created_at timestamptz not null default now(),
       primary key (review_id, user_id)
     )',
    review_id_type
  );
end
$$;

alter table public.review_helpfuls enable row level security;

drop policy if exists "review_helpfuls_select" on public.review_helpfuls;
create policy "review_helpfuls_select"
  on public.review_helpfuls for select
  to authenticated
  using (true);

drop policy if exists "review_helpfuls_insert_own" on public.review_helpfuls;
create policy "review_helpfuls_insert_own"
  on public.review_helpfuls for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "review_helpfuls_delete_own" on public.review_helpfuls;
create policy "review_helpfuls_delete_own"
  on public.review_helpfuls for delete
  to authenticated
  using (user_id = auth.uid());
