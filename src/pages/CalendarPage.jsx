import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { isSameDay, format } from 'date-fns';
import { Plus, Pencil, LogIn } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import CalendarGrid from '@/components/calendar/CalendarGrid';
import CalendarFilters from '@/components/calendar/CalendarFilters';
import JournalLinkedCard from '@/components/calendar/JournalLinkedCard';
import AddEventDialog from '@/components/home/AddEventDialog';
import { useImportantEvents } from '@/hooks/useImportantEvents';
import { useJournalEntries } from '@/hooks/useJournalEntries';
import { useVisitState } from '@/hooks/useVisitState';
import { useLanguage } from '@/hooks/useLanguage';
import { cal } from '@/lib/i18n';
import { getPresetEvents } from '@/lib/presetEvents';
import { logOp } from '@/hooks/useOperationLog';

// 智能日历页：月视图网格 + 拖拽移动事件 + 手账联动高亮 + 多维筛选
// 【i18n】英文模式下仅保留英文标题（Smart Calendar），按钮/提示/状态信息完整英文翻译
const CalendarPage = () => {
  const { role, login } = useVisitState();
  const { lang, isEn, t } = useLanguage();
  const c = (k) => cal(lang, k);
  const { data: userEvents = [], isLoading, updateEvent } = useImportantEvents();
  const { data: entries = [] } = useJournalEntries();
  const [type, setType] = useState('all');
  const [priority, setPriority] = useState('all');
  const [tag, setTag] = useState('all');
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [movingId, setMovingId] = useState(null);
  const [addOpen, setAddOpen] = useState(false);

  // 侧边栏快捷入口：跨页面事件触发快速添加/编辑
  useEffect(() => {
    const quickAdd = () => {
      if (role === 'guest') { toast.error(isEn ? 'Permission denied: log in to add events' : '权限不足：登录后才能添加事件'); return; }
      setAddOpen(true);
    };
    const quickEdit = () => {
      if (role === 'guest') { toast.error(c('needLogin')); return; }
      const sorted = [...userEvents].sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
      if (!sorted.length) { toast.info(c('noCustom')); return; }
      setMovingId(String(sorted[0].id));
      toast.info(isEn ? `Selected "${sorted[0].title}" — tap a target date to move it` : `已选中「${sorted[0].title}」，点击目标日期完成移动`);
    };
    window.addEventListener('calendar-quick-add', quickAdd);
    window.addEventListener('calendar-quick-edit', quickEdit);
    return () => {
      window.removeEventListener('calendar-quick-add', quickAdd);
      window.removeEventListener('calendar-quick-edit', quickEdit);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, userEvents, lang]);

  // 合并系统预设纪念日与自定义事件
  const allEvents = useMemo(() => [...getPresetEvents(), ...userEvents], [userEvents]);

  // 多维筛选：类型 / 优先级（置顶）/ 标签
  const filtered = useMemo(() => allEvents.filter((e) => {
    if (type !== 'all' && e.event_type !== type) return false;
    if (priority === 'pinned' && !e.is_pinned) return false;
    if (priority === 'normal' && e.is_pinned) return false;
    if (tag !== 'all' && !(e.tags || []).includes(tag)) return false;
    return true;
  }), [allEvents, type, priority, tag]);

  const dayEntries = useMemo(
    () => entries.filter((e) => isSameDay(new Date(e.created_at), selectedDate)),
    [entries, selectedDate]
  );

  // 拖拽/点选移动事件：更新日期 + 记录操作日志（预设事件禁止移动）
  const handleMove = (id, date) => {
    setMovingId(null);
    if (String(id).startsWith('preset_')) { toast.error(c('presetNoMove')); return; }
    const ev = userEvents.find((e) => String(e.id) === String(id));
    if (!ev) return;
    if (isSameDay(new Date(ev.event_date), date)) return;
    updateEvent.mutate(
      { id: ev.id, event_date: format(date, 'yyyy-MM-dd') },
      {
        onSuccess: () => {
          logOp('move_event', `移动事件「${ev.title}」→ ${format(date, 'yyyy-MM-dd')}`);
          toast.success(isEn ? `"${ev.title}" moved to ${format(date, 'yyyy-MM-dd')}` : `「${ev.title}」已移动到 ${format(date, 'yyyy-MM-dd')}`);
        },
        onError: () => toast.error(c('moveFail')),
      }
    );
  };

  // 快速编辑：选中最近的自定义事件进入移动模式
  const quickEdit = () => {
    const sorted = [...userEvents].sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
    if (!sorted.length) { toast.info(c('noCustom')); return; }
    setMovingId(String(sorted[0].id));
    toast.info(isEn ? `Selected "${sorted[0].title}" — tap a target date to move it` : `已选中「${sorted[0].title}」，点击目标日期完成移动`);
  };

  return (
    <PageShell title={isEn ? 'Smart Calendar 📅' : '智能日历 📅'}>
      <div className="space-y-4">
        {/* 权限不足明确标识：访客可浏览，登录后可编辑 */}
        {role === 'guest' && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <p className="flex-1 text-sm text-rose-600">{c('permGuest')}</p>
            <button onClick={login} className="flex shrink-0 items-center gap-1 rounded-xl bg-rose-400 px-3 py-2 text-xs text-white hover:bg-rose-500">
              <LogIn size={14} aria-hidden="true" /> {c('loginBtn')}
            </button>
          </div>
        )}

        {/* 操作按钮：随语言切换（英文 Quick Add Event / Quick Edit Event） */}
        <div className="flex gap-2">
          <button onClick={() => (role === 'guest' ? toast.error(c('needLogin')) : setAddOpen(true))}
            aria-label={t('quickAdd')}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-amber-400 py-3 font-hand text-white transition hover:bg-amber-500">
            <Plus size={16} aria-hidden="true" /> {t('quickAdd')}
          </button>
          <button onClick={quickEdit} aria-label={t('quickEdit')}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-sky-100 py-3 font-hand text-sky-700 transition hover:bg-sky-200">
            <Pencil size={16} aria-hidden="true" /> {t('quickEdit')}
          </button>
        </div>

        {movingId && (
          <div role="status" className="rounded-xl bg-sky-50 px-3 py-2 text-xs text-sky-700">{c('moveModeHint')}</div>
        )}

        <CalendarFilters type={type} setType={setType} priority={priority} setPriority={setPriority} tag={tag} setTag={setTag} />
        <CalendarGrid events={filtered} entries={entries} selectedDate={selectedDate}
          onSelectDate={setSelectedDate} onMoveEvent={handleMove} movingEventId={movingId}
          onSelectEvent={(id) => setMovingId((prev) => (prev === id ? null : id))} />

        {/* 手账卡片列表：与日历联动高亮 */}
        <section aria-label={isEn ? 'Journal entries of the day' : '当日手账联动'}>
          <h2 className="mb-2 font-hand text-lg text-amber-800">
            {isEn
              ? `📝 Entries on ${format(selectedDate, 'MMM d')} (${dayEntries.length})`
              : `📝 ${format(selectedDate, 'M月d日')} 的手账（${dayEntries.length}）`}
          </h2>
          <JournalLinkedCard entries={dayEntries}
            onPick={(en) => { setSelectedDate(new Date(en.created_at)); toast.success(isEn ? 'Highlighted the date of this entry 📅' : '已联动高亮该手账对应日期 📅'); }} />
        </section>

        {isLoading && <p className="text-center text-sm text-stone-400">{t('loading')}</p>}
      </div>
      <AddEventDialog open={addOpen} onOpenChange={setAddOpen} />
    </PageShell>
  );
};

export default CalendarPage;
