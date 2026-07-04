<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    // Tells Laravel that your table is explicitly named 'categories'
    protected $table = 'categories';

    // Tells Laravel that your primary key is 'category_id' instead of 'id'
    protected $primaryKey = 'category_id';

    // Since your migration does not have $table->timestamps(), disable them here
    public $timestamps = false;

    // Mass-assignable fields
    protected $fillable = [
        'category_name',
        'description',
    ];

    /**
     * Optional relationship to your Product model
     */
    public function products()
    {
        return $this->hasMany(Product::class, 'category_id', 'category_id');
    }
}