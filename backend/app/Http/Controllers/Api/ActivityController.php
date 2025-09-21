<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ActivityResource;
use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ActivityController extends Controller
{
    /**
     * 活動ログ一覧を取得
     */
    public function index(Request $request): JsonResponse
    {
        $query = Activity::with(['user', 'contact', 'deal']);

        // フィルタ条件
        if ($contactId = $request->get('contact_id')) {
            $query->forContact($contactId);
        }

        if ($dealId = $request->get('deal_id')) {
            $query->forDeal($dealId);
        }

        if ($type = $request->get('type')) {
            $query->ofType($type);
        }

        if ($startDate = $request->get('start_date')) {
            $endDate = $request->get('end_date', now());
            $query->inDateRange($startDate, $endDate);
        }

        $activities = $query->orderBy('occurred_at', 'desc')
            ->paginate(20);

        return response()->json([
            'data' => ActivityResource::collection($activities->items()),
            'pagination' => [
                'current_page' => $activities->currentPage(),
                'last_page' => $activities->lastPage(),
                'per_page' => $activities->perPage(),
                'total' => $activities->total(),
            ],
        ]);
    }

    /**
     * 活動ログを取得
     */
    public function show(Activity $activity): JsonResponse
    {
        $activity->load(['user', 'contact', 'deal']);

        return response()->json([
            'data' => new ActivityResource($activity),
        ]);
    }

    /**
     * 活動ログを作成
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'contact_id' => 'required|exists:contacts,id',
            'deal_id' => 'nullable|exists:deals,id',
            'type' => 'required|in:call,meeting,mail,note',
            'occurred_at' => 'required|date',
            'body' => 'required|string',
        ]);

        $activity = Activity::create([
            ...$request->all(),
            'user_id' => auth()->id(),
        ]);

        return response()->json([
            'message' => '活動ログを作成しました。',
            'data' => new ActivityResource($activity->load(['user', 'contact', 'deal'])),
        ], 201);
    }

    /**
     * 活動ログを更新
     */
    public function update(Request $request, Activity $activity): JsonResponse
    {
        $request->validate([
            'type' => 'sometimes|in:call,meeting,mail,note',
            'occurred_at' => 'sometimes|date',
            'body' => 'sometimes|string',
        ]);

        $activity->update($request->all());

        return response()->json([
            'message' => '活動ログを更新しました。',
            'data' => new ActivityResource($activity->load(['user', 'contact', 'deal'])),
        ]);
    }

    /**
     * 活動ログを削除
     */
    public function destroy(Activity $activity): JsonResponse
    {
        $activity->delete();

        return response()->json([
            'message' => '活動ログを削除しました。',
        ]);
    }
}
