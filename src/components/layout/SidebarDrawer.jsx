import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { NotebookPen, History, CalendarDays, Settings, BookHeart, MessageSquareHeart, CalendarRange, CalendarHeart, ChevronDown, ChevronUp, Plus, Pencil } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

// 抽屉式侧边栏菜单：主项 + 可折叠智能日历区 + 低频反馈入口
// 英文适配：间距收紧 + 文案截断保护，避免长英文菜单项换行破坏对齐
const SidebarDrawer = ({ onNavigate, onFeedback }) => {
  const { t, isEn } = useLanguage();
  const navigate = useNavigate();
  const [calOpen, setCalOpen] = useState(false);

  // 快捷添加/编辑：跳转智能日历并通过自定义事件触发对应动作
  const goCalendar = (evName) => {
    onNavigate();
    navigate('/calendar');
    window.dispatchEvent(new Event(evName));
  };

  // 链接样式：英文模式字号略降、内边距收紧，菜单项统一 truncate 防溢出
  const linkCls = ({ isActive }) =>
    `flex min-w-0 items-center gap-2.5 ${isEn ? 'px-3 py-2.5 text-[15px]' : 'px-4 py-3 text-base'} rounded-xl transition ${
      isActive ? 'bg-amber-200/70 text-amber-900 shadow-inner' : 'text-stone-600 hover:bg-amber-100'
    }`;

  // 菜单文案统一样式：截断保护，右侧表情符号不参与截断
  const Label = ({ children }) => (
    <span className="min-w-0 flex-1 truncate">{children}</span>
  );

  return (
    <div className="flex h-full flex-col bg-[#fffaef] p-4">
      <div className="mb-5 flex items-center gap-2">
        <BookHeart className="shrink-0 text-rose-400" size={26} aria-hidden="true" />
        <span className="truncate font-hand text-2xl text-amber-800">{t('appName')}</span>
      </div>
      <nav className="space-y-1.5">
        <NavLink to="/" end onClick={onNavigate} className={linkCls}>
          <NotebookPen size={18} className="shrink-0" aria-hidden="true" />
          <Label>{t('navToday')}</Label>
          <span className="ml-auto shrink-0">🌷</span>
        </NavLink>
        <NavLink to="/history" onClick={onNavigate} className={linkCls}>
          <History size={18} className="shrink-0" aria-hidden="true" />
          <Label>{t('navHistory')}</Label>
          <span className="ml-auto shrink-0">🕰️</span>
        </NavLink>
        <NavLink to="/countdown" onClick={onNavigate} className={linkCls}>
          <CalendarDays size={18} className="shrink-0" aria-hidden="true" />
          <Label>{t('navCountdown')}</Label>
          <span className="ml-auto shrink-0">🗓️</span>
        </NavLink>
        <NavLink to="/monthly-events" onClick={onNavigate} className={linkCls}>
          <CalendarHeart size={18} className="shrink-0" aria-hidden="true" />
          <Label>{t('navMonthly')}</Label>
          <span className="ml-auto shrink-0">💞</span>
        </NavLink>

        {/* 智能日历：可折叠展开，含快速添加/编辑事件入口 */}
        <button onClick={() => setCalOpen(!calOpen)} aria-expanded={calOpen}
          className={`flex w-full min-w-0 items-center gap-2.5 ${isEn ? 'px-3 py-2.5 text-[15px]' : 'px-4 py-3 text-base'} rounded-xl text-stone-600 transition hover:bg-amber-100`}>
          <CalendarRange size={18} className="shrink-0" aria-hidden="true" />
          <Label>{t('calTitle')}</Label>
          {calOpen
            ? <ChevronUp size={15} className="ml-auto shrink-0" aria-hidden="true" />
            : <ChevronDown size={15} className="ml-auto shrink-0" aria-hidden="true" />}
        </button>
        {calOpen && (
          <div className={`ml-3 space-y-1 border-l border-amber-200 pl-2 ${isEn ? 'text-sm' : ''}`}>
            <NavLink to="/calendar" onClick={onNavigate} className={linkCls}>
              <CalendarRange size={16} className="shrink-0" aria-hidden="true" />
              <Label>{t('calOverview')}</Label>
            </NavLink>
            <button onClick={() => goCalendar('calendar-quick-add')}
              className={`flex w-full min-w-0 items-center gap-2.5 rounded-xl px-3 py-2 ${isEn ? 'text-[13px]' : 'text-sm'} text-stone-600 transition hover:bg-amber-100`}>
              <Plus size={15} className="shrink-0" aria-hidden="true" />
              <Label>{t('quickAdd')}</Label>
            </button>
            <button onClick={() => goCalendar('calendar-quick-edit')}
              className={`flex w-full min-w-0 items-center gap-2.5 rounded-xl px-3 py-2 ${isEn ? 'text-[13px]' : 'text-sm'} text-stone-600 transition hover:bg-amber-100`}>
              <Pencil size={15} className="shrink-0" aria-hidden="true" />
              <Label>{t('quickEdit')}</Label>
            </button>
          </div>
        )}

        <NavLink to="/settings" onClick={onNavigate} className={linkCls}>
          <Settings size={18} className="shrink-0" aria-hidden="true" />
          <Label>{t('navSettings')}</Label>
          <span className="ml-auto shrink-0">🧷</span>
        </NavLink>
        <button
          onClick={() => { onNavigate(); onFeedback?.(); }}
          className={linkCls({ isActive: false })}
        >
          <MessageSquareHeart size={18} className="shrink-0" aria-hidden="true" />
          <Label>{t('navFeedback')}</Label>
          <span className="ml-auto shrink-0">💌</span>
        </button>
      </nav>
      <div className="mt-auto rounded-lg bg-yellow-100 p-3 text-sm text-amber-700 shadow font-hand">
        <span className={isEn ? 'block break-words text-[13px] leading-relaxed' : ''}>{t('slogan')}</span>
      </div>
    </div>
  );
};

export default SidebarDrawer;
