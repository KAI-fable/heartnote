-- 埋点事件表：记录页面 PV、点击热区、滚动深度、停留时长等行为数据
CREATE TABLE IF NOT EXISTS analytics_events (
  id BIGSERIAL PRIMARY KEY,
  event_name TEXT DEFAULT '',
  props JSONB,
  page_path TEXT DEFAULT '',
  session_id TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);
