import { useState } from 'react';
import { toast } from 'sonner';
import { MailCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { authErrorText } from '@/lib/authErrors';

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// 验证码登录：第一步发送邮箱验证码，第二步输入 6 位验证码完成免密登录
const OtpForm = ({ onDone, goLogin }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (!emailOk(email)) { toast.error('邮箱格式不正确'); return; }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setBusy(false);
    if (error) { toast.error(authErrorText(error)); return; }
    toast.success('验证码已发送至邮箱 ✉️ 请查收');
    setStep(2);
  };

  const verify = async () => {
    if (!/^\d{6}$/.test(code)) { toast.error('请输入 6 位数字验证码'); return; }
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'magiclink' });
    setBusy(false);
    if (error) { toast.error(authErrorText(error)); return; }
    toast.success('登录成功，欢迎回来 ✨');
    onDone?.();
  };

  return (
    <div className="space-y-3 rounded-2xl border border-amber-100 bg-white/85 p-4">
      <h2 className="font-hand text-xl text-amber-800">📩 验证码登录</h2>
      {step === 1 ? (
        <>
          <div>
            <label htmlFor="ot-email" className="text-xs text-amber-600">邮箱 *</label>
            <Input id="ot-email" type="email" value={email} onChange={(ev) => setEmail(ev.target.value)}
              className="border-amber-200" placeholder="you@example.com" />
          </div>
          <Button onClick={send} disabled={busy} className="h-11 w-full bg-sky-400 text-white hover:bg-sky-500">
            <MailCheck size={15} className="mr-1" aria-hidden="true" /> {busy ? '发送中...' : '发送验证码'}
          </Button>
        </>
      ) : (
        <>
          <p className="text-xs text-stone-500">验证码已发送至 <span className="font-bold text-amber-700">{email}</span></p>
          <Input value={code} onChange={(ev) => setCode(ev.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric" aria-label="6 位验证码" className="border-amber-200 text-center font-mono text-lg tracking-widest" placeholder="______" />
          <Button onClick={verify} disabled={busy} className="h-11 w-full bg-sky-400 text-white hover:bg-sky-500">
            {busy ? '验证中...' : '验证并登录'}
          </Button>
          <button onClick={() => setStep(1)} className="w-full text-center text-xs text-amber-600 hover:underline">← 重新发送</button>
        </>
      )}
      <button onClick={goLogin} className="w-full text-center text-xs text-amber-600 hover:underline">返回密码登录</button>
    </div>
  );
};

export default OtpForm;
