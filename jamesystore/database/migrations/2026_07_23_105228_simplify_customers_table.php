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
        Schema::table('customers', function (Blueprint $table) {
            // Remove old columns
            $table->dropColumn(['first_name', 'last_name', 'email', 'location']);
        });

        // Re-create the table with simplified columns
        Schema::table('customers', function (Blueprint $table) {
            $table->string('customer_name', 100)->after('customer_id');
            $table->string('number', 20)->nullable()->after('customer_name');
            $table->string('address', 200)->nullable()->after('number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn(['customer_name', 'number', 'address']);
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->string('first_name', 50);
            $table->string('last_name', 50);
            $table->string('phone_number', 15)->nullable();
            $table->string('email', 100)->unique()->nullable();
            $table->string('location', 100)->nullable();
        });
    }
};

