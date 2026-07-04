<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $table = 'products';
    protected $primaryKey = 'product_id';
    
    // Set to true because we added $table->timestamps() in the migration
    public $timestamps = false;

    protected $fillable = [
        'product_code',
        'product_name',
        'category_id',
        'price',
        'stock_quantity',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'stock_quantity' => 'integer',
    ];

    // Defines relationship to categories table
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'category_id');
    }
}