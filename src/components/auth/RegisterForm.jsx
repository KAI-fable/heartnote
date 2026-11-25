import { useState } from 'react';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { authErrorText } from '@/lib/authErrors';
import PasswordStrength from './PasswordStrength';

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// 注册表单：实时校验（邮箱格式 / 密码强度 / 两次一致），注册后引导邮箱验证
const RegisterForm = ({ goLogin }) => {
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);

  const validate = () => {
    const e = {};
    if (!emailOk(email)) e.email = '邮箱格式不正确';
    if (pwd.length < 8) e.pwd = '密码至少 8 位';
    else if (!/[A-Za-z]/.test(pwd) || !/\d/.test(pwd)) e.pwd = '密码需同时包含字母和数字';
    if (pwd2 !== pwd) e.pwd2 = '两次输入的密码不一致';
    setErrs(e);
    return !Object.keys(e).length;
  };

  const submit = async () => {
    if (!validate()) return;
    setBusy(true);
    const { error } = await supabase.auth.signUp({ email, password: pwd });
    setBusy(false);
    if (error) { toast.error(authErrorText(error)); return; }
    toast.success('注册成功！请前往邮箱查收验证邮件完成激活 ✉️');
    goLogin?.();
  };

  return (
    <div className="space-y-3 rounded-2xl border border-amber-100 bg-white/85 p-4">
      <h2 className="font-hand text-xl text-amber-800">📝 注册新账号</h2>
      <div>
        <label htmlFor="rg-email" className="text-xs text-amber-600">邮箱 *</label>
        <Input id="rg-email" type="email" value={email} onChange={(ev) => setEmail(ev.target.value)}
          aria-invalid={!!errs.email} className="border-amber-200" placeholder="you@example.com" />
        {errs.email && <p role="alert" className="mt-1 text-xs font-bold text-rose-600">{errs.email}</p>}
      </div>
      <div>
        <label htmlFor="rg-pwd" className="text-xs text-amber-600">密码 *（至少 8 位，含字母和数字）</label>
        <Input id="rg-pwd" type="password" value={pwd} onChange={(ev) => setPwd(ev.target.value)}
          aria-invalid={!!errs.pwd} className="border-amber-200" placeholder="设置登录密码" />
        {errs.pwd && <p role="alert" className="mt-1 text-xs font-bold text-rose-600">{errs.pwd}</p>}
        <PasswordStrength password={pwd} />
      </div>
      <div>
        <label htmlFor="rg-pwd2" className="text-xs text-amber-600">确认密码 *</label>
        <Input id="rg-pwd2" type="password" value={pwd2} onChange={(ev) => setPwd2(ev.target.value)}
          aria-invalid={!!errs.pwd2} className="border-amber-200" placeholder="再输入一次密码" />
        {errs.pwd2 && <p role="alert" className="mt-1 text-xs font-bold text-rose-600">{errs.pwd2}</p>}
      </div>
      <Button onClick={submit} disabled={busy} className="h-11 w-full bg-rose-400 text-white hover:bg-rose-500">
        <UserPlus size={15} className="mr-1" aria-hidden="true" /> {busy ? '注册中...' : '注册并接收验证邮件'}
      </Button>
      <p className="text-[11px] text-stone-400">💡 每个账号的数据相互独立隔离，注册后即可拥有专属的手账与重要日子空间</p>
      <button onClick={goLogin} className="w-full text-center text-xs text-amber-600 hover:underline">已有账号？返回登录</button>
    </div>
  );
};

export default RegisterForm;
