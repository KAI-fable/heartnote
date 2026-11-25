import { HomeIcon, History, CalendarDays, Settings, CalendarRange, CalendarHeart, KeyRound } from 'lucide-react';
import Index from './pages/Index.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import CountdownPage from './pages/CountdownPage.jsx';
import CalendarPage from './pages/CalendarPage.jsx';
import MonthlyEventsPage from './pages/MonthlyEventsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import AuthPage from './pages/AuthPage.jsx';

// 集中定义路由导航项：与侧边栏菜单一一对应
export const navItems = [
  { title: '今日记录', to: '/', icon: <HomeIcon className="h-4 w-4" />, page: <Index /> },
  { title: '历史回顾', to: '/history', icon: <History className="h-4 w-4" />, page: <HistoryPage /> },
  { title: '重要日记录', to: '/countdown', icon: <CalendarDays className="h-4 w-4" />, page: <CountdownPage /> },
  { title: '月度重要日', to: '/monthly-events', icon: <CalendarHeart className="h-4 w-4" />, page: <MonthlyEventsPage /> },
  { title: '智能日历', to: '/calendar', icon: <CalendarRange className="h-4 w-4" />, page: <CalendarPage /> },
  { title: '账号中心', to: '/auth', icon: <KeyRound className="h-4 w-4" />, page: <AuthPage /> },
  { title: '设置', to: '/settings', icon: <Settings className="h-4 w-4" />, page: <SettingsPage /> },
];
