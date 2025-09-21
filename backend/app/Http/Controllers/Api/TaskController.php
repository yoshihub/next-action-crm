<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TaskController extends Controller
{
    /**
     * タスク一覧を取得
     */
    public function index(Request $request): JsonResponse
    {
        $query = Task::with(['assignee', 'contact', 'deal']);

        // フィルタ条件
        if ($assigneeId = $request->get('assignee_id')) {
            $query->where('assignee_id', $assigneeId);
        }

        if ($contactId = $request->get('contact_id')) {
            $query->where('contact_id', $contactId);
        }

        if ($dealId = $request->get('deal_id')) {
            $query->where('deal_id', $dealId);
        }

        if ($priority = $request->get('priority')) {
            $query->priority($priority);
        }

        if ($status = $request->get('status')) {
            if ($status === 'completed') {
                $query->completed();
            } elseif ($status === 'pending') {
                $query->pending();
            }
        }

        $tasks = $query->orderBy('due_on')
            ->orderBy('priority', 'desc')
            ->paginate(20);

        return response()->json([
            'data' => TaskResource::collection($tasks->items()),
            'pagination' => [
                'current_page' => $tasks->currentPage(),
                'last_page' => $tasks->lastPage(),
                'per_page' => $tasks->perPage(),
                'total' => $tasks->total(),
            ],
        ]);
    }

    /**
     * タスクを取得
     */
    public function show(Task $task): JsonResponse
    {
        $task->load(['assignee', 'contact', 'deal']);

        return response()->json([
            'data' => new TaskResource($task),
        ]);
    }

    /**
     * タスクを作成
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'assignee_id' => 'required|exists:users,id',
            'contact_id' => 'nullable|exists:contacts,id',
            'deal_id' => 'nullable|exists:deals,id',
            'title' => 'required|string|max:255',
            'priority' => 'in:low,normal,high',
            'due_on' => 'required|date|after_or_equal:today',
        ]);

        $task = Task::create($request->all());

        return response()->json([
            'message' => 'タスクを作成しました。',
            'data' => new TaskResource($task->load(['assignee', 'contact', 'deal'])),
        ], 201);
    }

    /**
     * タスクを更新
     */
    public function update(Request $request, Task $task): JsonResponse
    {
        $request->validate([
            'title' => 'sometimes|string|max:255',
            'priority' => 'sometimes|in:low,normal,high',
            'due_on' => 'sometimes|date|after_or_equal:today',
        ]);

        $task->update($request->all());

        return response()->json([
            'message' => 'タスクを更新しました。',
            'data' => new TaskResource($task->load(['assignee', 'contact', 'deal'])),
        ]);
    }

    /**
     * タスクを削除
     */
    public function destroy(Task $task): JsonResponse
    {
        $task->delete();

        return response()->json([
            'message' => 'タスクを削除しました。',
        ]);
    }

    /**
     * タスクを完了にする
     */
    public function complete(Task $task): JsonResponse
    {
        $task->complete();

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
        $request->validate([
            'days' => 'integer|min:1|max:30',
        ]);

        $days = $request->get('days', 1);
        $task->postpone($days);

        return response()->json([
            'message' => "タスクを{$days}日延期しました。",
            'data' => new TaskResource($task->load(['assignee', 'contact', 'deal'])),
        ]);
    }
}

