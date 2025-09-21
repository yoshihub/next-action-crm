import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../app/apiClient';

const InboxPageSimple: React.FC = () => {
  const today = useQuery({
    queryKey: ['public-inbox', 'today'],
    queryFn: async () => (await apiClient.get('/public/inbox?scope=today')).data,
  });
  const overdue = useQuery({
    queryKey: ['public-inbox', 'overdue'],
    queryFn: async () => (await apiClient.get('/public/inbox?scope=overdue')).data,
  });
  const thisWeek = useQuery({
    queryKey: ['public-inbox', 'this_week'],
    queryFn: async () => (await apiClient.get('/public/inbox?scope=this_week')).data,
  });

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>受信箱 - シンプル版（API連携）</h1>
      <p>公開API /public/inbox の内容を表示します。</p>

      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e8f5e8', borderRadius: '5px' }}>
        <h2>今日のタスク（{today.data?.count ?? 0}）</h2>
        {today.isLoading ? (
          <p>読み込み中...</p>
        ) : today.isError ? (
          <p style={{ color: 'red' }}>エラー</p>
        ) : (
          <ul>
            {today.data?.data?.map((t: any) => (
              <li key={t.id}>{t.title}（{t.due_on?.slice(0, 10)}）</li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '5px' }}>
        <h2>遅延タスク（{overdue.data?.count ?? 0}）</h2>
        {overdue.isLoading ? (
          <p>読み込み中...</p>
        ) : overdue.isError ? (
          <p style={{ color: 'red' }}>エラー</p>
        ) : (
          <ul>
            {overdue.data?.data?.map((t: any) => (
              <li key={t.id}>{t.title}（{t.due_on?.slice(0, 10)}）</li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#d1ecf1', borderRadius: '5px' }}>
        <h2>今週のタスク（{thisWeek.data?.count ?? 0}）</h2>
        {thisWeek.isLoading ? (
          <p>読み込み中...</p>
        ) : thisWeek.isError ? (
          <p style={{ color: 'red' }}>エラー</p>
        ) : (
          <ul>
            {thisWeek.data?.data?.map((t: any) => (
              <li key={t.id}>{t.title}（{t.due_on?.slice(0, 10)}）</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default InboxPageSimple;
