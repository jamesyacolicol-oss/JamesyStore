<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('product_code', 20)->nullable()->unique()->after('product_id');
        });

        DB::table('products')
            ->orderBy('product_id')
            ->select('product_id')
            ->get()
            ->each(function ($product): void {
                DB::table('products')
                    ->where('product_id', $product->product_id)
                    ->update([
                        'product_code' => 'PRD-' . str_pad((string) (1000 + (int) $product->product_id), 4, '0', STR_PAD_LEFT),
                    ]);
            });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropUnique(['product_code']);
            $table->dropColumn('product_code');
        });
    }
};
