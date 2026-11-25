import { useMemo } from 'react';
import { BrainCircuit } from 'lucide-react';
import { useJournalEntries } from '@/hooks/useJournalEntries';
import { useLanguage } from '@/hooks/useLanguage';

// 中文停用字：参与构词则过滤该双字词，保证关键词有意义
const STOP = new Set('的了是在有和与人这那之我为它们你他她么吗呢吧啊呀哦嘛就都很被把也还又太最挺着过上下来去说不');

// 高频关键词提取：去除 HTML 后按相邻双字词统计词频（轻量级中文分词近似）
function extractKeywords(entries) {
  const freq = {};
  entries.forEach((e) => {
    const text = (e.content || '').replace(/<[^>]+>/g, '').replace(/[^\u4e00-\u9fa5A-Za-z]+/g, '');
    for (let i = 0; i < text.length - 1; i++) {
      const w = text.slice(i, i + 2);
      if (![...w].some((c) => STOP.has(c))) freq[w] = (freq[w] || 0) + 1;
    }
  });
  return Object.entries(freq)
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([w, n]) => ({ w, n }));
}

// 基于统计数据的简短智能摘要（本地模板引擎，随语言输出中/英文）
function buildSummary(entries, keywords, isEn) {
  const moods = {};
  entries.forEach((e) => { if (e.mood) moods[e.mood] = (moods[e.mood] || 0) + 1; });
  const topMood = Object.entries(moods).sort((a, b) => b[1] - a[1])[0];
  const days = {};
  entries.forEach((e) => {
    const d = new Date(e.created_at).toLocaleDateString(isEn ? 'en-US' : 'zh-CN');
    days[d] = (days[d] || 0) + 1;
  });
  const topDay = Object.entries(days).sort((a, b) => b[1] - a[1])[0];
  const kw = keywords.slice(0, 3).map((k) => (isEn ? k.w : `「${k.w}」`)).join(isEn ? ', ' : '');
  if (isEn) {
    return [
      `You have written ${entries.length} entries`,
      topMood ? `most common mood is ${topMood[0]}` : '',
      kw ? `top keywords: ${kw}` : '',
      topDay && topDay[1] > 1 ? `${topDay[0]} was your most productive day (${topDay[1]} entries)` : '',
    ].filter(Boolean).join(', ') + '. Keep journaling — this notebook knows you better 💛';
  }
  return [
    `你共写下 ${entries.length} 篇手账`,
    topMood ? `最常出现的心情是 ${topMood[0]}` : '',
    kw ? `高频关键词为 ${kw}` : '',
    topDay && topDay[1] > 1 ? `${topDay[0]} 是你的高产日（${topDay[1]} 篇）` : '',
  ].filter(Boolean).join('，') + '。继续保持记录的习惯，让本子更懂你 💛';
}

// AI 智能分析卡片：集成于统计区域，标题/摘要随语言切换
const AiInsights = () => {
  const { t, isEn } = useLanguage();
  const { data: entries = [], isLoading } = useJournalEntries();

  const { keywords, summary } = useMemo(() => {
    if (entries.length === 0) return { keywords: [], summary: '' };
    const kw = extractKeywords(entries);
    return { keywords: kw, summary: buildSummary(entries, kw, isEn) };
  }, [entries, isEn]);

  if (isLoading) return <p className="mt-3 text-center text-xs text-stone-300">{t('aiLoading')}</p>;
  if (entries.length === 0) return null;

  return (
    <div className="mt-4 rounded-xl bg-gradient-to-r from-amber-50 to-rose-50 p-4" aria-live="polite">
      <h3 className="flex items-center gap-1.5 text-sm font-bold text-amber-800">
        <BrainCircuit size={16} aria-hidden="true" /> 🧠 {t('aiTitle')}
      </h3>
      {keywords.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5" aria-label={t('aiTitle')}>
          {keywords.map((k) => (
            <span key={k.w} className="rounded-full bg-white px-2.5 py-0.5 text-[11px] text-amber-700 shadow-sm">
              {k.w} ×{k.n}
            </span>
          ))}
        </div>
      )}
      <p className="mt-2 text-xs leading-relaxed text-stone-600">{summary}</p>
    </div>
  );
};

export default AiInsights;
