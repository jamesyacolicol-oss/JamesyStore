<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
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
    ];

    public function getRoleAttribute(): string
    {
        return 'admin';
    }

    public function getMustChangePasswordAttribute(): bool
    {
        return false;
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'user_id');
    }
}
