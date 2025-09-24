import React from 'react';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../app/apiClient';
import type { Contact, Deal } from '../../app/types';
import { Button } from '../../components/ui/Button';

interface DealCreateModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (deal: Deal) => void;
}

const fetchContacts = async (keyword: string) => {
  const res = await apiClient.get('/contacts', { params: { keyword, per_page: 10 } });
  const data = (res.data?.data ?? res.data) as Contact[];
  return Array.isArray(data) ? data : [];
};

const DealCreateModal: React.FC<DealCreateModalProps> = ({ open, onClose, onCreated }) => {
  const [keyword, setKeyword] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [stage, setStage] = useState<'lead' | 'qualify' | 'proposal' | 'negotiation' | 'won' | 'lost'>('lead');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setKeyword('');
      setSelectedContact(null);
      setTitle('');
      setAmount(0);
      setStage('lead');
      setError(null);
    }
  }, [open]);

  const { data: candidates = [] } = useQuery({
    queryKey: ['contacts-search', keyword],
    queryFn: () => fetchContacts(keyword),
    enabled: open && keyword.length >= 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact) {
      setError('連絡先を選択してください');
      return;
    }
    if (!title.trim()) {
      setError('タイトルを入力してください');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiClient.post('/deals', {
        contact_id: selectedContact.id,
        title: title.trim(),
        amount: Number(amount) || 0,
        stage,
      });
      const deal = (res.data?.data ?? res.data) as Deal;
      onCreated(deal);
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || '作成に失敗しました';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded shadow-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">商談を新規作成</h2>
          <button className="text-gray-500" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">連絡先</label>
            <input
              type="text"
              placeholder="名前・会社・メールで検索"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            {keyword && (
              <div className="mt-2 max-h-40 overflow-auto border rounded">
                {candidates.map((c) => (
                  <div
                    key={c.id}
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-50 ${selectedContact?.id === c.id ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelectedContact(c)}
                  >
                    <div className="text-sm font-medium">{c.name}</div>
                    <div className="text-xs text-gray-500">{c.company || c.email || '-'}</div>
                  </div>
                ))}
                {candidates.length === 0 && (
                  <div className="px-3 py-2 text-sm text-gray-500">該当なし</div>
                )}
              </div>
            )}
            {selectedContact && (
              <div className="mt-2 text-xs text-gray-600">選択中: {selectedContact.name}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">タイトル</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">金額</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={amount}
              onChange={(e) => {
                const onlyDigits = e.target.value.replace(/[^0-9]/g, '');
                setAmount(Number(onlyDigits || '0'));
              }}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">ステージ</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as any)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="lead">リード</option>
              <option value="qualify">見極め</option>
              <option value="proposal">提案</option>
              <option value="negotiation">交渉</option>
              <option value="won">受注</option>
              <option value="lost">失注</option>
            </select>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>キャンセル</Button>
            <Button type="submit" disabled={submitting}>{submitting ? '作成中...' : '作成'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DealCreateModal;
