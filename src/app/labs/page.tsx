"use client";

import React, { useState, useMemo } from 'react';

// --- 型定義 ---
interface Laboratory {
  id: string;
  labName: string;
  professor: string;
  role: '教授' | '准教授';
  fields: string[];
  description: string;
  capacity: number;
  detailUrl: string;      // 学科公式 教員紹介（詳細サイト）
  labUrl?: string;        // 個別の研究室Webサイト
  researchUrl?: string;   // researchmap または 大学研究者情報
  researchUrlLabel?: string;
}

// --- 千葉工業大学 情報変革科学部 認知情報科学科 のデータ ---
const MOCK_LABS: Laboratory[] = [
  {
    id: '1',
    labName: '今井研究室',
    professor: '今井 順一',
    role: '教授',
    fields: ['画像処理', '感性情報処理', '知能システム'],
    description: '画像や感性情報処理を中心に、暮らしを豊かにする「気の利いた」知能システムや、人間の視野を可視化する技術を研究しています。',
    capacity: 10,
    detailUrl: 'https://www.cis-cit.net/教員紹介/今井-順一',
    labUrl: 'http://www.imai.cs.it-chiba.ac.jp/',
    researchUrl: 'https://researchmap.jp/imai/',
    researchUrlLabel: 'researchmap',
  },
  {
    id: '2',
    labName: '小笠原研究室',
    professor: '小笠原 秀人',
    role: '教授',
    fields: ['ソフトウェア工学', '品質保証', 'システム開発'],
    description: '複雑化するシステムに対応し、事故を防ぐ高品質なソフトウェア開発技術を研究。より安全で便利なシステムの実現を目指します。',
    capacity: 10,
    detailUrl: 'https://www.cis-cit.net/教員紹介/小笠原-秀人',
    labUrl: 'https://sel.jpn.org/',
    researchUrl: 'https://www.lib.it-chiba.ac.jp/cithp/KgApp?resId=S000447',
    researchUrlLabel: '大学研究者情報',
  },
  {
    id: '3',
    labName: '國宗研究室',
    professor: '國宗 永佳',
    role: '教授',
    fields: ['教育支援', 'ICT', '学習環境'],
    description: 'ICTを活用し、教えや学びの中にある困難を軽減する研究を実施。本質的な学習をスムーズに進めるための支援システムを開発します。',
    capacity: 10,
    detailUrl: 'https://www.cis-cit.net/教員紹介/國宗-永佳',
    labUrl: 'https://elt.net.it-chiba.ac.jp/',
    researchUrl: 'https://researchmap.jp/read0142436',
    researchUrlLabel: 'researchmap',
  },
  {
    id: '4',
    labName: '高橋研究室',
    professor: '高橋 暁子',
    role: '教授',
    fields: ['インストラクショナルデザイン', 'ICT', '学修支援'],
    description: '勉強をより効果的で魅力的にするための「教え方・学び方のデザイン」領域で、ICTとID理論を用いた学修支援を研究します。',
    capacity: 10,
    detailUrl: 'https://www.cis-cit.net/教員紹介/高橋-暁子',
    researchUrl: 'https://researchmap.jp/a_tak',
    researchUrlLabel: 'researchmap',
  },
  {
    id: '5',
    labName: '東本研究室',
    professor: '東本 崇仁',
    role: '教授',
    fields: ['認知心理学', '人工知能', '知的学習支援'],
    description: '認知心理学とAI技術を用い、個々に適した学習を実現するシステムを開発。人の心理を理解し問題解決できるコンピュータを目指します。',
    capacity: 10,
    detailUrl: 'https://www.cis-cit.net/教員紹介/東本-崇仁',
    labUrl: 'https://www.takahito.com/tomoto/',
    researchUrl: 'https://researchmap.jp/read0141235',
    researchUrlLabel: 'researchmap',
  },
  {
    id: '6',
    labName: '新井田研究室',
    professor: '新井田 統',
    role: '教授',
    fields: ['サービスデザイン', 'プロトタイピング', '参加型デザイン'],
    description: '人の認知特性を理解し、魅力的なサービスをデザインします。アイデア創出からプロトタイプ検証までのプロセスをICTで高度化します。',
    capacity: 10,
    detailUrl: 'https://www.cis-cit.net/教員紹介/新井田-統',
    researchUrl: 'https://researchmap.jp/Niida',
    researchUrlLabel: 'researchmap',
  },
  {
    id: '7',
    labName: '藤田研究室',
    professor: '藤田 茂',
    role: '教授',
    fields: ['知能情報学', 'マルチエージェント', 'セキュリティ'],
    description: 'IoTの情報を守る秘密分散・秘密計算技術や、マルチエージェントAIなど、暮らしを便利で安全にする情報技術を開発しています。',
    capacity: 10,
    detailUrl: 'https://www.cis-cit.net/教員紹介/藤田-茂',
    researchUrl: 'https://researchmap.jp/shigeru_fujita',
    researchUrlLabel: 'researchmap',
  },
  {
    id: '8',
    labName: '眞部研究室',
    professor: '眞部 雄介',
    role: '教授',
    fields: ['行動解析', '個人認識', 'センサーデータ'],
    description: '歩行や着座姿勢など日常の行動から、個人や状況を認識する技術を開発。センサーデータ解析による人間の動作理解を目指します。',
    capacity: 10,
    detailUrl: 'https://www.cis-cit.net/教員紹介/眞部-雄介',
    labUrl: 'https://sites.google.com/p.chibakoudai.jp/awareness-informatics-lab',
  },
  {
    id: '9',
    labName: '多胡研究室',
    professor: '多胡 輝一',
    role: '准教授',
    fields: ['IoT', 'ウェアラブル', '機械学習'],
    description: 'ウェアラブル端末の健康データを機械学習で解析し、疲労度の推定や、高齢者・病気の方を支援する見守りシステムを開発しています。',
    capacity: 10,
    detailUrl: 'https://www.cis-cit.net/教員紹介/多胡-輝一',
    labUrl: 'https://cf984242.cloudfree.jp/tagolab/',
    researchUrl: 'https://researchmap.jp/ktago',
    researchUrlLabel: 'researchmap',
  },
  {
    id: '10',
    labName: '長谷川研究室',
    professor: '長谷川 為春',
    role: '准教授',
    fields: ['映像解析', 'ITS', 'セキュリティ'],
    description: 'カメラ映像を解析し、走行車両の認識や追跡を行うITS研究や、侵入者検知・動作解析などのセキュリティ監視システムを研究します。',
    capacity: 10,
    detailUrl: 'https://www.cis-cit.net/教員紹介/長谷川-為春',
    researchUrl: 'https://researchmap.jp/read0102322',
    researchUrlLabel: 'researchmap',
  },
  {
    id: '11',
    labName: '山崎研究室',
    professor: '山崎 治',
    role: '准教授',
    fields: ['認知科学', '認知心理学', '知的活動支援'],
    description: '人間の活動を「心の中の情報処理」と捉え、学習や創造性といった知的活動の支援に向けた心理実験やシステム開発を行っています。',
    capacity: 10,
    detailUrl: 'https://www.cis-cit.net/教員紹介/山崎-治',
    labUrl: 'https://www.cog.chibatech.ac.jp/',
    researchUrl: 'https://researchmap.jp/7000003167',
    researchUrlLabel: 'researchmap',
  }
];

