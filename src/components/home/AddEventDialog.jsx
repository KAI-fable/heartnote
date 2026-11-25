import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EVENT_TYPES, categoryOf } from '@/lib/constants';
import { daysInMonth, parseLocalDate } from '@/lib/dateRules';
import { useImportantEvents } from '@/hooks/useImportantEvents';
import { useTags } from '@/hooks/useTags';
import { useLanguage } from '@/hooks/useLanguage';
import { ed } from '@/lib/i18nEditor';
import RepeatRulePicker from './RepeatRulePicker';
import TagChip from '@/components/common/TagChip';

// 新增重要日子弹窗：类型 / 差异化重复规则 / 日期合法性校验 / 标签选择
// 【i18n】标题/表单标签/占位符/校验信息/按钮随语言切换；默认标签随语言翻译
const AddEventDialog = ({ open, onOpenChange }) => {
  const { createEvent } = useImportantEvents();
  const { tags: allTags } = useTags();
  const { lang, isEn } = useLanguage();
  const e = (k) => ed(lang, k);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('纪念日');
  const [repeatRule, setRepeatRule] = useState('none');
  const [selTags, setSelTags] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) { setTitle(''); setDate(''); setType('纪念日'); setRepeatRule('none'); setSelTags([]); setErrors({}); }
  }, [open]);

  const toggleTag = (tg) => setSelTags((p) => (p.includes(tg) ? p.filter((x) => x !== tg) : [...p, tg]));

  // 提交：日期用本地时区解析，避免 'yyyy-MM-dd' 被 Date 按 UTC 解析导致日期偏移
  const submit = () => {
    const errs = {};
    if (!title.trim()) errs.title = e('evtNameNeeded');
    if (!date) errs.date = e('evtDateNeeded');
    // 按月重复的日期合法性校验：拦截"当月不存在"的日期（如 9.31）
    if (date && repeatRule === 'monthly') {
      const d = parseLocalDate(date);
      const now = new Date();
      if (d.getDate() > daysInMonth(now.getFullYear(), now.getMonth() + 1)) {
        errs.date = isEn ? `Day ${d.getDate()} doesn't exist this month — pick again` : `当月不存在 ${d.getDate()} 日，请重新选择`;
      }
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;

    createEvent.mutate(
      {
        title: title.trim(),
        event_date: format(parseLocalDate(date), 'yyyy-MM-dd'),
        event_type: type,
        repeat_rule: repeatRule,
        tags: selTags,
        is_pinned: false,
        remind: true,
      },
      { onSuccess: () => onOpenChange(false), onError: () => toast.error(e('evtAddFail')) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-hand text-xl text-amber-800">{e('eventDialogTitle')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label htmlFor="evt-title" className="text-xs text-amber-600">{e('evtNameLabel')}</label>
            <Input id="evt-title" value={title} onChange={(ev) => setTitle(ev.target.value)}
              aria-invalid={!!errors.title} aria-describedby={errors.title ? 'evt-title-err' : undefined}
              className="border-amber-200" placeholder={e('evtNamePh')} />
            {errors.title && <p id="evt-title-err" role="alert" className="mt-1 text-xs text-rose-500">{errors.title}</p>}
          </div>
          <div>
            <label htmlFor="evt-date" className="text-xs text-amber-600">{e('evtDateLabel')}</label>
            <Input id="evt-date" type="date" value={date} onChange={(ev) => setDate(ev.target.value)}
              aria-invalid={!!errors.date} aria-describedby={errors.date ? 'evt-date-err' : undefined}
              className="border-amber-200" />
            {errors.date && <p id="evt-date-err" role="alert" className="mt-1 text-xs text-rose-500">{errors.date}</p>}
          </div>
          <div>
            <p className="text-xs text-amber-600">{e('evtTypeLabel')}</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {EVENT_TYPES.map((tg) => (
                <button key={tg.name} onClick={() => setType(tg.name)} aria-pressed={type === tg.name}
                  className={`rounded-full px-3 py-1.5 text-xs transition ${
                    type === tg.name ? `${tg.chip} ring-2 ring-amber-400` : 'border border-amber-200 bg-white text-amber-600'
                  }`}>
                  {tg.emoji} {tg.name}
                </button>
              ))}
            </div>
          </div>
          <RepeatRulePicker value={repeatRule} onChange={setRepeatRule} eventType={type} />
          <div>
            <p className="text-xs text-amber-600">{e('evtTagsLabel')}</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {allTags.map((tg) => (
                <TagChip key={tg.id} tag={tg} active={selTags.includes(tg.name)}
                  onClick={() => toggleTag(tg.name)} activeCls={categoryOf(tg.category).chip} />
              ))}
            </div>
          </div>
          <Button onClick={submit} disabled={createEvent.isPending} className="h-11 w-full bg-rose-400 text-white hover:bg-rose-500">
            {createEvent.isPending ? e('evtSaving') : e('evtSave')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddEventDialog;
