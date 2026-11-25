// Supabase 认证错误 → 用户友好中文提示映射
// 说明：出于安全惯例，登录失败统一提示"账号或密码错误"，避免暴露"账号是否存在"
const ERROR_MAP = [
  [/Invalid login credentials/i, '账号不存在或密码错误，请核对后重试'],
  [/Email not confirmed/i, '邮箱尚未验证，请先查收验证邮件完成激活 ✉️'],
  [/already registered|User already/i, '该邮箱已被注册，请直接登录'],
  [/at least|weak password/i, '密码强度不足：至少 8 位且同时包含字母和数字'],
  [/rate|too many|frequency/i, '操作过于频繁，已触发防暴力破解保护，请稍后再试'],
  [/invalid.*otp|expired|token/i, '验证码不正确或已过期，请重新获取'],
  [/timeout|Failed to fetch|network|fetch/i, '网络异常或数据库连接异常，请检查网络后重试'],
  [/disabled|signup.*not/i, '注册通道暂未开放，请联系管理员'],
];

// 将 Supabase 错误对象翻译为中文提示；未知错误统一兜底并提示已留痕
export function authErrorText(error) {
  const msg = error?.message || String(error || '');
  const hit = ERROR_MAP.find(([re]) => re.test(msg));
  return hit ? hit[1] : `操作失败：${msg}（异常已记录，请稍后重试）`;
}
