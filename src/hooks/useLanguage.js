import { useCallback, useEffect, useState } from 'react';
import { t as translate } from '@/lib/i18n';

const KEY = 'journal_lang';
const read = () => (localStorage.getItem(KEY) === 'en' ? 'en' : 'zh');

// 全局语言状态：localStorage 持久化 + 自定义事件跨页面同步
export function useLanguage() {
  const [lang, setLang] = useState(read);

  useEffect(() => {
    const sync = () => setLang(read());
    window.addEventListener('lang-changed', sync);
    return () => window.removeEventListener('lang-changed', sync);
  }, []);

  const setLanguage = useCallback((l) => {
    localStorage.setItem(KEY, l);
    window.dispatchEvent(new Event('lang-changed'));
  }, []);

  const t = useCallback((k) => translate(lang, k), [lang]);
  return { lang, isEn: lang === 'en', setLanguage, t };
}
