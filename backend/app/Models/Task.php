<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Task extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'team_id',
        'assignee_id',
        'contact_id',
        'deal_id',
        'title',
        'priority',
        'due_on',
        'done_at',
    ];

    protected $casts = [
        'due_on' => 'date',
        'done_at' => 'datetime',
    ];

    /**
     * チーム
     */
    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * 担当者
     */
    public function assignee()
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    /**
     * 連絡先
     */
    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }

    /**
     * 商談
     */
    public function deal()
    {
        return $this->belongsTo(Deal::class);
    }

    /**
     * 完了済みのスコープ
     */
    public function scopeCompleted($query)
    {
        return $query->whereNotNull('done_at');
    }

    /**
     * 未完了のスコープ
     */
    public function scopePending($query)
    {
        return $query->whereNull('done_at');
    }

    /**
     * 今日のタスク
     */
    public function scopeToday($query)
    {
        return $query->where('due_on', today());
    }

    /**
     * 遅延タスク
     */
    public function scopeOverdue($query)
    {
        return $query->where('due_on', '<', today())
            ->whereNull('done_at');
    }

    /**
     * 今週のタスク
     */
    public function scopeThisWeek($query)
    {
        return $query->whereBetween('due_on', [today(), today()->addWeek()]);
    }

    /**
     * 優先度でのスコープ
     */
    public function scopePriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * タスクを完了にする
     */
    public function complete()
    {
        $this->done_at = now();
        $this->save();
    }

    /**
     * タスクを延期する
     */
    public function postpone($days = 1)
    {
        $this->due_on = $this->due_on->addDays($days);
        $this->save();
    }
}

