<?php

use App\Models\User;
use App\Models\Team;
use App\Models\Contact;

test('チームのオーナーはすべての連絡先にアクセスできる', function () {
    // オーナーとチームを作成
    $owner = User::factory()->create();
    $team = Team::factory()->create(['owner_id' => $owner->id]);
    $owner->update(['current_team_id' => $team->id]);

    // 連絡先を作成
    $contact = Contact::factory()->create([
        'team_id' => $team->id,
        'owner_id' => $owner->id,
    ]);

    // オーナーとして認証
    $this->actingAs($owner);

    // 連絡先にアクセスできることを確認
    $response = $this->getJson('/api/contacts');
    $response->assertStatus(200);
    $response->assertJsonFragment(['id' => $contact->id]);
});

test('チームのメンバーは自分の連絡先にアクセスできる', function () {
    // オーナーとチームを作成
    $owner = User::factory()->create();
    $team = Team::factory()->create(['owner_id' => $owner->id]);
    $owner->update(['current_team_id' => $team->id]);

    // メンバーを作成
    $member = User::factory()->create();
    $member->update(['current_team_id' => $team->id]);
    $team->users()->attach($member->id, ['role' => 'member']);

    // メンバーの連絡先を作成
    $memberContact = Contact::factory()->create([
        'team_id' => $team->id,
        'owner_id' => $member->id,
    ]);

    // オーナーの連絡先を作成
    $ownerContact = Contact::factory()->create([
        'team_id' => $team->id,
        'owner_id' => $owner->id,
    ]);

    // メンバーとして認証
    $this->actingAs($member);

    // 自分の連絡先にアクセスできることを確認
    $response = $this->getJson('/api/contacts');
    $response->assertStatus(200);

    $contactIds = collect($response->json('data'))->pluck('id');
    expect($contactIds)->toContain($memberContact->id);
    expect($contactIds)->toContain($ownerContact->id); // チームスコープで全件取得
});

test('チームのビューアーは読み取りのみ可能', function () {
    // オーナーとチームを作成
    $owner = User::factory()->create();
    $team = Team::factory()->create(['owner_id' => $owner->id]);
    $owner->update(['current_team_id' => $team->id]);

    // ビューアーを作成
    $viewer = User::factory()->create();
    $viewer->update(['current_team_id' => $team->id]);
    $team->users()->attach($viewer->id, ['role' => 'viewer']);

    // ビューアーとして認証
    $this->actingAs($viewer);

    // 読み取りは可能
    $response = $this->getJson('/api/contacts');
    $response->assertStatus(200);

    // 作成は拒否される（実際の実装ではPolicyで制御）
    $response = $this->postJson('/api/contacts', [
        'name' => 'Test Contact',
        'type' => 'person',
    ]);
    $response->assertStatus(403);
});

test('異なるチームのデータにはアクセスできない', function () {
    // チーム1とオーナー1を作成
    $owner1 = User::factory()->create();
    $team1 = Team::factory()->create(['owner_id' => $owner1->id]);
    $owner1->update(['current_team_id' => $team1->id]);

    // チーム2とオーナー2を作成
    $owner2 = User::factory()->create();
    $team2 = Team::factory()->create(['owner_id' => $owner2->id]);
    $owner2->update(['current_team_id' => $team2->id]);

    // チーム2の連絡先を作成
    $contact2 = Contact::factory()->create([
        'team_id' => $team2->id,
        'owner_id' => $owner2->id,
    ]);

    // オーナー1として認証
    $this->actingAs($owner1);

    // チーム2の連絡先にアクセスできないことを確認
    $response = $this->getJson('/api/contacts');
    $response->assertStatus(200);

    $contactIds = collect($response->json('data'))->pluck('id');
    expect($contactIds)->not->toContain($contact2->id);
});

