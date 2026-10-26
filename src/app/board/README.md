# 既存のSupabaseと掲示板の連携

友人が作成した `threads` と `posts` を使います。別の掲示板テーブルを作る必要はありません。以前の `board_threads` / `board_replies` 用SQLは使用しないでください。

| テーブル | 使用する列 |
| --- | --- |
| threads | id, title, category, user_id, created_at, updated_at |
| posts | id, thread_id, user_id, nickname, body, created_at |

- スレッドのタイトル・カテゴリは `threads`、最初の本文と返信はすべて `posts` に保存します。
- `user_id` はログイン済みのユーザーIDです。ブラウザのセッションをAPIへ送り、サーバーがSupabase Authで検証します。大学アカウントのみ受け付けます。
- `posts.thread_id` は、その投稿が属する実際の `threads.id` です。これらの列の乱数デフォルトには依存しません。
- 投稿フォームで入力したニックネーム（1〜30文字）を `posts.nickname` に保存し、一覧・会話画面に表示します。以前の投稿でニックネームが空の場合は、投稿者IDの先頭8文字を表示します。`user_id` は表示名とは別に、引き続き検証済みのログインユーザーIDを保存します。学年は保存しません。
- 新規スレッドは `threads` と最初の `posts` に順番にINSERTします。既存DBのRPCがないため、2つの書き込みは別トランザクションです。スレッド作成後に本文の保存結果を確認できなかった場合は、作成済みスレッドを開いて本文を下書きに残します。重複送信を避けるため会話を確認してから再送してください。
- 返信は独立した行を追加するため、同時投稿で別の返信を上書きしません。
- 一覧の更新日時は `threads.updated_at` と投稿日時から計算します。返信の際に `threads` の行を上書きしません。
- 以前のローカル `.data/threads.json` は自動移行しません。

## DB担当者への確認事項

この実装はデータベースを変更しません。画像では `threads.id` に主キーが選択されていなかったため、DB担当者に主キーを確認してもらってください。`posts.thread_id` の外部キーも確認してください。

画像ではRLSが無効になっていました。ログイン画面やAPIだけではSupabaseへの直接アクセスは制限できないため、DB担当者側でRLSを有効にし、大学アカウントの閲覧と、自分の `user_id = auth.uid()` による投稿を許可するポリシーを設定してください。既存データを消す・作り直す必要はありません。

接続設定は既存の `src/lib/supabase.ts` と同じ環境変数を使います。`NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を同じプロジェクトに設定してください。秘密キーは使いません。
