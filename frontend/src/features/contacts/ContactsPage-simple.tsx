import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../app/apiClient';

const ContactsPageSimple: React.FC = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['public-contacts'],
    queryFn: async () => {
      const res = await apiClient.get('/public/contacts');
      return res.data as any[];
    },
  });

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>連絡先 - シンプル版（API連携）</h1>
      <p>公開API /public/contacts の内容を表示します。</p>

      {isLoading && <p>読み込み中...</p>}
      {isError && <p style={{ color: 'red' }}>エラー: {(error as any)?.message}</p>}

      {!isLoading && !isError && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e8f5e8', borderRadius: '5px' }}>
          <h2>最新50件</h2>
          <ul>
            {data?.map((c) => (
              <li key={c.id}>
                {c.name} {c.email ? `- ${c.email}` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ContactsPageSimple;
