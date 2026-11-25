import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import OtpForm from '@/components/auth/OtpForm';
import ResetForm from '@/components/auth/ResetForm';
import { useAuth } from '@/hooks/useAuth';

const TITLE = { login: '登录', register: '注册新账号', otp: '验证码登录', reset: '找回密码' };

// 账号中心：四种认证模式互切，登录成功自动跳回首页；
// 已登录状态直接展示当前账号信息 + 退出入口
const AuthPage = () => {
  const [mode, setMode] = useState('login');
  const navigate = useNavigate();
  const { isLoggedIn, userEmail } = useAuth();
  const goHome = () => navigate('/');

  return (
    <PageShell title="账号中心 🔐">
      <div className="mx-auto max-w-md space-y-4">
        {isLoggedIn ? (
          <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-center">
            <ShieldCheck className="mx-auto text-emerald-500" size={32} aria-hidden="true" />
            <p className="font-hand text-lg text-emerald-700">已登录</p>
            <p className="truncate text-sm text-stone-600">{userEmail}</p>
            <p className="text-[11px] text-stone-400">你的手账与重要日子数据均已与本账号绑定，独立隔离存储</p>
            <button onClick={goHome} className="w-full rounded-xl bg-amber-400 py-2.5 text-sm text-white hover:bg-amber-500">
              返回首页 →
            </button>
          </div>
        ) : (
          <>
            {/* 步骤指引：清晰表单分组 + 当前模式高亮 */}
            <div className="flex gap-1.5" aria-label="认证步骤">
              {['login', 'register', 'otp', 'reset'].map((m) => (
                <button key={m} onClick={() => setMode(m)} aria-pressed={mode === m}
                  className={`flex-1 rounded-xl py-2 text-xs transition ${
                    mode === m ? 'bg-amber-400 font-bold text-white' : 'bg-white/85 text-stone-500 hover:bg-amber-50'
                  }`}>
                  {TITLE[m]}
                </button>
              ))}
            </div>
            {mode === 'login' && (
              <LoginForm onDone={goHome} goRegister={() => setMode('register')} goOtp={() => setMode('otp')} goReset={() => setMode('reset')} />
            )}
            {mode === 'register' && <RegisterForm goLogin={() => setMode('login')} />}
            {mode === 'otp' && <OtpForm onDone={goHome} goLogin={() => setMode('login')} />}
            {mode === 'reset' && <ResetForm onDone={() => setMode('login')} />}
          </>
        )}
        <p className="text-center text-[11px] text-stone-300">
          🔒 传输全程 TLS 加密 · 密码安全哈希存储 · 异常登录自动锁定保护
        </p>
      </div>
    </PageShell>
  );
};

export default AuthPage;
