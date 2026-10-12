
export type Post = {
  id: string;
  title: string;
  category: string;
  year: number;
  createdAt: string;
  excerpt: string;
};

// 現段階では表示確認用の仮データ
// 実際の掲示板と連携したら置き換える
export const samplePosts: Post[] = [
  {
    id: "sample-001",
    title: "おすすめの授業について教えてください",
    category: "質問・相談",
    year: 1,
    createdAt: "2026-10-12T08:00:00+09:00",
    excerpt: "2年生の方で、おすすめの授業があれば教えてほしいです！",
  },
  {
    id: "sample-002",
    title: "認知実験の参加者を募集しています",
    category: "実験協力",
    year: 3,
    createdAt: "2026-10-11T12:00:00+09:00",
    excerpt: "30分程度の実験に協力していただける方を募集しています。",
  },
  {
    id: "sample-003",
    title: "授業に関するアンケートへの協力お願いします",
    category: "アンケート",
    year: 2,
    createdAt: "2026-10-10T12:00:00+09:00",
    excerpt: "授業改善のためのアンケートを実施しています。",
  },
];
