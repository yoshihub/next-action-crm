<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\MoveDealRequest;
use App\Http\Requests\StoreDealRequest;
use App\Http\Resources\DealResource;
use App\Models\Deal;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DealController extends Controller
{
    /**
     * 商談一覧を取得（パイプライン用）
     */
    public function index(Request $request): JsonResponse
    {
        $stage = $request->get('stage');

        $query = Deal::with(['contact', 'owner'])
            ->whereNull('archived_at');

        if ($stage) {
            $query->inStage($stage);
        }

        $deals = $query->orderBy('order_index')
            ->get()
            ->groupBy('stage');

        return response()->json([
            'data' => $deals->map(function ($stageDeals) {
                return DealResource::collection($stageDeals);
            }),
        ]);
    }

    /**
     * 商談を取得
     */
    public function show(Deal $deal): JsonResponse
    {
        $deal->load(['contact', 'owner', 'activities', 'tasks']);

        return response()->json([
            'data' => new DealResource($deal),
        ]);
    }

    /**
     * 商談を作成
     */
    public function store(StoreDealRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = $request->user();

        // 所有者・チームを自動設定
        $data['owner_id'] = $user->id;
        $data['team_id'] = $user->current_team_id;

        // ステージと並び順（ギャップ法）を設定
        $stage = $data['stage'] ?? 'lead';
        $data['stage'] = $stage;
        $data['order_index'] = Deal::getNextOrderIndex($user->current_team_id, $stage);

        $deal = Deal::create($data);

        return response()->json([
            'message' => '商談を作成しました。',
            'data' => new DealResource($deal->load(['contact', 'owner'])),
        ], 201);
    }

    /**
     * 商談を更新
     */
    public function update(StoreDealRequest $request, Deal $deal): JsonResponse
    {
        $deal->update($request->validated());

        return response()->json([
            'message' => '商談を更新しました。',
            'data' => new DealResource($deal->load(['contact', 'owner'])),
        ]);
    }

    /**
     * 商談を削除
     */
    public function destroy(Deal $deal): JsonResponse
    {
        $deal->delete();

        return response()->json([
            'message' => '商談を削除しました。',
        ]);
    }

    /**
     * 商談を完了（アーカイブ）
     */
    public function complete(Deal $deal): JsonResponse
    {
        $deal->complete();

        return response()->json([
            'message' => '商談を完了しました。',
            'data' => new DealResource($deal->load(['contact', 'owner'])),
        ]);
    }

    /**
     * 商談を移動（D&D）
     */
    public function move(Deal $deal, MoveDealRequest $request): JsonResponse
    {
        $toStage = $request->validated()['to_stage'];
        $toIndex = $request->validated()['to_index'] ?? null;

        // ギャップ法でorder_indexを調整
        if ($toIndex === null) {
            $toIndex = Deal::getNextOrderIndex(
                $request->user()->current_team_id,
                $toStage
            );
        } else {
            // 既存のorder_indexを調整
            Deal::where('team_id', $request->user()->current_team_id)
                ->where('stage', $toStage)
                ->where('order_index', '>=', $toIndex)
                ->increment('order_index', 10);
        }

        $deal->moveToStage($toStage, $toIndex);

        return response()->json([
            'message' => '商談を移動しました。',
            'data' => new DealResource($deal->load(['contact', 'owner'])),
        ]);
    }
}
