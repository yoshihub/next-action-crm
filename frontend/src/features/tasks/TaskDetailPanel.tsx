import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../app/apiClient';
import type { ApiResponse, Task } from '../../app/types';
import { Button } from '../../components/ui/Button';

interface TaskDetailPanelProps {
  open: boolean;
  taskId: number | null;
  onClose: () => void;
}

const fetchTask = async (id: number) => {
  const res = await apiClient.get<ApiResponse<Task>>(`/tasks/${id}`);
  return res.data.data;
};

const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({ open, taskId, onClose }) => {
  const enabled = open && !!taskId;
  const { data: task, isLoading, error } = useQuery({
    queryKey: ['task-detail', taskId],
    queryFn: () => fetchTask(taskId as number),
    enabled,
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-xl flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="font-semibold">タスク詳細</div>
          <button className="text-gray-500" onClick={onClose}>×</button>
        </div>

        <div className="p-4 space-y-4 overflow-auto">
          {isLoading ? (
            <div>読み込み中...</div>
          ) : error ? (
            <div className="text-red-600">取得に失敗しました</div>
          ) : task ? (
            <>
              <div>
                <div className="text-sm text-gray-500">タイトル</div>
                <div className="text-lg font-medium">{task.title}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">期限</div>
                  <div className="font-medium">{new Date(task.due_on).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">優先度</div>
                  <div className="font-medium">{task.priority}</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500">ステータス</div>
                <div className="font-medium">{task.is_completed ? '完了' : '未完了'}</div>
              </div>

              {task.contact && (
                <div className="space-y-2">
                  <div>
                    <div className="text-sm text-gray-500">連絡先</div>
                    <div className="font-medium">{task.contact.name}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {task.contact.company && (
                      <div>
                        <div className="text-gray-500">会社</div>
                        <div className="font-medium">{task.contact.company}</div>
                      </div>
                    )}
                    {task.contact.type && (
                      <div>
                        <div className="text-gray-500">種別</div>
                        <div className="font-medium">{task.contact.type === 'person' ? '個人' : '企業'}</div>
                      </div>
                    )}
                    {task.contact.priority && (
                      <div>
                        <div className="text-gray-500">優先度</div>
                        <div className="font-medium">{task.contact.priority}</div>
                      </div>
                    )}
                    {task.contact.next_action_on && (
                      <div>
                        <div className="text-gray-500">次回フォロー日</div>
                        <div className="font-medium">{task.contact.next_action_on}</div>
                      </div>
                    )}
                  </div>

                  {(task.contact.phone || task.contact.email) && (
                    <div className="mt-1 space-y-1 text-sm">
                      {task.contact.phone && (
                        <div>
                          <span className="text-gray-500 mr-2">電話</span>
                          <a href={`tel:${task.contact.phone}`} className="text-blue-600 hover:underline">
                            {task.contact.phone}
                          </a>
                        </div>
                      )}
                      {task.contact.email && (
                        <div>
                          <span className="text-gray-500 mr-2">メール</span>
                          <a href={`mailto:${task.contact.email}`} className="text-blue-600 hover:underline">
                            {task.contact.email}
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {task.contact.note && (
                    <div>
                      <div className="text-sm text-gray-500">メモ</div>
                      <div className="text-sm whitespace-pre-wrap">{task.contact.note}</div>
                    </div>
                  )}
                </div>
              )}

              {task.deal && (
                <div>
                  <div className="text-sm text-gray-500">商談</div>
                  <div className="font-medium">{task.deal.title}</div>
                </div>
              )}
            </>
          ) : (
            <div>データが見つかりませんでした</div>
          )}
        </div>

        <div className="p-4 border-t flex justify-end">
          <Button variant="secondary" onClick={onClose}>閉じる</Button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPanel;
