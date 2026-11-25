-- 为用户数据表新增 user_id 列：UUID 类型，默认值取当前登录用户 auth.uid()
-- 未登录（anon）时该默认值为 NULL；配合后续 RLS 策略可实现"未登录不可写"的强隔离
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid();
ALTER TABLE important_events ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid();
