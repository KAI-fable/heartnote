-- 为重要日子表添加重复规则列：支持单次(none)/按年(yearly)/按月(monthly)差异化重复
-- 使用 IF NOT EXISTS 防错，可安全重复执行；已有数据默认为单次，不受影响
ALTER TABLE important_events ADD COLUMN IF NOT EXISTS repeat_rule TEXT DEFAULT 'none';
