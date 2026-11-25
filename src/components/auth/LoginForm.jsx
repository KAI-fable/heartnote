import { useState } from 'react';
import { toast } from 'sonner';
import { LogIn } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { authErrorText } from '@/lib/authErrors';

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// 登录表单：实时邮箱校验 + 友好错误分级 + 提交期间禁用按钮防重复
const LoginForm = ({ onDone, goRegister, goOtp, goReset }) => {
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);

  const validate = () => {
    const e = {};
    if (!emailOk(email)) e.email = '邮箱格式不正确';
    if (!pwd) e.pwd = '请输入密码';
    setErrs(e);
    return !Object.keys(e).length;
  };

  const submit = async () => {
    if (!validate()) return;
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pwd });
    setBusy(false);
    if (error) { toast.error(authErrorText(error)); return; }
    toast.success('登录成功，欢迎回来 ✨');
    onDone?.();
  };

  return (
    <div className="space-y-3 rounded-2xl border border-amber-100 bg-white/85 p-4">
      <h2 className="font-hand text-xl text-amber-800">🔐 账号登录</h2>
      <div>
        <label htmlFor="li-email" className="text-xs text-amber-600">邮箱 *</label>
        <Input id="li-email" type="email" value={email} onChange={(ev) => setEmail(ev.target.value)}
          aria-invalid={!!errs.email} className="border-amber-200" placeholder="you@example.com" />
        {errs.email && <p role="alert" className="mt-1 text-xs font-bold text-rose-600">{errs.email}</p>}
      </div>
      <div>
        <label htmlFor="li-pwd" className="text-xs text-amber-600">密码 *</label>
        <Input id="li-pwd" type="password" value={pwd} onChange={(ev) => setPwd(ev.target.value)}
          aria-invalid={!!errs.pwd} className="border-amber-200" placeholder="请输入密码" />
        {errs.pwd && <p role="alert" className="mt-1 text-xs font-bold text-rose-600">{errs.pwd}</p>}
      </div>
      <Button onClick={submit} disabled={busy} className="h-11 w-full bg-amber-400 text-white hover:bg-amber-500">
        <LogIn size={15} className="mr-1" aria-hidden="true" /> {busy ? '登录中...' : '登录'}
      </Button>
      <div className="flex justify-between text-xs">
        <button onClick={goOtp} className="text-sky-600 hover:underline">📩 验证码登录</button>
        <button onClick={goReset} className="text-amber-600 hover:underline">忘记密码？</button>
        <button onClick={goRegister} className="text-rose-500 hover:underline">注册新账号 →</button>
      </div>
    </div>
  );
};

export default LoginForm;
