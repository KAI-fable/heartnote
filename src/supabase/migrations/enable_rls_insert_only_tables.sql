-- 反馈 / 埋点 / 操作日志表：仅开放插入权限（anon 与 authenticated 均可写入），
-- 不配置任何 SELECT/UPDATE/DELETE 策略 → 在 RLS 启用后读取与修改被完全禁止，
-- 有效防止他人窥探匿名反馈内容与用户行为日志
ALTER TABLE feedback_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_operation_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insert_only_feedback" ON feedback_messages;
CREATE POLICY "insert_only_feedback" ON feedback_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "insert_only_analytics" ON analytics_events;
CREATE POLICY "insert_only_analytics" ON analytics_events
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "insert_only_op_logs" ON event_operation_logs;
CREATE POLICY "insert_only_op_logs" ON event_operation_logs
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);
