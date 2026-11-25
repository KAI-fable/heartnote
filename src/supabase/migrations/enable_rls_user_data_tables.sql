-- 启用手账与重要日子表的行级安全（RLS）
-- 策略设计：
--   1) 所有操作仅对 authenticated（已登录）角色开放；
--   2) 谓词条件 user_id = auth.uid() 精确限制行级访问，杜绝跨用户读/写；
--   3) 未配置任何 anon 策略 → 未登录用户对这两张表完全无权限（查/插/改/删全部拒绝）；
--   4) 使用 DROP POLICY IF EXISTS 保证迁移可安全重复执行
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE important_events ENABLE ROW LEVEL SECURITY;

-- journal_entries：本人专属四类策略
DROP POLICY IF EXISTS "user_select_own_entries" ON journal_entries;
CREATE POLICY "user_select_own_entries" ON journal_entries
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "user_insert_own_entries" ON journal_entries;
CREATE POLICY "user_insert_own_entries" ON journal_entries
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "user_update_own_entries" ON journal_entries;
CREATE POLICY "user_update_own_entries" ON journal_entries
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "user_delete_own_entries" ON journal_entries;
CREATE POLICY "user_delete_own_entries" ON journal_entries
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- important_events：本人专属四类策略
DROP POLICY IF EXISTS "user_select_own_events" ON important_events;
CREATE POLICY "user_select_own_events" ON important_events
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "user_insert_own_events" ON important_events;
CREATE POLICY "user_insert_own_events" ON important_events
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "user_update_own_events" ON important_events;
CREATE POLICY "user_update_own_events" ON important_events
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "user_delete_own_events" ON important_events;
CREATE POLICY "user_delete_own_events" ON important_events
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());
