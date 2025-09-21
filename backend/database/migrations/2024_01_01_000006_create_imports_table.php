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
        Schema::create('imports', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('team_id');
            $table->unsignedBigInteger('user_id');
            $table->enum('status', ['queued', 'running', 'done', 'failed'])->default('queued');
            $table->integer('total')->default(0);
            $table->integer('success')->default(0);
            $table->integer('failed')->default(0);
            $table->string('error_csv_path')->nullable();
            $table->timestamps();

            // インデックス
            $table->index(['team_id', 'status']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('imports');
    }
};
