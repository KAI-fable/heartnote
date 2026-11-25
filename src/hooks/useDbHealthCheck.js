import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// 需要校验的核心数据表（均为只读 head 查询，零副作用）
const TABLES = ['analytics_events', 'feedback_messages', 'journal_entries', 'important_events'];

// 数据库健康校验：对每张表执行 count 探测，返回成功/失败状态与错误详情
export function useDbHealthCheck() {
  return useQuery({
    queryKey: ['db_health_check'],
    queryFn: async () => {
      const results = [];
      for (const table of TABLES) {
        const { count, error } = await supabase
          .from(table)
          .select('id', { count: 'exact', head: true });
        results.push({
          table,
          ok: !error,
          rows: error ? null : count,
          error: error?.message || null,
        });
      }
      return results;
    },
    staleTime: 30 * 1000, // 30 秒内视为新鲜，避免重复探测
    retry: 1, // 自动重试一次，失败后可手动重试
  });
}
