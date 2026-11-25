import { differenceInCalendarDays } from 'date-fns';
import { nextOccurrence, parseLocalDate, startOfDay } from './dateRules';

// 纪念日状态统一计算：
// 1) 一律通过 nextOccurrence 取"下一次实际发生日期"（农历节日如七夕自动转公历并跨年顺延，
//    重复事件自动循环），避免硬编码原始日期导致的倒计时错误
// 2) status: 'today'（仅当天触发）| 'future' | 'expired'（仅单次事件过期会出现）
// 3) 日期数据解析失败时 invalid=true，供 UI 层兜底提示
export function dayStatus(ev, from = new Date()) {
  const base = parseLocalDate(ev.event_date);
  const invalid = isNaN(base.getTime());
  if (invalid) return { nextDate: null, diff: null, status: 'invalid', invalid: true };
  const nextDate = nextOccurrence(ev, from);
  const diff = differenceInCalendarDays(startOfDay(nextDate), startOfDay(from));
  const status = diff === 0 ? 'today' : diff > 0 ? 'future' : 'expired';
  return { nextDate, diff, status, invalid: false };
}
