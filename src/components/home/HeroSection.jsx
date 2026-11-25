import { BookHeart, CalendarRange, LogIn, LogOut } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

// 首屏极简信息卡片：登录后核心入口为智能日历；文案随语言实时切换
const HeroSection = ({ role, onLogin, onLogout, onCalendar }) => {
  const { t } = useLanguage();
  return (
    <section
      aria-labelledby="hero-title"
      className="rounded-3xl border border-amber-100 bg-white/85 px-6 py-8 text-center shadow-sm"
    >
      <p className="text-3xl" aria-hidden="true">📖</p>
      <h2 id="hero-title" className="mt-2 flex items-center justify-center gap-2 font-hand text-3xl text-amber-800">
        <BookHeart className="text-rose-400" size={26} aria-hidden="true" />
        {t('welcomeTitle')}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-stone-500">{t('welcomeDesc')}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        {role === 'user' ? (
          <>
            <button
              data-track="hero_calendar"
              onClick={onCalendar}
              className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2.5 text-white transition hover:bg-amber-500"
            >
              <CalendarRange size={16} aria-hidden="true" /> {t('openCalendar')}
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 rounded-xl border border-amber-200 px-4 py-2.5 text-amber-700 hover:bg-amber-50"
            >
              <LogOut size={16} aria-hidden="true" /> {t('logout')}
            </button>
          </>
        ) : (
          <button
            onClick={onLogin}
            className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2.5 text-white transition hover:bg-amber-500"
          >
            <LogIn size={16} aria-hidden="true" /> {t('login')}
          </button>
        )}
      </div>
      {role === 'guest' && (
        <p className="mt-3 text-xs text-stone-400">{t('guestHint')}</p>
      )}
    </section>
  );
};

export default HeroSection;
