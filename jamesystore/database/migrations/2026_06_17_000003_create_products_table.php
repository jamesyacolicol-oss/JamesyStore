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
        // Drop table first just in case it exists to avoid errors
        Schema::dropIfExists('products');

        Schema::create('products', function (Blueprint $table) {
            $table->id('product_id'); 
            $table->string('product_code', 50)->unique(); 
            $table->string('product_name', 100);
            
            // Ensure the categories table exists before this
            $table->foreignId('category_id')
                  ->constrained('categories', 'category_id')
                  ->onUpdate('cascade')
                  ->onDelete('restrict');

            $table->decimal('price', 10, 2);
            $table->integer('stock_quantity')->default(0);
            
            // This adds BOTH created_at and updated_at
            $table->timestamps(); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};