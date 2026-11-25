import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { readLocal, saveLocal } from '@/lib/storage';
import { logOp } from '@/hooks/useOperationLog';

// 手账记录读写：云端 + 本地双备份；列表自动过滤已归档（is_deleted）数据
export function useJournalEntries() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['journal_entries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        toast.error('云端读取失败，已使用本地备份数据');
        return readLocal('journal_entries').filter((e) => !e.is_deleted);
      }
      saveLocal('journal_entries', data || []);
      return (data || []).filter((e) => !e.is_deleted);
    },
  });

  // 每次变更前先写入本地备份
  const backup = (fn) => saveLocal('journal_entries', fn(readLocal('journal_entries')));

  const createEntry = useMutation({
    mutationFn: async (entry) => {
      backup((list) => [{ ...entry, id: Date.now(), is_deleted: false }, ...list]);
      const { error } = await supabase.from('journal_entries').insert(entry);
      if (error) throw error;
    },
    onSuccess: () => { toast.success('手账已保存 ✨'); qc.invalidateQueries({ queryKey: ['journal_entries'] }); },
    onError: () => { toast.error('云端保存失败，内容已存入本地备份'); qc.invalidateQueries({ queryKey: ['journal_entries'] }); },
  });

  const updateEntry = useMutation({
    mutationFn: async ({ id, ...patch }) => {
      backup((list) => list.map((e) => (e.id === id ? { ...e, ...patch } : e)));
      const { error } = await supabase.from('journal_entries').update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['journal_entries'] }),
    onError: () => { toast.error('云端更新失败，已更新本地备份'); qc.invalidateQueries({ queryKey: ['journal_entries'] }); },
  });

  // 删除模块：mode='soft' 走软删除（is_deleted 归档标记，可找回）；mode='hard' 走硬删除（物理移除）
  // 失败强制回源刷新清缓存残留，成功/失败均写操作日志，错误原因直达用户
  const deleteEntry = useMutation({
    mutationFn: async ({ id, mode = 'hard' }) => {
      if (mode === 'soft') {
        backup((list) => list.map((e) => (e.id === id ? { ...e, is_deleted: true } : e)));
        const { error } = await supabase.from('journal_entries').update({ is_deleted: true }).eq('id', id);
        if (error) throw error;
      } else {
        backup((list) => list.filter((e) => e.id !== id));
        const { error } = await supabase.from('journal_entries').delete().eq('id', id);
        if (error) throw error;
      }
      return { id, mode };
    },
    onSuccess: ({ id, mode }) => {
      logOp(mode === 'soft' ? 'archive_entry' : 'delete_entry',
        `${mode === 'soft' ? '归档（软删除）' : '彻底删除（硬删除）'}手账 #${id}`);
      toast.success(mode === 'soft' ? '已归档，可在本地备份中找回' : '已彻底删除');
      qc.invalidateQueries({ queryKey: ['journal_entries'], refetchType: 'all' });
    },
    onError: (e) => {
      logOp('delete_entry_fail', `删除手账失败：${e?.message || e}`);
      qc.invalidateQueries({ queryKey: ['journal_entries'], refetchType: 'all' });
      toast.error(`删除失败：${e?.message || '网络异常，请稍后重试'}`);
    },
  });

  return { ...query, createEntry, updateEntry, deleteEntry };
}
