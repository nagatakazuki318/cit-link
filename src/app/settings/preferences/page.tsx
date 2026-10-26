'use client';

export default function PreferencesSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-zinc-900 mb-1">環境設定・通知</h2>
        <p className="text-xs text-zinc-500 mb-6">アプリの通知や表示に関する設定を行います。</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-200/60">
          <div>
            <h3 className="text-sm font-medium text-zinc-900">メール通知</h3>
            <p className="text-xs text-zinc-500">新しい返信やイベントの案内を受け取る</p>
          </div>
          <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#a94448]" />
        </div>

        <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-200/60">
          <div>
            <h3 className="text-sm font-medium text-zinc-900">ダークモード（予定）</h3>
            <p className="text-xs text-zinc-500">夜間に見やすいダークテーマに切り替える</p>
          </div>
          <input type="checkbox" className="w-4 h-4 accent-[#a94448]" />
        </div>
      </div>
    </div>
  );
}