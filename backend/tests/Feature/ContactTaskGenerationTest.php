<?php

use App\Models\User;
use App\Models\Team;
use App\Models\Contact;
use App\Models\Task;

test('連絡先の次回フォロー日更新でタスクが自動作成される', function () {
    // ユーザーとチームを作成
    $user = User::factory()->create();
    $team = Team::factory()->create(['owner_id' => $user->id]);
    $user->update(['current_team_id' => $team->id]);

    // 連絡先を作成
    $contact = Contact::factory()->create([
        'team_id' => $team->id,
        'owner_id' => $user->id,
        'next_action_on' => null,
    ]);

    // 次回フォロー日を設定
    $nextActionDate = now()->addDays(3);
    $contact->update(['next_action_on' => $nextActionDate]);

    // タスクが自動作成されたことを確認
    $this->assertDatabaseHas('tasks', [
        'team_id' => $team->id,
        'assignee_id' => $user->id,
        'contact_id' => $contact->id,
        'title' => '次回フォロー',
        'due_on' => $nextActionDate->format('Y-m-d'),
        'priority' => 'normal',
        'done_at' => null,
    ]);
});

test('同名の未完了タスクが存在する場合は重複作成されない', function () {
    // ユーザーとチームを作成
    $user = User::factory()->create();
    $team = Team::factory()->create(['owner_id' => $user->id]);
    $user->update(['current_team_id' => $team->id]);

    // 連絡先を作成
    $contact = Contact::factory()->create([
        'team_id' => $team->id,
        'owner_id' => $user->id,
        'next_action_on' => now()->addDays(3),
    ]);

    // 既存のタスクを作成
    Task::factory()->create([
        'team_id' => $team->id,
        'assignee_id' => $user->id,
        'contact_id' => $contact->id,
        'title' => '次回フォロー',
        'due_on' => now()->addDays(3),
        'done_at' => null,
    ]);

    // 次回フォロー日を更新
    $contact->update(['next_action_on' => now()->addDays(5)]);

    // タスクが1つしか存在しないことを確認
    $taskCount = Task::where('contact_id', $contact->id)
        ->where('title', '次回フォロー')
        ->whereNull('done_at')
        ->count();

    expect($taskCount)->toBe(1);
});

test('完了済みタスクがある場合は新しいタスクが作成される', function () {
    // ユーザーとチームを作成
    $user = User::factory()->create();
    $team = Team::factory()->create(['owner_id' => $user->id]);
    $user->update(['current_team_id' => $team->id]);

    // 連絡先を作成
    $contact = Contact::factory()->create([
        'team_id' => $team->id,
        'owner_id' => $user->id,
        'next_action_on' => now()->addDays(3),
    ]);

    // 完了済みのタスクを作成
    Task::factory()->create([
        'team_id' => $team->id,
        'assignee_id' => $user->id,
        'contact_id' => $contact->id,
        'title' => '次回フォロー',
        'due_on' => now()->addDays(3),
        'done_at' => now(),
    ]);

    // 次回フォロー日を更新
    $contact->update(['next_action_on' => now()->addDays(5)]);

    // 新しいタスクが作成されたことを確認
    $taskCount = Task::where('contact_id', $contact->id)
        ->where('title', '次回フォロー')
        ->count();

    expect($taskCount)->toBe(2);
});

