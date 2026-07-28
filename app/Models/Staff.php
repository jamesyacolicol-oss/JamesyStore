<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Staff extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'staff';

    public $timestamps = false;


    protected $primaryKey = 'staff_id';

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        // DB column in phpMyAdmin is role_id
        'role_id',
        'is_active',
        'must_change_password',
        'force_logout_at',
        'status',
        'hired_at',
        'first_name',
        'last_name',
        'password_hash',
    ];


    /**
     * Get the name of the unique identifier for the user.
     * Override default 'email' to use 'phone' for authentication.
     */
    public function getAuthIdentifierName(): string
    {
        return 'phone';
    }

    /**
     * Get the column name for the user's unique identifier.
     */
    public function getKeyName(): string
    {
        return $this->primaryKey;
    }

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_active' => 'boolean',
        'must_change_password' => 'boolean',
    ];

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
