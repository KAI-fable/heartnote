import { createClient } from '@supabase/supabase-js';

// 连接信息从环境变量读取（本地放在 .env，见 .env.example），不写进源码
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('缺少 Supabase 配置：请复制 .env.example 为 .env 并填写 VITE_SUPABASE_URL 与 VITE_SUPABASE_ANON_KEY');
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
