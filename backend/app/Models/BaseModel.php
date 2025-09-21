<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

abstract class BaseModel extends Model
{
    /**
     * チームスコープを自動適用
     */
    protected static function booted(): void
    {
        static::addGlobalScope('team', function (Builder $builder) {
            if (auth()->check() && auth()->user()->current_team_id) {
                $builder->where('team_id', auth()->user()->current_team_id);
            }
        });
    }

    /**
     * チームIDを自動設定
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($model) {
            if (auth()->check() && auth()->user()->current_team_id) {
                $model->team_id = auth()->user()->current_team_id;
            }
        });
    }
}

