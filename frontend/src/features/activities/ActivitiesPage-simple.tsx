import React from 'react';

const ActivitiesPageSimple: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>活動ログ - シンプル版</h1>
      <p>types.tsを使わないシンプルな活動ログページです。</p>

      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e8f5e8', borderRadius: '5px' }}>
        <h2>最近の活動</h2>
        <ul>
          <li>2025/9/20 14:30 - 田中さんと電話会議</li>
          <li>2025/9/20 10:15 - 佐藤さんにメール送信</li>
          <li>2025/9/19 16:45 - 鈴木さんと面談</li>
          <li>2025/9/19 09:30 - プロジェクト会議</li>
        </ul>
      </div>

      <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '5px' }}>
        <h2>今週の活動</h2>
        <ul>
          <li>電話: 5件</li>
          <li>メール: 12件</li>
          <li>面談: 3件</li>
          <li>会議: 2件</li>
        </ul>
      </div>

      <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#d1ecf1', borderRadius: '5px' }}>
        <h2>活動統計</h2>
        <ul>
          <li>今月の総活動数: 45件</li>
          <li>最も多い活動: メール (60%)</li>
          <li>平均活動数/日: 2.3件</li>
        </ul>
      </div>
    </div>
  );
};

export default ActivitiesPageSimple;

