import { useMemo, useState } from 'react';
import { addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTags } from '@/hooks/useTags';
import { useLanguage } from '@/hooks/useLanguage';
import { TAG_COLORS } from '@/lib/constants';
import { cal } from '@/lib/i18n';
import { parseLocalDate } from '@/lib/dateRules';
import { getHolidayLabel } from '@/lib/lunar';

// 标签颜色解析：无标签或未匹配时回落默认琥珀色
const colorOf = (tagName, tags) => tags.find((x) => x.name === tagName)?.color || TAG_COLORS[0];

// 智能日历网格：月视图时间轴，事件可拖拽/点选移动，手账自动打点
// 【i18n】月份格式/星期表头/今天按钮/操作指引随语言切换（英文模式显示英文）
const CalendarGrid = ({ events, entries, selectedDate, onSelectDate, onMoveEvent, movingEventId, onSelectEvent }) => {
  const { tags } = useTags();
  const { lang } = useLanguage();
  const c = (k) => cal(lang, k);
  const [cursor, setCursor] = useState(() => new Date());
  const [over, setOver] = useState(null);

  // 6 行 7 列响应式网格：覆盖当月前后补齐的完整周
  const days = useMemo(
    () => eachDayOfInterval({ start: startOfWeek(startOfMonth(cursor)), end: endOfWeek(endOfMonth(cursor)) }),
    [cursor]
  );

  // 时区安全解析：'yyyy-MM-dd' 事件日期按本地时区处理，避免跨时区偏移一天
  const eventsOf = (d) => events.filter((e) => isSameDay(parseLocalDate(e.event_date), d));
  const entryCount = (d) => entries.filter((e) => isSameDay(new Date(e.created_at), d)).length;

  return (
    <section aria-label={lang === 'en' ? 'Smart calendar grid' : '智能日历网格'} className="rounded-2xl border border-amber-100 bg-white/85 p-3">
      <div className="flex items-center gap-2">
        <button onClick={() => setCursor(subMonths(cursor, 1))} aria-label={lang === 'en' ? 'Previous month' : '上个月'} className="rounded-lg p-2 hover:bg-amber-100">
          <ChevronLeft size={16} className="text-amber-600" aria-hidden="true" />
        </button>
        <p className="font-hand text-lg text-amber-800">{format(cursor, c('monthFmt'))}</p>
        <button onClick={() => setCursor(addMonths(cursor, 1))} aria-label={lang === 'en' ? 'Next month' : '下个月'} className="rounded-lg p-2 hover:bg-amber-100">
          <ChevronRight size={16} className="text-amber-600" aria-hidden="true" />
        </button>
        <button onClick={() => setCursor(new Date())} className="ml-auto rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-600 hover:bg-amber-100">{c('todayBtn')}</button>
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1 text-center">
        {c('weekdays').map((w) => <span key={w} className="py-1 text-[10px] text-amber-400">{w}</span>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((d) => {
          const evs = eventsOf(d);
          const ec = entryCount(d);
          const inMonth = isSameMonth(d, cursor);
          const holiday = getHolidayLabel(d);
          const key = d.toISOString();
          return (
            <div key={key} role="gridcell" aria-label={format(d, 'yyyy-MM-dd')}
              onClick={() => (movingEventId ? onMoveEvent(movingEventId, d) : onSelectDate(d))}
              onDragOver={(e) => { e.preventDefault(); setOver(key); }}
              onDragLeave={() => setOver(null)}
              onDrop={(e) => { e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); setOver(null); if (id) onMoveEvent(id, d); }}
              className={`min-h-[64px] cursor-pointer rounded-xl border p-1 transition ${
                inMonth ? 'bg-white/85 border-amber-100' : 'border-transparent bg-stone-50/70 opacity-55'
              } ${isSameDay(d, selectedDate) ? 'ring-2 ring-amber-400' : ''} ${over === key ? 'bg-amber-100 ring-2 ring-sky-300' : ''}`}>
              <div className="flex items-center gap-0.5">
                <span className={`text-xs ${isToday(d) ? 'font-bold text-rose-500' : 'text-stone-600'}`}>{d.getDate()}</span>
                {ec > 0 && <span className="text-[9px] text-amber-500" aria-label={`${ec} ${lang === 'en' ? 'entries' : '篇手账'}`}>✏️{ec}</span>}
                {holiday && <span className="ml-auto text-[8px] text-rose-400">{holiday}</span>}
              </div>
              {/* 事件芯片：按标签颜色渲染，可拖拽（预设事件除外），点选进入移动模式 */}
              {evs.slice(0, 2).map((e) => {
                const col = colorOf((e.tags || [])[0], tags);
                return (
                  <div key={e.id} draggable={!String(e.id).startsWith('preset_')}
                    onDragStart={(ev) => ev.dataTransfer.setData('text/plain', String(e.id))}
                    onClick={(ev) => { ev.stopPropagation(); onSelectEvent?.(String(e.id)); }}
                    className={`mt-0.5 truncate rounded px-1 text-[9px] ${movingEventId === String(e.id) ? 'ring-2 ring-sky-400' : ''}`}
                    style={{ backgroundColor: `${col}33`, color: col }} title={e.title}>
                    {e.emoji || '📌'} {e.title}
                  </div>
                );
              })}
              {evs.length > 2 && <p className="px-1 text-[8px] text-stone-400">+{evs.length - 2}</p>}
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[10px] text-stone-400">{c('calHint')}</p>
    </section>
  );
};

export default CalendarGrid;
