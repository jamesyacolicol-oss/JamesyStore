<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('staff', function (Blueprint $table) {
            // Using the model's primary key.
            $table->bigIncrements('staff_id');

            $table->string('name');
            $table->string('phone')->unique();

            $table->string('password'); // guard expects 'password'

            // Role and flags
            $table->unsignedBigInteger('role_id')->default(1);
            $table->boolean('is_active')->default(true);
            $table->boolean('must_change_password')->default(false);
            $table->timestamp('force_logout_at')->nullable();

            // Status / audit fields used by the app
            $table->string('status')->nullable();
            $table->timestamp('hired_at')->nullable();
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();

            // Some seeds may use this column name.
            $table->string('password_hash')->nullable();

            // If you expect staff records to not use the default timestamp columns,
            // feel free to remove these.
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staff');
    }
};

