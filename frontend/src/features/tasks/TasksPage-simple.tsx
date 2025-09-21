import React from 'react';

const TasksPageSimple: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>タスク - シンプル版</h1>
      <p>types.tsを使わないシンプルなタスクページです。</p>

      <div style={{ marginTop: '20px', display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1, padding: '10px', backgroundColor: '#e8f5e8', borderRadius: '5px' }}>
          <h2>今日のタスク</h2>
          <ul>
            <li>田中さんに電話</li>
            <li>見積書作成</li>
            <li>会議資料準備</li>
          </ul>
        </div>

        <div style={{ flex: 1, padding: '10px', backgroundColor: '#fff3cd', borderRadius: '5px' }}>
          <h2>今週のタスク</h2>
          <ul>
            <li>プロジェクト提案書作成</li>
            <li>顧客訪問</li>
            <li>月次レポート作成</li>
          </ul>
        </div>

        <div style={{ flex: 1, padding: '10px', backgroundColor: '#f8d7da', borderRadius: '5px' }}>
          <h2>遅延タスク</h2>
          <ul>
            <li>資料整理（2日遅延）</li>
            <li>フォローアップ（1日遅延）</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TasksPageSimple;

