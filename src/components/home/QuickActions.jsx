import { PenLine, CalendarDays, BarChart3 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const ACTIONS = [
  { type: 'write', key: 'quickWrite', icon: PenLine, cls: 'bg-amber-400 text-white' },
  { type: 'event', key: 'quickEvent', icon: CalendarDays, cls: 'bg-rose-100 text-rose-600' },
  { type: 'stats', key: 'quickStats', icon: BarChart3, cls: 'bg-sky-100 text-sky-600' },
];

// 快捷操作区：三版块等宽排布，字号与图标同步放大提升可读性
const QuickActions = ({ onAction, hotZone }) => {
  const { t } = useLanguage();
  return (
    <section aria-label={t('quickStats')} className="grid grid-cols-3 gap-3">
      {ACTIONS.map(({ type, key, icon: Icon, cls }) => (
        <button
          key={type}
          data-track={`quick_${type}`}
          onClick={() => onAction(type)}
          aria-label={t(key)}
          className={`flex flex-col items-center gap-1.5 rounded-2xl py-4 font-hand text-base tracking-wide transition hover:scale-[1.03] active:scale-95 ${cls} ${
            hotZone === `quick_${type}` ? 'shadow-md ring-2 ring-amber-500 ring-offset-2' : ''
          }`}
        >
          <Icon size={24} aria-hidden="true" />
          {t(key)}
        </button>
      ))}
    </section>
  );
};

export default QuickActions;
