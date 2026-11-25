-- 重要日子操作日志表：记录用户ID、删除/编辑动作、事件名称、错误码与堆栈信息
CREATE TABLE IF NOT EXISTS event_operation_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT DEFAULT '',
  action TEXT DEFAULT '',
  event_name TEXT DEFAULT '',
  detail TEXT DEFAULT '',
  error_code TEXT DEFAULT '',
  stack_info TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);
