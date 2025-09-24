import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../app/apiClient';
import type { InboxResponse, Task } from '../../app/types';
import { Button } from '../../components/ui/Button';
import TaskDetailPanel from '../tasks/TaskDetailPanel';

const SCOPES = [
  { key: 'today', label: '今日' },
  { key: 'overdue', label: '遅延' },
  { key: 'this_week', label: '今週' },
] as const;

const fetchInbox = async (scope: string) => {
  const res = await apiClient.get<InboxResponse>('/inbox', { params: { scope } });
  return res.data;
};

const InboxPage: React.FC = () => {
  const [scope, setScope] = useState<(typeof SCOPES)[number]['key']>('today');
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['inbox', scope],
    queryFn: () => fetchInbox(scope),
    keepPreviousData: true,
  });

  const tasks = useMemo(() => data?.data ?? [], [data]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const completeTask = async (taskId: number) => {
    await apiClient.post(`/inbox/${taskId}/complete`);
    await refetch();
  };

  const postponeTask = async (taskId: number, days: number) => {
    await apiClient.post(`/inbox/${taskId}/postpone`, { days });
    await refetch();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">受信箱</h1>
        <div className="flex items-center gap-2">
          {SCOPES.map((s) => (
            <Button
              key={s.key}
              variant={scope === s.key ? 'default' : 'secondary'}
              onClick={() => setScope(s.key)}
            >
              {s.label}
            </Button>
          ))}
          <Button variant="secondary" onClick={() => refetch()} disabled={isFetching}>再取得</Button>
        </div>
      </div>

      {isLoading ? (
        <div>読み込み中...</div>
      ) : error ? (
        <div className="text-red-600">取得に失敗しました</div>
      ) : (
        <div className="space-y-2">
          {tasks.length === 0 && (
            <div className="text-gray-600">タスクはありません</div>
          )}
          {tasks.map((t: Task) => (
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
                <Button size="sm" onClick={() => completeTask(t.id)}>完了</Button>
                <Button size="sm" variant="secondary" onClick={() => postponeTask(t.id, 1)}>+1日</Button>
                <Button size="sm" variant="secondary" onClick={() => postponeTask(t.id, 7)}>+7日</Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <TaskDetailPanel open={detailOpen} taskId={selectedTaskId} onClose={() => { setDetailOpen(false); setSelectedTaskId(null); }} />
    </div>
  );
};

export default InboxPage;
