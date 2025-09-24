import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../app/apiClient';
import type { ApiResponse, Deal } from '../../app/types';
import { Button } from '../../components/ui/Button';

const STAGE_LABELS: Record<string, string> = {
  lead: 'リード',
  qualify: '見極め',
  proposal: '提案',
  negotiation: '交渉',
  won: '受注',
  lost: '失注',
};

interface DealDetailPanelProps {
  open: boolean;
  dealId: number | null;
  onClose: () => void;
}

const fetchDeal = async (id: number) => {
  const res = await apiClient.get<ApiResponse<Deal>>(`/deals/${id}`);
  return res.data.data;
};



const DealDetailPanel: React.FC<DealDetailPanelProps> = ({ open, dealId, onClose }) => {
  const enabled = open && !!dealId;
  const { data: deal, isLoading, error } = useQuery({
    queryKey: ['deal-detail', dealId],
    queryFn: () => fetchDeal(dealId as number),
    enabled,
  });
  // 商談詳細のタスク表示は不要のため削除

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
                  <div className="font-medium">{STAGE_LABELS[deal.stage] ?? deal.stage}</div>
                </div>
              </div>

              {deal.contact && (
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">連絡先</div>
                  <div className="font-medium">{deal.contact.name}</div>
                  {(deal.contact.phone || deal.contact.email) && (
                    <div className="mt-1 space-y-1 text-sm">
                      {deal.contact.phone && (
                        <div>
                          <span className="text-gray-500 mr-2">電話</span>
                          <a href={`tel:${deal.contact.phone}`} className="text-blue-600 hover:underline">
                            {deal.contact.phone}
                          </a>
                        </div>
                      )}
                      {deal.contact.email && (
                        <div>
                          <span className="text-gray-500 mr-2">メール</span>
                          <a href={`mailto:${deal.contact.email}`} className="text-blue-600 hover:underline">
                            {deal.contact.email}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* タスク表示は削除 */}

              {/* 活動ログ機能は削除 */}
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
