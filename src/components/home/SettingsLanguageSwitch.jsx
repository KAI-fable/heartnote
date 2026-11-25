import { Languages } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/hooks/useLanguage';
import { logOp } from '@/hooks/useOperationLog';

// 设置页语言切换开关：中英文实时切换，界面文本与日期格式同步更新
const SettingsLanguageSwitch = () => {
  const { isEn, setLanguage, t } = useLanguage();
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-white/85 p-4">
      <Languages size={18} className="shrink-0 text-amber-500" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-stone-700">{t('langTitle')}</p>
        <p className="text-xs text-stone-400">{t('langDesc')}</p>
      </div>
      <span className={`text-xs ${!isEn ? 'font-bold text-amber-700' : 'text-stone-400'}`}>中文</span>
      <Switch
        checked={isEn}
        onCheckedChange={(v) => {
          setLanguage(v ? 'en' : 'zh');
          logOp('lang_switch', v ? '切换为 English' : '切换为 中文');
          toast.success(v ? 'Switched to English ✨' : '已切换为中文 ✨');
        }}
        aria-label="切换英文界面"
      />
      <span className={`text-xs ${isEn ? 'font-bold text-amber-700' : 'text-stone-400'}`}>English</span>
    </div>
  );
};

export default SettingsLanguageSwitch;
