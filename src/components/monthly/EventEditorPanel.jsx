import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CalendarPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EVENT_TYPES } from '@/lib/constants';
import { daysInMonth } from '@/lib/dateRules';
import { useImportantEvents } from '@/hooks/useImportantEvents';
import { useTags } from '@/hooks/useTags';
import { useLanguage } from '@/hooks/useLanguage';
import { cal } from '@/lib/i18n';
import MonthWarnDialog from './MonthWarnDialog';

// 右侧事件详情编辑区：每月N日重复规则，日期越界即时模态提示并禁用提交
// 【i18n】标题/占位符/重复说明/校验提示/按钮文案随语言切换
const EventEditorPanel = ({ cursor }) => {
  const { createEvent } = useImportantEvents();
  const { tags } = useTags();
  const { lang, isEn } = useLanguage();
  const c = (k) => cal(lang, k);
  const [title, setTitle] = useState('');
  const [day, setDay] = useState('');
  const [type, setType] = useState('日常');
  const [selTags, setSelTags] = useState([]);
  const [warn, setWarn] = useState('');

  const dayNum = parseInt(day, 10);
  const maxDay = daysInMonth(cursor.getFullYear(), cursor.getMonth() + 1);
  const invalid = day !== '' && (!Number.isInteger(dayNum) || dayNum < 1 || dayNum > 31);
  const overflow = !invalid && day !== '' && dayNum > maxDay;
  const blocked = invalid || overflow;

  // 日期越界即时弹窗：如 2 月输入 31 → "该月无31号"
  useEffect(() => {
    if (invalid) setWarn(isEn ? `Date "${day}" is invalid, please enter a number between 1-31` : `日期「${day}」无效，请输入 1-31 之间的数字`);
    else if (overflow) setWarn(isEn ? `This month has no day ${dayNum} (only ${maxDay} days)` : `该月无 ${dayNum} 号（${format(cursor, 'M')}月只有 ${maxDay} 天）`);
    else setWarn('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day, cursor]);

  const toggleTag = (n) => setSelTags((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]));

  const submit = () => {
    if (!title.trim()) { toast.error(c('titleNeeded')); return; }
    createEvent.mutate({
      title: title.trim(),
      event_date: format(new Date(cursor.getFullYear(), cursor.getMonth(), dayNum), 'yyyy-MM-dd'),
      event_type: type, repeat_rule: 'monthly', tags: selTags, is_pinned: false, remind: true,
    }, {
      onSuccess: () => {
        toast.success(isEn ? `"${title.trim()}" created — repeats on day ${dayNum} monthly 🎈` : `「${title.trim()}」已创建，每月 ${dayNum} 日重复 🎈`);
        setTitle(''); setDay(''); setSelTags([]);
      },
      onError: () => toast.error(c('saveFail')),
    });
  };

  return (
    <section aria-label={c('editorTitle')} className="rounded-2xl border border-amber-100 bg-white/85 p-4">
      <h2 className="flex items-center gap-1.5 font-hand text-lg text-amber-800">
        <CalendarPlus size={17} aria-hidden="true" /> {c('editorTitle')}
      </h2>
      <div className="mt-2 space-y-2.5">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={c('eventNamePh')} className="h-9 border-amber-200" aria-label={c('eventNamePh')} />
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-xs text-amber-600">{c('everyMonth')}</span>
          <Input type="number" min="1" max="31" value={day} onChange={(e) => setDay(e.target.value)}
            aria-label={isEn ? 'Monthly repeat day' : '每月重复日期'} aria-invalid={blocked} className="h-9 w-20 border-amber-200" placeholder="1-31" />
          <span className="text-xs text-amber-600">
            {isEn ? `repeats monthly (${format(cursor, 'MMMM')} has max ${maxDay} days)` : `日重复（${format(cursor, 'M')}月最多 ${maxDay} 天）`}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {EVENT_TYPES.map((tg) => (
            <button key={tg.name} onClick={() => setType(tg.name)} aria-pressed={type === tg.name}
              className={`rounded-full px-2.5 py-1 text-xs transition ${type === tg.name ? `${tg.chip} ring-2 ring-amber-400` : 'border border-amber-200 bg-white text-amber-600'}`}>
              {tg.emoji} {tg.name}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <button key={t.id} onClick={() => toggleTag(t.name)} aria-pressed={selTags.includes(t.name)}
              className={`rounded-full border px-2.5 py-1 text-xs transition ${selTags.includes(t.name) ? 'border-transparent ring-2 ring-amber-400' : 'border-amber-200 bg-white text-amber-600'}`}
              style={selTags.includes(t.name) ? { backgroundColor: `${t.color}33`, color: t.color } : {}}>
              {t.icon || '#'} {t.name}
            </button>
          ))}
        </div>
        <Button onClick={submit} disabled={blocked || !day || createEvent.isPending}
          className="h-10 w-full bg-emerald-400 text-white hover:bg-emerald-500">
          {blocked ? c('blockedSubmit') : createEvent.isPending ? c('saving') : c('createMonthly')}
        </Button>
      </div>
      <MonthWarnDialog open={!!warn} onOpenChange={(v) => { if (!v) setWarn(''); }} message={warn} />
    </section>
  );
};

export default EventEditorPanel;
