import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../app/apiClient';

const DealsPageSimple: React.FC = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['public-deals'],
    queryFn: async () => (await apiClient.get('/public/deals')).data as any[],
  });

  const grouped = useMemo(() => {
    const map: Record<string, any[]> = { lead: [], qualify: [], proposal: [], negotiation: [], won: [], lost: [] };
    (data || []).forEach((d) => { map[d.stage]?.push(d); });
    return map;
  }, [data]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>商談 - シンプル版（API連携）</h1>
      <p>公開API /public/deals の内容を表示します。</p>

      {isLoading && <p>読み込み中...</p>}
      {isError && <p style={{ color: 'red' }}>エラー: {(error as any)?.message}</p>}

      {!isLoading && !isError && (
        <div style={{ marginTop: '20px', display: 'flex', gap: '20px' }}>
          {(
            [
              { key: 'lead', title: 'リード', bg: '#e8f5e8' },
              { key: 'qualify', title: '一次判断', bg: '#fff3cd' },
              { key: 'proposal', title: '提案', bg: '#d1ecf1' },
              { key: 'negotiation', title: '交渉', bg: '#fde2e4' },
              { key: 'won', title: '受注', bg: '#d4edda' },
              { key: 'lost', title: '失注', bg: '#f8d7da' },
            ] as const
          ).map((col) => (
            <div key={col.key} style={{ flex: 1, padding: '10px', backgroundColor: col.bg, borderRadius: '5px' }}>
              <h2>{col.title}（{grouped[col.key]?.length ?? 0}）</h2>
              <ul>
                {grouped[col.key]?.map((d) => (
                  <li key={d.id}>{d.title} - ¥{d.amount?.toLocaleString?.() ?? d.amount}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DealsPageSimple;
