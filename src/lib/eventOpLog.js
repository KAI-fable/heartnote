import { supabase } from '@/integrations/supabase/client';
import { logOp } from '@/hooks/useOperationLog';

// 用户ID：复用会话级 analytics session id，标识操作来源
function currentUserId() {
  return sessionStorage.getItem('analytics_sid') || 'anonymous';
}

// 操作日志入库：记录用户ID、动作、事件名称、时间与错误信息（错误含错误码+堆栈）
export async function logEventOpDb(action, eventName, error = null) {
  const record = {
    user_id: currentUserId(),
    action,
    event_name: eventName,
    detail: `操作时间：${new Date().toISOString()}`,
    error_code: error ? 'EVT_OP_FAIL' : '',
    stack_info: error ? String(error?.stack || error?.message || error) : '',
  };
  try {
    const { error: dbError } = await supabase.from('event_operation_logs').insert(record);
    if (dbError) throw dbError;
  } catch (e) {
    // 入库失败兜底：本地留痕，保证日志不丢失、便于排查
    logOp('db_log_fail', `操作日志入库失败：${e?.message || e}`);
  }
}
