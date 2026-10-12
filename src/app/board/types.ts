export const categories = ["質問・相談", "雑談", "メンバー募集", "実験協力", "アンケート", "イベント"] as const;
export const grades = ["1年生", "2年生", "3年生", "4年生", "大学院生", "その他"] as const;
export type Post = { id: string; name: string; grade: string; body: string; createdAt: string };
export type Thread = { id: string; title: string; category: string; posts: Post[]; updatedAt: string };
