import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../app/apiClient';
import type { PaginatedResponse, Task } from '../../app/types';
import { Button } from '../../components/ui/Button';
// import { Input } from '../../components/ui/Input';
import TaskDetailPanel from './TaskDetailPanel';

interface TaskParams {
  page: number;
  per_page: number;
  status?: 'pending' | 'completed';
  priority?: 'low' | 'normal' | 'high';
}

const defaultParams: TaskParams = { page: 1, per_page: 20, status: 'pending' };

const fetchTasks = async (params: TaskParams) => {
  const res = await apiClient.get<PaginatedResponse<Task>>('/tasks', { params });
  return res.data;
};

const TasksPage: React.FC = () => {
  const [params, setParams] = useState<TaskParams>({ ...defaultParams });
  const { data, isLoading, error, refetch, isFetching } = useQuery<PaginatedResponse<Task>>({
    queryKey: ['tasks', params],
    queryFn: () => fetchTasks(params),
  });

  const completeTask = async (id: number) => {
    await apiClient.post(`/tasks/${id}/complete`);
    await refetch();
  };

  const postponeTask = async (id: number, days: number) => {
    await apiClient.post(`/tasks/${id}/postpone`, { days });
    await refetch();
  };

  const total = data?.pagination.total ?? 0;
  const currentPage = data?.pagination.current_page ?? 1;
  const lastPage = data?.pagination.last_page ?? 1;

  const gotoPage = (page: number) => setParams((p) => ({ ...p, page }));

  const rows = useMemo(() => data?.data ?? [], [data]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">タスク</h1>
        <div className="flex items-center gap-2">
          <select
            className="border rounded px-2 py-1 text-sm"
            value={params.status}
            onChange={(e) => setParams((p) => ({ ...p, page: 1, status: e.target.value as TaskParams['status'] }))}
          >
            <option value="pending">未完了</option>
            <option value="completed">完了</option>
          </select>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={params.priority ?? ''}
            onChange={(e) => setParams((p) => ({ ...p, page: 1, priority: (e.target.value || undefined) as TaskParams['priority'] }))}
          >
            <option value="">すべての優先度</option>
            <option value="high">高</option>
            <option value="normal">中</option>
            <option value="low">低</option>
          </select>
          <Button variant="secondary" onClick={() => refetch()} disabled={isFetching}>再取得</Button>
        </div>
      </div>

      {isLoading ? (
        <div>読み込み中...</div>
      ) : error ? (
        <div className="text-red-600">取得に失敗しました</div>
      ) : (
        <div className="space-y-2">
          {rows.length === 0 && <div className="text-gray-600">タスクはありません</div>}
          {rows.map((t: Task) => (
            <div key={t.id} className="flex items-center justify-between bg-white border rounded p-3">
              <div>
                <button className="font-medium text-left hover:underline" onClick={() => { setSelectedTaskId(t.id); setDetailOpen(true); }}>{t.title}</button>
                <div className="text-sm text-gray-500">
                  期限: {new Date(t.due_on).toLocaleDateString()} / 優先度: {t.priority}
                  {t.contact && (
                    <span className="ml-2">連絡先: {t.contact.name}</span>
                  )}
                  {t.deal && (
                    <span className="ml-2">商談: {t.deal.title}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {params.status !== 'completed' && (
                  <Button size="sm" onClick={() => completeTask(t.id)}>完了</Button>
                )}
                {params.status !== 'completed' && (
                  <>
                    <Button size="sm" variant="secondary" onClick={() => postponeTask(t.id, 1)}>+1日</Button>
                    <Button size="sm" variant="secondary" onClick={() => postponeTask(t.id, 7)}>+7日</Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <TaskDetailPanel open={detailOpen} taskId={selectedTaskId} onClose={() => { setDetailOpen(false); setSelectedTaskId(null); }} />

      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm text-gray-600">全{total}件</div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" disabled={currentPage <= 1} onClick={() => gotoPage(currentPage - 1)}>前へ</Button>
          <span className="text-sm">{currentPage} / {lastPage}</span>
          <Button variant="secondary" disabled={currentPage >= lastPage} onClick={() => gotoPage(currentPage + 1)}>次へ</Button>
          <select
            className="ml-2 border rounded px-2 py-1 text-sm"
            value={params.per_page}
            onChange={(e) => setParams((p) => ({ ...p, page: 1, per_page: Number(e.target.value) }))}
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>{n}件/頁</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
