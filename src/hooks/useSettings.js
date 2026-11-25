import { useEffect, useState } from 'react';

const KEY = 'journal_settings';
// defaultTagLang：默认标签显示语言偏好（auto=跟随界面语言 / zh / en），不影响自定义标签
const DEFAULTS = { showLunar: true, reminderDays: 3, defaultTagLang: 'auto' };

const read = () => {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
  catch { return { ...DEFAULTS }; }
};

// 全局设置（跨页面通过自定义事件同步）
export function useSettings() {
  const [settings, setSettings] = useState(read);

  useEffect(() => {
    const sync = () => setSettings(read());
    window.addEventListener('settings-changed', sync);
    return () => window.removeEventListener('settings-changed', sync);
  }, []);

  const update = (patch) => {
    const next = { ...read(), ...patch };
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event('settings-changed'));
  };

  return [settings, update];
}
