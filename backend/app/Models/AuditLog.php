<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class AuditLog extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'team_id',
        'user_id',
        'action',
        'entity',
        'entity_id',
        'before',
        'after',
        'occurred_at',
    ];

    protected $casts = [
        'before' => 'array',
        'after' => 'array',
        'occurred_at' => 'datetime',
    ];

    /**
     * チーム
     */
    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * ユーザー
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * アクションでのスコープ
     */
    public function scopeWithAction($query, $action)
    {
        return $query->where('action', $action);
    }

    /**
     * エンティティでのスコープ
     */
    public function scopeForEntity($query, $entity, $entityId = null)
    {
        $query = $query->where('entity', $entity);

        if ($entityId) {
            $query->where('entity_id', $entityId);
        }

        return $query;
    }

    /**
     * 日付範囲でのスコープ
     */
    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('occurred_at', [$startDate, $endDate]);
    }

    /**
     * 監査ログを作成
     */
    public static function createLog($action, $entity, $entityId, $before = null, $after = null)
    {
        return static::create([
            'team_id' => auth()->user()->current_team_id,
            'user_id' => auth()->id(),
            'action' => $action,
            'entity' => $entity,
            'entity_id' => $entityId,
            'before' => $before,
            'after' => $after,
            'occurred_at' => now(),
        ]);
    }
}

