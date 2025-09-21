<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Import extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'team_id',
        'user_id',
        'status',
        'total',
        'success',
        'failed',
        'error_csv_path',
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
     * ステータスでのスコープ
     */
    public function scopeWithStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * 進捗率を取得
     */
    public function getProgressPercentageAttribute()
    {
        if ($this->total === 0) {
            return 0;
        }

        return round((($this->success + $this->failed) / $this->total) * 100, 2);
    }

    /**
     * 成功率を取得
     */
    public function getSuccessRateAttribute()
    {
        $processed = $this->success + $this->failed;
        if ($processed === 0) {
            return 0;
        }

        return round(($this->success / $processed) * 100, 2);
    }
}

