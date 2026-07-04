<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderDetail extends Model
{
    use HasFactory;

    protected $table = 'order_line_items';
    protected $primaryKey = null;
    public $incrementing = false;
    public $timestamps = false; // SIGURADUHING FALSE

    protected $fillable = [
        'order_id', 'product_id', 'quantity', 'ordered_price',
    ];

    public function order() { return $this->belongsTo(Order::class, 'order_id', 'order_id'); }
    public function product() { return $this->belongsTo(Product::class, 'product_id', 'product_id'); }
}