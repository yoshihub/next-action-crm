import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { apiClient } from '../../app/apiClient';
import { Deal } from '../../app/types';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { PlusIcon as Plus, DollarSignIcon as DollarSign, TrendingUpIcon as TrendingUp, UserIcon as User } from '../../components/icons/Icons';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import DealCard from './DealCard';

const DealsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const { data: dealsData, isLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      const response = await apiClient.get('/deals');
      return response.data;
    },
  });

  const moveDealMutation = useMutation({
    mutationFn: async ({ dealId, toStage, toIndex }: { dealId: number; toStage: string; toIndex: number }) => {
      const response = await apiClient.post(`/deals/${dealId}/move`, {
        to_stage: toStage,
        to_index: toIndex,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });

  const stages = [
    { key: 'lead', label: 'リード', color: 'bg-gray-100' },
    { key: 'qualify', label: '見込み', color: 'bg-blue-100' },
    { key: 'proposal', label: '提案', color: 'bg-yellow-100' },
    { key: 'negotiation', label: '交渉', color: 'bg-orange-100' },
    { key: 'won', label: '受注', color: 'bg-green-100' },
    { key: 'lost', label: '失注', color: 'bg-red-100' },
  ];

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const dealId = parseInt(active.id as string);
    const newStage = over.id as string;

    // 同じステージ内での移動の場合は何もしない
    const currentDeal = findDealById(dealId);
    if (currentDeal && currentDeal.stage === newStage) {
      setActiveId(null);
      return;
    }

    // 新しいステージでのorder_indexを計算
    const newStageDeals = dealsData?.data[newStage] || [];
    const newIndex = newStageDeals.length * 10 + 10;

    moveDealMutation.mutate({
      dealId,
      toStage: newStage,
      toIndex: newIndex,
    });

    setActiveId(null);
  };

  const findDealById = (dealId: number): Deal | null => {
    for (const stageDeals of Object.values(dealsData?.data || {})) {
      const deal = stageDeals.find((d: Deal) => d.id === dealId);
      if (deal) return deal;
    }
    return null;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">商談パイプライン</h1>
          <p className="mt-1 text-sm text-gray-500">
            商談の進捗をステージごとに管理します
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          新規作成
        </Button>
      </div>

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {stages.map((stage) => {
            const stageDeals = dealsData?.data[stage.key] || [];
            const totalAmount = stageDeals.reduce((sum: number, deal: Deal) => sum + deal.amount, 0);

            return (
              <div key={stage.key} className="space-y-4">
                <Card className={`${stage.color} border-0`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-900">
                      {stage.label}
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-600">
                      {stageDeals.length}件 • {formatCurrency(totalAmount)}
                    </CardDescription>
                  </CardHeader>
                </Card>

                <SortableContext
                  items={stageDeals.map((deal: Deal) => deal.id.toString())}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3 min-h-[200px]">
                    {stageDeals.map((deal: Deal) => (
                      <DealCard key={deal.id} deal={deal} />
                    ))}
                  </div>
                </SortableContext>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeId ? (
            <DealCard deal={findDealById(parseInt(activeId))!} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default DealsPage;
