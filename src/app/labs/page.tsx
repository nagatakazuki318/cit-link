"use client";

import React, { useState } from 'react';

// --- 型定義 ---
interface Laboratory {
  id: string;
  labName: string;
  professor: string;
  role: string;
  fields: string[];
  description: string;
  capacity: number;
}

// --- 千葉工業大学 情報変革科学部 認知情報科学科 のデータ ---
const MOCK_LABS: Laboratory[] = [
  {
    id: '1',
    labName: '今井研究室',
    professor: '今井 順一',
    role: '教授',
    fields: ['画像処理', '感性情報処理', '知能システム'],
    description: '画像処理や感性情報処理を中心に、「気の利いた」支援で暮らしを豊かにする知能システムの実現に向けた研究を進めています。人間に見えている領域を可視化するシステムの開発などを行っています。',
    capacity: 10,
  },
  {
    id: '2',
    labName: '小笠原研究室',
    professor: '小笠原 秀人',
    role: '教授',
    fields: ['ソフトウェア工学', '品質保証', 'システム開発'],
    description: '複雑さに対応し、かつ高品質を実現するためのソフトウェア開発技術を研究しています。社会的影響の大きな事故を防ぐため、ソフトウェアの品質を高めてより便利なシステムを開発します。',
    capacity: 10,
  },
  {
    id: '3',
    labName: '國宗研究室',
    professor: '國宗 永佳',
    role: '教授',
    fields: ['教育支援', 'ICT', '学習環境'],
    description: '情報通信技術（ICT）を活用し、教え・学びの中に存在する困難を軽減する研究を行っています。本質的な学び・教えをスムーズに進めるための支援システムを開発しています。',
    capacity: 10,
  },
  {
    id: '4',
    labName: '高橋研究室',
    professor: '高橋 暁子',
    role: '教授',
    fields: ['インストラクショナルデザイン', 'ICT', '学修支援'],
    description: '「勉強」を効果的で効率的で魅力的なものにするための「教え方・学び方のデザイン」の研究領域において、ICTとID理論（インストラクショナルデザイン）を使った学修支援の研究をしています。',
    capacity: 10,
  },
  {
    id: '5',
    labName: '東本研究室',
    professor: '東本 崇仁',
    role: '教授',
    fields: ['認知心理学', '人工知能', '知的学習支援'],
    description: '認知心理学と人工知能の技術を用いて一人一人にあった学習を実現する知的システムを開発しています。人の心理を理解し、問題を解決できるコンピュータを開発します。',
    capacity: 10,
  },
  {
    id: '6',
    labName: '新井田研究室',
    professor: '新井田 統',
    role: '教授',
    fields: ['サービスデザイン', 'プロトタイピング', '参加型デザイン'],
    description: '人の認知特性を理解して魅力的なサービスをデザインする研究をしています。利用者を調査してアイデアを創出し、プロトタイプを作ってテストをするデザインプロセスをICTで高度化します。',
    capacity: 10,
  },
  {
    id: '7',
    labName: '藤田研究室',
    professor: '藤田 茂',
    role: '教授',
    fields: ['知能情報学', 'マルチエージェント', 'セキュリティ'],
    description: 'あらゆるモノがインターネットに繋がるIoTから得た情報を守るために秘密分散・秘密計算の研究を行っています。また、マルチエージェントによるAIなど暮らしを便利にする技術を開発しています。',
    capacity: 10,
  },
  {
    id: '8',
    labName: '眞部研究室',
    professor: '眞部 雄介',
    role: '教授',
    fields: ['行動解析', '個人認識', 'センサーデータ'],
    description: '日常的な行動（歩行や着座姿勢、書字、デスクワークなど）から、個人や状況を認識する機能を開発しています。センサーデータの計測・解析に基づき、人間の動作や行為の認識を目指します。',
    capacity: 10,
  },
  {
    id: '9',
    labName: '多胡研究室',
    professor: '多胡 輝一',
    role: '准教授',
    fields: ['IoT', 'ウェアラブル', '機械学習'],
    description: 'ウェアラブルデバイス等から得られる健康データを利活用し、機械学習で生活習慣や疲労度を推定したり、病気の人や高齢者を支援する見守りシステムの開発に取り組んでいます。',
    capacity: 10,
  },
  {
    id: '10',
    labName: '長谷川研究室',
    professor: '長谷川 為春',
    role: '准教授',
    fields: ['映像解析', 'ITS', 'セキュリティ'],
    description: '監視カメラや車載カメラからの映像を解析し、走行車両の認識や追跡を行う研究（ITS）や、建物内への侵入者検知・人物の動作解析といったセキュリティ監視システムなどの研究を行っています。',
    capacity: 10,
  },
  {
    id: '11',
    labName: '山崎研究室',
    professor: '山崎 治',
    role: '准教授',
    fields: ['認知科学', '認知心理学', '知的活動支援'],
    description: '人が関わるさまざまな活動を「心の中の情報処理」という観点から捉え、学習や思考、創造性などの人の知的活動のサポートに関心を持ち、心理実験やその知見を活かしたシステム開発を行います。',
    capacity: 10,
  }
];

