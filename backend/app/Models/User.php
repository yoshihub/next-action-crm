<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'timezone',
        'current_team_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * ユーザーが所属するチーム
     */
    public function teams()
    {
        return $this->belongsToMany(Team::class, 'team_user')
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * 現在のチーム
     */
    public function currentTeam()
    {
        return $this->belongsTo(Team::class, 'current_team_id');
    }

    /**
     * ユーザーが所有するチーム
     */
    public function ownedTeams()
    {
        return $this->hasMany(Team::class, 'owner_id');
    }

    /**
     * 連絡先
     */
    public function contacts()
    {
        return $this->hasMany(Contact::class, 'owner_id');
    }

    /**
     * 商談
     */
    public function deals()
    {
        return $this->hasMany(Deal::class, 'owner_id');
    }

    /**
     * 活動ログ
     */
    public function activities()
    {
        return $this->hasMany(Activity::class);
    }

    /**
     * タスク（担当者）
     */
    public function assignedTasks()
    {
        return $this->hasMany(Task::class, 'assignee_id');
    }

    /**
     * チーム内での役割を取得
     */
    public function getRoleInTeam($teamId)
    {
        $teamUser = $this->teams()->where('team_id', $teamId)->first();
        return $teamUser ? $teamUser->pivot->role : null;
    }
}
