<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Contact extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'team_id',
        'owner_id',
        'type',
        'name',
        'company',
        'email',
        'phone',
        'tags',
        'score',
        'priority',
        'status',
        'note',
        'next_action_on',
        'last_contacted_at',
        'archived_at',
    ];

    protected $casts = [
        'tags' => 'array',
        'next_action_on' => 'date',
        'last_contacted_at' => 'datetime',
        'archived_at' => 'datetime',
    ];

    /**
     * チーム
     */
    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * オーナー
     */
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * 商談
     */
    public function deals()
    {
        return $this->hasMany(Deal::class);
    }

    // 活動ログ機能は廃止

    /**
     * タスク
     */
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    /**
     * 次回フォロータスクを自動作成
     */
    public function createNextActionTask(string $priority = 'normal')
    {
        if (!$this->next_action_on) {
            return;
        }

        // 同名の未完了タスクが存在しないかチェック
        $existingTask = $this->tasks()
            ->where('title', '次回フォロー')
            ->whereNull('done_at')
            ->first();

        if (!$existingTask) {
            $this->tasks()->create([
                'team_id' => $this->team_id,
                'assignee_id' => $this->owner_id,
                'title' => '次回フォロー',
                'due_on' => $this->next_action_on,
                'priority' => in_array($priority, ['low', 'normal', 'high'], true) ? $priority : 'normal',
            ]);
        }
    }

    /**
     * 次回フォローの未完了タスクを一つだけ維持（なければ再開/作成）
     */
    public function ensureOnePendingFollowupTask(): void
    {
        if (!$this->next_action_on) {
            return;
        }

        // 未完了フォロータスクの重複を解消（最新1件だけ残す）
        $pendings = $this->tasks()
            ->where('title', '次回フォロー')
            ->whereNull('done_at')
            ->orderByDesc('id')
            ->get();

        if ($pendings->count() > 0) {
            $keep = $pendings->first();
            $toRemove = $pendings->slice(1);
            if ($toRemove->count() > 0) {
                $this->tasks()
                    ->whereIn('id', $toRemove->pluck('id'))
                    ->delete();
            }

            // 残した1件を最新内容で同期
            $keep->due_on = $this->next_action_on;
            $keep->priority = in_array($this->priority, ['low', 'normal', 'high'], true) ? $this->priority : 'normal';
            $keep->save();
            return;
        }

        // 直近の完了タスクがあれば再開
        $latestCompleted = $this->tasks()
            ->where('title', '次回フォロー')
            ->whereNotNull('done_at')
            ->orderByDesc('done_at')
            ->first();

        if ($latestCompleted) {
            $latestCompleted->done_at = null;
            $latestCompleted->due_on = $this->next_action_on;
            $latestCompleted->priority = in_array($this->priority, ['low', 'normal', 'high'], true) ? $this->priority : 'normal';
            $latestCompleted->save();
            return;
        }

        // どちらも無ければ新規作成
        $this->tasks()->create([
            'team_id' => $this->team_id,
            'assignee_id' => $this->owner_id,
            'title' => '次回フォロー',
            'due_on' => $this->next_action_on,
            'priority' => in_array($this->priority, ['low', 'normal', 'high'], true) ? $this->priority : 'normal',
        ]);
    }

    /**
     * 次回フォローの未完了タスクを完了にする
     */
    public function completePendingFollowupTasks(): void
    {
        $this->tasks()
            ->where('title', '次回フォロー')
            ->whereNull('done_at')
            ->update(['done_at' => now()]);
    }

    /**
     * スコア範囲でのスコープ
     */
    public function scopeScoreRange($query, $min, $max)
    {
        return $query->whereBetween('score', [$min, $max]);
    }

    /**
     * タグでのスコープ
     */
    public function scopeWithTag($query, $tag)
    {
        return $query->whereJsonContains('tags', $tag);
    }

    /**
     * 次回アクション日でのスコープ
     */
    public function scopeNextActionOn($query, $date)
    {
        return $query->where('next_action_on', $date);
    }
}
