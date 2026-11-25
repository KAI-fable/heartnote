// 密码强度实时检测：长度 + 字符种类四档评分，高对比度色条 + 文字提示
const PasswordStrength = ({ password }) => {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  score = Math.min(score, 4);

  const LEVELS = [
    { label: '弱', cls: 'bg-rose-500', text: 'text-rose-600', w: 'w-1/4' },
    { label: '一般', cls: 'bg-orange-500', text: 'text-orange-600', w: 'w-2/4' },
    { label: '良好', cls: 'bg-amber-500', text: 'text-amber-600', w: 'w-3/4' },
    { label: '强', cls: 'bg-emerald-500', text: 'text-emerald-600', w: 'w-full' },
  ];
  const lv = LEVELS[score - 1] || LEVELS[0];

  return (
    <div className="mt-1.5" aria-live="polite">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
        <div className={`h-full rounded-full transition-all ${lv.cls} ${lv.w}`} />
      </div>
      <p className={`mt-1 text-[11px] ${lv.text}`}>密码强度：{lv.label}</p>
    </div>
  );
};

export default PasswordStrength;
