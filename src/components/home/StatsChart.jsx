import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { subDays, isSameDay, format } from 'date-fns';
import { useJournalEntries } from '@/hooks/useJournalEntries';
import { useLanguage } from '@/hooks/useLanguage';
import AiInsights from './AiInsights';

const MOOD_COLORS = { '😊': '#fbbf24', '🥰': '#fb7185', '😢': '#60a5fa', '😌': '#34d399', '🤩': '#a78bfa', '😴': '#94a3b8' };

// 可交互统计图表：心情分布饼图 / 近7天记录柱状图，文案随语言切换
const StatsChart = () => {
  const { t, isEn } = useLanguage();
  const { data: entries = [], isLoading } = useJournalEntries();
  const [mode, setMode] = useState('pie');

  const moodData = Object.entries(
    entries.reduce((acc, e) => {
      acc[e.mood] = (acc[e.mood] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const weekData = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(new Date(), 6 - i);
    return {
      day: format(day, 'M/d'),
      count: entries.filter((e) => isSameDay(new Date(e.created_at), day)).length,
    };
  });

  return (
    <section aria-label={t('statsTitle')} className="rounded-2xl border border-amber-100 bg-white/85 p-4">
      <div className="flex items-center gap-2">
        <h2 className="font-hand text-lg text-amber-800">📊 {t('statsTitle')}</h2>
        <div className="ml-auto flex gap-1" role="tablist" aria-label={t('statsTitle')}>
          {[['pie', t('moodDist')], ['bar', t('weekTrend')]].map(([m, label]) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={`rounded-lg px-3 py-1 text-xs ${mode === m ? 'bg-amber-300 text-amber-900' : 'bg-amber-50 text-amber-600'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {isLoading ? (
        <p className="py-10 text-center text-sm text-stone-400">{t('loading')}</p>
      ) : entries.length === 0 ? (
        <p className="py-10 text-center text-sm text-stone-400">{t('noStatsData')}</p>
      ) : mode === 'pie' ? (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={moodData} dataKey="value" nameKey="name" outerRadius={80} label>
              {moodData.map((d) => <Cell key={d.name} fill={MOOD_COLORS[d.name] || '#fbbf24'} />)}
            </Pie>
            <Tooltip /><Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={weekData}>
            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" name={t('countName')} fill="#fbbf24" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
      {/* AI 智能分析：关键词提取 + 智能摘要（随语言输出） */}
      <AiInsights />
    </section>
  );
};

export default StatsChart;
