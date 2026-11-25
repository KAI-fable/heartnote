import { Languages } from 'lucide-react';
import { toast } from 'sonner';
import { useSettings } from '@/hooks/useSettings';
import { useLanguage } from '@/hooks/useLanguage';
import { ed } from '@/lib/i18nEditor';

const OPTIONS = [
  { value: 'auto', key: 'tagLangAuto' },
  { value: 'zh', key: 'tagLangZh' },
  { value: 'en', key: 'tagLangEn' },
];

// 默认标签语言偏好设置：调整默认标签显示语言（跟随界面/中文/English），
// 用户手动创建的自定义标签不受影响；切换即时生效并全局同步
const DefaultTagLangSetting = () => {
  const [settings, update] = useSettings();
  const { lang } = useLanguage();
  const e = (k) => ed(lang, k);

  return (
    <div className="rounded-2xl border border-amber-100 bg-white/85 p-4">
      <div className="flex items-center gap-3">
        <Languages size={18} className="shrink-0 text-amber-500" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-stone-700">{e('tagLangTitle')}</p>
          <p className="text-xs text-stone-400">{e('tagLangDesc')}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2" role="radiogroup" aria-label={e('tagLangTitle')}>
        {OPTIONS.map((o) => (
          <button key={o.value} role="radio" aria-checked={settings.defaultTagLang === o.value}
            onClick={() => { update({ defaultTagLang: o.value }); toast.success(e('tagLangSaved')); }}
            className={`flex-1 rounded-xl py-2 text-sm transition ${
              settings.defaultTagLang === o.value ? 'bg-amber-400 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}>
            {e(o.key)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DefaultTagLangSetting;