type RoleFilter = 'すべて' | '教授' | '准教授';

export default function LabsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleFilter>('すべて');
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [selectedLab, setSelectedLab] = useState<Laboratory | null>(null);

  // 全分野タグの一覧を抽出
  const allFields = useMemo(() => {
    const fieldSet = new Set<string>();
    MOCK_LABS.forEach(lab => lab.fields.forEach(f => fieldSet.add(f)));
    return Array.from(fieldSet);
  }, []);

  // 検索クエリ・役職・分野タグに基づくフィルタリング処理
  const filteredLabs = useMemo(() => {
    return MOCK_LABS.filter(lab => {
      if (selectedRole !== 'すべて' && lab.role !== selectedRole) {
        return false;
      }
      if (selectedField && !lab.fields.includes(selectedField)) {
        return false;
      }
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();
      return (
        lab.labName.toLowerCase().includes(query) ||
        lab.professor.toLowerCase().includes(query) ||
        lab.description.toLowerCase().includes(query) ||
        lab.fields.some(field => field.toLowerCase().includes(query))
      );
    });
  }, [searchQuery, selectedRole, selectedField]);

  const hasActiveFilter = searchQuery !== '' || selectedRole !== 'すべて' || selectedField !== null;

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedRole('すべて');
    setSelectedField(null);
  };

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">
        
        {/* ヘッダー部分 */}
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#a94448]/10 text-[#a94448] text-xs font-bold mb-3">
                LABORATORIES
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
                認知情報科学科 研究室一覧
              </h1>
              <p className="text-slate-600 text-sm md:text-base">
                興味のある研究分野や教員名から研究室を探し、各研究室サイトや教員詳細ページへアクセスできます。
              </p>
            </div>
            
            {/* 検索バー */}
            <div className="relative w-full md:w-80 shrink-0">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="教員名・研究キーワードで検索..."
                className="w-full pl-10 pr-9 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#a94448] focus:border-[#a94448] transition-all bg-slate-50 focus:bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="検索文字をクリア"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* 絞り込みエリア（役職＆キーワードタグ） */}
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-4">
            {/* 役職フィルタ */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 mr-1">職位：</span>
              {(['すべて', '教授', '准教授'] as RoleFilter[]).map(role => {
                const isActive = selectedRole === role;
                const count = role === 'すべて'
                  ? MOCK_LABS.length
                  : MOCK_LABS.filter(l => l.role === role).length;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#a94448] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {role} ({count})
                  </button>
                );
              })}
            </div>

            {/* 分野タグフィルタ */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 mr-1">注目キーワード：</span>
              {allFields.map(field => {
                const isSelected = selectedField === field;
                return (
                  <button
                    key={field}
                    type="button"
                    onClick={() => setSelectedField(isSelected ? null : field)}
                    className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#a94448] text-white border-[#a94448]'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-[#a94448]/50 hover:text-[#a94448]'
                    }`}
                  >
                    #{field}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 検索結果件数とリセットボタン */}
        <div className="mb-5 flex items-center justify-between px-1">
          <div className="text-sm font-medium text-slate-600">
            全 <span className="font-bold text-slate-800">{MOCK_LABS.length}</span> 研究室中{' '}
            <span className="text-[#a94448] font-bold text-base">{filteredLabs.length}</span> 件を表示
          </div>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-bold text-[#a94448] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              絞り込みをリセット
            </button>
          )}
        </div>

        {/* 研究室カードグリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLabs.map(lab => (
            <article 
              key={lab.id} 
              className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:border-[#a94448]/40 transition-all duration-200 flex flex-col h-full"
            >
              {/* アクセントバー */}
              <div className="h-1.5 w-full bg-gradient-to-r from-[#a94448] to-[#cf6569]" />

              <div className="p-6 flex flex-col flex-grow">
                {/* カード上部：研究室名・職位バッジ・担当教員 */}
                <div className="mb-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h2 className="text-xl font-extrabold text-slate-800 group-hover:text-[#a94448] transition-colors">
                      {lab.labName}
                    </h2>
                    <span
                      className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-md ${
                        lab.role === '教授'
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {lab.role}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-700 font-semibold text-sm bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-[#a94448] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{lab.professor}</span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      定員 {lab.capacity}名
                    </span>
                  </div>
                </div>

                {/* 分野タグ（クリックで絞り込み可能） */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {lab.fields.map(field => {
                    const isSelected = selectedField === field;
                    return (
                      <button
                        key={field}
                        type="button"
                        onClick={() => setSelectedField(isSelected ? null : field)}
                        title={`「${field}」で絞り込む`}
                        className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer border ${
                          isSelected
                            ? 'bg-[#a94448] text-white border-[#a94448]'
                            : 'bg-[#a94448]/8 text-[#a94448] border-[#a94448]/20 hover:bg-[#a94448]/15'
                        }`}
                      >
                        #{field}
                      </button>
                    );
                  })}
                </div>

                {/* 説明文（全文を読みやすく表示） */}
                <p className="text-slate-600 text-sm leading-7 mb-6 flex-grow">
                  {lab.description}
                </p>

                {/* カード下部：各種サイトへのアクセスボタン */}
                <div className="pt-4 border-t border-slate-100 mt-auto flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* 教員詳細サイト（学科公式） */}
                    <a
                      href={lab.detailUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                      <span>教員詳細サイト</span>
                      <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>

                    {/* 研究室サイト または 研究者情報 */}
                    {lab.labUrl ? (
                      <a
                        href={lab.labUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#a94448] text-white hover:bg-[#8a373a] transition-colors shadow-2xs"
                      >
                        <span>研究室サイト</span>
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : lab.researchUrl ? (
                      <a
                        href={lab.researchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#a94448]/10 text-[#a94448] hover:bg-[#a94448] hover:text-white transition-colors"
                      >
                        <span>{lab.researchUrlLabel || '研究者情報'}</span>
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : null}
                  </div>

                  {/* 詳細ポップアップを開くボタン */}
                  <button
                    type="button"
                    onClick={() => setSelectedLab(lab)}
                    className="w-full py-1.5 text-xs font-semibold text-slate-500 hover:text-[#a94448] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>すべてのリンク・詳細を見る</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* 検索結果ゼロの場合 */}
        {filteredLabs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <svg className="w-14 h-14 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-bold text-slate-700 mb-1">条件に一致する研究室が見つかりませんでした</h3>
            <p className="text-slate-500 text-sm">
              検索キーワードや絞り込み条件を変更してお試しください。
            </p>
            <button 
              type="button"
              onClick={resetFilters}
              className="mt-5 px-5 py-2.5 bg-[#a94448] text-white text-sm rounded-xl font-bold hover:bg-[#8a373a] transition-colors cursor-pointer"
            >
              すべての条件をクリア
            </button>
          </div>
        )}
      </div>

      {/* 研究室詳細ポップアップ（モーダル） */}
      {selectedLab && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
          onClick={() => setSelectedLab(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-2 w-full bg-gradient-to-r from-[#a94448] to-[#cf6569]" />
            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 mb-2">
                    千葉工業大学 認知情報科学科
                  </span>
                  <h2 className="text-2xl font-extrabold text-slate-800">
                    {selectedLab.labName}
                  </h2>
                  <p className="text-slate-600 font-semibold mt-1">
                    担当：{selectedLab.professor}（{selectedLab.role}） / 定員 {selectedLab.capacity}名
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLab(null)}
                  aria-label="閉じる"
                  className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 研究分野タグ */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {selectedLab.fields.map(field => (
                  <span
                    key={field}
                    className="text-xs px-3 py-1 rounded-md font-semibold bg-[#a94448]/10 text-[#a94448] border border-[#a94448]/20"
                  >
                    #{field}
                  </span>
                ))}
              </div>

              {/* 研究内容 */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-6">
                <h3 className="text-xs font-bold text-slate-500 mb-1.5">研究概要</h3>
                <p className="text-slate-700 text-sm leading-7">
                  {selectedLab.description}
                </p>
              </div>

              {/* 外部サイトへのリンク一覧 */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-slate-500 mb-2">関連サイトへアクセス</h3>

                {selectedLab.labUrl && (
                  <a
                    href={selectedLab.labUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm bg-[#a94448] text-white hover:bg-[#8a373a] transition-colors shadow-xs"
                  >
                    <span>研究室Webサイトを開く</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}

                <a
                  href={selectedLab.detailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm bg-slate-800 text-white hover:bg-slate-700 transition-colors"
                >
                  <span>学科公式 教員紹介（詳細サイト）を開く</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>

                {selectedLab.researchUrl && (
                  <a
                    href={selectedLab.researchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    <span>研究者情報（{selectedLab.researchUrlLabel || '外部サイト'}）を開く</span>
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>

              <div className="mt-6 text-right">
                <button
                  type="button"
                  onClick={() => setSelectedLab(null)}
                  className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}