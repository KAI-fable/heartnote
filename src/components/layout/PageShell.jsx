import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import SidebarDrawer from './SidebarDrawer';
import FeedbackDialog from './FeedbackDialog';

// 页面外壳：顶栏 + 抽屉菜单 + 统一反馈弹窗，各页面共用
const PageShell = ({ title, children }) => {
  const [open, setOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  // 打开反馈前先收起抽屉，避免层级遮挡
  const openFeedback = () => { setOpen(false); setFeedbackOpen(true); };

  // 监听编辑器等组件发起的输入异常反馈事件，统一打开反馈弹窗
  useEffect(() => {
    const handler = () => openFeedback();
    window.addEventListener('open-feedback', handler);
    return () => window.removeEventListener('open-feedback', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-[#fffdf7]/90 backdrop-blur border-b border-amber-100">
        <div className="max-w-5xl mx-auto flex items-center gap-3 px-4 h-14">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button aria-label="打开菜单" className="p-3 -ml-3 rounded-full hover:bg-amber-100">
                <Menu size={22} className="text-amber-700" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <SheetTitle className="sr-only">导航菜单</SheetTitle>
              <SidebarDrawer onNavigate={() => setOpen(false)} onFeedback={openFeedback} />
            </SheetContent>
          </Sheet>
          <h1 className="font-hand text-2xl text-amber-800">{title}</h1>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 pt-4 pb-24">{children}</main>
      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </div>
  );
};

export default PageShell;
