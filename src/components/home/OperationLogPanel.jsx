import { ScrollText, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useOperationLog, clearOpLog } from '@/hooks/useOperationLog';

// 操作日志面板：记录标签增删改/排序、事件移动、语言切换等关键操作，便于问题排查
const OperationLogPanel = () => {
  const { logs } = useOperationLog();
  return (
    <div className="rounded-2xl border border-amber-100 bg-white/85 p-4">
      <div className="flex items-center gap-2">
        <h2 className="flex items-center gap-1.5 font-hand text-lg text-amber-800">
          <ScrollText size={18} aria-hidden="true" /> 操作日志
        </h2>
        <Button variant="outline" size="sm" onClick={clearOpLog} className="ml-auto border-amber-200 text-amber-600">
          <Trash2 size={13} className="mr-1" aria-hidden="true" /> 清空日志
        </Button>
      </div>
      {logs.length === 0 ? (
        <p className="py-3 text-center text-xs text-stone-400">暂无操作记录，去创建/编辑标签或移动事件吧</p>
      ) : (
        <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto" aria-live="polite">
          {logs.slice(0, 20).map((l, i) => (
            <li key={i} className="rounded-lg bg-amber-50/60 px-3 py-1.5 text-xs text-stone-600">
              <span className="text-amber-400">{format(new Date(l.time), 'MM-dd HH:mm:ss')}</span> · {l.detail}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-[10px] text-stone-300">记录标签增删改、层级排序、事件移动等关键操作，便于异常排查</p>
    </div>
  );
};

export default OperationLogPanel;
