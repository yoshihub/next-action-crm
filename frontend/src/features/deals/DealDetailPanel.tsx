import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../app/apiClient';
import type { ApiResponse, Deal, PaginatedResponse, Task, Activity } from '../../app/types';
import { Button } from '../../components/ui/Button';

interface DealDetailPanelProps {
  open: boolean;
  dealId: number | null;
  onClose: () => void;
}

const fetchDeal = async (id: number) => {
  const res = await apiClient.get<ApiResponse<Deal>>(`/deals/${id}`);
  return res.data.data;
};

const fetchTasksByDeal = async (id: number) => {
  const res = await apiClient.get<PaginatedResponse<Task>>('/tasks', { params: { deal_id: id, page: 1, per_page: 20 } });
  return res.data.data ?? [];
};

const fetchActivitiesByDeal = async (id: number) => {
  const res = await apiClient.get<PaginatedResponse<Activity>>('/activities', { params: { deal_id: id, page: 1, per_page: 20 } });
  return res.data.data ?? [];
};

const DealDetailPanel: React.FC<DealDetailPanelProps> = ({ open, dealId, onClose }) => {
  const enabled = open && !!dealId;
  const { data: deal, isLoading, error } = useQuery({
    queryKey: ['deal-detail', dealId],
    queryFn: () => fetchDeal(dealId as number),
    enabled,
  });
  const { data: tasks = [] } = useQuery({
    queryKey: ['deal-tasks', dealId],
    queryFn: () => fetchTasksByDeal(dealId as number),
    enabled,
  });
  const { data: activities = [] } = useQuery({
    queryKey: ['deal-activities', dealId],
    queryFn: () => fetchActivitiesByDeal(dealId as number),
    enabled,
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-xl flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="font-semibold">商談詳細</div>
          <button className="text-gray-500" onClick={onClose}>×</button>
        </div>

        <div className="p-4 space-y-4 overflow-auto">
          {isLoading ? (
            <div>読み込み中...</div>
          ) : error ? (
            <div className="text-red-600">取得に失敗しました</div>
          ) : deal ? (
            <>
              <div>
                <div className="text-sm text-gray-500">タイトル</div>
                <div className="text-lg font-medium">{deal.title}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">金額</div>
                  <div className="font-medium">¥{deal.amount.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">ステージ</div>
                  <div className="font-medium">{deal.stage}</div>
                </div>
              </div>

              {deal.contact && (
                <div>
                  <div className="text-sm text-gray-500">連絡先</div>
                  <div className="font-medium">{deal.contact.name}</div>
                </div>
              )}

              <div>
                <div className="text-sm text-gray-500 mb-2">タスク</div>
                {tasks.length === 0 ? (
                  <div className="text-sm text-gray-500">タスクはありません</div>
                ) : (
                  <ul className="space-y-2">
                    {tasks.map((t) => (
                      <li key={t.id} className="border rounded p-2">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-sm">{t.title}</div>
                          <div className="text-xs text-gray-500">{t.due_on}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-2">活動ログ</div>
                {activities.length === 0 ? (
                  <div className="text-sm text-gray-500">活動ログはありません</div>
                ) : (
                  <ul className="space-y-2">
                    {activities.map((a) => (
                      <li key={a.id} className="border rounded p-2">
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">{a.occurred_at}</div>
                          <div className="text-xs text-gray-500">{a.type}</div>
                        </div>
                        <div className="text-sm whitespace-pre-wrap">{a.body}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          ) : (
            <div>データが見つかりませんでした</div>
          )}
        </div>

        <div className="p-4 border-t flex justify-end">
          <Button variant="secondary" onClick={onClose}>閉じる</Button>
        </div>
      </div>
    </div>
  );
};

export default DealDetailPanel;

