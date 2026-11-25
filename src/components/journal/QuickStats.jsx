import { differenceInCalendarDays } from 'date-fns';

// 顶部统计条：手账数 / 重要日子数 / 最近倒数日
const QuickStats = ({ entries, events }) => {
  const today = new Date();
  const future = events
    .filter((e) => differenceInCalendarDays(new Date(e.event_date), today) >= 0)
    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
  const next = future[0];
  const diff = next ? differenceInCalendarDays(new Date(next.event_date), today) : null;

  const items = [
    { label: '手账', value: `${entries.length} 篇`, sub: '记录生活' },
    { label: '重要日子', value: `${events.length} 个`, sub: '用心珍藏' },
    { label: '最近倒数', value: diff === null ? '—' : `D-${diff}`, sub: next ? next.title : '快去添加吧' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((it) => (
        <div key={it.label} className="bg-white/85 rounded-2xl border border-amber-100 p-3 text-center shadow-sm">
          <p className="text-[11px] text-amber-400">{it.label}</p>
          <p className="font-hand text-xl text-amber-800 my-0.5">{it.value}</p>
          <p className="text-[10px] text-stone-400 truncate">{it.sub}</p>
        </div>
      ))}
    </div>
  );
};

export default QuickStats;
