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
        Schema::create('contacts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('team_id');
            $table->unsignedBigInteger('owner_id');
            $table->enum('type', ['person', 'company'])->default('person');
            $table->string('name');
            $table->string('company')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->json('tags')->nullable();
            $table->enum('priority', ['low', 'normal', 'high'])->default('normal');
            $table->enum('status', ['pending', 'completed'])->default('pending');
            $table->text('note')->nullable();
            $table->date('next_action_on')->nullable();
            $table->dateTime('last_contacted_at')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();

            // インデックス
            $table->unique(['team_id', 'email']); // NULLはMySQL仕様で重複可
            $table->index(['team_id', 'next_action_on', 'name']);
            $table->index(['team_id', 'phone']);
            $table->index('owner_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contacts');
    }
};
