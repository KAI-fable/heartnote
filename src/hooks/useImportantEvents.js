import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { readLocal, saveLocal } from '@/lib/storage';
import { logOp } from '@/hooks/useOperationLog';

// 重要日子读写：云端 + 本地双备份；列表自动过滤已归档（is_deleted）数据
export function useImportantEvents() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['important_events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('important_events')
        .select('*')
        .order('event_date', { ascending: true });
      if (error) {
        toast.error('云端读取失败，已使用本地备份数据');
        return readLocal('important_events').filter((e) => !e.is_deleted);
      }
      saveLocal('important_events', data || []);
      return (data || []).filter((e) => !e.is_deleted);
    },
  });

  const backup = (fn) => saveLocal('important_events', fn(readLocal('important_events')));

  const createEvent = useMutation({
    mutationFn: async (ev) => {
      backup((list) => [...list, { ...ev, id: Date.now(), is_deleted: false }]);
      const { error } = await supabase.from('important_events').insert(ev);
      if (error) throw error;
    },
    onSuccess: () => { toast.success('重要日子已记录 🎈'); qc.invalidateQueries({ queryKey: ['important_events'] }); },
    onError: () => { toast.error('云端保存失败，已存入本地备份'); qc.invalidateQueries({ queryKey: ['important_events'] }); },
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, ...patch }) => {
      backup((list) => list.map((e) => (e.id === id ? { ...e, ...patch } : e)));
      const { error } = await supabase.from('important_events').update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['important_events'] }),
    onError: () => { toast.error('云端更新失败，已更新本地备份'); qc.invalidateQueries({ queryKey: ['important_events'] }); },
  });

  // 删除模块：mode='soft' 归档标记 / mode='hard' 物理删除，失败回源还原 + 日志留痕
  const deleteEvent = useMutation({
    mutationFn: async ({ id, mode = 'hard' }) => {
      if (mode === 'soft') {
        backup((list) => list.map((e) => (e.id === id ? { ...e, is_deleted: true } : e)));
        const { error } = await supabase.from('important_events').update({ is_deleted: true }).eq('id', id);
        if (error) throw error;
      } else {
        backup((list) => list.filter((e) => e.id !== id));
        const { error } = await supabase.from('important_events').delete().eq('id', id);
        if (error) throw error;
      }
      return { id, mode };
    },
    onSuccess: ({ id, mode }) => {
      logOp(mode === 'soft' ? 'archive_event' : 'delete_event',
        `${mode === 'soft' ? '归档（软删除）' : '彻底删除（硬删除）'}重要日子 #${id}`);
      toast.success(mode === 'soft' ? '已归档，可在本地备份中找回' : '已彻底删除');
      qc.invalidateQueries({ queryKey: ['important_events'], refetchType: 'all' });
    },
    onError: (e) => {
      logOp('delete_event_fail', `删除重要日子失败：${e?.message || e}`);
      qc.invalidateQueries({ queryKey: ['important_events'], refetchType: 'all' });
      toast.error(`删除失败：${e?.message || '网络异常，请稍后重试'}`);
    },
  });

  return { ...query, createEvent, updateEvent, deleteEvent };
}