export default function LabsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // 検索クエリに基づくフィルタリング処理
  const filteredLabs = MOCK_LABS.filter(lab => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      lab.labName.toLowerCase().includes(query) ||
      lab.professor.toLowerCase().includes(query) ||
      lab.fields.some(field => field.toLowerCase().includes(query))
    );
  });

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* ヘッダー部分 */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
              認知情報科学科 研究室一覧
            </h1>
            <p className="text-slate-500">
              興味のある研究分野や教授名から、所属する研究室を探すことができます。
            </p>
          </div>
          
          {/* 検索バー */}
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="教授名やキーワードで検索..."
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a94448] focus:border-[#a94448] shadow-sm transition-all bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* 検索結果件数 */}
        <div className="mb-6 text-sm font-medium text-slate-500">
          全 {MOCK_LABS.length} 件中 <span className="text-[#a94448]">{filteredLabs.length}</span> 件を表示
        </div>

        {/* 研究室カードグリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLabs.map(lab => (
            <div 
              key={lab.id} 
              className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
            >
              {/* カード上部：タイトルと教授名 */}
              <div className="mb-4">
                <h2 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-[#a94448] transition-colors">
                  {lab.labName}
                </h2>
                <div className="flex items-center text-slate-600 font-medium">
                  <svg className="w-4 h-4 mr-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  {lab.professor} <span className="text-sm ml-1 text-slate-400">{lab.role}</span>
                </div>
              </div>

              {/* 分野タグ */}
              <div className="flex flex-wrap gap-2 mb-4">
                {lab.fields.map(field => (
                  <span 
                    key={field} 
                    className="bg-[#a94448]/10 text-[#a94448] text-xs px-3 py-1.5 rounded-lg font-semibold tracking-wide border border-[#a94448]/20"
                  >
                    {field}
                  </span>
                ))}
              </div>

              {/* 説明文 */}
              <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
                {lab.description}
              </p>

              {/* カード下部：フッター */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-auto">
                <div className="flex items-center text-sm text-slate-500 font-medium">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  定員 {lab.capacity}名
                </div>
                <button className="text-[#a94448] hover:text-[#8a373a] text-sm font-bold flex items-center transition-colors">
                  詳細を見る
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 検索結果ゼロの場合 */}
        {filteredLabs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 className="text-lg font-bold text-slate-700 mb-2">見つかりませんでした</h3>
            <p className="text-slate-500">
              「{searchQuery}」に一致する研究室や教授はありません。<br/>
              別のキーワードをお試しください。
            </p>
            <button 
              onClick={() => setSearchQuery('')}
              className="mt-6 px-4 py-2 bg-[#a94448]/10 text-[#a94448] rounded-lg font-medium hover:bg-[#a94448]/20 transition-colors"
            >
              検索条件をクリア
            </button>
          </div>
        )}
      </div>
    </main>
  );
}