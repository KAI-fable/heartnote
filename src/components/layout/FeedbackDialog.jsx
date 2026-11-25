import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FeedbackForm from '@/components/home/FeedbackForm';

// 反馈弹窗：由侧边栏入口触发，统一收纳低频操作
const FeedbackDialog = ({ open, onOpenChange }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="font-hand text-xl text-amber-800">💌 意见反馈</DialogTitle>
      </DialogHeader>
      <FeedbackForm />
    </DialogContent>
  </Dialog>
);

export default FeedbackDialog;
