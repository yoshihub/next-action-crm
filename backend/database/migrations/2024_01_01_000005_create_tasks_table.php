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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('team_id');
            $table->unsignedBigInteger('assignee_id');
            $table->unsignedBigInteger('contact_id')->nullable();
            $table->unsignedBigInteger('deal_id')->nullable();
            $table->string('title');
            $table->enum('priority', ['low', 'normal', 'high'])->default('normal');
            $table->date('due_on');
            $table->dateTime('done_at')->nullable();
            $table->timestamps();

            // インデックス
            $table->index(['team_id', 'assignee_id', 'due_on', 'done_at']);
            $table->index(['team_id', 'contact_id']);
            $table->index(['team_id', 'deal_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
