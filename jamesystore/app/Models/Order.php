<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $table = 'orders';
    protected $primaryKey = 'order_id';
    
    // Keep timestamps enabled to match the migration's $table->timestamps().
    public $timestamps = true; 

    protected $fillable = [
        'customer_id', 'user_id', 'order_number', 'subtotal', 
        'tax_amount', 'total_amount', 'payment_amount', 
        'paid_amount', 'change_amount', 'status', 'payment_status', 
        'payment_method', 'notes', 'ordered_at'
    ];

    public function user() { return $this->belongsTo(User::class, 'user_id', 'id'); }
    public function customer() { return $this->belongsTo(Customer::class, 'customer_id', 'customer_id'); }
    public function lineItems() { return $this->hasMany(OrderDetail::class, 'order_id', 'order_id'); }
}