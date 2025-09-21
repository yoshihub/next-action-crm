<?php

use App\Models\User;
use App\Models\Team;
use App\Models\Contact;
use App\Models\Deal;

test('商談のステージ移動でギャップ法でorder_indexが採番される', function () {
    // ユーザーとチームを作成
    $user = User::factory()->create();
    $team = Team::factory()->create(['owner_id' => $user->id]);
    $user->update(['current_team_id' => $team->id]);

    // 連絡先を作成
    $contact = Contact::factory()->create([
        'team_id' => $team->id,
        'owner_id' => $user->id,
    ]);

    // 商談を作成
    $deal = Deal::factory()->create([
        'team_id' => $team->id,
        'owner_id' => $user->id,
        'contact_id' => $contact->id,
        'stage' => 'lead',
        'order_index' => 10,
    ]);

    // ステージを移動
    $deal->moveToStage('qualify', 20);

    // order_indexが更新されたことを確認
    expect($deal->order_index)->toBe(20);
    expect($deal->stage)->toBe('qualify');
});

test('商談がwonステージに移動すると確度が100になる', function () {
    // ユーザーとチームを作成
    $user = User::factory()->create();
    $team = Team::factory()->create(['owner_id' => $user->id]);
    $user->update(['current_team_id' => $team->id]);

    // 連絡先を作成
    $contact = Contact::factory()->create([
        'team_id' => $team->id,
        'owner_id' => $user->id,
    ]);

    // 商談を作成
    $deal = Deal::factory()->create([
        'team_id' => $team->id,
        'owner_id' => $user->id,
        'contact_id' => $contact->id,
        'stage' => 'negotiation',
        'probability' => 80,
    ]);

    // wonステージに移動
    $deal->moveToStage('won');

    // 確度が100になったことを確認
    expect($deal->probability)->toBe(100);
    expect($deal->stage)->toBe('won');
});

test('商談がlostステージに移動すると確度が0になる', function () {
    // ユーザーとチームを作成
    $user = User::factory()->create();
    $team = Team::factory()->create(['owner_id' => $user->id]);
    $user->update(['current_team_id' => $team->id]);

    // 連絡先を作成
    $contact = Contact::factory()->create([
        'team_id' => $team->id,
        'owner_id' => $user->id,
    ]);

    // 商談を作成
    $deal = Deal::factory()->create([
        'team_id' => $team->id,
        'owner_id' => $user->id,
        'contact_id' => $contact->id,
        'stage' => 'negotiation',
        'probability' => 80,
    ]);

    // lostステージに移動
    $deal->moveToStage('lost');

    // 確度が0になったことを確認
    expect($deal->probability)->toBe(0);
    expect($deal->stage)->toBe('lost');
});

test('getNextOrderIndexでギャップ法のインデックスが取得できる', function () {
    // ユーザーとチームを作成
    $user = User::factory()->create();
    $team = Team::factory()->create(['owner_id' => $user->id]);
    $user->update(['current_team_id' => $team->id]);

    // 連絡先を作成
    $contact = Contact::factory()->create([
        'team_id' => $team->id,
        'owner_id' => $user->id,
    ]);

    // 既存の商談を作成
    Deal::factory()->create([
        'team_id' => $team->id,
        'owner_id' => $user->id,
        'contact_id' => $contact->id,
        'stage' => 'lead',
        'order_index' => 10,
    ]);

    Deal::factory()->create([
        'team_id' => $team->id,
        'owner_id' => $user->id,
        'contact_id' => $contact->id,
        'stage' => 'lead',
        'order_index' => 20,
    ]);

    // 次のorder_indexを取得
    $nextIndex = Deal::getNextOrderIndex($team->id, 'lead');

    // ギャップ法で30が返されることを確認
    expect($nextIndex)->toBe(30);
});

