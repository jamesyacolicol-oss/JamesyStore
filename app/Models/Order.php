<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    public const DEFAULT_STATUS = 'pending';
    public const DEFAULT_PAYMENT_STATUS = 'unpaid';
    public const PAYMENT_METHODS = [
        'cash',
        'gcash',
    ];

    public const STATUSES = [
        'pending',
        'processing',
        'completed',
        'cancelled',
    ];

    public const PAYMENT_STATUSES = [
        'unpaid',
        'partial',
        'paid',
    ];

    protected $fillable = [
        'order_number',
        'staff_id',
        'user_id',
        'customer_id',
        'status',
        'payment_status',
        'subtotal',
        'tax_amount',
        'total_amount',
        'paid_amount',
        'payment_method',
        'change_amount',
        'ordered_at',
        'notes',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'change_amount' => 'decimal:2',
        'ordered_at' => 'datetime',
    ];

    protected $appends = [
        'creator_name',
    ];

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function details()
    {
        return $this->hasMany(OrderDetail::class);
    }

    public function getCreatorNameAttribute(): string
    {
        return $this->staff?->name ?? $this->user?->name ?? 'Unknown user';
    }
}
