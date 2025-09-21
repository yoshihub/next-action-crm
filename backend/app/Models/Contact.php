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

    /**
     * 活動ログ
     */
    public function activities()
    {
        return $this->hasMany(Activity::class);
    }

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
    public function createNextActionTask()
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
                'assignee_id' => $this->owner_id,
                'title' => '次回フォロー',
                'due_on' => $this->next_action_on,
                'priority' => 'normal',
            ]);
        }
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
