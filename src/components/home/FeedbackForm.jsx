import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { readLocal, saveLocal } from '@/lib/storage';

const schema = z.object({
  name: z.string().min(1, '请填写称呼'),
  email: z.string().email('邮箱格式不正确').or(z.literal('')),
  message: z.string().min(5, '留言至少 5 个字'),
});

// 实时反馈表单：输入即校验，云端失败自动本地兜底
const FeedbackForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', message: '' },
    mode: 'onChange', // 实时校验
  });

  const onSubmit = async (data) => {
    const record = { ...data, created_at: new Date().toISOString() };
    try {
      const { error } = await supabase.from('feedback_messages').insert(record);
      if (error) throw error;
      toast.success('反馈已收到，谢谢你 💛');
      reset();
    } catch {
      saveLocal('feedback_messages', [...readLocal('feedback_messages'), record]);
      toast.error('云端提交失败，内容已暂存到本地');
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} aria-label="意见反馈表单" className="space-y-3 rounded-2xl border border-amber-100 bg-white/85 p-4">
      <h2 className="font-hand text-lg text-amber-800">💌 想对本子说点什么？</h2>
      <div>
        <label htmlFor="fb-name" className="text-xs text-amber-600">称呼 *</label>
        <Input id="fb-name" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'fb-name-err' : undefined} {...register('name')} className="border-amber-200" placeholder="怎么称呼你呀" />
        {errors.name && <p id="fb-name-err" role="alert" className="mt-1 text-xs text-rose-500">{errors.name.message}</p>}
      </div>
      <div>
        <label htmlFor="fb-email" className="text-xs text-amber-600">邮箱（选填）</label>
        <Input id="fb-email" type="email" {...register('email')} className="border-amber-200" placeholder="方便联系你" />
        {errors.email && <p role="alert" className="mt-1 text-xs text-rose-500">{errors.email.message}</p>}
      </div>
      <div>
        <label htmlFor="fb-msg" className="text-xs text-amber-600">留言 *</label>
        <Textarea id="fb-msg" aria-invalid={!!errors.message} {...register('message')} className="border-amber-200" rows={3} placeholder="功能建议、遇到的问题都可以说～" />
        {errors.message && <p role="alert" className="mt-1 text-xs text-rose-500">{errors.message.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full bg-amber-400 text-white hover:bg-amber-500">
        <Send size={15} className="mr-1" aria-hidden="true" />
        {isSubmitting ? '提交中...' : '提交反馈'}
      </Button>
    </form>
  );
};

export default FeedbackForm;
