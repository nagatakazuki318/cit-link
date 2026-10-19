import React from 'react';

interface LinkItem {
  title: string;
  description: string;
  url: string;
  badge?: string;
}

interface CategorySection {
  category: string;
  items: LinkItem[];
}

const linkData: CategorySection[] = [
  {
    category: "Portals & Systems",
    items: [
      {
        title: "大学公式ポータル (CIT Portal)",
        description: "時間割、休講情報、成績確認のハブ。",
        url: "https://www.it-chiba.ac.jp/",
        badge: "Essential",
      },
      {
        title: "Webシラバス",
        description: "講義内容、担当教員、評価基準の検索。",
        url: "https://www.it-chiba.ac.jp/",
      },
      {
        title: "LMS (授業支援システム)",
        description: "課題提出・教材ダウンロード・小テスト。",
        url: "https://www.it-chiba.ac.jp/",
      },
      {
        title: "バスダイヤ表",
        description: "新習志野、津田沼間をつなぐバスのダイヤ表",
        url: "https://kmsk.is.it-chiba.ac.jp/portal/whole/gakubu/bus_schedule.pdf"
      },
      {
        title: "CITサービス",
        description: "学食のメニューや購買の営業時間",
        url: "https://www.cit-s.com/"
      },
    ],
  },
  {
    category: "Campus Life",
    items: [
      {
        title: "図書館・蔵書検索 (OPAC)",
        description: "学内図書館の本の検索と貸出状況の確認。",
        url: "https://www.it-chiba.ac.jp/",
      },
      {
        title: "学生支援課・各種申請",
        description: "奨学金、証明書発行、通学定期等の手続き。",
        url: "https://www.it-chiba.ac.jp/",
      },
    ],
  },
  {
    category: "Career",
    items: [
      {
        title: "キャリアセンター",
        description: "学内求人、面談予約、インターンシップ情報。",
        url: "https://www.it-chiba.ac.jp/",
        badge: "Career",
      },
    ],
  },
];

export default function LinksPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900 py-20 px-6 sm:px-12 lg:px-20 font-sans antialiased">
      <div className="max-w-2xl mx-auto">
        
        {/* Apple風ヘッダー */}
        <div className="text-center mb-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">
            CIT-LINK DIRECTORY
          </p>
          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-zinc-900 mb-4">
            Links.
          </h1>
          <p className="text-zinc-500 text-base sm:text-lg font-normal tracking-wide max-w-md mx-auto">
            学内インフラと、キャンパスライフをスムーズにするためのリンク集。
          </p>
        </div>

        {/* カテゴリごとのリスト */}
        <div className="space-y-16">
          {linkData.map((section, index) => (
            <section key={index}>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-6 px-1">
                {section.category}
              </h2>
              
              <div className="bg-zinc-50 rounded-2xl border border-zinc-100 overflow-hidden shadow-sm divide-y divide-zinc-100">
                {section.items.map((item, itemIdx) => (
                  <a
                    key={itemIdx}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block p-6 transition-all duration-200 hover:bg-zinc-100/80"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="text-base font-medium text-zinc-900 group-hover:text-blue-600 transition-colors">
                            {item.title}
                          </span>
                          {item.badge && (
                            <span className="text-[10px] font-medium uppercase tracking-wider bg-zinc-200/60 text-zinc-600 px-2 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-zinc-500 font-normal">
                          {item.description}
                        </p>
                      </div>

                      <div className="text-zinc-300 group-hover:text-zinc-600 group-hover:translate-x-0.5 transition-all pl-4">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* フッター */}
        <div className="mt-24 text-center text-xs text-zinc-400 tracking-wider">
          Chiba Institute of Technology — Student Community
        </div>

      </div>
    </main>
  );
}