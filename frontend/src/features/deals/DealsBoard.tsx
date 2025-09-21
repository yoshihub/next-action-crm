import React, { useMemo, useState } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../app/apiClient';
import type { Deal, DealsResponse } from '../../app/types';
import { Button } from '../../components/ui/Button';

const STAGES = ['lead', 'qualify', 'proposal', 'negotiation', 'won', 'lost'] as const;

type Stage = typeof STAGES[number];

interface BoardState {
  [K: string]: Deal[];
}

const STAGE_LABELS: Record<Stage, string> = {
  lead: 'リード',
  qualify: '見極め',
  proposal: '提案',
  negotiation: '交渉',
  won: '受注',
  lost: '失注',
};

const fetchDeals = async () => {
  const res = await apiClient.get<DealsResponse>('/deals');
  return res.data.data;
};

const Column: React.FC<{ stageId: string; title: string; children: React.ReactNode }> = ({ stageId, title, children }) => {
  const { setNodeRef } = useDroppable({ id: stageId });
  return (
    <div ref={setNodeRef} className="bg-gray-50 rounded-md p-3 border min-h-[200px]">
      <h2 className="font-semibold mb-2">{title}</h2>
      {children}
    </div>
  );
};

const SortableCard: React.FC<{ deal: Deal }> = ({ deal }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: String(deal.id) });
  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.7 : 1,
    cursor: 'grab',
  };
  return (
    <div ref={setNodeRef} style={style} className="bg-white rounded shadow p-2 mb-2 border" {...attributes} {...listeners}>
      <div className="font-medium">{deal.title}</div>
      <div className="text-sm text-gray-500">¥{deal.amount.toLocaleString()}</div>
      {deal.contact && (
        <div className="text-xs text-gray-400 mt-1">{deal.contact.name}</div>
      )}
    </div>
  );
};

const DealsBoard: React.FC = () => {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['deals-board'], queryFn: fetchDeals });
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const [board, setBoard] = useState<BoardState>({});
  // 作成UIは一旦削除

  React.useEffect(() => {
    if (data) {
      setBoard(data as unknown as BoardState);
    }
  }, [data]);

  const idsByStage = useMemo(() => {
    const m: Record<string, string[]> = {};
    STAGES.forEach((s) => {
      m[s] = (board[s] ?? []).map((d) => String(d.id));
    });
    return m;
  }, [board]);

  const findDealById = (id: string) => {
    for (const s of STAGES) {
      const idx = (board[s] ?? []).findIndex((d) => String(d.id) === id);
      if (idx >= 0) return { stage: s, index: idx, deal: board[s][idx] };
    }
    return null;
  };

  const moveApi = async (id: number, to_stage: Stage, to_index: number) => {
    await apiClient.post(`/deals/${id}/move`, { to_stage, to_index });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);

    let toStage: Stage | undefined;
    if ((STAGES as readonly string[]).includes(overId)) {
      toStage = overId as Stage;
    } else {
      const toStageEntry = Object.entries(idsByStage).find(([, ids]) => ids.includes(overId));
      toStage = toStageEntry ? (toStageEntry[0] as Stage) : undefined;
    }

    const src = findDealById(activeId);
    if (!src) return;

    let destIndex = 0;
    if (toStage) {
      if ((STAGES as readonly string[]).includes(overId)) {
        destIndex = (board[toStage] ?? []).length;
      } else {
        destIndex = (idsByStage[toStage] ?? []).indexOf(overId);
        if (destIndex < 0) destIndex = (board[toStage] ?? []).length;
      }
    }

    setBoard((prev) => {
      const copy: BoardState = { ...prev, [src.stage]: [...(prev[src.stage] ?? [])] };
      const [moved] = copy[src.stage].splice(src.index, 1);
      const targetStage = toStage ?? src.stage;
      const destArr = [...(copy[targetStage] ?? [])];
      destArr.splice(destIndex, 0, moved);
      copy[targetStage] = destArr;
      return copy;
    });

    try {
      await moveApi(Number(activeId), toStage ?? src.stage, destIndex * 10);
      await refetch();
    } catch (e) {
      await refetch();
    }
  };

  // 作成ロジックは一旦削除

  if (isLoading) return <div>読み込み中...</div>;
  if (error) return <div>取得に失敗しました</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">商談パイプライン</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => refetch()}>再取得</Button>
        </div>
      </div>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {STAGES.map((s) => (
            <Column key={s} stageId={s} title={STAGE_LABELS[s]}>
              <SortableContext items={idsByStage[s] ?? []} strategy={verticalListSortingStrategy}>
                {(board[s] ?? []).map((deal) => (
                  <SortableCard key={deal.id} deal={deal} />
                ))}
              </SortableContext>
            </Column>
          ))}
        </div>
      </DndContext>
      {/* 作成モーダルは一旦削除 */}
    </div>
  );
};

export default DealsBoard;
