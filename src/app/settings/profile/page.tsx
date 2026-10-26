'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ProfileSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

  // フォーム用ステート
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('学部1年');
  const [department, setDepartment] = useState('');
  const [bio, setBio] = useState('');
  const [github, setGithub] = useState('');
  const [interests, setInterests] = useState('');

  useEffect(() => {
    async function getProfile() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data) {
          setName(data.name || '');
          setGrade(data.grade || '学部1年');
          setDepartment(data.department || '');
          setBio(data.bio || '');
          setGithub(data.github || '');
          setInterests(data.interests || '');
        }
      } catch (error) {
        console.error('プロフィールの取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    }

    getProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('ログインしていません');

      const updates = {
        id: user.id,
        name,
        grade,
        department,
        bio,
        interests,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;

      setMessage('プロフィールを保存しました。');
    } catch (error: any) {
      setMessage('エラーが発生しました: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-zinc-400">読み込み中...</div>;
  }

  return (
    <form onSubmit={handleUpdate} className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-zinc-900 mb-1">プロフィール公開情報</h2>
        <p className="text-xs text-zinc-500 mb-6">他の学生に公開されるあなたの情報を編集します。</p>
      </div>

      {message && (
        <div className="p-3 bg-zinc-900 text-white text-xs rounded-xl font-medium">
          {message}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-zinc-600 mb-1.5">表示名</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          placeholder="例：千葉 太郎"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1.5">学年</label>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="学部1年">学部1年</option>
            <option value="学部2年">学部2年</option>
            <option value="学部3年">学部3年</option>
            <option value="学部4年">学部4年</option>
            <option value="修士1年">修士1年</option>
            <option value="修士2年">修士2年</option>
            <option value="博士課程">博士課程</option>
            <option value="その他">その他</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1.5">学部・学科</label>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            placeholder="例：情報工学科"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-600 mb-1.5">興味・関心 / スキル（カンマ区切り）</label>
        <input
          type="text"
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          placeholder="例：React, Python, バンド"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-600 mb-1.5">自己紹介</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
          placeholder="自由に書いてね！"
        />
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={updating}
          className="px-6 py-2.5 bg-[#a94448] text-white text-xs font-medium uppercase tracking-wider rounded-xl hover:opacity-95 transition-opacity shadow-sm"
        >
          {updating ? '保存中...' : '変更を保存'}
        </button>
      </div>
    </form>
  );
}