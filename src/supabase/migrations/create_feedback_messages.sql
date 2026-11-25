-- 反馈留言表：存储表单提交的意见反馈
CREATE TABLE IF NOT EXISTS feedback_messages (
  id BIGSERIAL PRIMARY KEY,
  name TEXT DEFAULT '',
  email TEXT DEFAULT '',
  message TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);
