import React from 'react';

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Next Action CRM - テストページ</h1>
      <p>このページが表示されれば、Reactは正常に動作しています。</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <h2>デバッグ情報</h2>
        <p>現在の時刻: {new Date().toLocaleString()}</p>
        <p>React バージョン: {React.version}</p>
      </div>
    </div>
  );
}

export default App;

