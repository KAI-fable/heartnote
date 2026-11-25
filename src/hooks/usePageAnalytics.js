import { useEffect, useRef } from 'react';
import { trackEvent } from '@/integrations/analytics/tracker';
import { throttle } from '@/lib/performance';

const HOT_THRESHOLD = 3; // 同一热区累计点击 3 次触发智能引导回调

// 页面级埋点：进入即记 PV，滚动节流记录深度，离开上报停留时长
export function usePageAnalytics({ onHotZone } = {}) {
  const enteredAt = useRef(Date.now());
  const maxScroll = useRef(0);
  const cbRef = useRef(onHotZone);
  cbRef.current = onHotZone;

  useEffect(() => {
    trackEvent('page_view', { ref: document.referrer });

    // 滚动深度（节流 500ms，避免高频触发）
    const onScroll = throttle(() => {
      const total = Math.max(document.body.scrollHeight - window.innerHeight, 1);
      const depth = Math.round((window.scrollY / total) * 100);
      if (depth > maxScroll.current) maxScroll.current = depth;
    }, 500);
    window.addEventListener('scroll', onScroll, { passive: true });

    // 点击埋点：仅捕获带 data-track 标记的元素，并做高频热区检测
    const onClick = (e) => {
      const zone = e.target.closest?.('[data-track]')?.dataset.track;
      if (!zone) return;
      const key = `hot_${zone}`;
      const count = (parseInt(sessionStorage.getItem(key) || '0', 10) || 0) + 1;
      sessionStorage.setItem(key, String(count));
      trackEvent('click', { zone, count });
      if (count === HOT_THRESHOLD) cbRef.current?.(zone);
    };
    document.addEventListener('click', onClick);

    // 停留时长：离开页面或组件卸载时上报
    const reportDwell = () =>
      trackEvent('dwell', {
        seconds: Math.round((Date.now() - enteredAt.current) / 1000),
        maxScroll: maxScroll.current,
      });
    window.addEventListener('pagehide', reportDwell);

    return () => {
      reportDwell();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('click', onClick);
      window.removeEventListener('pagehide', reportDwell);
    };
  }, []);
}
