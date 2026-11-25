import { useMemo } from 'react';
import { addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, format } from 'date-fns';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useTags } from '@/hooks/useTags';
import { useLanguage } from '@/hooks/useLanguage';
import { cal } from '@/lib/i18n';
import { eventColor, lunarTip } from '@/lib/eventColors';
import { occurrencesInMonth } from '@/lib/dateRules';

// 顶部智能日历视图：重复事件按规则展开打点，节日专属配色，悬浮显示节日名+农历
// 【i18n】月份格式/星期表头/图例/操作指引随语言切换；英文模式下农历提示加 "Lunar: " 前缀
const MonthlyCalendar = ({ events, cursor, setCursor, selectedDate, onSelectDate, onRequestDelete }) => {
  const { tags } = useTags();
  const { lang } = useLanguage();
  const c = (k) => cal(lang, k);

  const days = useMemo(
    () => eachDayOfInterval({ start: startOfWeek(startOfMonth(cursor)), end: endOfWeek(endOfMonth(cursor)) }),
    [cursor]
  );

  // 事件按重复规则（monthly/yearly/单次）展开到当月各天，大小月与闰年自动钳制
  const evMap = useMemo(() => {
    const map = {};
    events.forEach((ev) =>
      occurrencesInMonth(ev, cursor).forEach((d) => {
        const k = format(d, 'yyyy-MM-dd');
        (map[k] = map[k] || []).push(ev);
      })
    );
    return map;
  }, [events, cursor]);

  return (
    <section aria-label={lang === 'en' ? 'Monthly calendar' : '月度智能日历'} className="rounded-2xl border border-amber-100 bg-white/85 p-3">
      <div className="flex items-center gap-2">
        <button onClick={() => setCursor(subMonths(cursor, 1))} aria-label={lang === 'en' ? 'Previous month' : '上个月'} className="rounded-lg p-2 hover:bg-amber-100">
          <ChevronLeft size={16} className="text-amber-600" aria-hidden="true" />
        </button>
        <p className="font-hand text-lg text-amber-800">{format(cursor, c('monthFmt'))}</p>
        <button onClick={() => setCursor(addMonths(cursor, 1))} aria-label={lang === 'en' ? 'Next month' : '下个月'} className="rounded-lg p-2 hover:bg-amber-100">
          <ChevronRight size={16} className="text-amber-600" aria-hidden="true" />
        </button>
        <span className="ml-auto text-[10px] text-stone-400">{c('legend')}</span>
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1 text-center">
        {c('weekdays').map((w) => <span key={w} className="py-1 text-[10px] text-amber-400">{w}</span>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((d) => {
          const key = format(d, 'yyyy-MM-dd');
          const list = evMap[key] || [];
          const inMonth = isSameMonth(d, cursor);
          return (
            <div key={key} role="gridcell" aria-label={key} onClick={() => onSelectDate(d)}
              className={`min-h-[62px] cursor-pointer rounded-xl border p-1 transition ${
                inMonth ? 'border-amber-100 bg-white/85' : 'border-transparent bg-stone-50/70 opacity-55'
              } ${isSameDay(d, selectedDate) ? 'ring-2 ring-amber-400' : ''}`}>
              <span className={`text-xs ${isToday(d) ? 'font-bold text-rose-500' : 'text-stone-600'}`}>{d.getDate()}</span>
              {list.slice(0, 2).map((ev) => {
                const col = eventColor(ev, tags);
                return (
                  <div key={ev.id} draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', String(ev.id))}
                    title={`${ev.title} · ${c('lunarPrefix')}${lunarTip(d)}`} onClick={(e) => e.stopPropagation()}
                    className="group mt-0.5 flex items-center gap-0.5 rounded px-1 text-[9px]"
                    style={{ backgroundColor: `${col}33`, color: col }}>
                    <span className="truncate">{ev.title}</span>
                    <button aria-label={`${lang === 'en' ? 'Delete' : '删除'} ${ev.title}`}
                      onClick={(e) => { e.stopPropagation(); onRequestDelete(ev); }}
                      className="shrink-0 opacity-0 transition group-hover:opacity-100">
                      <X size={9} aria-hidden="true" />
                    </button>
                  </div>
                );
              })}
              {list.length > 2 && <p className="px-1 text-[8px] text-stone-400">+{list.length - 2}</p>}
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[10px] text-stone-400">{c('monthlyHint')}</p>
    </section>
  );
};

export default MonthlyCalendar;
