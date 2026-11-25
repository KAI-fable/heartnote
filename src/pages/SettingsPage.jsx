import { Moon, Bell, DatabaseBackup } from 'lucide-react';
import { toast } from 'sonner';
import PageShell from '@/components/layout/PageShell';
import { useSettings } from '@/hooks/useSettings';
import { useLanguage } from '@/hooks/useLanguage';
import { clearLocal } from '@/lib/storage';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import SettingsLanguageSwitch from '@/components/home/SettingsLanguageSwitch';
import DefaultTagLangSetting from '@/components/home/DefaultTagLangSetting';

const REMIND_OPTIONS = [1, 3, 7];

// 设置页：语言切换 / 默认标签语言 / 农历展示 / 提前提醒天数 / 本地备份管理
// （操作日志与输入方向诊断模块已按需求彻底移除，用户视角无任何展示入口）
const SettingsPage = () => {
  const [settings, update] = useSettings();
  const { isEn, t } = useLanguage();

  return (
    <PageShell title={t('settingsTitle')}>
      <div className="space-y-4">
        {/* 英文语言切换开关：实时生效 */}
        <SettingsLanguageSwitch />

        {/* 默认标签语言偏好：默认标签随此语言显示，自定义标签不受影响 */}
        <DefaultTagLangSetting />

        <div className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-white/85 p-4">
          <Moon size={18} className="shrink-0 text-amber-500" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-stone-700">{t('showLunar')}</p>
            <p className="text-xs text-stone-400">{t('showLunarDesc')}</p>
          </div>
          <Switch
            checked={settings.showLunar}
            onCheckedChange={(v) => update({ showLunar: v })}
            aria-label={isEn ? 'Toggle lunar display' : '切换农历展示'}
          />
        </div>

        <div className="rounded-2xl border border-amber-100 bg-white/85 p-4">
          <div className="flex items-center gap-3">
            <Bell size={18} className="text-amber-500" aria-hidden="true" />
            <p className="text-sm text-stone-700">{t('remindTitle')}</p>
          </div>
          <div className="mt-3 flex gap-2" role="radiogroup" aria-label={t('remindTitle')}>
            {REMIND_OPTIONS.map((d) => (
              <button
                key={d}
                role="radio"
                aria-checked={settings.reminderDays === d}
                onClick={() => update({ reminderDays: d })}
                className={`flex-1 rounded-xl py-2 text-sm transition ${
                  settings.reminderDays === d
                    ? 'bg-amber-400 text-white'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                {isEn ? `${d}d before` : `提前 ${d} 天`}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4">
          <div className="flex items-center gap-3">
            <DatabaseBackup size={18} className="text-rose-400" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-stone-700">{t('backupTitle')}</p>
              <p className="text-xs text-stone-400">{t('backupDesc')}</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              if (window.confirm(isEn ? 'Clear all local backup data?' : '确定清空所有本地备份数据吗？')) {
                clearLocal();
                toast.success(isEn ? 'Local backup cleared' : '本地备份已清空');
              }
            }}
            className="mt-3 w-full border-rose-200 text-rose-600 hover:bg-rose-100"
          >
            {t('clearBackup')}
          </Button>
        </div>
      </div>
    </PageShell>
  );
};

export default SettingsPage;
