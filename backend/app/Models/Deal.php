<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Deal extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'team_id',
        'owner_id',
        'contact_id',
        'title',
        'amount',
        'stage',
        'probability',
        'expected_close_on',
        'order_index',
        'lost_reason',
        'archived_at',
    ];

    protected $casts = [
        'expected_close_on' => 'date',
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
     * 連絡先
     */
    public function contact()
    {
        return $this->belongsTo(Contact::class);
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
     * ステージでのスコープ
     */
    public function scopeInStage($query, $stage)
    {
        return $query->where('stage', $stage);
    }

    /** ステージ移動（副作用を最小限に） */
    public function moveToStage(string $newStage, ?int $newIndex = null): void
    {
        $this->stage = $newStage;
        $this->probability = match ($newStage) {
            'won' => 100,
            'lost' => 0,
            default => $this->probability,
        };
        if ($newIndex !== null) {
            $this->order_index = $newIndex;
        }
        $this->save();
    }

    /**
     * 商談を完了（看板から非表示にする＝アーカイブ）
     */
    public function complete(): void
    {
        $this->archived_at = now();
        $this->save();
    }

    /**
     * ギャップ法でorder_indexを採番
     */
    public static function getNextOrderIndex($teamId, $stage)
    {
        $maxIndex = static::where('team_id', $teamId)
            ->where('stage', $stage)
            ->max('order_index');

        return $maxIndex ? $maxIndex + 10 : 10;
    }
}
