import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

const VISIT_KEY = 'journal_visited'; // localStorage：永久记录是否来过
const ROLE_KEY = 'journal_role';     // sessionStorage：会话级登录态

// 访客/登录视图区分 + 首次访问检测
export function useVisitState() {
  const [role, setRole] = useState(() => sessionStorage.getItem(ROLE_KEY) || 'guest');
  const [isFirstVisit, setFirstVisit] = useState(() => !localStorage.getItem(VISIT_KEY));

  useEffect(() => {
    if (isFirstVisit) localStorage.setItem(VISIT_KEY, String(Date.now()));
  }, [isFirstVisit]);

  const login = useCallback(() => {
    sessionStorage.setItem(ROLE_KEY, 'user');
    setRole('user');
    toast.success('欢迎回来～已解锁完整功能 ✨');
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(ROLE_KEY);
    setRole('guest');
    toast('已切换为访客视图');
  }, []);

  const dismissOnboarding = useCallback(() => setFirstVisit(false), []);

  return { role, isFirstVisit, login, logout, dismissOnboarding };
}
