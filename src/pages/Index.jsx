import { lazy, Suspense, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PageShell from '@/components/layout/PageShell';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import HeroSection from '@/components/home/HeroSection';
import QuickActions from '@/components/home/QuickActions';
import OnboardingOverlay from '@/components/home/OnboardingOverlay';
import EntryEditorDialog from '@/components/journal/EntryEditorDialog';
import AddEventDialog from '@/components/home/AddEventDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { usePageAnalytics } from '@/hooks/usePageAnalytics';
import { useVisitState } from '@/hooks/useVisitState';
import { useJournalEntries } from '@/hooks/useJournalEntries';
import { useLanguage } from '@/hooks/useLanguage';
import { trackEvent, initAnalytics } from '@/integrations/analytics/tracker';
import { debounce } from '@/lib/performance';
import { supabase } from '@/integrations/supabase/client';

// 渐进式加载：图表与重要日子管理为异步 chunk，首屏只渲染核心静态内容
const StatsChart = lazy(() => import('@/components/home/StatsChart'));
const ImportantDaysManager = lazy(() => import('@/components/home/ImportantDaysManager'));

initAnalytics(); // 启动时补传历史埋点

const SectionSkeleton = () => (
  <div className="rounded-2xl border border-amber-100 bg-white/85 p-6">
    <Skeleton className="h-32 w-full rounded-xl" />
  </div>
);

const Index = () => {
  const { role, isFirstVisit, login, logout, dismissOnboarding } = useVisitState();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { createEntry } = useJournalEntries();
  const [editorOpen, setEditorOpen] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);
  const [hotZone, setHotZone] = useState(null);

  // 智能引导：同一区域点击 3 次触发快捷提示并高亮
  usePageAnalytics({
    onHotZone: (zone) => {
      setHotZone(zone);
      toast.info('发现你常点这里，快捷入口已高亮 ✨');
    },
  });

  // 高频操作防抖（400ms）：避免重复打开编辑器
  const openEditor = useCallback(
    debounce(() => {
      trackEvent('action', { type: 'open_editor' });
      setEditorOpen(true);
    }, 400),
    []
  );

  // 快捷操作：写手账 / 加重要日子（本页弹窗）/ 滚动查看统计
  const handleAction = (type) => {
    if (role === 'guest') {
      toast.info('登录后即可使用该功能哦～');
      return;
    }
    if (type === 'write') openEditor();
    else if (type === 'event') {
      trackEvent('action', { type: 'open_event_dialog' });
      setEventOpen(true);
    } else if (type === 'stats') {
      document.getElementById('stats-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <PageShell title={`${t('navToday')} 🌷`}>
      <div className="space-y-5">
        <ErrorBoundary onError={() => toast.error('区块加载出错，已降级显示')}>
          {/* 登录后核心入口为智能日历（原写作入口已替换） */}
          <HeroSection role={role} onLogin={() => navigate('/auth')}
            onLogout={async () => { await supabase.auth.signOut(); logout(); }}
            onCalendar={() => { trackEvent('action', { type: 'open_calendar' }); navigate('/calendar'); }} />
        </ErrorBoundary>

        <QuickActions onAction={handleAction} hotZone={hotZone} />

        <ErrorBoundary onError={() => toast.error('重要日子模块加载失败')}>
          <Suspense fallback={<SectionSkeleton />}>
            <ImportantDaysManager onAdd={() => setEventOpen(true)} />
          </Suspense>
        </ErrorBoundary>

        <div id="stats-section">
          <ErrorBoundary onError={() => toast.error('统计图表加载失败')}>
            <Suspense fallback={<SectionSkeleton />}>
              <StatsChart />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>

      <OnboardingOverlay open={isFirstVisit} onClose={dismissOnboarding} />
      <EntryEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        entry={null}
        onSave={(data) => {
          createEntry.mutate(data);
          setEditorOpen(false);
        }}
      />
      <AddEventDialog open={eventOpen} onOpenChange={setEventOpen} />
    </PageShell>
  );
};

export default Index;
