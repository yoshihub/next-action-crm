<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Team;
use App\Models\Contact;
use App\Models\Deal;
use App\Models\Task;
use App\Models\Activity;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // テストユーザーを作成
        $user = User::factory()->create([
            'name' => 'テストユーザー',
            'email' => 'test@example.com',
            'timezone' => 'Asia/Tokyo',
        ]);

        // チームを作成
        $team = Team::factory()->create([
            'name' => 'テストチーム',
            'owner_id' => $user->id,
        ]);

        $user->update(['current_team_id' => $team->id]);

        // チームメンバーを作成
        $member = User::factory()->create([
            'name' => 'メンバー',
            'email' => 'member@example.com',
            'timezone' => 'Asia/Tokyo',
        ]);
        $member->update(['current_team_id' => $team->id]);
        $team->users()->attach($member->id, ['role' => 'member']);

        // 連絡先を作成
        Contact::factory(20)->create([
            'team_id' => $team->id,
        ])->each(function ($contact) use ($team, $user) {
            // 50%の確率で次回フォロー日を設定
            if (rand(0, 1)) {
                $contact->update([
                    'next_action_on' => now()->addDays(rand(1, 7)),
                ]);
            }
        });

        // 商談を作成
        Deal::factory(15)->create([
            'team_id' => $team->id,
        ]);

        // タスクを作成（今日のタスク）
        Task::factory(5)->create([
            'team_id' => $team->id,
            'assignee_id' => $user->id,
            'due_on' => today(),
            'done_at' => null,
        ]);

        // 遅延タスク
        Task::factory(3)->create([
            'team_id' => $team->id,
            'assignee_id' => $user->id,
            'due_on' => today()->subDays(rand(1, 5)),
            'done_at' => null,
        ]);

        // 今週のタスク
        Task::factory(8)->create([
            'team_id' => $team->id,
            'assignee_id' => $user->id,
            'due_on' => today()->addDays(rand(1, 7)),
            'done_at' => null,
        ]);

        // 活動ログを作成
        Activity::factory(30)->create([
            'team_id' => $team->id,
        ]);
    }
}
