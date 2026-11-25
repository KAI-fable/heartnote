import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import PageShell from '@/components/layout/PageShell';
import DeleteOptionsDialog from '@/components/common/DeleteOptionsDialog';
import { useImportantEvents } from '@/hooks/useImportantEvents';
import { useLanguage } from '@/hooks/useLanguage';
import { TYPE_KEY } from '@/lib/i18n';
import { parseLocalDate } from '@/lib/dateRules';
import { dayStatus } from '@/lib/dayStatus';
import { typeOf } from '@/lib/constants';
import { getHolidayLabel } from '@/lib/lunar';

// 重要日记录页：倒计时基于 nextOccurrence 动态取下一次实际发生日期（农历节日自动转公历、
// 重复事件自动跨年顺延），状态区分 已过期/今日/未来，日期异常兜底，实时拉取后端数据
const CountdownPage = () => {
  const { t, isEn } = useLanguage();
  const { data: events = [], isLoading, deleteEvent, updateEvent, refetch } = useImportantEvents();
  const [deleteTarget, setDeleteTarget] = useState(null);

  // 实时校验：进入页面即重新请求后端，保证倒计时与最新日期一致
  useEffect(() => { refetch(); }, [refetch]);

  const rows = [...events]
    .map((e) => ({ ...e, st: dayStatus(e) }))
    .sort((a, b) => (b.is_pinned - a.is_pinned) || (a.st.diff ?? Infinity) - (b.st.diff ?? Infinity));

  const confirmDelete = (mode) => {
    if (!deleteTarget) return;
    deleteEvent.mutate({ id: deleteTarget.id, mode });
    setDeleteTarget(null);
  };

  return (
    <PageShell title={`${t('navCountdown')} 🗓️`}>
      <div className="space-y-3">
        {isLoading ? (
          <p className="py-16 text-center text-sm text-stone-400">{t('loading')}</p>
        ) : rows.length === 0 ? (
          <p className="py-16 text-center text-sm text-stone-400">{t('noEventsCta')}</p>
        ) : (
          rows.map((e) => {
            const ty = typeOf(e.event_type);
            const st = e.st;
            const holiday = !st.invalid ? getHolidayLabel(parseLocalDate(e.event_date)) : null;
            return (
              <div key={e.id} className="rounded-2xl border border-amber-100 bg-white/85 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden="true">{ty.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 truncate text-sm text-stone-700">
                      {e.title}
                      {e.is_pinned && (
                        <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[11px] text-amber-800">{t('pinnedTag')}</span>
                      )}
                    </p>
                    <p className="text-[11px] text-stone-400">
                      {st.invalid ? (
                        <span className="text-rose-500">{isEn ? '⚠️ Invalid date data' : '⚠️ 日期数据异常'}</span>
                      ) : (
                        <>
                          {format(parseLocalDate(e.event_date), isEn ? 'MMM d, yyyy' : 'yyyy年M月d日')} · {t(TYPE_KEY[ty.name] || 'typeDaily')}
                          {holiday && !isEn ? ` · ${holiday}` : ''}
                          {st.status === 'future' && e.repeat_rule !== 'none' &&
                            ` · ${isEn ? 'Next: ' : '下次：'}${format(st.nextDate, isEn ? 'MMM d, yyyy' : 'yyyy年M月d日')}`}
                        </>
                      )}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 font-hand text-sm ${
                    st.status === 'today' ? 'bg-amber-300 text-amber-900'
                      : st.status === 'future' ? 'bg-amber-200 text-amber-800'
                      : 'bg-stone-200 text-stone-500'
                  }`}>
                    {st.invalid ? '⚠️'
                      : st.status === 'today' ? t('justToday')
                      : st.status === 'future' ? `D-${st.diff}`
                      : (isEn ? 'Expired' : '已过期')}
                  </span>
                  <button
                    onClick={() => updateEvent.mutate({ id: e.id, is_pinned: !e.is_pinned })}
                    aria-label={e.is_pinned ? t('unpin') : t('pin')}
                    className="rounded-lg bg-amber-50 px-2 py-2 text-sm hover:bg-amber-100"
                  >📌</button>
                  <button
                    onClick={() => setDeleteTarget(e)}
                    aria-label={t('del')}
                    className="rounded-lg bg-rose-50 px-2 py-2 text-sm hover:bg-rose-100"
                  >🗑️</button>
                </div>
                {(e.tags || []).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 border-t border-amber-50 pt-2">
                    {e.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-700">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      <DeleteOptionsDialog target={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete} />
    </PageShell>
  );
};

export default CountdownPage;
