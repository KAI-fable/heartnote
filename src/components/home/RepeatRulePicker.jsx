import { useEffect } from 'react';
import { toast } from 'sonner';
import { Repeat } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { ed } from '@/lib/i18nEditor';

// 重复规则选择器：按类型过滤选项，互斥单选（单字段存储），从源头避免年/月重复冲突
// 【i18n】规则名称与提示随语言切换
const RepeatRulePicker = ({ value, onChange, eventType }) => {
  const { lang } = useLanguage();
  const e = (k) => ed(lang, k);

  // 全量规则表（key 稳定，展示文案随语言翻译）
  const ALL = [
    { value: 'none', label: e('repeatNone'), types: ['纪念日', '约会', '日常'], hint: e('repeatNoneHint') },
    { value: 'yearly', label: e('repeatYearly'), types: ['纪念日'], hint: e('repeatYearlyHint') },
    { value: 'monthly', label: e('repeatMonthly'), types: ['约会'], hint: e('repeatMonthlyHint') },
  ];
  const options = ALL.filter((o) => o.types.includes(eventType));

  // 类型切换导致当前规则不再适用时，自动回落为"单次"
  useEffect(() => {
    if (!options.some((o) => o.value === value)) onChange('none');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventType]);

  return (
    <div>
      <p className="flex items-center gap-1 text-xs text-amber-600">
        <Repeat size={12} aria-hidden="true" /> {e('repeatLabel')}
      </p>
      <div className="mt-1 flex gap-2" role="radiogroup" aria-label={e('repeatLabel')}>
        {options.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={value === o.value}
            onClick={() => { onChange(o.value); if (o.value !== 'none') toast.info(o.hint); }}
            className={`flex-1 rounded-xl py-2 text-xs transition ${
              value === o.value ? 'bg-amber-400 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RepeatRulePicker;
