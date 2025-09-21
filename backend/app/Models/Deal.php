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
     * ステージでのスコープ
     */
    public function scopeInStage($query, $stage)
    {
        return $query->where('stage', $stage);
    }

    /**
     * ステージ移動時の処理
     */
    public function moveToStage($newStage, $newIndex = null)
    {
        $this->stage = $newStage;

        // won/lost遷移時は確度を固定
        if ($newStage === 'won') {
            $this->probability = 100;
        } elseif ($newStage === 'lost') {
            $this->probability = 0;
        }

        if ($newIndex !== null) {
            $this->order_index = $newIndex;
        }

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
