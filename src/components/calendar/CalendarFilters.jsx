import { EVENT_TYPES, TAG_COLORS } from '@/lib/constants';
import { useTags } from '@/hooks/useTags';

// 筛选行容器
const Row = ({ label, children }) => (
  <div className="flex items-center gap-1.5">
    <span className="w-10 shrink-0 text-[10px] text-amber-500">{label}</span>
    <div className="flex flex-wrap gap-1">{children}</div>
  </div>
);

const chip = (active) =>
  `rounded-full border px-2.5 py-1 text-[11px] transition ${
    active ? 'border-transparent text-white' : 'border-amber-200 bg-white text-amber-600'
  }`;

// 多维度筛选：按类型 / 优先级（置顶）/ 标签，实时过滤日历事件
const CalendarFilters = ({ type, setType, priority, setPriority, tag, setTag }) => {
  const { tags } = useTags();
  return (
    <section aria-label="日历筛选" className="space-y-1.5 rounded-2xl border border-amber-100 bg-white/85 p-3">
      <Row label="类型">
        {[{ name: 'all', label: '全部' }, ...EVENT_TYPES].map((x) => (
          <button key={x.name} onClick={() => setType(x.name)} aria-pressed={type === x.name}
            className={`${chip(type === x.name)} ${type === x.name ? 'bg-amber-400' : ''}`}>{x.label || x.name}</button>
        ))}
      </Row>
      <Row label="优先级">
        {[['all', '全部'], ['pinned', '📌 置顶'], ['normal', '普通']].map(([v, l]) => (
          <button key={v} onClick={() => setPriority(v)} aria-pressed={priority === v}
            className={`${chip(priority === v)} ${priority === v ? 'bg-sky-400' : ''}`}>{l}</button>
        ))}
      </Row>
      <Row label="标签">
        <button onClick={() => setTag('all')} aria-pressed={tag === 'all'}
          className={`${chip(tag === 'all')} ${tag === 'all' ? 'bg-rose-400' : ''}`}>全部</button>
        {tags.map((tg) => (
          <button key={tg.id} onClick={() => setTag(tg.name)} aria-pressed={tag === tg.name}
            className={chip(tag === tg.name)}
            style={tag === tg.name ? { backgroundColor: tg.color || TAG_COLORS[0], color: '#fff' } : {}}>
            {tg.icon || '#'} {tg.name}
          </button>
        ))}
      </Row>
    </section>
  );
};

export default CalendarFilters;
