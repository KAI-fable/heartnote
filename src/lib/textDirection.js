// BiDi 双向文本方向检测与清洗工具（纯函数，便于单元测试覆盖边界案例）
// RTL 范围：希伯来文 / 阿拉伯文 / 叙利亚文 / 等从右至左文字区段
const RTL_CHARS = /[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F\uFB1D-\uFDFF\uFE70-\uFEFF]/g;
// LTR 范围：基础拉丁字母及扩展拉丁区段
const LTR_CHARS = /[A-Za-z\u00C0-\u024F]/g;
// BiDi 隐形控制标记：LRM/RLM/LRE/RLE/PDF/LRI/RLI/FSI/PDI
// 注意刻意排除 \u200D（ZWJ）：它是 emoji 组合字符，清除会导致家庭/肤色 emoji 拆散乱码
const BIDI_MARKS_G = /[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g;
const BIDI_MARKS = /[\u200E\u200F\u202A-\u202E\u2066-\u2069]/;

// 剥离所有隐形方向控制标记，保留 emoji ZWJ 与常规字符
export function stripBiDiMarks(text) {
  return (text || '').replace(BIDI_MARKS_G, '');
}

// 检测是否含有隐形方向标记（用于异常输入留痕与告警）
export function containsBiDiMarks(text) {
  return BIDI_MARKS.test(text || '');
}

// 主流方向检测：rtl / ltr / neutral（中文与 emoji 视为中性，渲染回落 LTR）
// 混合输入时以字符数占多的一方为主流方向，供编辑器动态设置 dir 属性重排文本流
export function detectDirection(text) {
  const t = stripBiDiMarks(text || '');
  const rtl = (t.match(RTL_CHARS) || []).length;
  const ltr = (t.match(LTR_CHARS) || []).length;
  if (!rtl && !ltr) return 'neutral';
  if (rtl > 0 && ltr === 0) return 'rtl';
  if (ltr > 0 && rtl === 0) return 'ltr';
  return rtl > ltr ? 'rtl' : 'ltr';
}

// 输入净化：清除隐形方向标记，防止镜像翻转与乱码；emoji 组合不受影响
export function sanitizeInput(text) {
  return stripBiDiMarks(text);
}
