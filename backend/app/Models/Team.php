<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'owner_id',
    ];

    /**
     * チームのオーナー
     */
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * チームのメンバー
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'team_user')
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * 連絡先
     */
    public function contacts()
    {
        return $this->hasMany(Contact::class);
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
     * インポート
     */
    public function imports()
    {
        return $this->hasMany(Import::class);
    }

    /**
     * 監査ログ
     */
    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }
}

