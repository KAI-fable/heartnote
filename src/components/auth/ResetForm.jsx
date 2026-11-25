import { useState } from 'react';
import { toast } from 'sonner';
import { KeyRound } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { authErrorText } from '@/lib/authErrors';

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// 找回密码：邮箱验证码确认身份 → 设置新密码（不依赖邮件链接，验证码直达）
const ResetForm = ({ onDone }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [pwd, setPwd] = useState('');
  const [busy, setBusy] = useState(false);

  const sendCode = async () => {
    if (!emailOk(email)) { toast.error('邮箱格式不正确'); return; }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setBusy(false);
    if (error) { toast.error(authErrorText(error)); return; }
    toast.success('重置验证码已发送至邮箱 ✉️');
    setStep(2);
  };

  const resetPwd = async () => {
    if (!/^\d{6}$/.test(code)) { toast.error('请输入 6 位数字验证码'); return; }
    if (pwd.length < 8 || !/[A-Za-z]/.test(pwd) || !/\d/.test(pwd)) {
      toast.error('新密码至少 8 位且同时包含字母和数字'); return;
    }
    setBusy(true);
    // 先用验证码确认身份，再更新密码
    const { error: vErr } = await supabase.auth.verifyOtp({ email, token: code, type: 'recovery' });
    if (vErr) { setBusy(false); toast.error(authErrorText(vErr)); return; }
    const { error: uErr } = await supabase.auth.updateUser({ password: pwd });
    setBusy(false);
    if (uErr) { toast.error(authErrorText(uErr)); return; }
    toast.success('密码已重置成功，请使用新密码登录 ✨');
    onDone?.();
  };

  return (
    <div className="space-y-3 rounded-2xl border border-amber-100 bg-white/85 p-4">
      <h2 className="font-hand text-xl text-amber-800">🔑 找回密码</h2>
      {step === 1 ? (
        <>
          <div>
            <label htmlFor="rs-email" className="text-xs text-amber-600">注册邮箱 *</label>
            <Input id="rs-email" type="email" value={email} onChange={(ev) => setEmail(ev.target.value)}
              className="border-amber-200" placeholder="you@example.com" />
          </div>
          <Button onClick={sendCode} disabled={busy} className="h-11 w-full bg-amber-400 text-white hover:bg-amber-500">
            {busy ? '发送中...' : '发送重置验证码'}
          </Button>
        </>
      ) : (
        <>
          <Input value={code} onChange={(ev) => setCode(ev.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric" aria-label="6 位验证码" className="border-amber-200 text-center font-mono tracking-widest" placeholder="请输入 6 位验证码" />
          <Input type="password" value={pwd} onChange={(ev) => setPwd(ev.target.value)}
            aria-label="新密码" className="border-amber-200" placeholder="设置新密码（至少 8 位，含字母和数字）" />
          <Button onClick={resetPwd} disabled={busy} className="h-11 w-full bg-amber-400 text-white hover:bg-amber-500">
            <KeyRound size={15} className="mr-1" aria-hidden="true" /> {busy ? '提交中...' : '确认重置密码'}
          </Button>
        </>
      )}
    </div>
  );
};

export default ResetForm;
