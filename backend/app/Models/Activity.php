<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Activity extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'team_id',
        'user_id',
        'contact_id',
        'deal_id',
        'type',
        'occurred_at',
        'body',
    ];

    protected $casts = [
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
     * タイプでのスコープ
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * 連絡先でのスコープ
     */
    public function scopeForContact($query, $contactId)
    {
        return $query->where('contact_id', $contactId);
    }

    /**
     * 商談でのスコープ
     */
    public function scopeForDeal($query, $dealId)
    {
        return $query->where('deal_id', $dealId);
    }

    /**
     * 日付範囲でのスコープ
     */
    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('occurred_at', [$startDate, $endDate]);
    }
}

