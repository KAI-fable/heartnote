import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// 全局认证状态：启动时恢复会话，监听登录/登出/令牌刷新事件实时同步
// 会话令牌由 Supabase 服务端签发并自动管理（自动续期、安全存储），前端无需手动处理
export function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return {
    session,
    user: session?.user || null,
    loading,
    isLoggedIn: !!session,
    userEmail: session?.user?.email || '',
  };
}
