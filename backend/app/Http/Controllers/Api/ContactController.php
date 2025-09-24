<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactRequest;
use App\Http\Requests\UpdateContactRequest;
use App\Http\Resources\ContactResource;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ContactController extends Controller
{
    /**
     * 連絡先一覧を取得
     */
    public function index(Request $request): JsonResponse
    {
        $query = Contact::with(['owner']);

        // 検索条件
        if ($keyword = $request->get('keyword')) {
            $query->where(function ($q) use ($keyword) {
                $q->where('name', 'like', "%{$keyword}%")
                    ->orWhere('company', 'like', "%{$keyword}%")
                    ->orWhere('email', 'like', "%{$keyword}%");
            });
        }

        if ($tag = $request->get('tag')) {
            $query->withTag($tag);
        }

        if ($ownerId = $request->get('owner_id')) {
            $query->where('owner_id', $ownerId);
        }

        if ($nextAction = $request->get('next_action')) {
            $query->where('next_action_on', $nextAction);
        }

        // 並び替え・ページング
        $allowedSorts = [
            'name',
            'company',
            'email',
            'next_action_on',
            'priority',
            'created_at',
            'updated_at',
        ];
        $sortBy = $request->get('sort_by');
        if (!in_array($sortBy, $allowedSorts, true)) {
            $sortBy = 'name';
        }

        $sortDir = strtolower((string) $request->get('sort_dir', 'asc')) === 'desc' ? 'desc' : 'asc';

        $perPage = (int) $request->get('per_page', 20);
        if ($perPage < 1) {
            $perPage = 1;
        }
        if ($perPage > 100) {
            $perPage = 100;
        }

        $contacts = $query->orderBy($sortBy, $sortDir)
            ->paginate($perPage);

        return response()->json([
            'data' => ContactResource::collection($contacts->items()),
            'pagination' => [
                'current_page' => $contacts->currentPage(),
                'last_page' => $contacts->lastPage(),
                'per_page' => $contacts->perPage(),
                'total' => $contacts->total(),
            ],
        ]);
    }

    /**
     * 連絡先を取得
     */
    public function show(Contact $contact): JsonResponse
    {
        $contact->load(['owner', 'deals', 'activities', 'tasks']);

        return response()->json([
            'data' => new ContactResource($contact),
        ]);
    }

    /**
     * 連絡先を作成
     */
    public function store(StoreContactRequest $request): JsonResponse
    {
        $data = $request->validated();
        // 所有者は認証ユーザーに自動設定
        $data['owner_id'] = $request->user()->id;
        $contact = Contact::create($data);

        // 次回フォロータスクを自動作成（連絡先の優先度を反映）
        $contact->createNextActionTask($data['priority'] ?? 'normal');

        return response()->json([
            'message' => '連絡先を作成しました。',
            'data' => new ContactResource($contact->load('owner')),
        ], 201);
    }

    /**
     * 連絡先を更新
     */
    public function update(UpdateContactRequest $request, Contact $contact): JsonResponse
    {
        $oldNextActionOn = $contact->next_action_on;

        $contact->update($request->validated());

        // next_action_onが変更された場合、タスクを自動作成（連絡先の優先度を反映）
        if ($oldNextActionOn !== $contact->next_action_on) {
            $contact->createNextActionTask($request->get('priority', 'normal'));
        }

        return response()->json([
            'message' => '連絡先を更新しました。',
            'data' => new ContactResource($contact->load('owner')),
        ]);
    }

    /**
     * 連絡先を削除
     */
    public function destroy(Contact $contact): JsonResponse
    {
        $contact->delete();

        return response()->json([
            'message' => '連絡先を削除しました。',
        ]);
    }
}
