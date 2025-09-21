import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../app/apiClient';
import type { Contact, PaginatedResponse } from '../../app/types';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import ContactForm from './ContactForm';
import type { ContactFormValues } from './ContactForm';

interface ContactsQueryParams {
  page: number;
  per_page: number;
  keyword?: string;
  owner_id?: number;
  tag?: string;
  next_action?: string;
  sort_by: string;
  sort_dir: 'asc' | 'desc';
}

const defaultParams: ContactsQueryParams = {
  page: 1,
  per_page: 20,
  sort_by: 'name',
  sort_dir: 'asc',
};

const fetchContacts = async (params: ContactsQueryParams) => {
  const res = await apiClient.get<PaginatedResponse<Contact>>('/contacts', { params });
  return res.data;
};

const columns: { key: keyof Contact | 'owner_name' | 'actions'; label: string; sortable?: boolean }[] = [
  { key: 'name', label: '名前', sortable: true },
  { key: 'company', label: '会社', sortable: true },
  { key: 'email', label: 'メール', sortable: true },
  { key: 'phone', label: '電話' },
  { key: 'next_action_on', label: '次回フォロー', sortable: true },
  { key: 'score', label: 'スコア', sortable: true },
  { key: 'owner_name', label: '担当者' },
  { key: 'updated_at', label: '更新日', sortable: true },
  { key: 'actions', label: '', sortable: false },
];

const ContactsPage: React.FC = () => {
  const [params, setParams] = useState<ContactsQueryParams>(() => ({ ...defaultParams }));
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['contacts', params],
    queryFn: () => fetchContacts(params),
    keepPreviousData: true,
  });

  const [keywordInput, setKeywordInput] = useState<string>('');

  // モーダル制御
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Contact | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setParams((p) => ({ ...p, page: 1, keyword: keywordInput || undefined }));
    }, 400);
    return () => clearTimeout(t);
  }, [keywordInput]);

  const onSort = (key: string) => {
    if (!key) return;
    setParams((p) => {
      const dir: 'asc' | 'desc' = p.sort_by === key ? (p.sort_dir === 'asc' ? 'desc' : 'asc') : 'asc';
      return { ...p, sort_by: key, sort_dir: dir };
    });
  };

  const total = data?.pagination.total ?? 0;
  const currentPage = data?.pagination.current_page ?? 1;
  const lastPage = data?.pagination.last_page ?? 1;

  const gotoPage = (page: number) => setParams((p) => ({ ...p, page }));

  const headerCells = useMemo(() => columns.map((col) => (
    <th
      key={String(col.key)}
      className="px-3 py-2 text-left text-sm font-semibold text-gray-700"
      onClick={() => col.sortable && onSort(col.key as string)}
    >
      <span className={`inline-flex items-center gap-1 ${col.sortable ? 'cursor-pointer select-none' : ''}`}>
        {col.label}
        {col.sortable && params.sort_by === col.key && (
          <span className="text-gray-400">{params.sort_dir === 'asc' ? '▲' : '▼'}</span>
        )}
      </span>
    </th>
  )), [params.sort_by, params.sort_dir]);

  const sanitize = (values: ContactFormValues) => {
    const payload: Record<string, unknown> = { ...values };
    // 空文字を送らない（Laravelのnullableに合わせる）
    Object.keys(payload).forEach((k) => {
      const v = (payload as any)[k];
      if (v === '') {
        delete (payload as any)[k];
      }
    });
    return payload;
  };

  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleCreate = async (values: ContactFormValues) => {
    setSubmitError(null);
    try {
      await apiClient.post('/contacts', sanitize(values));
      setCreateOpen(false);
      await refetch();
    } catch (e: any) {
      setSubmitError(e?.response?.data?.message || '作成に失敗しました');
    }
  };

  const handleUpdate = async (id: number, values: ContactFormValues) => {
    setSubmitError(null);
    try {
      await apiClient.patch(`/contacts/${id}`, sanitize(values));
      setEditTarget(null);
      await refetch();
    } catch (e: any) {
      setSubmitError(e?.response?.data?.message || '更新に失敗しました');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">連絡先</h1>
        <Button onClick={() => setCreateOpen(true)}>新規作成</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>検索</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 items-center">
            <Input
              placeholder="キーワード（名前/会社/メール）"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              className="w-80"
            />
            <Button onClick={() => refetch()} disabled={isFetching}>再取得</Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 overflow-x-auto bg-white border rounded-md">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              {headerCells}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-3 py-3" colSpan={columns.length}>読み込み中...</td>
              </tr>
            ) : error ? (
              <tr>
                <td className="px-3 py-3 text-red-600" colSpan={columns.length}>エラーが発生しました</td>
              </tr>
            ) : (data?.data ?? []).length === 0 ? (
              <tr>
                <td className="px-3 py-3" colSpan={columns.length}>データがありません</td>
              </tr>
            ) : (
              data!.data.map((c) => (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2">{c.name}</td>
                  <td className="px-3 py-2">{c.company ?? '-'}</td>
                  <td className="px-3 py-2">{c.email ?? '-'}</td>
                  <td className="px-3 py-2">{c.phone ?? '-'}</td>
                  <td className="px-3 py-2">{c.next_action_on ?? '-'}</td>
                  <td className="px-3 py-2">{c.score}</td>
                  <td className="px-3 py-2">{c.owner?.name ?? '-'}</td>
                  <td className="px-3 py-2">{new Date(c.updated_at).toLocaleString()}</td>
                  <td className="px-3 py-2 text-right">
                    <Button variant="secondary" size="sm" onClick={() => setEditTarget(c)}>編集</Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm text-gray-600">全{total}件</div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" disabled={currentPage <= 1} onClick={() => gotoPage(currentPage - 1)}>前へ</Button>
          <span className="text-sm">{currentPage} / {lastPage}</span>
          <Button variant="secondary" disabled={currentPage >= lastPage} onClick={() => gotoPage(currentPage + 1)}>次へ</Button>
          <select
            className="ml-2 border rounded px-2 py-1 text-sm"
            value={params.per_page}
            onChange={(e) => setParams((p) => ({ ...p, page: 1, per_page: Number(e.target.value) }))}
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>{n}件/頁</option>
            ))}
          </select>
        </div>
      </div>

      {/* 新規作成モーダル（簡易実装: カードで代替） */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-lg w-full max-w-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">連絡先を作成</h2>
            {submitError && (
              <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">{submitError}</div>
            )}
            <ContactForm
              onSubmit={async (v) => {
                await handleCreate(v);
              }}
              onCancel={() => setCreateOpen(false)}
              submitLabel="作成"
            />
          </div>
        </div>
      )}

      {/* 編集モーダル */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-lg w-full max-w-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">連絡先を編集</h2>
            {submitError && (
              <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">{submitError}</div>
            )}
            <ContactForm
              defaultValues={editTarget}
              onSubmit={async (v) => {
                await handleUpdate(editTarget.id, v);
              }}
              onCancel={() => setEditTarget(null)}
              submitLabel="更新"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsPage;
