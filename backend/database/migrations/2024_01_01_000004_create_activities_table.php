<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('team_id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('contact_id');
            $table->unsignedBigInteger('deal_id')->nullable();
            $table->enum('type', ['call', 'meeting', 'mail', 'note']);
            $table->dateTime('occurred_at');
            $table->text('body');
            $table->timestamps();

            // インデックス
            $table->index(['team_id', 'contact_id', 'occurred_at']);
            $table->index(['team_id', 'deal_id']);
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};
