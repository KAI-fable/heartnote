import { useState } from 'react';
import { toast } from 'sonner';
import { Trash2, RotateCcw } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import MonthlyCalendar from '@/components/monthly/MonthlyCalendar';
import TagPanel from '@/components/monthly/TagPanel';
import EventEditorPanel from '@/components/monthly/EventEditorPanel';
import DeleteConfirmDialog from '@/components/monthly/DeleteConfirmDialog';
import { useImportantEvents } from '@/hooks/useImportantEvents';
import { useLanguage } from '@/hooks/useLanguage';
import { cal } from '@/lib/i18n';
import { getPresetEvents, hidePreset, restorePresets } from '@/lib/presetEvents';
import { logEventOpDb } from '@/lib/eventOpLog';
import { logOp } from '@/hooks/useOperationLog';

// 月度重要日管理页：顶部智能日历，下方左侧标签面板 + 右侧事件编辑区
// 【i18n】英文模式下仅保留英文标题（Monthly Days），界面文案/提示/弹窗完整英文翻译
const MonthlyEventsPage = () => {
  const { lang, isEn } = useLanguage();
  const c = (k) => cal(lang, k);
  const { data: userEvents = [], deleteEvent } = useImportantEvents();
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [pending, setPending] = useState(null); // 待删除事件（二次确认中）
  const [version, setVersion] = useState(0); // 预设增删后强制刷新日历

  // 合并预置纪念日与用户自定义事件
  const events = [...getPresetEvents(), ...userEvents];

  // 确认删除：预设走本地隐藏，自定义走云端硬删除（mode:'hard'），均记录操作日志入库
  const confirmDelete = async () => {
    const ev = pending;
    if (!ev) return;
    setPending(null);
    try {
      if (String(ev.id).startsWith('preset_')) {
        hidePreset(ev.id);
        setVersion((v) => v + 1);
        logOp('delete_preset', `移除预设纪念日「${ev.title}」`);
        await logEventOpDb('delete_preset', ev.title);
        toast.success(isEn ? `Preset "${ev.title}" removed` : `预设「${ev.title}」已移除`);
      } else {
        deleteEvent.mutate({ id: ev.id, mode: 'hard' }, {
          onSuccess: async () => {
            logOp('delete_event', `删除事件「${ev.title}」`);
            await logEventOpDb('delete_event', ev.title);
            toast.success(isEn ? `"${ev.title}" deleted` : `「${ev.title}」已删除`);
          },
          onError: () => toast.error(c('saveFail')),
        });
      }
    } catch (e) {
      await logEventOpDb('delete_fail', ev?.title || 'unknown', e);
      toast.error(isEn ? 'Delete failed, error has been logged' : '删除操作出现异常，已记录错误日志');
    }
  };

  // 拖拽事件到删除区 → 触发二次确认弹窗
  const onDropDelete = (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const ev = events.find((x) => String(x.id) === id);
    if (ev) setPending(ev);
  };

  return (
    <PageShell title={isEn ? 'Monthly Days 🗓️' : '月度重要日 🗓️'}>
      <div className="space-y-4">
        <MonthlyCalendar key={version} events={events} cursor={cursor} setCursor={setCursor}
          selectedDate={selectedDate} onSelectDate={setSelectedDate} onRequestDelete={setPending} />

        {/* 拖拽删除区：拖入事件即弹二次确认 */}
        <div onDragOver={(e) => e.preventDefault()} onDrop={onDropDelete}
          className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/50 py-3 text-sm text-rose-400 transition hover:border-rose-300 hover:bg-rose-50">
          <Trash2 size={15} aria-hidden="true" /> {c('dropZone')}
          <button onClick={() => { restorePresets(); setVersion((v) => v + 1); logOp('restore_presets', '恢复全部预置纪念日'); toast.success(c('restored')); }}
            className="ml-3 flex items-center gap-1 rounded-lg bg-amber-100 px-2.5 py-1 text-xs text-amber-600 hover:bg-amber-200">
            <RotateCcw size={12} aria-hidden="true" /> {c('restorePresets')}
          </button>
        </div>

        {/* 左：标签面板 / 右：事件编辑区 */}
        <div className="grid gap-4 md:grid-cols-2">
          <TagPanel />
          <EventEditorPanel cursor={cursor} />
        </div>
      </div>
      <DeleteConfirmDialog target={pending} onCancel={() => setPending(null)} onConfirm={confirmDelete} />
    </PageShell>
  );
};

export default MonthlyEventsPage;
