-- 为手账与重要日子表添加软删除（归档）标记列：false=正常展示，true=已归档隐藏
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE important_events ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
