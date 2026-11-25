import { useEffect } from 'react';
import { toast } from 'sonner';
import { RefreshCw, CheckCircle2, XCircle, Loader2, Database } from 'lucide-react';
import { useDbHealthCheck } from '@/hooks/useDbHealthCheck';

// SQL 执行状态面板：实时展示各表校验结果，支持失败重试
const DatabaseStatusPanel = () => {
  const { data, isLoading, isError, error, refetch, isFetching } = useDbHealthCheck();

  // 执行完成后弹出明确的结果反馈（成功 / 失败 + 错误详情）
  useEffect(() => {
    if (!data) return;
    const failed = data.filter((r) => !r.ok);
    if (failed.length === 0) {
      toast.success(`SQL 校验通过：${data.length} 张表均可正常访问，操作成功 ✅`);
    } else {
      toast.error(`SQL 校验失败：${failed.map((f) => `${f.table}（${f.error}）`).join('、')}`);
    }
  }, [data]);

  const statusOf = (r) =>
    r.ok ? (
      <span className="flex items-center gap-1 text-emerald-600">
        <CheckCircle2 size={14} aria-hidden="true" /> 连接成功 · {r.rows} 行
      </span>
    ) : (
      <span className="flex items-center gap-1 text-rose-600" title={r.error || ''}>
        <XCircle size={14} aria-hidden="true" /> 失败：{r.error}
      </span>
    );

  return (
    <section
      aria-label="数据库执行状态面板"
      className="rounded-2xl border border-amber-100 bg-white/85 p-4"
    >
      <div className="flex items-center gap-2">
        <h2 className="flex items-center gap-1.5 font-hand text-lg text-amber-800">
          <Database size={18} aria-hidden="true" /> 数据库执行状态
        </h2>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          aria-label="重新执行校验"
          className="ml-auto flex items-center gap-1 rounded-xl border border-amber-200 px-3 py-1.5 text-xs text-amber-700 hover:bg-amber-50 disabled:opacity-50"
        >
          <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} aria-hidden="true" />
          {isFetching ? '校验中...' : '重新校验'}
        </button>
      </div>

      {/* 读校验零副作用：失败支持重试，成功无需撤销 */}
      <div aria-live="polite" className="mt-3 space-y-2">
        {isLoading ? (
          <p className="flex items-center gap-2 py-4 text-sm text-stone-400">
            <Loader2 size={16} className="animate-spin" aria-hidden="true" /> 正在执行 SQL 校验查询...
          </p>
        ) : isError ? (
          <div role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600">
            <p>校验请求执行失败：{error?.message || '网络异常'}</p>
            <button
              onClick={() => refetch()}
              className="mt-2 rounded-lg bg-rose-500 px-3 py-1.5 text-xs text-white hover:bg-rose-600"
            >
              重试
            </button>
          </div>
        ) : (
          data.map((r) => (
            <div
              key={r.table}
              className="flex items-center justify-between rounded-xl bg-amber-50/60 px-3 py-2 text-sm"
            >
              <span className="font-mono text-xs text-stone-600">{r.table}</span>
              {statusOf(r)}
            </div>
          ))
        )}
      </div>
      <p className="mt-2 text-[10px] text-stone-300">
        校验为只读探测（count 查询），不产生任何数据写入；失败可随时点击重试。
      </p>
    </section>
  );
};

export default DatabaseStatusPanel;
