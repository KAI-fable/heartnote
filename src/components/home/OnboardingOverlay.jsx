import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

const STEPS = [
  { emoji: '👋', title: '欢迎使用手账本', desc: '这里是你的个人记录空间，先花 30 秒了解一下吧～' },
  { emoji: '✍️', title: '随手记录', desc: '点击「写一篇手账」或快捷操作，支持心情、贴纸标签与插图。' },
  { emoji: '📊', title: '足迹与统计', desc: '系统会记住你的使用习惯，下方图表可查看心情与记录趋势。' },
];

// 新手引导浮层：首次访问展示，支持 Esc 关闭、方向键翻页（WCAG 兼容）
const OnboardingOverlay = ({ open, onClose }) => {
  const [step, setStep] = useState(0);

  const next = () => (step < STEPS.length - 1 ? setStep(step + 1) : onClose());

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft' && step > 0) setStep(step - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, step, onClose]);

  if (!open) return null;
  const s = STEPS[step];

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`新手引导 第${step + 1}步，共${STEPS.length}步`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl"
      >
        <button onClick={onClose} aria-label="关闭引导" className="absolute right-4 top-4 rounded-full p-1.5 text-stone-400 hover:bg-stone-100">
          <X size={18} aria-hidden="true" />
        </button>
        <p className="text-5xl" aria-hidden="true">{s.emoji}</p>
        <h2 className="mt-3 font-hand text-xl text-amber-800">{s.title}</h2>
        <p className="mt-2 text-sm text-stone-500">{s.desc}</p>
        <div className="mt-4 flex justify-center gap-1.5" aria-hidden="true">
          {STEPS.map((_, i) => (
            <span key={i} className={`h-1.5 w-6 rounded-full ${i === step ? 'bg-amber-400' : 'bg-amber-100'}`} />
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-xl border border-amber-200 py-2.5 text-amber-600 hover:bg-amber-50">
            跳过
          </button>
          <button
            onClick={next}
            autoFocus
            className="flex-1 rounded-xl bg-amber-400 py-2.5 text-white hover:bg-amber-500"
          >
            {step < STEPS.length - 1 ? '下一步 →' : '开始使用 ✨'}
          </button>
        </div>
        <p className="mt-2 text-[10px] text-stone-300">提示：← → 方向键翻页，Esc 关闭</p>
      </motion.div>
    </motion.div>
  );
};

export default OnboardingOverlay;
