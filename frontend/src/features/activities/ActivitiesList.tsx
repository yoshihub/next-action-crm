import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../app/apiClient';
import type { Activity, PaginatedResponse } from '../../app/types';
import { Button } from '../../components/ui/Button';

interface Params {
  page: number;
  per_page: number;
  type?: 'call' | 'meeting' | 'mail' | 'note';
  start_date?: string;
  end_date?: string;
}

const defaultParams: Params = { page: 1, per_page: 20 };

const fetchActivities = async (params: Params) => {
  const res = await apiClient.get<PaginatedResponse<Activity>>('/activities', { params });
  return res.data;
};

const ActivitiesList: React.FC = () => {
  const [params, setParams] = useState<Params>({ ...defaultParams });
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['activities', params],
    queryFn: () => fetchActivities(params),
    keepPreviousData: true,
  });

  const rows = useMemo(() => data?.data ?? [], [data]);

  const total = data?.pagination.total ?? 0;
  const currentPage = data?.pagination.current_page ?? 1;
  const lastPage = data?.pagination.last_page ?? 1;

  const gotoPage = (page: number) => setParams((p) => ({ ...p, page }));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">活動ログ</h1>
        <div className="flex items-center gap-2">
          <select
            className="border rounded px-2 py-1 text-sm"
            value={params.type ?? ''}
            onChange={(e) => setParams((p) => ({ ...p, page: 1, type: (e.target.value || undefined) as Params['type'] }))}
          >
            <option value="">全タイプ</option>
            <option value="call">通話</option>
            <option value="meeting">面談</option>
            <option value="mail">メール</option>
            <option value="note">ノート</option>
          </select>
          <input
            type="date"
            className="border rounded px-2 py-1 text-sm"
            value={params.start_date ?? ''}
            onChange={(e) => setParams((p) => ({ ...p, page: 1, start_date: e.target.value || undefined }))}
          />
          <input
            type="date"
            className="border rounded px-2 py-1 text-sm"
            value={params.end_date ?? ''}
            onChange={(e) => setParams((p) => ({ ...p, page: 1, end_date: e.target.value || undefined }))}
          />
          <Button variant="secondary" onClick={() => refetch()} disabled={isFetching}>再取得</Button>
        </div>
      </div>

      {isLoading ? (
        <div>読み込み中...</div>
      ) : error ? (
        <div className="text-red-600">取得に失敗しました</div>
      ) : (
        <div className="space-y-2">
          {rows.length === 0 && <div className="text-gray-600">活動ログはありません</div>}
          {rows.map((a) => (
            <div key={a.id} className="bg-white border rounded p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">
                  {a.type} / {new Date(a.occurred_at).toLocaleString()}
                </div>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {a.body}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {a.user && <span>担当: {a.user.name}</span>}
                {a.contact && <span className="ml-2">連絡先: {a.contact.name}</span>}
                {a.deal && <span className="ml-2">商談: {a.deal.title}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

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

export default ActivitiesList;
