import { useMemo, useState } from 'react';
import { FlaskConical, RefreshCw } from 'lucide-react';
import { runDirectionTests } from '@/lib/textDirectionTests';

// 输入方向诊断面板：在浏览器内执行单元测试并展示逐条结果，支持一键重跑
const DirectionDiagnostics = () => {
  const [tick, setTick] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const results = useMemo(() => runDirectionTests(), [tick]);
  const passed = results.filter((r) => r.pass).length;

  return (
    <section aria-label="输入方向诊断" className="rounded-2xl border border-amber-100 bg-white/85 p-4">
      <div className="flex items-center gap-2">
        <h2 className="flex items-center gap-1.5 font-hand text-lg text-amber-800">
          <FlaskConical size={18} aria-hidden="true" /> 输入方向诊断（单元测试）
        </h2>
        <button onClick={() => setTick((t) => t + 1)} aria-label="重跑测试"
          className="ml-auto flex items-center gap-1 rounded-xl border border-amber-200 px-3 py-1.5 text-xs text-amber-700 hover:bg-amber-50">
          <RefreshCw size={13} aria-hidden="true" /> 重跑
        </button>
      </div>
      <p className={`mt-2 text-xs ${passed === results.length ? 'text-emerald-600' : 'text-rose-500'}`} aria-live="polite">
        {passed === results.length
          ? `✅ 全部 ${results.length} 项边界案例通过（BiDi 方向 / 标记清洗 / emoji 兼容）`
          : `⚠️ ${passed}/${results.length} 通过，存在失败案例`}
      </p>
      <ul className="mt-2 max-h-44 space-y-1 overflow-y-auto">
        {results.map((r) => (
          <li key={r.name} className={`rounded-lg px-3 py-1.5 text-xs ${r.pass ? 'bg-emerald-50/60 text-stone-600' : 'bg-rose-50 text-rose-600'}`}>
            {r.pass ? '✅' : '❌'} {r.name}{r.err ? `（${r.err}）` : ''}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[10px] text-stone-300">覆盖 RTL/LTR 检测、隐形双向标记剥离、ZWJ emoji 保真、中性输入回落等边界场景</p>
    </section>
  );
};

export default DirectionDiagnostics;
