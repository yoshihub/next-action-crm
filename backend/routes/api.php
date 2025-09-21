<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\DealController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\InboxController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Carbon;
use App\Models\Contact;
use App\Models\Deal;
use App\Models\Task;

// 認証不要のルート
Route::get('/health', function () {
    return response()->json([
        'ok' => true,
        'time' => now()->toDateTimeString(),
    ]);
});

// デモ用・公開API（簡易）
Route::get('/public/contacts', function () {
    return Contact::query()
        ->orderByDesc('id')
        ->limit(50)
        ->get();
});

Route::get('/public/deals', function () {
    return Deal::query()
        ->orderBy('stage')
        ->orderBy('order_index')
        ->limit(200)
        ->get();
});

Route::get('/public/inbox', function () {
    $scope = request('scope', 'today');
    $today = now()->toDateString();

    $query = Task::query()->whereNull('done_at');

    if ($scope === 'overdue') {
        $query->whereDate('due_on', '<', $today);
    } elseif ($scope === 'this_week') {
        $query->whereBetween('due_on', [now()->startOfWeek()->toDateString(), now()->endOfWeek()->toDateString()]);
    } else { // today
        $query->whereDate('due_on', '=', $today);
    }

    return [
        'scope' => $scope,
        'data' => $query->orderBy('due_on')->orderByDesc('id')->limit(100)->get(),
        'count' => $query->count(),
    ];
});
Route::post('/auth/login', [AuthController::class, 'login']);

// 認証が必要なルート
Route::middleware('auth:sanctum')->group(function () {
    // 認証関連
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/switch-team', [AuthController::class, 'switchTeam']);

    // 受信箱
    Route::get('/inbox', [InboxController::class, 'index']);
    Route::post('/inbox/{task}/complete', [InboxController::class, 'complete']);
    Route::post('/inbox/{task}/postpone', [InboxController::class, 'postpone']);

    // 連絡先
    Route::apiResource('contacts', ContactController::class);

    // 商談
    Route::apiResource('deals', DealController::class);
    Route::post('/deals/{deal}/move', [DealController::class, 'move']);

    // タスク
    Route::apiResource('tasks', TaskController::class);
    Route::post('/tasks/{task}/complete', [TaskController::class, 'complete']);
    Route::post('/tasks/{task}/postpone', [TaskController::class, 'postpone']);

    // 活動ログ
    Route::apiResource('activities', ActivityController::class);
});
