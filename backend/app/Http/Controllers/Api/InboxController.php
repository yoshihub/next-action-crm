<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class InboxController extends Controller
{
    /**
     * 受信箱のタスクを取得
     */
    public function index(Request $request): JsonResponse
    {
        $scope = $request->get('scope', 'today');
        $assigneeId = $request->get('assignee_id');

        $query = Task::with(['assignee', 'contact', 'deal'])
            ->pending();

        // 連絡先のステータスが未完了のみ
        $query->whereHas('contact', function ($q) {
            $q->where('status', 'pending');
        });

        // 担当者でフィルタ
        if ($assigneeId) {
            $query->where('assignee_id', $assigneeId);
        }

        // スコープに応じてフィルタ
        switch ($scope) {
            case 'today':
                $query->today();
                break;
            case 'overdue':
                $query->overdue();
                break;
            case 'this_week':
                $query->thisWeek();
                break;
        }

        $tasks = $query->orderBy('due_on')
            ->orderBy('priority', 'desc')
            ->get();

        return response()->json([
            'data' => TaskResource::collection($tasks),
            'scope' => $scope,
            'count' => $tasks->count(),
        ]);
    }

    /**
     * タスクを完了にする
     */
    public function complete(Task $task): JsonResponse
    {
        $task->complete();
        if ($task->contact) {
            $task->contact->status = 'completed';
            $task->contact->save();
            $task->contact->completePendingFollowupTasks();
        }

        return response()->json([
            'message' => 'タスクを完了にしました。',
            'data' => new TaskResource($task->load(['assignee', 'contact', 'deal'])),
        ]);
    }

    /**
     * タスクを延期する
     */
    public function postpone(Task $task, Request $request): JsonResponse
    {
        $days = $request->get('days', 1);
        $task->postpone($days);

        // タスクの期日変更を連絡先にも同期
        if ($task->contact) {
            $task->contact->status = 'pending';
            $task->contact->next_action_on = $task->due_on;
            $task->contact->save();
        }

        return response()->json([
            'message' => "タスクを{$days}日延期しました。",
            'data' => new TaskResource($task->load(['assignee', 'contact', 'deal'])),
        ]);
    }
}
