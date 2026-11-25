import { useEffect, useMemo } from 'react';
import { differenceInCalendarDays, format } from 'date-fns';
import { CalendarHeart, Plus } from 'lucide-react';
import { useImportantEvents } from '@/hooks/useImportantEvents';
import { useLanguage } from '@/hooks/useLanguage';
import { TYPE_KEY } from '@/lib/i18n';
import { parseLocalDate } from '@/lib/dateRules';
import { dayStatus } from '@/lib/dayStatus';
import { typeOf } from '@/lib/constants';

// 重要日子管理：倒计时基于 nextOccurrence 动态取"下一次实际发生日期"（农历节日自动转公历、
// 重复事件自动顺延跨年），状态明确区分 已过期/今日/未来，日期异常时兜底提示；
// 挂载即重新拉取后端最新数据，保证倒计时与实际日期一致
const ImportantDaysManager = ({ onAdd }) => {
  const { t, isEn } = useLanguage();
  const { data: events = [], isLoading, refetch } = useImportantEvents();

  // 实时校验：进入页面即重新请求后端，同步最新日期数据
  useEffect(() => { refetch(); }, [refetch]);

  const rows = useMemo(
    () => events
      .map((e) => ({ ...e, st: dayStatus(e) }))
      .sort((a, b) => (a.st.status === 'expired') - (b.st.status === 'expired') || (a.st.diff ?? 0) - (b.st.diff ?? 0)),
    [events]
  );

  return (
    <section aria-label={t('daysTitle')} className="rounded-2xl border border-amber-100 bg-white/85 p-4">
      <div className="flex items-center gap-2">
        <h2 className="flex items-center gap-1.5 font-hand text-lg text-amber-800">
          <CalendarHeart size={18} className="text-rose-400" aria-hidden="true" /> {t('daysTitle')}
        </h2>
        <button
          data-track="important_add"
          onClick={onAdd}
          aria-label={t('addDay')}
          className="ml-auto flex items-center gap-1 rounded-xl bg-rose-100 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-200"
        >
          <Plus size={13} aria-hidden="true" /> {t('addDay')}
        </button>
      </div>

      <div aria-live="polite" className="mt-3">
        {isLoading ? (
          <p className="py-6 text-center text-sm text-stone-400">{t('loading')}</p>
        ) : rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-stone-400">{t('noDays')}</p>
        ) : (
          <ul className="space-y-2">
            {rows.map((e) => {
              const ty = typeOf(e.event_type);
              const st = e.st;
              // 反向天数：基于原始日期计算已过去多少天（单次过期/重复事件均适用）
              const reverse = st.invalid ? null : Math.max(differenceInCalendarDays(new Date(), parseLocalDate(e.event_date)), 0);
              return (
                <li key={e.id} className="rounded-xl bg-amber-50/60 px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="text-lg" aria-hidden="true">{ty.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-stone-700">{e.title}</p>
                      <p className="text-[10px] text-stone-400">
                        {st.invalid ? (
                          <span className="text-rose-500">{isEn ? '⚠️ Invalid date data' : '⚠️ 日期数据异常'}</span>
                        ) : (
                          <>
                            {format(parseLocalDate(e.event_date), isEn ? 'MMM d, yyyy' : 'yyyy年M月d日')} · {t(TYPE_KEY[ty.name] || 'typeDaily')}
                            {/* 重复事件额外展示下一次实际发生日期（如农历七夕转公历后的真实日期） */}
                            {st.status === 'future' && e.repeat_rule !== 'none' &&
                              ` · ${isEn ? 'Next: ' : '下次：'}${format(st.nextDate, isEn ? 'MMM d' : 'M月d日')}`}
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      {st.invalid ? (
                        <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[11px] text-stone-600">—</span>
                      ) : st.status === 'today' ? (
                        <span className="rounded-full bg-amber-300 px-2 py-0.5 text-[11px] text-amber-900">🎉 {t('justToday')}</span>
                      ) : st.status === 'future' ? (
                        <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[11px] text-amber-800">
                          {isEn ? `in ${st.diff}d` : `还有 ${st.diff} 天`}
                        </span>
                      ) : (
                        <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[11px] text-stone-500">{isEn ? 'Expired' : '已过期'}</span>
                      )}
                      {reverse !== null && reverse > 0 && (
                        <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] text-sky-700">
                          {isEn ? `${reverse}d ago` : `已过 ${reverse} 天`}
                        </span>
                      )}
                    </div>
                  </div>
                  {(e.tags || []).length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {e.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-white px-2 py-0.5 text-[10px] text-amber-700">#{tag}</span>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
};

export default ImportantDaysManager;
