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
        Schema::create('deals', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('team_id');
            $table->unsignedBigInteger('owner_id');
            $table->unsignedBigInteger('contact_id');
            $table->string('title');
            $table->unsignedInteger('amount')->default(0);
            $table->enum('stage', ['lead', 'qualify', 'proposal', 'negotiation', 'won', 'lost'])->default('lead');
            $table->unsignedTinyInteger('probability')->default(0);
            $table->date('expected_close_on')->nullable();
            $table->integer('order_index')->default(0);
            $table->text('lost_reason')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();

            // インデックス
            $table->index(['team_id', 'stage', 'order_index']);
            $table->index(['team_id', 'contact_id']);
            $table->index('owner_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deals');
    }
};
