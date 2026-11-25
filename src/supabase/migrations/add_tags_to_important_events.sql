-- 为重要日子表添加标签数组列：实现与手账一致的标签归类体系
ALTER TABLE important_events ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
